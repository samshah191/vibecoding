"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wafMiddleware = wafMiddleware;
exports.getRules = getRules;
exports.setRules = setRules;
const rules = {
    blockIPs: [],
    allowIPs: [],
    blockPathPatterns: []
};
function wafMiddleware(req, res, next) {
    const ip = (req.ip || req.socket.remoteAddress || '').replace('::ffff:', '');
    if (rules.allowIPs.length && !rules.allowIPs.includes(ip)) {
        return res.status(403).json({ success: false, error: 'WAF: IP not allowed' });
    }
    if (rules.blockIPs.includes(ip)) {
        return res.status(403).json({ success: false, error: 'WAF: IP blocked' });
    }
    const path = req.originalUrl || req.url;
    if (rules.blockPathPatterns.some(p => path.includes(p))) {
        return res.status(403).json({ success: false, error: 'WAF: Path blocked' });
    }
    next();
}
function getRules() { return { ...rules, blockPathPatterns: [...rules.blockPathPatterns], blockIPs: [...rules.blockIPs], allowIPs: [...rules.allowIPs] }; }
function setRules(nextRules) {
    if (nextRules.blockIPs)
        rules.blockIPs = nextRules.blockIPs;
    if (nextRules.allowIPs)
        rules.allowIPs = nextRules.allowIPs;
    if (nextRules.blockPathPatterns)
        rules.blockPathPatterns = nextRules.blockPathPatterns;
}
//# sourceMappingURL=waf.js.map