import { Job, JobStatus, ProgressUpdate, RetryPolicy } from '../../types/orchestration';

function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export type JobHandler<TPayload = any, TResult = any> = (job: Job<TPayload, TResult>, update: (p: ProgressUpdate) => void) => Promise<TResult>;

interface QueueItem<TP, TR> {
  job: Job<TP, TR>;
  handler: JobHandler<TP, TR>;
}

export class InMemoryJobQueue {
  private queue: QueueItem<any, any>[] = [];
  private processing = false;
  private handlers = new Map<string, JobHandler<any, any>>();
  private store = new Map<string, Job<any, any>>();

  constructor(private defaultRetry: RetryPolicy = { maxAttempts: 3, backoffMs: 1000 }) {}

  register(type: string, handler: JobHandler<any, any>) { this.handlers.set(type, handler); }

  async enqueue<TP, TR>(type: string, payload: TP, notify?: Job<TP, TR>['notify'], retry?: Partial<RetryPolicy>) {
    const job: Job<TP, TR> = {
      id: uuid(),
      type: type as any,
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
    if (!handler) throw new Error(`No handler registered for type ${type}`);

    this.store.set(job.id, job);
    this.queue.push({ job, handler });
    this.process().catch(err => console.error('Queue processing error', err));
    return job;
  }

  get(jobId: string) { return this.store.get(jobId); }
  list() { return Array.from(this.store.values()); }

  private async process() {
    if (this.processing) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      await this.processItem(item);
    }
    this.processing = false;
  }

  private async processItem<TP, TR>(item: QueueItem<TP, TR>) {
    const job = item.job;
    const handler = item.handler;
    const update = (p: ProgressUpdate) => {
      if (typeof p.progress === 'number') job.progress = p.progress;
      if (p.message) job.logs.push(`[${new Date().toISOString()}] ${p.message}`);
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
      } catch (err: any) {
        job.error = err?.message ?? String(err);
        job.status = 'failed';
        update({ message: `Failed: ${job.error}` });
        if (job.attempts >= job.maxAttempts) break;
        await new Promise(r => setTimeout(r, backoff));
      }
    }
  }
}
