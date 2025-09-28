"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
const tasksByProject = new Map();
const policyByProject = new Map();
const notificationsByUser = new Map();
const auditByProject = new Map();
function id() { return Math.random().toString(36).slice(2); }
function ensureProject(policy, projectId) { if (!policy.has(projectId))
    policy.set(projectId, {}); }
function can(projectId, userId, required) {
    const policy = policyByProject.get(projectId) || {};
    const role = policy[userId];
    const order = ['viewer', 'reviewer', 'editor', 'owner'];
    return !!role && order.indexOf(role) >= order.indexOf(required);
}
function recordAudit(projectId, actor, type, data) {
    const list = auditByProject.get(projectId) || [];
    list.push({ id: id(), ts: new Date().toISOString(), actor, projectId, type, data });
    auditByProject.set(projectId, list);
}
function notify(userId, text) {
    const list = notificationsByUser.get(userId) || [];
    list.push({ id: id(), userId, ts: new Date().toISOString(), text });
    notificationsByUser.set(userId, list);
}
// Roles & permissions
router.post('/projects/:projectId/roles', (req, res) => {
    const schema = zod_1.z.object({ assignments: zod_1.z.array(zod_1.z.object({ userId: zod_1.z.string(), role: zod_1.z.enum(['owner', 'editor', 'reviewer', 'viewer']) })) });
    const p = schema.parse(req.body);
    ensureProject(policyByProject, req.params.projectId);
    const policy = policyByProject.get(req.params.projectId);
    p.assignments.forEach(a => { policy[a.userId] = a.role; notify(a.userId, `You are now ${a.role} on project ${req.params.projectId}`); });
    recordAudit(req.params.projectId, req.user.userId, 'roles.update', p.assignments);
    res.json({ success: true, data: policy });
});
router.get('/projects/:projectId/roles', (req, res) => {
    res.json({ success: true, data: policyByProject.get(req.params.projectId) || {} });
});
// Tasking & Kanban
router.post('/projects/:projectId/tasks', (req, res) => {
    const schema = zod_1.z.object({ title: zod_1.z.string(), status: zod_1.z.enum(['todo', 'in-progress', 'done']).default('todo'), assignee: zod_1.z.string().optional(), dueDate: zod_1.z.string().optional(), attachments: zod_1.z.array(zod_1.z.object({ type: zod_1.z.enum(['diff', 'ai-task', 'file']), ref: zod_1.z.string() })).optional() });
    const p = schema.parse(req.body);
    const projectId = req.params.projectId;
    const userId = req.user.userId;
    if (!can(projectId, userId, 'editor'))
        return res.status(403).json({ success: false, error: 'Forbidden' });
    const t = { id: id(), title: p.title, status: p.status, assignee: p.assignee, dueDate: p.dueDate, attachments: p.attachments, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const list = tasksByProject.get(projectId) || [];
    list.push(t);
    tasksByProject.set(projectId, list);
    if (t.assignee)
        notify(t.assignee, `Assigned task: ${t.title}`);
    recordAudit(projectId, userId, 'task.create', t);
    res.status(201).json({ success: true, data: t });
});
router.get('/projects/:projectId/tasks', (req, res) => {
    const projectId = req.params.projectId;
    const userId = req.user.userId;
    if (!can(projectId, userId, 'viewer'))
        return res.status(403).json({ success: false, error: 'Forbidden' });
    res.json({ success: true, data: tasksByProject.get(projectId) || [] });
});
router.put('/projects/:projectId/tasks/:taskId', (req, res) => {
    const schema = zod_1.z.object({ title: zod_1.z.string().optional(), status: zod_1.z.enum(['todo', 'in-progress', 'done']).optional(), assignee: zod_1.z.string().optional(), dueDate: zod_1.z.string().optional() });
    const p = schema.parse(req.body);
    const projectId = req.params.projectId;
    const userId = req.user.userId;
    if (!can(projectId, userId, 'editor'))
        return res.status(403).json({ success: false, error: 'Forbidden' });
    const list = tasksByProject.get(projectId) || [];
    const idx = list.findIndex(t => t.id === req.params.taskId);
    if (idx === -1)
        return res.status(404).json({ success: false, error: 'Task not found' });
    const updated = { ...list[idx], ...p, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    tasksByProject.set(projectId, list);
    if (updated.assignee)
        notify(updated.assignee, `Task updated: ${updated.title}`);
    recordAudit(projectId, userId, 'task.update', updated);
    res.json({ success: true, data: updated });
});
router.delete('/projects/:projectId/tasks/:taskId', (req, res) => {
    const projectId = req.params.projectId;
    const userId = req.user.userId;
    if (!can(projectId, userId, 'editor'))
        return res.status(403).json({ success: false, error: 'Forbidden' });
    const list = tasksByProject.get(projectId) || [];
    const idx = list.findIndex(t => t.id === req.params.taskId);
    if (idx === -1)
        return res.status(404).json({ success: false, error: 'Task not found' });
    const [removed] = list.splice(idx, 1);
    tasksByProject.set(projectId, list);
    recordAudit(projectId, userId, 'task.delete', removed);
    res.json({ success: true });
});
// Notification center
router.get('/notifications', (req, res) => {
    const list = notificationsByUser.get(req.user.userId) || [];
    res.json({ success: true, data: list });
});
router.post('/notifications/mark-read', (req, res) => {
    const schema = zod_1.z.object({ ids: zod_1.z.array(zod_1.z.string()) });
    const p = schema.parse(req.body);
    const list = notificationsByUser.get(req.user.userId) || [];
    p.ids.forEach(id => { const n = list.find(x => x.id === id); if (n)
        n.read = true; });
    notificationsByUser.set(req.user.userId, list);
    res.json({ success: true, data: list });
});
// Audit trail
router.get('/projects/:projectId/audit', (req, res) => {
    res.json({ success: true, data: auditByProject.get(req.params.projectId) || [] });
});
exports.default = router;
//# sourceMappingURL=team.js.map