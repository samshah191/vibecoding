import { Router } from 'express';
import { z } from 'zod';
import { PromptService } from '../services/orchestration/promptService';
import { ProviderRouter } from '../services/orchestration/providerRouter';
import { InMemoryJobQueue } from '../services/orchestration/jobQueue';
import { ArtifactGenerators, CodegenInput } from '../services/artifacts/artifactGenerators';
import { Agents } from '../services/agents/agents';
import { AgentTaskInput, GeneratedArtifacts } from '../types/orchestration';

const router = Router();

// Singletons in-memory for now
const prompts = new PromptService();
const routerProvider = new ProviderRouter();
const queue = new InMemoryJobQueue();

prompts.seedDefaults();

// Register job handlers
queue.register('codegen', async (job, update) => {
  update({ progress: 10, message: 'Validating input' });
  const input = job.payload as CodegenInput;
  update({ progress: 30, message: 'Generating code artifacts' });
  const artifacts = ArtifactGenerators.bundleAll(input);
  update({ progress: 80, message: 'Packaging artifacts' });
  return artifacts;
});

queue.register('docs', async (job, update) => {
  update({ progress: 50, message: 'Generating docs' });
  return ArtifactGenerators.docs(job.payload.name, job.payload.description);
});

queue.register('bugfix', async (job, update) => {
  update({ progress: 25, message: 'Applying bugfix agent' });
  const result = await Agents.bugfix(job.payload as AgentTaskInput);
  update({ progress: 90, message: 'Finalizing' });
  return result;
});

// Schemas
const upsertTemplateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  versions: z.array(z.object({
    version: z.string(),
    createdAt: z.string(),
    variants: z.array(z.object({ id: z.string(), weight: z.number().optional(), content: z.string() }))
  })),
  environmentOverrides: z.array(z.object({ env: z.string(), content: z.string().optional(), merge: z.record(z.string()).optional() })).optional()
});

router.post('/prompts', (req, res) => {
  try {
    const tpl = upsertTemplateSchema.parse(req.body);
    prompts.upsertTemplate(tpl);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.get('/prompts', (req, res) => {
  res.json({ success: true, data: prompts.listTemplates() });
});

router.post('/prompts/render', (req, res) => {
  try {
    const schema = z.object({ name: z.string(), env: z.string().default('dev'), placeholders: z.record(z.string()).optional() });
    const p = schema.parse(req.body);
    const rendered = prompts.render(p.name, p.env, p.placeholders);
    res.json({ success: true, data: rendered });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Manage routing rules
router.post('/llm/rules', (req, res) => {
  try {
    const schema = z.object({ id: z.string(), when: z.object({ env: z.array(z.string()).optional(), feature: z.array(z.enum(['codegen','docs','db','infra','bugfix','perf','style'])).optional(), model: z.array(z.string()).optional() }), to: z.object({ provider: z.string(), model: z.string() }), weight: z.number().optional() });
    const rule = schema.parse(req.body);
    routerProvider.registerRule(rule);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.get('/llm/rules', (req, res) => {
  res.json({ success: true, data: routerProvider.getRules() });
});

// Route a generation call via provider router (stubbed)
router.post('/llm/generate', async (req, res) => {
  try {
    const schema = z.object({ feature: z.string(), env: z.string().default('dev'), model: z.string().default('default'), prompt: z.string(), temperature: z.number().optional() });
    const p = schema.parse(req.body);
    const resp = await routerProvider.generate(p.feature, p.env, p.model, { prompt: p.prompt, temperature: p.temperature });
    res.json({ success: true, data: resp });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Job queue endpoints
router.post('/jobs/enqueue', async (req, res) => {
  try {
    const schema = z.object({ type: z.enum(['codegen','docs','db','infra','bundle','bugfix','perf','style']), payload: z.any(), notify: z.object({ inApp: z.boolean().optional(), email: z.array(z.string()).optional(), slackWebhookUrl: z.string().optional() }).optional() });
    const p = schema.parse(req.body);
    const job = await queue.enqueue(p.type, p.payload, p.notify);
    res.json({ success: true, data: job });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.get('/jobs/:id', (req, res) => {
  const job = queue.get(req.params.id);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  res.json({ success: true, data: job });
});

router.get('/jobs', (req, res) => {
  res.json({ success: true, data: queue.list() });
});

// Agents endpoints
router.post('/agents/:kind', async (req, res) => {
  try {
    const schema = z.object({
      target: z.enum(['code', 'db', 'infra', 'docs']),
      artifacts: z.custom<GeneratedArtifacts>(),
      issue: z.string().optional(),
    });
    const parsed = schema.parse(req.body);
    const payload: AgentTaskInput = {
      target: parsed.target,
      artifacts: parsed.artifacts,
      issue: parsed.issue,
    };
    const kind = req.params.kind;
    if (kind === 'bugfix') {
      res.json({ success: true, data: await Agents.bugfix(payload) });
    } else if (kind === 'perf') {
      res.json({ success: true, data: await Agents.performance(payload) });
    } else if (kind === 'style') {
      res.json({ success: true, data: await Agents.style(payload) });
    } else {
      res.status(400).json({ success: false, error: 'Unknown agent' });
    }
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

export default router;
