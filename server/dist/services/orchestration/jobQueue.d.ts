import { Job, ProgressUpdate, RetryPolicy } from '../../types/orchestration';
export type JobHandler<TPayload = any, TResult = any> = (job: Job<TPayload, TResult>, update: (p: ProgressUpdate) => void) => Promise<TResult>;
export declare class InMemoryJobQueue {
    private defaultRetry;
    private queue;
    private processing;
    private handlers;
    private store;
    constructor(defaultRetry?: RetryPolicy);
    register(type: string, handler: JobHandler<any, any>): void;
    enqueue<TP, TR>(type: string, payload: TP, notify?: Job<TP, TR>['notify'], retry?: Partial<RetryPolicy>): Promise<Job<TP, TR>>;
    get(jobId: string): Job<any, any> | undefined;
    list(): Job<any, any>[];
    private process;
    private processItem;
}
//# sourceMappingURL=jobQueue.d.ts.map