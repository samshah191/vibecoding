import { LLMProvider, LLMRequest, LLMResponse, ProviderRouteRule } from '../../types/orchestration';
export declare class ProviderRouter {
    private rules;
    private providers;
    constructor();
    registerRule(rule: ProviderRouteRule): void;
    getRules(): ProviderRouteRule[];
    registerProvider(provider: LLMProvider): void;
    generate(feature: string, env: string, logicalModel: string, req: LLMRequest): Promise<LLMResponse>;
}
//# sourceMappingURL=providerRouter.d.ts.map