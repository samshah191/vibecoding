import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map