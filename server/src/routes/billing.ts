import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// ---------- Data models (in-memory for dev) ----------

type Cycle = 'monthly'|'annual';
interface Plan { id: string; name: string; priceMonthlyCents: number; priceAnnualCents: number; quotas: { projects: number; aiTokens: number; deployMinutes: number; collabSeats: number; }; overage: { aiPer1kTokensCents: number; deployPerMinuteCents: number; extraSeatPerMonthCents: number; }; features: string[]; }
interface Subscription { userId: string; planId: string; status: 'active'|'canceled'|'past_due'; cycle: Cycle; startedAt: string; renewalAt: string; overrides?: Partial<Plan['quotas']>; }
interface Usage { userId: string; periodStart: string; periodEnd: string; aiTokens: number; deployMinutes: number; projects: number; collabSeats: number; updatedAt: string; }
interface InvoiceItem { description: string; amountCents: number; quantity?: number; }
interface Invoice { id: string; userId: string; periodStart: string; periodEnd: string; items: InvoiceItem[]; subtotalCents: number; totalCents: number; createdAt: string; }

const plans: Plan[] = [
  { id: 'free', name: 'Free', priceMonthlyCents: 0, priceAnnualCents: 0, quotas: { projects: 3, aiTokens: 25000, deployMinutes: 30, collabSeats: 1 }, overage: { aiPer1kTokensCents: 0, deployPerMinuteCents: 0, extraSeatPerMonthCents: 0 }, features: ['Basic features'] },
  { id: 'pro', name: 'Pro', priceMonthlyCents: 1200, priceAnnualCents: 12000, quotas: { projects: 50, aiTokens: 150000, deployMinutes: 600, collabSeats: 5 }, overage: { aiPer1kTokensCents: 2, deployPerMinuteCents: 1, extraSeatPerMonthCents: 500 }, features: ['Priority support','Advanced codegen'] },
  { id: 'enterprise', name: 'Enterprise', priceMonthlyCents: 9900, priceAnnualCents: 99000, quotas: { projects: 1000, aiTokens: 5000000, deployMinutes: 20000, collabSeats: 500 }, overage: { aiPer1kTokensCents: 1, deployPerMinuteCents: 1, extraSeatPerMonthCents: 300 }, features: ['SLA','SSO','Custom contracts'] }
];

const subscriptionsByUser = new Map<string, Subscription>();
const usageByUser = new Map<string, Usage>();
const invoices: Invoice[] = [];

function id() { return Math.random().toString(36).slice(2); }
function nowIso() { return new Date().toISOString(); }
function addMonths(date: Date, months: number) { const d = new Date(date); d.setMonth(d.getMonth() + months); return d; }
function addYears(date: Date, years: number) { const d = new Date(date); d.setFullYear(d.getFullYear() + years); return d; }
function isAdmin(userId: string) { return (process.env.ADMIN_USER_IDS || '').split(',').map(s=>s.trim()).filter(Boolean).includes(userId); }

function startNewPeriod(userId: string, cycle: Cycle) {
  const now = new Date();
  const periodStart = now.toISOString();
  const periodEnd = (cycle === 'monthly' ? addMonths(now, 1) : addYears(now, 1)).toISOString();
  usageByUser.set(userId, { userId, periodStart, periodEnd, aiTokens: 0, deployMinutes: 0, projects: 0, collabSeats: 0, updatedAt: nowIso() });
}

function ensureUsage(userId: string, cycle: Cycle) {
  const u = usageByUser.get(userId);
  if (!u) startNewPeriod(userId, cycle);
  else if (new Date(u.periodEnd) < new Date()) startNewPeriod(userId, cycle);
  return usageByUser.get(userId)!;
}

function getPlan(planId: string) { const p = plans.find(p=>p.id===planId); if(!p) throw new Error('Plan not found'); return p; }

function getQuota(userId: string) {
  const sub = subscriptionsByUser.get(userId); if (!sub) return plans[0].quotas; // default free
  const plan = getPlan(sub.planId);
  return { ...plan.quotas, ...(sub.overrides || {}) };
}

function remaining(userId: string) {
  const sub = subscriptionsByUser.get(userId);
  const cycle = sub?.cycle || 'monthly';
  const usage = ensureUsage(userId, cycle);
  const q = getQuota(userId);
  return {
    projects: Math.max(0, q.projects - usage.projects),
    aiTokens: Math.max(0, q.aiTokens - usage.aiTokens),
    deployMinutes: Math.max(0, q.deployMinutes - usage.deployMinutes),
    collabSeats: Math.max(0, q.collabSeats - usage.collabSeats)
  };
}

function prorate(oldCents: number, newCents: number, cycle: Cycle, startedAt: string, renewalAt: string) {
  const now = new Date();
  const start = new Date(startedAt); const end = new Date(renewalAt);
  const totalMs = end.getTime() - start.getTime();
  const remainingMs = Math.max(0, end.getTime() - now.getTime());
  const fraction = totalMs > 0 ? remainingMs / totalMs : 0;
  const diff = newCents - oldCents;
  const prorated = Math.round(diff * fraction);
  return { fraction, proratedDiffCents: prorated };
}

// ---------- Routes ----------

// Plans are public
router.get('/plans', (_req, res) => {
  res.json({ success: true, data: plans });
});

// Subscription info
router.get('/subscription', authenticateToken, (req: any, res) => {
  const sub = subscriptionsByUser.get(req.user!.userId) || null;
  res.json({ success: true, data: sub });
});

router.post('/subscribe', authenticateToken, (req: any, res) => {
  const schema = z.object({ planId: z.string(), cycle: z.enum(['monthly','annual']).default('monthly') });
  const p = schema.parse(req.body);
  const plan = getPlan(p.planId);
  const now = new Date();
  const renewalAt = (p.cycle === 'monthly' ? addMonths(now, 1) : addYears(now, 1)).toISOString();
  const sub: Subscription = { userId: req.user!.userId, planId: plan.id, status: 'active', cycle: p.cycle, startedAt: nowIso(), renewalAt };
  subscriptionsByUser.set(req.user!.userId, sub);
  startNewPeriod(req.user!.userId, p.cycle);
  res.status(201).json({ success: true, data: sub });
});

router.post('/subscription/change', authenticateToken, (req: any, res) => {
  const schema = z.object({ planId: z.string() });
  const p = schema.parse(req.body);
  const sub = subscriptionsByUser.get(req.user!.userId);
  if (!sub) return res.status(400).json({ success: false, error: 'No active subscription' });
  const oldPlan = getPlan(sub.planId); const newPlan = getPlan(p.planId);
  const oldPrice = sub.cycle === 'monthly' ? oldPlan.priceMonthlyCents : oldPlan.priceAnnualCents;
  const newPrice = sub.cycle === 'monthly' ? newPlan.priceMonthlyCents : newPlan.priceAnnualCents;
  const pr = prorate(oldPrice, newPrice, sub.cycle, sub.startedAt, sub.renewalAt);
  sub.planId = newPlan.id; sub.startedAt = nowIso(); sub.renewalAt = (sub.cycle === 'monthly' ? addMonths(new Date(), 1) : addYears(new Date(), 1)).toISOString();
  subscriptionsByUser.set(req.user!.userId, sub);
  res.json({ success: true, data: { subscription: sub, proration: pr } });
});

router.post('/subscription/cancel', authenticateToken, (req: any, res) => {
  const sub = subscriptionsByUser.get(req.user!.userId);
  if (!sub) return res.status(400).json({ success: false, error: 'No active subscription' });
  sub.status = 'canceled'; subscriptionsByUser.set(req.user!.userId, sub);
  res.json({ success: true, data: sub });
});

router.post('/subscription/resume', authenticateToken, (req: any, res) => {
  const sub = subscriptionsByUser.get(req.user!.userId);
  if (!sub) return res.status(400).json({ success: false, error: 'No subscription' });
  sub.status = 'active'; subscriptionsByUser.set(req.user!.userId, sub);
  res.json({ success: true, data: sub });
});

// Usage & Credits
router.get('/usage', authenticateToken, (req: any, res) => {
  const sub = subscriptionsByUser.get(req.user!.userId);
  const cycle: Cycle = sub?.cycle || 'monthly';
  const usage = ensureUsage(req.user!.userId, cycle);
  res.json({ success: true, data: { usage, remaining: remaining(req.user!.userId) } });
});

router.get('/check', authenticateToken, (req: any, res) => {
  const schema = z.object({ type: z.enum(['ai','build','project','seat']), amount: z.coerce.number().default(1) });
  const p = schema.parse(req.query);
  const rem = remaining(req.user!.userId);
  const map: any = { ai: rem.aiTokens, build: rem.deployMinutes, project: rem.projects, seat: rem.collabSeats };
  const allowed = map[p.type] >= p.amount;
  res.json({ success: true, data: { allowed, remaining: map[p.type] } });
});

router.post('/usage/add', authenticateToken, (req: any, res) => {
  const schema = z.object({ type: z.enum(['ai','build','project','seat']), amount: z.number().positive() });
  const p = schema.parse(req.body);
  const sub = subscriptionsByUser.get(req.user!.userId);
  const cycle: Cycle = sub?.cycle || 'monthly';
  const u = ensureUsage(req.user!.userId, cycle);
  const rem = remaining(req.user!.userId);
  const mapRem: any = { ai: rem.aiTokens, build: rem.deployMinutes, project: rem.projects, seat: rem.collabSeats };
  if (mapRem[p.type] < p.amount) return res.status(429).json({ success: false, error: 'Quota exceeded', throttle: true, remaining: mapRem[p.type] });
  if (p.type === 'ai') u.aiTokens += p.amount; else if (p.type === 'build') u.deployMinutes += p.amount; else if (p.type === 'project') u.projects += p.amount; else if (p.type === 'seat') u.collabSeats += p.amount;
  u.updatedAt = nowIso(); usageByUser.set(req.user!.userId, u);
  res.json({ success: true, data: { usage: u, remaining: remaining(req.user!.userId) } });
});

router.post('/usage/reset', authenticateToken, (req: any, res) => {
  if (!isAdmin(req.user!.userId)) return res.status(403).json({ success: false, error: 'Admin only' });
  const schema = z.object({ userId: z.string(), cycle: z.enum(['monthly','annual']).default('monthly') });
  const p = schema.parse(req.body);
  startNewPeriod(p.userId, p.cycle);
  res.json({ success: true, data: usageByUser.get(p.userId) });
});

// Invoices & overrides
router.get('/invoices', authenticateToken, (req: any, res) => {
  const userId = req.user!.userId;
  res.json({ success: true, data: invoices.filter(i => i.userId === userId) });
});

router.post('/invoices/generate', authenticateToken, (req: any, res) => {
  const userId = req.user!.userId;
  const sub = subscriptionsByUser.get(userId);
  if (!sub) return res.status(400).json({ success: false, error: 'No subscription' });
  const plan = getPlan(sub.planId);
  const u = ensureUsage(userId, sub.cycle);
  const items: InvoiceItem[] = [];
  // Base subscription item
  const baseCents = sub.cycle === 'monthly' ? plan.priceMonthlyCents : plan.priceAnnualCents;
  items.push({ description: `${plan.name} plan (${sub.cycle})`, amountCents: baseCents });
  // Overage examples
  const overAi = Math.max(0, u.aiTokens - (getQuota(userId).aiTokens));
  if (overAi > 0) {
    const units = Math.ceil(overAi / 1000);
    items.push({ description: `AI overage (${units}k tokens)`, amountCents: units * plan.overage.aiPer1kTokensCents });
  }
  const overBuild = Math.max(0, u.deployMinutes - (getQuota(userId).deployMinutes));
  if (overBuild > 0) items.push({ description: `Build minutes overage (${overBuild})`, amountCents: overBuild * plan.overage.deployPerMinuteCents });

  const subtotal = items.reduce((s,i)=>s+i.amountCents,0);
  const inv: Invoice = { id: id(), userId, periodStart: u.periodStart, periodEnd: u.periodEnd, items, subtotalCents: subtotal, totalCents: subtotal, createdAt: nowIso() };
  invoices.push(inv);
  res.status(201).json({ success: true, data: inv });
});

router.get('/invoices/:id/export', authenticateToken, (req: any, res) => {
  const inv = invoices.find(i => i.id === req.params.id && i.userId === req.user!.userId);
  if (!inv) return res.status(404).json({ success: false, error: 'Invoice not found' });
  res.setHeader('Content-Type','application/json');
  res.send(JSON.stringify(inv, null, 2));
});

router.post('/admin/override-subscription', authenticateToken, (req: any, res) => {
  if (!isAdmin(req.user!.userId)) return res.status(403).json({ success: false, error: 'Admin only' });
  const schema = z.object({ userId: z.string(), planId: z.string(), overrides: z.object({ projects: z.number().optional(), aiTokens: z.number().optional(), deployMinutes: z.number().optional(), collabSeats: z.number().optional() }).optional() });
  const p = schema.parse(req.body);
  const existing = subscriptionsByUser.get(p.userId);
  if (!existing) return res.status(404).json({ success: false, error: 'Subscription not found' });
  existing.planId = p.planId; existing.overrides = p.overrides; subscriptionsByUser.set(p.userId, existing);
  res.json({ success: true, data: existing });
});

router.post('/admin/credit-grant', authenticateToken, (req: any, res) => {
  if (!isAdmin(req.user!.userId)) return res.status(403).json({ success: false, error: 'Admin only' });
  const schema = z.object({ userId: z.string(), credits: z.object({ aiTokens: z.number().optional(), deployMinutes: z.number().optional(), projects: z.number().optional(), collabSeats: z.number().optional() }) });
  const p = schema.parse(req.body);
  const sub = subscriptionsByUser.get(p.userId); const cycle: Cycle = sub?.cycle || 'monthly';
  const u = ensureUsage(p.userId, cycle);
  if (p.credits.aiTokens) u.aiTokens = Math.max(0, u.aiTokens - p.credits.aiTokens);
  if (p.credits.deployMinutes) u.deployMinutes = Math.max(0, u.deployMinutes - p.credits.deployMinutes);
  if (p.credits.projects) u.projects = Math.max(0, u.projects - p.credits.projects);
  if (p.credits.collabSeats) u.collabSeats = Math.max(0, u.collabSeats - p.credits.collabSeats);
  u.updatedAt = nowIso(); usageByUser.set(p.userId, u);
  res.json({ success: true, data: u });
});

export default router;
