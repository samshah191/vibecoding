"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const waf_1 = require("../services/security/waf");
const router = (0, express_1.Router)();
// -------- Auth hardening stubs --------
router.get('/auth/providers', (_req, res) => {
    res.json({ success: true, data: [
            { id: 'saml', name: 'SAML SSO', status: 'planned' },
            { id: 'scim', name: 'SCIM Provisioning', status: 'planned' },
            { id: 'mfa', name: 'MFA Enforcement', status: 'enabled' },
            { id: 'passwordless', name: 'Passwordless Magic Link', status: 'planned' }
        ] });
});
router.post('/auth/mfa/enforce', auth_1.authenticateToken, (req, res) => {
    // Store enforcement flag per tenant/user in real implementation
    res.json({ success: true, data: { enforced: true } });
});
// -------- Audit & compliance --------
const auditLog = [];
router.get('/audit/logs', auth_1.authenticateToken, (_req, res) => {
    res.json({ success: true, data: auditLog });
});
router.get('/audit/export', auth_1.authenticateToken, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(auditLog, null, 2));
});
router.post('/compliance/data-residency', auth_1.authenticateToken, (req, res) => {
    const schema = zod_1.z.object({ region: zod_1.z.enum(['eu', 'us', 'apac']), policy: zod_1.z.enum(['strict', 'flexible']).default('strict') });
    const p = schema.parse(req.body);
    // In real impl: route storage/services by region. Here we just echo.
    res.json({ success: true, data: p });
});
router.post('/compliance/encryption', auth_1.authenticateToken, (req, res) => {
    const schema = zod_1.z.object({ atRest: zod_1.z.boolean().default(true), inTransit: zod_1.z.boolean().default(true), keyRotationDays: zod_1.z.number().default(90) });
    const p = schema.parse(req.body);
    res.json({ success: true, data: p });
});
// GDPR tooling
const dsarQueue = [];
router.post('/gdpr/dsar', auth_1.authenticateToken, (req, res) => {
    const schema = zod_1.z.object({ type: zod_1.z.enum(['export', 'delete']) });
    const p = schema.parse(req.body);
    const rec = { id: Math.random().toString(36).slice(2), userId: req.user.userId, type: p.type, status: 'pending', requestedAt: new Date().toISOString() };
    dsarQueue.push(rec);
    res.status(201).json({ success: true, data: rec });
});
router.get('/gdpr/dsar', auth_1.authenticateToken, (req, res) => {
    const list = dsarQueue.filter(x => x.userId === req.user.userId);
    res.json({ success: true, data: list });
});
router.post('/gdpr/dsar/:id/process', auth_1.authenticateToken, (req, res) => {
    // Admin action in real impl; here allow any authenticated for demo
    const rec = dsarQueue.find(x => x.id === req.params.id);
    if (!rec)
        return res.status(404).json({ success: false, error: 'Not found' });
    rec.status = 'completed';
    rec.finishedAt = new Date().toISOString();
    res.json({ success: true, data: rec });
});
// -------- Platform security --------
router.get('/waf/rules', auth_1.authenticateToken, (_req, res) => {
    res.json({ success: true, data: (0, waf_1.getRules)() });
});
router.post('/waf/rules', auth_1.authenticateToken, (req, res) => {
    const schema = zod_1.z.object({ blockIPs: zod_1.z.array(zod_1.z.string()).optional(), allowIPs: zod_1.z.array(zod_1.z.string()).optional(), blockPathPatterns: zod_1.z.array(zod_1.z.string()).optional() });
    const p = schema.parse(req.body);
    (0, waf_1.setRules)(p);
    res.json({ success: true, data: (0, waf_1.getRules)() });
});
router.post('/scan/secrets', auth_1.authenticateToken, (req, res) => {
    const schema = zod_1.z.object({ text: zod_1.z.string() });
    const p = schema.parse(req.body);
    const findings = [];
    const patterns = [
        { type: 'AWS_KEY', re: /AKIA[0-9A-Z]{16}/g },
        { type: 'GCP_KEY', re: /AIza[0-9A-Za-z\-_]{35}/g },
        { type: 'GENERIC_SECRET', re: /secret\w{8,}/gi }
    ];
    for (const pat of patterns) {
        const matches = p.text.match(pat.re) || [];
        matches.forEach(m => findings.push({ type: pat.type, match: m }));
    }
    res.json({ success: true, data: findings });
});
router.post('/alerts/runtime', auth_1.authenticateToken, (req, res) => {
    const schema = zod_1.z.object({ type: zod_1.z.enum(['suspiciousAuth', 'wafBlock', 'rateLimit', 'anomaly']), message: zod_1.z.string(), context: zod_1.z.record(zod_1.z.any()).optional() });
    const p = schema.parse(req.body);
    // In real impl: send to SIEM/alerts. Here returns success.
    res.json({ success: true, data: { received: true, alert: p } });
});
exports.default = router;
//# sourceMappingURL=security.js.map