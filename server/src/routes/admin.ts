import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';

const router = Router();
const prisma = new PrismaClient();

const isAdmin = () => true;

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));


// ---------- Internal Control Panel ----------
// Users
router.get('/users', async (req: any, res) => {
  const { page = 1, limit = 20, search } = req.query as any;
  const skip = (Number(page) - 1) * Number(limit);
  const where: any = search ? { OR: [{ email: { contains: search as string, mode: 'insensitive' } }, { name: { contains: search as string, mode: 'insensitive' } }] } : {};
  const users = await prisma.user.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } });
  const total = await prisma.user.count({ where });
  res.json({ success: true, data: users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

router.put('/users/:id', async (req: any, res) => {
  const schema = z.object({ name: z.string().optional() });
  const p = schema.parse(req.body);
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: p });
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(404).json({ success: false, error: 'User not found' });
  }
});

// Workspaces (in-memory)
interface Workspace { id: string; name: string; ownerId: string; credits: { aiTokens: number; deployMinutes: number }; members: { userId: string; role: 'owner'|'admin'|'member' }[]; createdAt: string; updatedAt: string; }
const workspaces = new Map<string, Workspace>();
function wid() { return 'ws_' + Math.random().toString(36).slice(2); }

router.post('/workspaces', (req: any, res) => {
  const schema = z.object({ name: z.string(), ownerId: z.string() });
  const p = schema.parse(req.body);
  const ws: Workspace = { id: wid(), name: p.name, ownerId: p.ownerId, credits: { aiTokens: 100000, deployMinutes: 1000 }, members: [{ userId: p.ownerId, role: 'owner' }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  workspaces.set(ws.id, ws);
  res.status(201).json({ success: true, data: ws });
});

router.get('/workspaces', (req: any, res) => {
  res.json({ success: true, data: Array.from(workspaces.values()) });
});

router.put('/workspaces/:id', (req: any, res) => {
  const ws = workspaces.get(req.params.id); if (!ws) return res.status(404).json({ success: false, error: 'Not found' });
  const schema = z.object({ name: z.string().optional(), credits: z.object({ aiTokens: z.number().int().nonnegative().optional(), deployMinutes: z.number().int().nonnegative().optional() }).optional() });
  const p = schema.parse(req.body);
  if (p.name) ws.name = p.name;
  if (p.credits) ws.credits = { ...ws.credits, ...p.credits } as any;
  ws.updatedAt = new Date().toISOString();
  workspaces.set(ws.id, ws);
  res.json({ success: true, data: ws });
});

router.post('/workspaces/:id/members', (req: any, res) => {
  const schema = z.object({ userId: z.string(), role: z.enum(['owner','admin','member']).default('member') });
  const p = schema.parse(req.body);
  const ws = workspaces.get(req.params.id); if (!ws) return res.status(404).json({ success: false, error: 'Not found' });
  const existing = ws.members.find(m => m.userId === p.userId);
  if (existing) existing.role = p.role; else ws.members.push({ userId: p.userId, role: p.role });
  ws.updatedAt = new Date().toISOString();
  res.json({ success: true, data: ws });
});

router.delete('/workspaces/:id/members/:userId', (req: any, res) => {
  const ws = workspaces.get(req.params.id); if (!ws) return res.status(404).json({ success: false, error: 'Not found' });
  ws.members = ws.members.filter(m => m.userId !== req.params.userId);
  ws.updatedAt = new Date().toISOString();
  res.json({ success: true, data: ws });
});

// ---------- Support Case Management ----------
interface SupportCase { id: string; userId: string; subject: string; severity: 'low'|'medium'|'high'; status: 'open'|'pending'|'closed'; messages: { from: 'user'|'admin'; text: string; ts: string }[]; logs: string[]; sessionId?: string; consent?: boolean; createdAt: string; updatedAt: string; }
const cases = new Map<string, SupportCase>();
function cid() { return 'case_' + Math.random().toString(36).slice(2); }

router.post('/support/cases', (req: any, res) => {
  const schema = z.object({ subject: z.string(), severity: z.enum(['low','medium','high']) });
  const p = schema.parse(req.body);
  const c: SupportCase = { id: cid(), userId: req.user!.userId, subject: p.subject, severity: p.severity, status: 'open', messages: [], logs: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  cases.set(c.id, c);
  res.status(201).json({ success: true, data: c });
});

router.get('/support/cases', (req: any, res) => {
  const { all } = req.query as any;
  const uid = req.user!.userId;
  const list = Array.from(cases.values()).filter(x => all && isAdmin(uid) ? true : x.userId === uid);
  res.json({ success: true, data: list });
});

router.get('/support/cases/:id', (req: any, res) => {
  const c = cases.get(req.params.id); if (!c) return res.status(404).json({ success: false, error: 'Not found' });
  if (!isAdmin(req.user!.userId) && c.userId !== req.user!.userId) return res.status(403).json({ success: false, error: 'Forbidden' });
  res.json({ success: true, data: c });
});

router.post('/support/cases/:id/reply', (req: any, res) => {
  const schema = z.object({ text: z.string() });
  const p = schema.parse(req.body);
  const c = cases.get(req.params.id); if (!c) return res.status(404).json({ success: false, error: 'Not found' });
  const from: 'user'|'admin' = isAdmin(req.user!.userId) ? 'admin' : 'user';
  c.messages.push({ from, text: p.text, ts: new Date().toISOString() });
  c.updatedAt = new Date().toISOString();
  res.json({ success: true, data: c });
});

router.post('/support/cases/:id/close', (req: any, res) => {
  const c = cases.get(req.params.id); if (!c) return res.status(404).json({ success: false, error: 'Not found' });
  if (!isAdmin(req.user!.userId) && c.userId !== req.user!.userId) return res.status(403).json({ success: false, error: 'Forbidden' });
  c.status = 'closed'; c.updatedAt = new Date().toISOString();
  res.json({ success: true, data: c });
});

router.post('/support/cases/:id/attach-logs', (req: any, res) => {
  const schema = z.object({ entries: z.array(z.string()) });
  const p = schema.parse(req.body);
  const c = cases.get(req.params.id); if (!c) return res.status(404).json({ success: false, error: 'Not found' });
  c.logs.push(...p.entries);
  c.updatedAt = new Date().toISOString();
  res.json({ success: true, data: c });
});

// Session replay (consent-driven, in-memory)
const replayConsentByUser = new Map<string, boolean>();
const sessionEvents = new Map<string, { sessionId: string; userId: string; events: any[]; createdAt: string }>();

router.post('/support/replay/consent', (req: any, res) => {
  const schema = z.object({ consent: z.boolean() });
  const p = schema.parse(req.body);
  replayConsentByUser.set(req.user!.userId, p.consent);
  res.json({ success: true, data: { userId: req.user!.userId, consent: p.consent } });
});

router.post('/support/replay/:sessionId/ingest', (req: any, res) => {
  const consent = replayConsentByUser.get(req.user!.userId);
  if (!consent) return res.status(400).json({ success: false, error: 'Consent required' });
  const events = Array.isArray(req.body?.events) ? req.body.events : [];
  sessionEvents.set(req.params.sessionId, { sessionId: req.params.sessionId, userId: req.user!.userId, events, createdAt: new Date().toISOString() });
  res.status(201).json({ success: true });
});

router.get('/support/replay/:sessionId', (req: any, res) => {
  const sess = sessionEvents.get(req.params.sessionId); if (!sess) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: sess });
});

router.get('/support/cases/:id/logbundle', (req: any, res) => {
  const c = cases.get(req.params.id); if (!c) return res.status(404).json({ success: false, error: 'Not found' });
  if (!isAdmin(req.user!.userId) && c.userId !== req.user!.userId) return res.status(403).json({ success: false, error: 'Forbidden' });
  const bundle = { caseId: c.id, createdAt: new Date().toISOString(), messages: c.messages, logs: c.logs };
  res.setHeader('Content-Type','application/json');
  res.send(JSON.stringify(bundle, null, 2));
});

// ---------- Feature Flag Administration ----------
interface FlagDef { key: string; description?: string; enabled: boolean; killSwitch?: boolean; rolloutPercent?: number; staged?: Record<string, number>; targets?: string[]; updatedAt: string }
const flags = new Map<string, FlagDef>();

router.get('/flags', (req: any, res) => {
  res.json({ success: true, data: Array.from(flags.values()) });
});

router.post('/flags', (req: any, res) => {
  const schema = z.object({ key: z.string(), description: z.string().optional(), enabled: z.boolean().default(false) });
  const p = schema.parse(req.body);
  const def: FlagDef = { key: p.key, description: p.description, enabled: p.enabled, updatedAt: new Date().toISOString() };
  flags.set(def.key, def);
  res.status(201).json({ success: true, data: def });
});

router.put('/flags/:key', (req: any, res) => {
  const def = flags.get(req.params.key); if (!def) return res.status(404).json({ success: false, error: 'Not found' });
  const schema = z.object({ description: z.string().optional(), enabled: z.boolean().optional(), targets: z.array(z.string()).optional() });
  const p = schema.parse(req.body);
  Object.assign(def, p, { updatedAt: new Date().toISOString() });
  flags.set(def.key, def);
  res.json({ success: true, data: def });
});

router.post('/flags/:key/rollout', (req: any, res) => {
  const def = flags.get(req.params.key); if (!def) return res.status(404).json({ success: false, error: 'Not found' });
  const schema = z.object({ percent: z.number().min(0).max(100), env: z.string().optional() });
  const p = schema.parse(req.body);
  if (p.env) { def.staged = def.staged || {}; def.staged[p.env] = p.percent; } else { def.rolloutPercent = p.percent; }
  def.updatedAt = new Date().toISOString();
  flags.set(def.key, def);
  res.json({ success: true, data: def });
});

router.post('/flags/:key/kill', (req: any, res) => {
  const def = flags.get(req.params.key); if (!def) return res.status(404).json({ success: false, error: 'Not found' });
  const schema = z.object({ on: z.boolean() });
  const p = schema.parse(req.body);
  def.killSwitch = p.on; def.enabled = !p.on && def.enabled; def.updatedAt = new Date().toISOString();
  flags.set(def.key, def);
  res.json({ success: true, data: def });
});

// ---------- Knowledge Base & Diagnostics ----------
interface KBArticle { id: string; title: string; body: string; tags?: string[]; createdAt: string; updatedAt: string }
const kb = new Map<string, KBArticle>();
function kid() { return 'kb_' + Math.random().toString(36).slice(2); }

router.get('/kb/articles', (_req, res) => {
  res.json({ success: true, data: Array.from(kb.values()) });
});

router.post('/kb/articles', (req: any, res) => {
  const schema = z.object({ title: z.string(), body: z.string(), tags: z.array(z.string()).optional() });
  const p = schema.parse(req.body);
  const a: KBArticle = { id: kid(), title: p.title, body: p.body, tags: p.tags, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  kb.set(a.id, a);
  res.status(201).json({ success: true, data: a });
});

router.put('/kb/articles/:id', (req: any, res) => {
  const a = kb.get(req.params.id); if (!a) return res.status(404).json({ success: false, error: 'Not found' });
  const schema = z.object({ title: z.string().optional(), body: z.string().optional(), tags: z.array(z.string()).optional() });
  const p = schema.parse(req.body);
  Object.assign(a, p, { updatedAt: new Date().toISOString() });
  kb.set(a.id, a);
  res.json({ success: true, data: a });
});

interface Flow { id: string; name: string; steps: string[] }
const flows: Flow[] = [
  { id: 'network-issues', name: 'Network issues', steps: ['Check connection', 'Retry after 5 minutes', 'Collect logs', 'Escalate to admin'] },
  { id: 'failed-deploy', name: 'Failed deployment', steps: ['View pipeline logs', 'Retry build', 'Rollback to previous release'] }
];

router.get('/diagnostics/flows', (_req, res) => {
  res.json({ success: true, data: flows });
});

router.post('/diagnostics/flows/run', (req, res) => {
  const schema = z.object({ flowId: z.string(), inputs: z.record(z.any()).optional() });
  const p = schema.parse(req.body);
  const flow = flows.find(f => f.id === p.flowId); if (!flow) return res.status(404).json({ success: false, error: 'Flow not found' });
  const result = { completed: true, nextSteps: flow.steps, notes: 'This is a simulated guided flow. Use logs to investigate further.' };
  res.json({ success: true, data: result });
});

export default router;
