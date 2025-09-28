export type Environment = 'dev' | 'staging' | 'prod' | string;
export interface PromptVariant {
    id: string;
    weight?: number;
    content: string;
}
export interface PromptVersion {
    version: string;
    createdAt: string;
    variants: PromptVariant[];
}
export interface EnvironmentOverride {
    env: Environment;
    content?: string;
    merge?: Record<string, string>;
}
export interface PromptTemplate {
    name: string;
    description?: string;
    tags?: string[];
    versions: PromptVersion[];
    environmentOverrides?: EnvironmentOverride[];
}
export interface RenderedPrompt {
    name: string;
    version: string;
    variant: string;
    env: Environment;
    content: string;
}
export type ProviderId = 'openai' | 'anthropic' | 'azure-openai' | 'local' | string;
export interface ProviderRouteRule {
    id: string;
    when: {
        env?: Environment[];
        feature?: ('codegen' | 'docs' | 'db' | 'infra' | 'bugfix' | 'perf' | 'style')[];
        model?: string[];
    };
    to: {
        provider: ProviderId;
        model: string;
    };
    weight?: number;
}
export interface LLMRequest {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    metadata?: Record<string, any>;
}
export interface LLMResponse {
    provider: ProviderId;
    model: string;
    content: string;
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
    };
    latencyMs?: number;
}
export interface LLMProvider {
    id: ProviderId;
    generate(req: LLMRequest): Promise<LLMResponse>;
}
export type JobType = 'codegen' | 'docs' | 'db' | 'infra' | 'bundle' | 'bugfix' | 'perf' | 'style';
export type JobStatus = 'queued' | 'running' | 'failed' | 'completed' | 'canceled';
export interface RetryPolicy {
    maxAttempts: number;
    backoffMs: number;
}
export interface NotificationChannelConfig {
    inApp?: boolean;
    email?: string[];
    slackWebhookUrl?: string;
}
export interface Job<TPayload = any, TResult = any> {
    id: string;
    type: JobType;
    payload: TPayload;
    status: JobStatus;
    attempts: number;
    maxAttempts: number;
    createdAt: string;
    updatedAt: string;
    progress: number;
    logs: string[];
    result?: TResult;
    error?: string;
    notify?: NotificationChannelConfig;
}
export interface ProgressUpdate {
    progress?: number;
    message?: string;
    data?: Record<string, any>;
}
export interface FileArtifact {
    path: string;
    content: string;
}
export interface CodeArtifactBundle {
    name: string;
    files: FileArtifact[];
    tests?: FileArtifact[];
}
export interface DatabaseArtifact {
    schema: string;
    migrations: FileArtifact[];
}
export interface InfraArtifact {
    dockerfiles: FileArtifact[];
    terraform?: FileArtifact[];
    ci?: FileArtifact[];
}
export interface DocsArtifact {
    readme: string;
    apiDocs?: string;
    architecture?: string;
}
export interface GeneratedArtifacts {
    code?: CodeArtifactBundle;
    db?: DatabaseArtifact;
    infra?: InfraArtifact;
    docs?: DocsArtifact;
}
export interface AgentTaskInput {
    target: 'code' | 'db' | 'infra' | 'docs';
    artifacts: GeneratedArtifacts;
    issue?: string;
}
export interface AgentTaskResult {
    updatedArtifacts: GeneratedArtifacts;
    summary: string;
}
export interface DeterministicSeed {
    key: string;
}
//# sourceMappingURL=orchestration.d.ts.map