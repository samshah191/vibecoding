import { Environment, PromptTemplate, RenderedPrompt } from '../../types/orchestration';
export declare class PromptService {
    private templates;
    upsertTemplate(tpl: PromptTemplate): void;
    getTemplate(name: string): PromptTemplate | undefined;
    listTemplates(): PromptTemplate[];
    render(name: string, env: Environment, placeholders?: Record<string, string>): RenderedPrompt;
    seedDefaults(): void;
}
//# sourceMappingURL=promptService.d.ts.map