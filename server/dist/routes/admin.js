"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
function isAdmin(userId) {
    const adminList = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    return adminList.includes(userId);
}
router.use(auth_1.authenticateToken);
// ---------- Internal Control Panel ----------
// Users
router.get('/users', async (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search ? { OR: [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }] } : {};
    const users = await prisma.user.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } });
    const total = await prisma.user.count({ where });
    res.json({ success: true, data: users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});
router.put('/users/:id', async (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const schema = zod_1.z.object({ name: zod_1.z.string().optional() });
    const p = schema.parse(req.body);
    try {
        const user = await prisma.user.update({ where: { id: req.params.id }, data: p });
        res.json({ success: true, data: user });
    }
    catch (e) {
        res.status(404).json({ success: false, error: 'User not found' });
    }
});
const workspaces = new Map();
function wid() { return 'ws_' + Math.random().toString(36).slice(2); }
router.post('/workspaces', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const schema = zod_1.z.object({ name: zod_1.z.string(), ownerId: zod_1.z.string() });
    const p = schema.parse(req.body);
    const ws = { id: wid(), name: p.name, ownerId: p.ownerId, credits: { aiTokens: 100000, deployMinutes: 1000 }, members: [{ userId: p.ownerId, role: 'owner' }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    workspaces.set(ws.id, ws);
    res.status(201).json({ success: true, data: ws });
});
router.get('/workspaces', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    res.json({ success: true, data: Array.from(workspaces.values()) });
});
router.put('/workspaces/:id', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const ws = workspaces.get(req.params.id);
    if (!ws)
        return res.status(404).json({ success: false, error: 'Not found' });
    const schema = zod_1.z.object({ name: zod_1.z.string().optional(), credits: zod_1.z.object({ aiTokens: zod_1.z.number().int().nonnegative().optional(), deployMinutes: zod_1.z.number().int().nonnegative().optional() }).optional() });
    const p = schema.parse(req.body);
    if (p.name)
        ws.name = p.name;
    if (p.credits)
        ws.credits = { ...ws.credits, ...p.credits };
    ws.updatedAt = new Date().toISOString();
    workspaces.set(ws.id, ws);
    res.json({ success: true, data: ws });
});
router.post('/workspaces/:id/members', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const schema = zod_1.z.object({ userId: zod_1.z.string(), role: zod_1.z.enum(['owner', 'admin', 'member']).default('member') });
    const p = schema.parse(req.body);
    const ws = workspaces.get(req.params.id);
    if (!ws)
        return res.status(404).json({ success: false, error: 'Not found' });
    const existing = ws.members.find(m => m.userId === p.userId);
    if (existing)
        existing.role = p.role;
    else
        ws.members.push({ userId: p.userId, role: p.role });
    ws.updatedAt = new Date().toISOString();
    res.json({ success: true, data: ws });
});
router.delete('/workspaces/:id/members/:userId', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const ws = workspaces.get(req.params.id);
    if (!ws)
        return res.status(404).json({ success: false, error: 'Not found' });
    ws.members = ws.members.filter(m => m.userId !== req.params.userId);
    ws.updatedAt = new Date().toISOString();
    res.json({ success: true, data: ws });
});
const cases = new Map();
function cid() { return 'case_' + Math.random().toString(36).slice(2); }
router.post('/support/cases', (req, res) => {
    const schema = zod_1.z.object({ subject: zod_1.z.string(), severity: zod_1.z.enum(['low', 'medium', 'high']) });
    const p = schema.parse(req.body);
    const c = { id: cid(), userId: req.user.userId, subject: p.subject, severity: p.severity, status: 'open', messages: [], logs: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    cases.set(c.id, c);
    res.status(201).json({ success: true, data: c });
});
router.get('/support/cases', (req, res) => {
    const { all } = req.query;
    const uid = req.user.userId;
    const list = Array.from(cases.values()).filter(x => all && isAdmin(uid) ? true : x.userId === uid);
    res.json({ success: true, data: list });
});
router.get('/support/cases/:id', (req, res) => {
    const c = cases.get(req.params.id);
    if (!c)
        return res.status(404).json({ success: false, error: 'Not found' });
    if (!isAdmin(req.user.userId) && c.userId !== req.user.userId)
        return res.status(403).json({ success: false, error: 'Forbidden' });
    res.json({ success: true, data: c });
});
router.post('/support/cases/:id/reply', (req, res) => {
    const schema = zod_1.z.object({ text: zod_1.z.string() });
    const p = schema.parse(req.body);
    const c = cases.get(req.params.id);
    if (!c)
        return res.status(404).json({ success: false, error: 'Not found' });
    const from = isAdmin(req.user.userId) ? 'admin' : 'user';
    c.messages.push({ from, text: p.text, ts: new Date().toISOString() });
    c.updatedAt = new Date().toISOString();
    res.json({ success: true, data: c });
});
router.post('/support/cases/:id/close', (req, res) => {
    const c = cases.get(req.params.id);
    if (!c)
        return res.status(404).json({ success: false, error: 'Not found' });
    if (!isAdmin(req.user.userId) && c.userId !== req.user.userId)
        return res.status(403).json({ success: false, error: 'Forbidden' });
    c.status = 'closed';
    c.updatedAt = new Date().toISOString();
    res.json({ success: true, data: c });
});
router.post('/support/cases/:id/attach-logs', (req, res) => {
    const schema = zod_1.z.object({ entries: zod_1.z.array(zod_1.z.string()) });
    const p = schema.parse(req.body);
    const c = cases.get(req.params.id);
    if (!c)
        return res.status(404).json({ success: false, error: 'Not found' });
    c.logs.push(...p.entries);
    c.updatedAt = new Date().toISOString();
    res.json({ success: true, data: c });
});
// Session replay (consent-driven, in-memory)
const replayConsentByUser = new Map();
const sessionEvents = new Map();
router.post('/support/replay/consent', (req, res) => {
    const schema = zod_1.z.object({ consent: zod_1.z.boolean() });
    const p = schema.parse(req.body);
    replayConsentByUser.set(req.user.userId, p.consent);
    res.json({ success: true, data: { userId: req.user.userId, consent: p.consent } });
});
router.post('/support/replay/:sessionId/ingest', (req, res) => {
    const consent = replayConsentByUser.get(req.user.userId);
    if (!consent)
        return res.status(400).json({ success: false, error: 'Consent required' });
    const events = Array.isArray(req.body?.events) ? req.body.events : [];
    sessionEvents.set(req.params.sessionId, { sessionId: req.params.sessionId, userId: req.user.userId, events, createdAt: new Date().toISOString() });
    res.status(201).json({ success: true });
});
router.get('/support/replay/:sessionId', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const sess = sessionEvents.get(req.params.sessionId);
    if (!sess)
        return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: sess });
});
router.get('/support/cases/:id/logbundle', (req, res) => {
    const c = cases.get(req.params.id);
    if (!c)
        return res.status(404).json({ success: false, error: 'Not found' });
    if (!isAdmin(req.user.userId) && c.userId !== req.user.userId)
        return res.status(403).json({ success: false, error: 'Forbidden' });
    const bundle = { caseId: c.id, createdAt: new Date().toISOString(), messages: c.messages, logs: c.logs };
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(bundle, null, 2));
});
const flags = new Map();
router.get('/flags', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    res.json({ success: true, data: Array.from(flags.values()) });
});
router.post('/flags', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const schema = zod_1.z.object({ key: zod_1.z.string(), description: zod_1.z.string().optional(), enabled: zod_1.z.boolean().default(false) });
    const p = schema.parse(req.body);
    const def = { key: p.key, description: p.description, enabled: p.enabled, updatedAt: new Date().toISOString() };
    flags.set(def.key, def);
    res.status(201).json({ success: true, data: def });
});
router.put('/flags/:key', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const def = flags.get(req.params.key);
    if (!def)
        return res.status(404).json({ success: false, error: 'Not found' });
    const schema = zod_1.z.object({ description: zod_1.z.string().optional(), enabled: zod_1.z.boolean().optional(), targets: zod_1.z.array(zod_1.z.string()).optional() });
    const p = schema.parse(req.body);
    Object.assign(def, p, { updatedAt: new Date().toISOString() });
    flags.set(def.key, def);
    res.json({ success: true, data: def });
});
router.post('/flags/:key/rollout', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const def = flags.get(req.params.key);
    if (!def)
        return res.status(404).json({ success: false, error: 'Not found' });
    const schema = zod_1.z.object({ percent: zod_1.z.number().min(0).max(100), env: zod_1.z.string().optional() });
    const p = schema.parse(req.body);
    if (p.env) {
        def.staged = def.staged || {};
        def.staged[p.env] = p.percent;
    }
    else {
        def.rolloutPercent = p.percent;
    }
    def.updatedAt = new Date().toISOString();
    flags.set(def.key, def);
    res.json({ success: true, data: def });
});
router.post('/flags/:key/kill', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const def = flags.get(req.params.key);
    if (!def)
        return res.status(404).json({ success: false, error: 'Not found' });
    const schema = zod_1.z.object({ on: zod_1.z.boolean() });
    const p = schema.parse(req.body);
    def.killSwitch = p.on;
    def.enabled = !p.on && def.enabled;
    def.updatedAt = new Date().toISOString();
    flags.set(def.key, def);
    res.json({ success: true, data: def });
});
const kb = new Map();
function kid() { return 'kb_' + Math.random().toString(36).slice(2); }
router.get('/kb/articles', (_req, res) => {
    res.json({ success: true, data: Array.from(kb.values()) });
});
router.post('/kb/articles', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const schema = zod_1.z.object({ title: zod_1.z.string(), body: zod_1.z.string(), tags: zod_1.z.array(zod_1.z.string()).optional() });
    const p = schema.parse(req.body);
    const a = { id: kid(), title: p.title, body: p.body, tags: p.tags, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    kb.set(a.id, a);
    res.status(201).json({ success: true, data: a });
});
router.put('/kb/articles/:id', (req, res) => {
    if (!isAdmin(req.user.userId))
        return res.status(403).json({ success: false, error: 'Admin only' });
    const a = kb.get(req.params.id);
    if (!a)
        return res.status(404).json({ success: false, error: 'Not found' });
    const schema = zod_1.z.object({ title: zod_1.z.string().optional(), body: zod_1.z.string().optional(), tags: zod_1.z.array(zod_1.z.string()).optional() });
    const p = schema.parse(req.body);
    Object.assign(a, p, { updatedAt: new Date().toISOString() });
    kb.set(a.id, a);
    res.json({ success: true, data: a });
});
const flows = [
    { id: 'network-issues', name: 'Network issues', steps: ['Check connection', 'Retry after 5 minutes', 'Collect logs', 'Escalate to admin'] },
    { id: 'failed-deploy', name: 'Failed deployment', steps: ['View pipeline logs', 'Retry build', 'Rollback to previous release'] }
];
router.get('/diagnostics/flows', (_req, res) => {
    res.json({ success: true, data: flows });
});
router.post('/diagnostics/flows/run', (req, res) => {
    const schema = zod_1.z.object({ flowId: zod_1.z.string(), inputs: zod_1.z.record(zod_1.z.any()).optional() });
    const p = schema.parse(req.body);
    const flow = flows.find(f => f.id === p.flowId);
    if (!flow)
        return res.status(404).json({ success: false, error: 'Flow not found' });
    const result = { completed: true, nextSteps: flow.steps, notes: 'This is a simulated guided flow. Use logs to investigate further.' };
    res.json({ success: true, data: result });
});
exports.default = router;
//# sourceMappingURL=admin.js.map