import { LLMProvider, LLMRequest, LLMResponse, ProviderId, ProviderRouteRule } from '../../types/orchestration';

class StubProvider implements LLMProvider {
  constructor(public id: ProviderId, private modelDefault: string) {}
  async generate(req: LLMRequest): Promise<LLMResponse> {
    // Deterministic stub content using input prompt hash-like slice
    const seed = (req.prompt || '').length + (req.temperature ?? 0);
    const content = `STUB(${this.id}:${this.modelDefault})::` +
      Buffer.from(`${seed}|${req.prompt.substring(0, 64)}`).toString('base64');
    return {
      provider: this.id,
      model: this.modelDefault,
      content,
      usage: { promptTokens: req.prompt.length / 4 | 0, completionTokens: 64, totalTokens: ((req.prompt.length / 4 | 0) + 64) },
      latencyMs: 10
    };
  }
}

export class ProviderRouter {
  private rules: ProviderRouteRule[] = [];
  private providers = new Map<ProviderId, LLMProvider>();

  constructor() {
    // Register default stub providers
    this.registerProvider(new StubProvider('openai', 'gpt-4o-mini'));
    this.registerProvider(new StubProvider('anthropic', 'claude-3-haiku'));
    this.registerProvider(new StubProvider('local', 'local-llm'));
  }

  registerRule(rule: ProviderRouteRule) {
    this.rules.push(rule);
  }

  getRules(): ProviderRouteRule[] {
    return [...this.rules];
  }

  registerProvider(provider: LLMProvider) {
    this.providers.set(provider.id, provider);
  }

  // Simple routing based on first matching rule, otherwise default to 'local'
  async generate(feature: string, env: string, logicalModel: string, req: LLMRequest): Promise<LLMResponse> {
    const rule = this.rules.find(r =>
      (!r.when.env || r.when.env.includes(env)) &&
      (!r.when.feature || r.when.feature.includes(feature as any)) &&
      (!r.when.model || r.when.model.includes(logicalModel))
    );

    const providerId = rule?.to.provider ?? 'local';
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error(`Provider not registered: ${providerId}`);

    return provider.generate(req);
  }
}
