import { Request, Response, NextFunction } from 'express';

interface WafRules {
  blockIPs: string[]; // exact matches for simplicity
  allowIPs: string[];
  blockPathPatterns: string[]; // simple substring match to avoid ReDoS
}

const rules: WafRules = {
  blockIPs: [],
  allowIPs: [],
  blockPathPatterns: []
};

export function wafMiddleware(req: Request, res: Response, next: NextFunction) {
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

export function getRules() { return { ...rules, blockPathPatterns: [...rules.blockPathPatterns], blockIPs: [...rules.blockIPs], allowIPs: [...rules.allowIPs] }; }
export function setRules(nextRules: Partial<WafRules>) {
  if (nextRules.blockIPs) rules.blockIPs = nextRules.blockIPs;
  if (nextRules.allowIPs) rules.allowIPs = nextRules.allowIPs;
  if (nextRules.blockPathPatterns) rules.blockPathPatterns = nextRules.blockPathPatterns;
}
