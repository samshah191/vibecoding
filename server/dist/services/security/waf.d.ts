import { Request, Response, NextFunction } from 'express';
interface WafRules {
    blockIPs: string[];
    allowIPs: string[];
    blockPathPatterns: string[];
}
export declare function wafMiddleware(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function getRules(): {
    blockPathPatterns: string[];
    blockIPs: string[];
    allowIPs: string[];
};
export declare function setRules(nextRules: Partial<WafRules>): void;
export {};
//# sourceMappingURL=waf.d.ts.map