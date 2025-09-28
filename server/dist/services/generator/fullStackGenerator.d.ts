export type GenerationPlatform = 'web' | 'mobile';
export type BackendTarget = 'node' | 'fastapi';
export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}
export interface GenerationOptions {
    description: string;
    platform?: GenerationPlatform;
    backend?: BackendTarget;
    userId: string;
    conversation?: ConversationMessage[];
}
export interface ProjectSummary {
    appId: string;
    name: string;
    description: string;
    platform: GenerationPlatform;
    backend: BackendTarget;
    clientPath: string;
    serverPath: string;
    projectRoot: string;
    archivePath: string;
    commands: {
        client: string;
        server: string;
    };
    environment: {
        clientEnv: Record<string, string>;
        serverEnv: Record<string, string>;
    };
    features: string[];
    apiEndpoints: string[];
}
declare class FullStackGenerator {
    constructor(baseDir?: undefined);
    generateProject(options: any): Promise<{
        appId: string;
        name: any;
        description: any;
        platform: any;
        backend: any;
        clientPath: string;
        serverPath: string;
        projectRoot: string;
        archivePath: string;
        commands: {
            client: string;
            server: string;
        };
        environment: {
            clientEnv: {
                EXPO_PUBLIC_API_URL: string;
                VITE_API_URL?: undefined;
            } | {
                VITE_API_URL: string;
                EXPO_PUBLIC_API_URL?: undefined;
            };
            serverEnv: {
                PORT?: undefined;
            } | {
                PORT: string;
            };
        };
        features: string[];
        apiEndpoints: string[];
    }>;
    generateReactWebClient(params: any): Promise<void>;
    generateFastAPIBackend(params: any): Promise<void>;
    generateProjectReadme(params: any): Promise<void>;
    createArchive(sourceDir: any, archivePath: any): Promise<void>;
    getArchivePath(appId: any): string;
    getProjectRoot(appId: any): string;
    getOutputRoot(): any;
}
export { FullStackGenerator };
//# sourceMappingURL=fullStackGenerator.d.ts.map