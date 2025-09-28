"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryJobQueue = void 0;
function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
class InMemoryJobQueue {
    constructor(defaultRetry = { maxAttempts: 3, backoffMs: 1000 }) {
        this.defaultRetry = defaultRetry;
        this.queue = [];
        this.processing = false;
        this.handlers = new Map();
        this.store = new Map();
    }
    register(type, handler) { this.handlers.set(type, handler); }
    async enqueue(type, payload, notify, retry) {
        const job = {
            id: uuid(),
            type: type,
            payload,
            status: 'queued',
            attempts: 0,
            maxAttempts: retry?.maxAttempts ?? this.defaultRetry.maxAttempts,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 0,
            logs: [],
            notify
        };
        const handler = this.handlers.get(type);
        if (!handler)
            throw new Error(`No handler registered for type ${type}`);
        this.store.set(job.id, job);
        this.queue.push({ job, handler });
        this.process().catch(err => console.error('Queue processing error', err));
        return job;
    }
    get(jobId) { return this.store.get(jobId); }
    list() { return Array.from(this.store.values()); }
    async process() {
        if (this.processing)
            return;
        this.processing = true;
        while (this.queue.length > 0) {
            const item = this.queue.shift();
            await this.processItem(item);
        }
        this.processing = false;
    }
    async processItem(item) {
        const job = item.job;
        const handler = item.handler;
        const update = (p) => {
            if (typeof p.progress === 'number')
                job.progress = p.progress;
            if (p.message)
                job.logs.push(`[${new Date().toISOString()}] ${p.message}`);
            job.updatedAt = new Date().toISOString();
        };
        const backoff = this.defaultRetry.backoffMs;
        while (job.attempts < job.maxAttempts) {
            try {
                job.status = 'running';
                job.attempts++;
                update({ message: `Attempt ${job.attempts}` });
                const result = await handler(job, update);
                job.result = result;
                job.status = 'completed';
                job.progress = 100;
                update({ message: 'Completed' });
                return;
            }
            catch (err) {
                job.error = err?.message ?? String(err);
                job.status = 'failed';
                update({ message: `Failed: ${job.error}` });
                if (job.attempts >= job.maxAttempts)
                    break;
                await new Promise(r => setTimeout(r, backoff));
            }
        }
    }
}
exports.InMemoryJobQueue = InMemoryJobQueue;
//# sourceMappingURL=jobQueue.js.map