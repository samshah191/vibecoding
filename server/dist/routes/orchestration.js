"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const promptService_1 = require("../services/orchestration/promptService");
const providerRouter_1 = require("../services/orchestration/providerRouter");
const jobQueue_1 = require("../services/orchestration/jobQueue");
const artifactGenerators_1 = require("../services/artifacts/artifactGenerators");
const agents_1 = require("../services/agents/agents");
const router = (0, express_1.Router)();
// Singletons in-memory for now
const prompts = new promptService_1.PromptService();
const routerProvider = new providerRouter_1.ProviderRouter();
const queue = new jobQueue_1.InMemoryJobQueue();
prompts.seedDefaults();
// Register job handlers
queue.register('codegen', async (job, update) => {
    update({ progress: 10, message: 'Validating input' });
    const input = job.payload;
    update({ progress: 30, message: 'Generating code artifacts' });
    const artifacts = artifactGenerators_1.ArtifactGenerators.bundleAll(input);
    update({ progress: 80, message: 'Packaging artifacts' });
    return artifacts;
});
queue.register('docs', async (job, update) => {
    update({ progress: 50, message: 'Generating docs' });
    return artifactGenerators_1.ArtifactGenerators.docs(job.payload.name, job.payload.description);
});
queue.register('bugfix', async (job, update) => {
    update({ progress: 25, message: 'Applying bugfix agent' });
    const result = await agents_1.Agents.bugfix(job.payload);
    update({ progress: 90, message: 'Finalizing' });
    return result;
});
// Schemas
const upsertTemplateSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    versions: zod_1.z.array(zod_1.z.object({
        version: zod_1.z.string(),
        createdAt: zod_1.z.string(),
        variants: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), weight: zod_1.z.number().optional(), content: zod_1.z.string() }))
    })),
    environmentOverrides: zod_1.z.array(zod_1.z.object({ env: zod_1.z.string(), content: zod_1.z.string().optional(), merge: zod_1.z.record(zod_1.z.string()).optional() })).optional()
});
router.post('/prompts', (req, res) => {
    try {
        const tpl = upsertTemplateSchema.parse(req.body);
        prompts.upsertTemplate(tpl);
        res.json({ success: true });
    }
    catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});
router.get('/prompts', (req, res) => {
    res.json({ success: true, data: prompts.listTemplates() });
});
router.post('/prompts/render', (req, res) => {
    try {
        const schema = zod_1.z.object({ name: zod_1.z.string(), env: zod_1.z.string().default('dev'), placeholders: zod_1.z.record(zod_1.z.string()).optional() });
        const p = schema.parse(req.body);
        const rendered = prompts.render(p.name, p.env, p.placeholders);
        res.json({ success: true, data: rendered });
    }
    catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});
// Manage routing rules
router.post('/llm/rules', (req, res) => {
    try {
        const schema = zod_1.z.object({ id: zod_1.z.string(), when: zod_1.z.object({ env: zod_1.z.array(zod_1.z.string()).optional(), feature: zod_1.z.array(zod_1.z.enum(['codegen', 'docs', 'db', 'infra', 'bugfix', 'perf', 'style'])).optional(), model: zod_1.z.array(zod_1.z.string()).optional() }), to: zod_1.z.object({ provider: zod_1.z.string(), model: zod_1.z.string() }), weight: zod_1.z.number().optional() });
        const rule = schema.parse(req.body);
        routerProvider.registerRule(rule);
        res.json({ success: true });
    }
    catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});
router.get('/llm/rules', (req, res) => {
    res.json({ success: true, data: routerProvider.getRules() });
});
// Route a generation call via provider router (stubbed)
router.post('/llm/generate', async (req, res) => {
    try {
        const schema = zod_1.z.object({ feature: zod_1.z.string(), env: zod_1.z.string().default('dev'), model: zod_1.z.string().default('default'), prompt: zod_1.z.string(), temperature: zod_1.z.number().optional() });
        const p = schema.parse(req.body);
        const resp = await routerProvider.generate(p.feature, p.env, p.model, { prompt: p.prompt, temperature: p.temperature });
        res.json({ success: true, data: resp });
    }
    catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});
// Job queue endpoints
router.post('/jobs/enqueue', async (req, res) => {
    try {
        const schema = zod_1.z.object({ type: zod_1.z.enum(['codegen', 'docs', 'db', 'infra', 'bundle', 'bugfix', 'perf', 'style']), payload: zod_1.z.any(), notify: zod_1.z.object({ inApp: zod_1.z.boolean().optional(), email: zod_1.z.array(zod_1.z.string()).optional(), slackWebhookUrl: zod_1.z.string().optional() }).optional() });
        const p = schema.parse(req.body);
        const job = await queue.enqueue(p.type, p.payload, p.notify);
        res.json({ success: true, data: job });
    }
    catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});
router.get('/jobs/:id', (req, res) => {
    const job = queue.get(req.params.id);
    if (!job)
        return res.status(404).json({ success: false, error: 'Job not found' });
    res.json({ success: true, data: job });
});
router.get('/jobs', (req, res) => {
    res.json({ success: true, data: queue.list() });
});
// Agents endpoints
router.post('/agents/:kind', async (req, res) => {
    try {
        const schema = zod_1.z.object({
            target: zod_1.z.enum(['code', 'db', 'infra', 'docs']),
            artifacts: zod_1.z.custom(),
            issue: zod_1.z.string().optional(),
        });
        const parsed = schema.parse(req.body);
        const payload = {
            target: parsed.target,
            artifacts: parsed.artifacts,
            issue: parsed.issue,
        };
        const kind = req.params.kind;
        if (kind === 'bugfix') {
            res.json({ success: true, data: await agents_1.Agents.bugfix(payload) });
        }
        else if (kind === 'perf') {
            res.json({ success: true, data: await agents_1.Agents.performance(payload) });
        }
        else if (kind === 'style') {
            res.json({ success: true, data: await agents_1.Agents.style(payload) });
        }
        else {
            res.status(400).json({ success: false, error: 'Unknown agent' });
        }
    }
    catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});
exports.default = router;
//# sourceMappingURL=orchestration.js.map