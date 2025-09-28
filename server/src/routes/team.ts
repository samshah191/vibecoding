import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// In-memory stores
type Role = 'owner'|'editor'|'reviewer'|'viewer';
interface Task { id: string; title: string; status: 'todo'|'in-progress'|'done'; assignee?: string; dueDate?: string; attachments?: { type: 'diff'|'ai-task'|'file'; ref: string }[]; createdAt: string; updatedAt: string; }
interface ProjectPolicy { [userId: string]: Role; }
interface Notification { id: string; userId: string; ts: string; text: string; read?: boolean; }
interface AuditEvent { id: string; ts: string; actor: string; projectId: string; type: string; data: any }

const tasksByProject = new Map<string, Task[]>();
const policyByProject = new Map<string, ProjectPolicy>();
const notificationsByUser = new Map<string, Notification[]>();
const auditByProject = new Map<string, AuditEvent[]>();

function id() { return Math.random().toString(36).slice(2); }
function ensureProject(policy: Map<string, any>, projectId: string) { if (!policy.has(projectId)) policy.set(projectId, {}); }
function can(projectId: string, userId: string, required: Role): boolean {
  const policy = policyByProject.get(projectId) || {}; const role = (policy as ProjectPolicy)[userId];
  const order: Role[] = ['viewer','reviewer','editor','owner'];
  return !!role && order.indexOf(role) >= order.indexOf(required);
}
function recordAudit(projectId: string, actor: string, type: string, data: any) {
  const list = auditByProject.get(projectId) || []; list.push({ id: id(), ts: new Date().toISOString(), actor, projectId, type, data }); auditByProject.set(projectId, list);
}
function notify(userId: string, text: string) {
  const list = notificationsByUser.get(userId) || []; list.push({ id: id(), userId, ts: new Date().toISOString(), text }); notificationsByUser.set(userId, list);
}

// Roles & permissions
router.post('/projects/:projectId/roles', (req: any, res) => {
  const schema = z.object({ assignments: z.array(z.object({ userId: z.string(), role: z.enum(['owner','editor','reviewer','viewer']) })) });
  const p = schema.parse(req.body);
  ensureProject(policyByProject as any, req.params.projectId);
  const policy = policyByProject.get(req.params.projectId)!;
  p.assignments.forEach(a => { (policy as ProjectPolicy)[a.userId] = a.role; notify(a.userId, `You are now ${a.role} on project ${req.params.projectId}`); });
  recordAudit(req.params.projectId, req.user!.userId, 'roles.update', p.assignments);
  res.json({ success: true, data: policy });
});

router.get('/projects/:projectId/roles', (req, res) => {
  res.json({ success: true, data: policyByProject.get(req.params.projectId) || {} });
});

// Tasking & Kanban
router.post('/projects/:projectId/tasks', (req: any, res) => {
  const schema = z.object({ title: z.string(), status: z.enum(['todo','in-progress','done']).default('todo'), assignee: z.string().optional(), dueDate: z.string().optional(), attachments: z.array(z.object({ type: z.enum(['diff','ai-task','file']), ref: z.string() })).optional() });
  const p = schema.parse(req.body);
  const projectId = req.params.projectId; const userId = req.user!.userId;
  if (!can(projectId, userId, 'editor')) return res.status(403).json({ success: false, error: 'Forbidden' });
  const t: Task = { id: id(), title: p.title, status: p.status, assignee: p.assignee, dueDate: p.dueDate, attachments: p.attachments, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const list = tasksByProject.get(projectId) || []; list.push(t); tasksByProject.set(projectId, list);
  if (t.assignee) notify(t.assignee, `Assigned task: ${t.title}`);
  recordAudit(projectId, userId, 'task.create', t);
  res.status(201).json({ success: true, data: t });
});

router.get('/projects/:projectId/tasks', (req: any, res) => {
  const projectId = req.params.projectId; const userId = req.user!.userId;
  if (!can(projectId, userId, 'viewer')) return res.status(403).json({ success: false, error: 'Forbidden' });
  res.json({ success: true, data: tasksByProject.get(projectId) || [] });
});

router.put('/projects/:projectId/tasks/:taskId', (req: any, res) => {
  const schema = z.object({ title: z.string().optional(), status: z.enum(['todo','in-progress','done']).optional(), assignee: z.string().optional(), dueDate: z.string().optional() });
  const p = schema.parse(req.body);
  const projectId = req.params.projectId; const userId = req.user!.userId;
  if (!can(projectId, userId, 'editor')) return res.status(403).json({ success: false, error: 'Forbidden' });
  const list = tasksByProject.get(projectId) || []; const idx = list.findIndex(t => t.id === req.params.taskId);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Task not found' });
  const updated = { ...list[idx], ...p, updatedAt: new Date().toISOString() } as Task; list[idx] = updated; tasksByProject.set(projectId, list);
  if (updated.assignee) notify(updated.assignee, `Task updated: ${updated.title}`);
  recordAudit(projectId, userId, 'task.update', updated);
  res.json({ success: true, data: updated });
});

router.delete('/projects/:projectId/tasks/:taskId', (req: any, res) => {
  const projectId = req.params.projectId; const userId = req.user!.userId;
  if (!can(projectId, userId, 'editor')) return res.status(403).json({ success: false, error: 'Forbidden' });
  const list = tasksByProject.get(projectId) || []; const idx = list.findIndex(t => t.id === req.params.taskId);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Task not found' });
  const [removed] = list.splice(idx, 1); tasksByProject.set(projectId, list);
  recordAudit(projectId, userId, 'task.delete', removed);
  res.json({ success: true });
});

// Notification center
router.get('/notifications', (req: any, res) => {
  const list = notificationsByUser.get(req.user!.userId) || [];
  res.json({ success: true, data: list });
});

router.post('/notifications/mark-read', (req: any, res) => {
  const schema = z.object({ ids: z.array(z.string()) }); const p = schema.parse(req.body);
  const list = notificationsByUser.get(req.user!.userId) || [];
  p.ids.forEach(id => { const n = list.find(x => x.id === id); if (n) n.read = true; });
  notificationsByUser.set(req.user!.userId, list);
  res.json({ success: true, data: list });
});

// Audit trail
router.get('/projects/:projectId/audit', (req, res) => {
  res.json({ success: true, data: auditByProject.get(req.params.projectId) || [] });
});

export default router;
