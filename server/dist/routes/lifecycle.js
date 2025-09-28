"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const jobQueue_1 = require("../services/orchestration/jobQueue");
const router = (0, express_1.Router)();
// In-memory stores (no-cost, dev-only)
const envStore = {
    dev: { name: 'dev', config: { LOG_LEVEL: 'debug' }, secrets: {}, flags: { featureX: true } },
    staging: { name: 'staging', config: { LOG_LEVEL: 'info' }, secrets: {}, flags: { featureX: false } },
    prod: { name: 'prod', config: { LOG_LEVEL: 'warn' }, secrets: {}, flags: { featureX: false } }
};
// Observability simulated metrics
const metricsStore = {
    dev: { uptime: 0.999, latencyMsP50: 45, latencyMsP95: 120, errorRate: 0.004, lastUpdated: new Date().toISOString() },
    staging: { uptime: 0.998, latencyMsP50: 55, latencyMsP95: 150, errorRate: 0.006, lastUpdated: new Date().toISOString() },
    prod: { uptime: 0.9995, latencyMsP50: 40, latencyMsP95: 100, errorRate: 0.002, lastUpdated: new Date().toISOString() }
};
// Alerts configs (placeholders only)
const alertsStore = { dev: { rules: [] }, staging: { rules: [] }, prod: { rules: [] } };
// Targets metadata
const targets = [
    { id: 'base44-k8s', name: 'Base44 Kubernetes', type: 'kubernetes' },
    { id: 'base44-serverless', name: 'Base44 Serverless', type: 'serverless' },
    { id: 'vercel', name: 'Vercel', type: 'external' },
    { id: 'netlify', name: 'Netlify', type: 'external' },
    { id: 'aws', name: 'AWS (ECS/Lambda)', type: 'external' },
    { id: 'azure', name: 'Azure (AKS/Functions)', type: 'external' }
];
const builds = new Map();
const releasesByEnv = new Map();
const queue = new jobQueue_1.InMemoryJobQueue({ maxAttempts: 2, backoffMs: 500 });
// Register a deploy handler that simulates stages and writes logs
queue.register('deploy', async (job, update) => {
    const buildId = job.payload.buildId;
    const build = builds.get(buildId);
    if (!build)
        throw new Error('Build not found');
    const runStage = async (stage, workMs, succeed = true) => {
        stage.status = 'running';
        stage.startedAt = new Date().toISOString();
        update({ message: `${stage.name}: started` });
        stage.logs.push(`[${new Date().toISOString()}] ${stage.name}: initializing`);
        await new Promise(r => setTimeout(r, workMs));
        if (build.status === 'canceled') {
            stage.logs.push('Canceled');
            stage.status = 'canceled';
            return;
        }
        if (!succeed) {
            stage.status = 'failed';
            stage.logs.push('Stage failed');
            throw new Error(`${stage.name} failed`);
        }
        stage.status = 'completed';
        stage.finishedAt = new Date().toISOString();
        stage.logs.push('Stage completed');
        update({ message: `${stage.name}: completed` });
    };
    try {
        build.status = 'running';
        update({ progress: 5, message: 'Pipeline started' });
        await runStage(build.stages[0], 300);
        update({ progress: 40 });
        await runStage(build.stages[1], 300);
        update({ progress: 75 });
        await runStage(build.stages[2], 300);
        build.status = 'completed';
        build.finishedAt = new Date().toISOString();
        update({ progress: 100, message: 'Pipeline completed' });
        // Create a release on success
        const releaseId = `rel_${Date.now()}`;
        build.releaseId = releaseId;
        const list = releasesByEnv.get(build.env) ?? [];
        list.push({ releaseId, buildId: build.id, createdAt: new Date().toISOString() });
        releasesByEnv.set(build.env, list);
        return { buildId: build.id, releaseId };
    }
    catch (err) {
        build.status = build.status === 'canceled' ? 'canceled' : 'failed';
        throw err;
    }
});
// Middleware
router.use(auth_1.authenticateToken);
// Environment management
router.get('/envs', (_req, res) => {
    res.json({ success: true, data: Object.values(envStore) });
});
router.post('/envs', (req, res) => {
    const schema = zod_1.z.object({ name: zod_1.z.string(), config: zod_1.z.record(zod_1.z.string()).optional(), secrets: zod_1.z.record(zod_1.z.string()).optional(), flags: zod_1.z.record(zod_1.z.boolean()).optional() });
    const p = schema.parse(req.body);
    if (envStore[p.name])
        return res.status(400).json({ success: false, error: 'Environment exists' });
    envStore[p.name] = { name: p.name, config: p.config ?? {}, secrets: p.secrets ?? {}, flags: p.flags ?? {} };
    res.status(201).json({ success: true, data: envStore[p.name] });
});
router.post('/envs/clone', (req, res) => {
    const schema = zod_1.z.object({ from: zod_1.z.string(), to: zod_1.z.string(), rotateSecrets: zod_1.z.boolean().default(false) });
    const p = schema.parse(req.body);
    const src = envStore[p.from];
    if (!src)
        return res.status(404).json({ success: false, error: 'Source env not found' });
    if (envStore[p.to])
        return res.status(400).json({ success: false, error: 'Target env exists' });
    const clonedSecrets = Object.fromEntries(Object.keys(src.secrets).map(k => [k, p.rotateSecrets ? randomSecret() : src.secrets[k]]));
    envStore[p.to] = { name: p.to, config: { ...src.config }, secrets: clonedSecrets, flags: { ...src.flags }, target: src.target };
    res.status(201).json({ success: true, data: envStore[p.to] });
});
router.post('/envs/compare', (req, res) => {
    const schema = zod_1.z.object({ a: zod_1.z.string(), b: zod_1.z.string() });
    const { a, b } = schema.parse(req.body);
    const envA = envStore[a];
    const envB = envStore[b];
    if (!envA || !envB)
        return res.status(404).json({ success: false, error: 'Environment not found' });
    const diff = (ka, kb) => {
        const keys = new Set([...Object.keys(ka), ...Object.keys(kb)]);
        const added = [], removed = [], changed = [];
        keys.forEach(k => {
            if (!(k in ka))
                added.push(k);
            else if (!(k in kb))
                removed.push(k);
            else if (ka[k] !== kb[k])
                changed.push(k);
        });
        return { added, removed, changed };
    };
    res.json({ success: true, data: {
            config: diff(envA.config, envB.config),
            secrets: diff(envA.secrets, envB.secrets),
            flags: diff(envA.flags, envB.flags)
        } });
});
router.post('/envs/:name/rotate-secrets', (req, res) => {
    const name = req.params.name;
    const env = envStore[name];
    if (!env)
        return res.status(404).json({ success: false, error: 'Environment not found' });
    Object.keys(env.secrets).forEach(k => env.secrets[k] = randomSecret());
    res.json({ success: true, data: env });
});
router.put('/envs/:name', (req, res) => {
    const schema = zod_1.z.object({ config: zod_1.z.record(zod_1.z.string()).optional(), secrets: zod_1.z.record(zod_1.z.string()).optional(), flags: zod_1.z.record(zod_1.z.boolean()).optional(), target: zod_1.z.string().optional() });
    const p = schema.parse(req.body);
    const env = envStore[req.params.name];
    if (!env)
        return res.status(404).json({ success: false, error: 'Environment not found' });
    env.config = p.config ?? env.config;
    env.secrets = p.secrets ?? env.secrets;
    env.flags = p.flags ?? env.flags;
    env.target = p.target ?? env.target;
    res.json({ success: true, data: env });
});
// Targets
router.get('/targets', (_req, res) => {
    res.json({ success: true, data: targets });
});
router.post('/targets/select', (req, res) => {
    const schema = zod_1.z.object({ env: zod_1.z.string(), targetId: zod_1.z.string() });
    const p = schema.parse(req.body);
    if (!envStore[p.env])
        return res.status(404).json({ success: false, error: 'Environment not found' });
    if (!targets.find(t => t.id === p.targetId))
        return res.status(400).json({ success: false, error: 'Unknown target' });
    envStore[p.env].target = p.targetId;
    res.json({ success: true, data: envStore[p.env] });
});
// Pipeline: run/cancel/retry, logs per stage
router.post('/pipeline/run', async (req, res) => {
    const schema = zod_1.z.object({ env: zod_1.z.string(), notify: zod_1.z.object({ emails: zod_1.z.array(zod_1.z.string()).optional(), slackWebhookUrl: zod_1.z.string().optional() }).optional() });
    const p = schema.parse(req.body);
    const env = envStore[p.env];
    if (!env)
        return res.status(404).json({ success: false, error: 'Environment not found' });
    const target = env.target ?? 'base44-k8s';
    const build = {
        id: `b_${Date.now()}`, env: env.name, target, status: 'queued', createdAt: new Date().toISOString(), attempts: 0,
        stages: [{ name: 'build', status: 'queued', logs: [] }, { name: 'test', status: 'queued', logs: [] }, { name: 'deploy', status: 'queued', logs: [] }],
        notify: p.notify
    };
    builds.set(build.id, build);
    // Enqueue
    const job = await queue.enqueue('deploy', { buildId: build.id });
    res.status(202).json({ success: true, data: { build, jobId: job.id } });
});
router.get('/pipeline/:id', (req, res) => {
    const build = builds.get(req.params.id);
    if (!build)
        return res.status(404).json({ success: false, error: 'Build not found' });
    res.json({ success: true, data: build });
});
router.get('/pipeline/:id/logs', (req, res) => {
    const build = builds.get(req.params.id);
    if (!build)
        return res.status(404).json({ success: false, error: 'Build not found' });
    res.json({ success: true, data: build.stages.map(s => ({ name: s.name, status: s.status, logs: s.logs })) });
});
router.post('/pipeline/:id/cancel', (req, res) => {
    const build = builds.get(req.params.id);
    if (!build)
        return res.status(404).json({ success: false, error: 'Build not found' });
    if (build.status === 'completed' || build.status === 'failed')
        return res.status(400).json({ success: false, error: 'Cannot cancel finished build' });
    build.status = 'canceled';
    res.json({ success: true, data: build });
});
router.post('/pipeline/:id/retry', async (req, res) => {
    const old = builds.get(req.params.id);
    if (!old)
        return res.status(404).json({ success: false, error: 'Build not found' });
    const build = { ...old, id: `b_${Date.now()}`, status: 'queued', createdAt: new Date().toISOString(), attempts: old.attempts + 1,
        stages: [{ name: 'build', status: 'queued', logs: [] }, { name: 'test', status: 'queued', logs: [] }, { name: 'deploy', status: 'queued', logs: [] }] };
    builds.set(build.id, build);
    const job = await queue.enqueue('deploy', { buildId: build.id });
    res.status(202).json({ success: true, data: { build, jobId: job.id } });
});
// Rollback controls
router.get('/releases/:env', (req, res) => {
    const list = releasesByEnv.get(req.params.env) ?? [];
    res.json({ success: true, data: list });
});
router.post('/rollback', (req, res) => {
    const schema = zod_1.z.object({ env: zod_1.z.string(), toRelease: zod_1.z.string() });
    const p = schema.parse(req.body);
    const list = releasesByEnv.get(p.env) ?? [];
    const target = list.find(r => r.releaseId === p.toRelease);
    if (!target)
        return res.status(404).json({ success: false, error: 'Release not found' });
    // Simulate rollback by moving the release to the end (mark as current)
    releasesByEnv.set(p.env, [...list.filter(r => r.releaseId !== p.toRelease), target]);
    res.json({ success: true, data: target });
});
// Observability
router.get('/observability/:env/overview', (req, res) => {
    const m = metricsStore[req.params.env];
    if (!m)
        return res.status(404).json({ success: false, error: 'Env not found' });
    res.json({ success: true, data: m });
});
router.post('/observability/:env/alerts', (req, res) => {
    const schema = zod_1.z.object({ emails: zod_1.z.array(zod_1.z.string()).optional(), slackWebhookUrl: zod_1.z.string().optional(), rules: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string(), threshold: zod_1.z.number(), metric: zod_1.z.enum(['latencyP95', 'errorRate', 'uptime']), direction: zod_1.z.enum(['above', 'below']), enabled: zod_1.z.boolean().default(true) })).default([]) });
    const p = schema.parse(req.body);
    const env = req.params.env;
    if (!envStore[env])
        return res.status(404).json({ success: false, error: 'Env not found' });
    alertsStore[env] = { emails: p.emails, slackWebhookUrl: p.slackWebhookUrl, rules: p.rules };
    res.json({ success: true, data: alertsStore[env] });
});
router.get('/observability/:env/alerts', (req, res) => {
    const env = req.params.env;
    if (!envStore[env])
        return res.status(404).json({ success: false, error: 'Env not found' });
    res.json({ success: true, data: alertsStore[env] ?? { rules: [] } });
});
// Utils
function randomSecret() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
exports.default = router;
//# sourceMappingURL=lifecycle.js.map