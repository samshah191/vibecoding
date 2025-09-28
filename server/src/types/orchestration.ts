// Core types for AI Orchestration, Job Management, Artifact Generators, and Agents

export type Environment = 'dev' | 'staging' | 'prod' | string;

// Prompt templates with versioning and A/B variants
export interface PromptVariant {
  id: string; // e.g., "A", "B"
  weight?: number; // used for A/B routing; default 1
  content: string; // template content
}

export interface PromptVersion {
  version: string; // semantic or incremental
  createdAt: string; // ISO string
  variants: PromptVariant[];
}

export interface EnvironmentOverride {
  env: Environment;
  content?: string; // full override
  merge?: Record<string, string>; // optional placeholder merges
}

export interface PromptTemplate {
  name: string; // unique logical name
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

// Provider routing
export type ProviderId = 'openai' | 'anthropic' | 'azure-openai' | 'local' | string;

export interface ProviderRouteRule {
  id: string;
  when: {
    env?: Environment[];
    feature?: ('codegen' | 'docs' | 'db' | 'infra' | 'bugfix' | 'perf' | 'style')[];
    model?: string[]; // logical model name
  };
  to: {
    provider: ProviderId;
    model: string; // concrete model id at provider
  };
  weight?: number; // for weighted round-robin
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
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  latencyMs?: number;
}

export interface LLMProvider {
  id: ProviderId;
  generate(req: LLMRequest): Promise<LLMResponse>;
}

// Job orchestration
export type JobType =
  | 'codegen'
  | 'docs'
  | 'db'
  | 'infra'
  | 'bundle'
  | 'bugfix'
  | 'perf'
  | 'style';

export type JobStatus = 'queued' | 'running' | 'failed' | 'completed' | 'canceled';

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number; // constant backoff for simplicity
}

export interface NotificationChannelConfig {
  inApp?: boolean;
  email?: string[]; // list of emails
  slackWebhookUrl?: string; // incoming webhook URL
}

export interface Job<TPayload = any, TResult = any> {
  id: string;
  type: JobType;
  payload: TPayload;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  progress: number; // 0..100
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

// Artifact definitions
export interface FileArtifact {
  path: string; // e.g., src/components/Button.tsx
  content: string;
}

export interface CodeArtifactBundle {
  name: string; // project name
  files: FileArtifact[];
  tests?: FileArtifact[];
}

export interface DatabaseArtifact {
  schema: string; // e.g., Prisma schema or SQL DDL
  migrations: FileArtifact[]; // migration files
}

export interface InfraArtifact {
  dockerfiles: FileArtifact[];
  terraform?: FileArtifact[];
  ci?: FileArtifact[]; // e.g., GitHub Actions
}

export interface DocsArtifact {
  readme: string;
  apiDocs?: string;
  architecture?: string; // mermaid / markdown diagrams
}

export interface GeneratedArtifacts {
  code?: CodeArtifactBundle;
  db?: DatabaseArtifact;
  infra?: InfraArtifact;
  docs?: DocsArtifact;
}

// Agent tasks
export interface AgentTaskInput {
  target: 'code' | 'db' | 'infra' | 'docs';
  artifacts: GeneratedArtifacts;
  issue?: string; // bug description or perf concern, style note
}

export interface AgentTaskResult {
  updatedArtifacts: GeneratedArtifacts;
  summary: string;
}

// Deterministic generation seeds
export interface DeterministicSeed {
  key: string; // seed key to ensure stable outputs
}
