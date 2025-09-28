import { GeneratedApp } from '../types/app';
export declare class AIService {
    generateApp(description: string, userId: string): Promise<GeneratedApp>;
    private buildPrompt;
    private parseAIResponse;
    private generateAppId;
    private extractAppName;
    private generateDefaultFeatures;
    private generateDefaultFrontend;
    private generateDefaultBackend;
    private generateDefaultDatabase;
    private generateFallbackApp;
}
//# sourceMappingURL=aiService.d.ts.map