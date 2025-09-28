import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// In-memory data stores for community features
const followers = new Map<string, Set<string>>(); // userId -> follower userIds
const achievementsByUser = new Map<string, { id: string; title: string; description?: string; ts: string }[]>();
const moderationQueue: { id: string; itemType: 'project'|'user'|'comment'; itemId: string; reason: string; status: 'pending'|'approved'|'rejected'; reporterId: string; ts: string }[] = [];
const dmcaQueue: { id: string; projectId: string; claimant: string; contact: string; reason: string; status: 'pending'|'approved'|'rejected'; ts: string }[] = [];
const templates: { id: string; projectId: string; creatorId: string; name: string; description?: string; priceCents: number; revenueShare: number; createdAt: string; }[] = [];
const tips: { id: string; toUserId: string; fromUserId: string; amountCents: number; note?: string; ts: string }[] = [];

function id() { return Math.random().toString(36).slice(2); }
function isAdmin(userId: string): boolean {
  const adminList = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  return adminList.includes(userId);
}

// -------- Public Gallery --------
router.get('/gallery', async (req, res) => {
  try {
    const { q, page = '1', limit = '20', sort = 'updatedAt:desc' } = req.query as any;
    const [sortBy, sortOrder] = (sort as string).split(':');
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isPublic: true };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { forks: true, versions: true, exports: true } }
      },
      orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.project.count({ where });

    const data = projects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      thumbnail: (p as any).thumbnail,
      author: p.user,
      techStack: deriveTechStackSafe(p.appData),
      analytics: {
        views: (p as any).viewCount || 0,
        forks: (p as any)._count?.forks || 0,
        versions: (p as any)._count?.versions || 0
      },
      createdAt: p.createdAt,
      updatedAt: (p as any).updatedAt
    }));

    res.json({ success: true, data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (e) {
    console.error('Gallery error', e);
    res.status(500).json({ success: false, error: 'Failed to fetch gallery' });
  }
});

router.get('/gallery/:id', async (req, res) => {
  try {
    const p = await prisma.project.findFirst({ where: { id: req.params.id, isPublic: true }, include: { user: { select: { id: true, name: true, avatar: true } }, _count: { select: { forks: true, versions: true, exports: true } } } });
    if (!p) return res.status(404).json({ success: false, error: 'Not found' });
    const detail = {
      id: p.id,
      name: p.name,
      description: p.description,
      thumbnail: (p as any).thumbnail,
      author: p.user,
      techStack: deriveTechStackSafe(p.appData),
      analytics: {
        views: (p as any).viewCount || 0,
        forks: (p as any)._count?.forks || 0,
        versions: (p as any)._count?.versions || 0,
        exports: (p as any)._count?.exports || 0
      },
      createdAt: p.createdAt,
      updatedAt: (p as any).updatedAt
    };
    res.json({ success: true, data: detail });
  } catch (e) {
    console.error('Gallery detail error', e);
    res.status(500).json({ success: false, error: 'Failed to fetch item' });
  }
});

router.post('/gallery/:id/remix', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user!.userId;
    const project = await prisma.project.findFirst({ where: { id: req.params.id, isPublic: true } });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const forkedProject = await prisma.project.create({
      data: {
        name: `${project.name} (Remix)`,
        description: project.description,
        appData: project.appData,
        thumbnail: (project as any).thumbnail,
        isPublic: false,
        userId,
        parentProjectId: project.id
      },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
    });

    await prisma.project.update({ where: { id: project.id }, data: { forkCount: { increment: 1 } } });

    await prisma.projectVersion.create({ data: { version: 1, name: 'Remix initial', appData: project.appData as any, changes: 'Remixed from gallery', projectId: forkedProject.id, userId } });

    res.status(201).json({ success: true, data: forkedProject });
  } catch (e) {
    console.error('Remix error', e);
    res.status(500).json({ success: false, error: 'Failed to remix' });
  }
});

// -------- User Profiles --------
router.get('/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, avatar: true, createdAt: true } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const apps = await prisma.project.findMany({ where: { userId, isPublic: true }, select: { id: true, name: true, description: true, createdAt: true } });
    const followerCount = followers.get(userId)?.size || 0;
    const achievements = achievementsByUser.get(userId) || [];

    res.json({ success: true, data: { user, portfolio: apps, followerCount, achievements } });
  } catch (e) {
    console.error('Profile error', e);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

router.post('/profiles/:userId/follow', authenticateToken, (req: any, res) => {
  const target = req.params.userId; const actor = req.user!.userId;
  if (target === actor) return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
  const set = followers.get(target) || new Set<string>();
  if (set.has(actor)) set.delete(actor); else set.add(actor);
  followers.set(target, set);
  res.json({ success: true, data: { followerCount: set.size, following: set.has(actor) } });
});

// -------- Moderation Tools --------
router.post('/moderation/flag', authenticateToken, (req: any, res) => {
  const schema = z.object({ itemType: z.enum(['project','user','comment']), itemId: z.string(), reason: z.string() });
  const p = schema.parse(req.body);
  const flag = { id: id(), itemType: p.itemType, itemId: p.itemId, reason: p.reason, status: 'pending' as const, reporterId: req.user!.userId, ts: new Date().toISOString() };
  moderationQueue.push(flag);
  res.status(201).json({ success: true, data: flag });
});

router.get('/moderation/review', authenticateToken, (req: any, res) => {
  if (!isAdmin(req.user!.userId)) return res.status(403).json({ success: false, error: 'Admin only' });
  res.json({ success: true, data: moderationQueue.filter(x => x.status === 'pending') });
});

router.post('/moderation/review/:id/:action', authenticateToken, async (req: any, res) => {
  if (!isAdmin(req.user!.userId)) return res.status(403).json({ success: false, error: 'Admin only' });
  const action = req.params.action as 'approve'|'reject';
  const item = moderationQueue.find(x => x.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'Not found' });
  item.status = action === 'approve' ? 'approved' : 'rejected';
  // Optionally take action
  if (item.itemType === 'project' && action === 'approve') {
    try { await prisma.project.update({ where: { id: item.itemId }, data: { isPublic: false } }); } catch {}
  }
  res.json({ success: true, data: item });
});

router.post('/moderation/dmca/submit', authenticateToken, (req: any, res) => {
  const schema = z.object({ projectId: z.string(), claimant: z.string(), contact: z.string(), reason: z.string() });
  const p = schema.parse(req.body);
  const record = { id: id(), projectId: p.projectId, claimant: p.claimant, contact: p.contact, reason: p.reason, status: 'pending' as const, ts: new Date().toISOString() };
  dmcaQueue.push(record);
  res.status(201).json({ success: true, data: record });
});

router.post('/moderation/dmca/:id/approve', authenticateToken, async (req: any, res) => {
  if (!isAdmin(req.user!.userId)) return res.status(403).json({ success: false, error: 'Admin only' });
  const rec = dmcaQueue.find(x => x.id === req.params.id);
  if (!rec) return res.status(404).json({ success: false, error: 'Not found' });
  rec.status = 'approved';
  try { await prisma.project.update({ where: { id: rec.projectId }, data: { isPublic: false } }); } catch {}
  res.json({ success: true, data: rec });
});

router.post('/moderation/dmca/:id/reject', authenticateToken, (req: any, res) => {
  if (!isAdmin(req.user!.userId)) return res.status(403).json({ success: false, error: 'Admin only' });
  const rec = dmcaQueue.find(x => x.id === req.params.id);
  if (!rec) return res.status(404).json({ success: false, error: 'Not found' });
  rec.status = 'rejected';
  res.json({ success: true, data: rec });
});

// -------- Monetization --------
router.post('/monetization/templates', authenticateToken, (req: any, res) => {
  const schema = z.object({ projectId: z.string(), name: z.string(), description: z.string().optional(), priceCents: z.number().int().nonnegative(), revenueShare: z.number().min(0).max(1).default(0.9) });
  const p = schema.parse(req.body);
  const listing = { id: id(), projectId: p.projectId, creatorId: req.user!.userId, name: p.name, description: p.description, priceCents: p.priceCents, revenueShare: p.revenueShare, createdAt: new Date().toISOString() };
  templates.push(listing);
  res.status(201).json({ success: true, data: listing });
});

router.get('/monetization/templates', (req, res) => {
  const { q } = req.query as any;
  const data = templates.filter(t => !q || t.name.toLowerCase().includes((q as string).toLowerCase()));
  res.json({ success: true, data });
});

router.post('/monetization/tips', authenticateToken, (req: any, res) => {
  const schema = z.object({ toUserId: z.string(), amountCents: z.number().int().positive(), note: z.string().optional() });
  const p = schema.parse(req.body);
  const tip = { id: id(), toUserId: p.toUserId, fromUserId: req.user!.userId, amountCents: p.amountCents, note: p.note, ts: new Date().toISOString() };
  tips.push(tip);
  res.status(201).json({ success: true, data: tip });
});

// Utils
function deriveTechStackSafe(appData: any): string[] {
  try {
    const parsed = typeof appData === 'string' ? JSON.parse(appData) : appData;
    const stack: string[] = [];
    if (parsed?.config?.framework) stack.push(parsed.config.framework);
    if (parsed?.config?.language) stack.push(parsed.config.language);
    if (parsed?.config?.styling) stack.push(parsed.config.styling);
    if (parsed?.config?.database) stack.push(parsed.config.database);
    return stack.length ? stack : ['Unknown'];
  } catch {
    return ['Unknown'];
  }
}

export default router;
