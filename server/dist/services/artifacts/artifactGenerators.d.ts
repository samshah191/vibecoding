import { CodeArtifactBundle, DatabaseArtifact, DocsArtifact, GeneratedArtifacts, InfraArtifact } from '../../types/orchestration';
export interface CodegenInput {
    name: string;
    description: string;
    language: 'TypeScript' | 'JavaScript';
    framework: 'react' | 'vue' | 'angular' | 'nextjs' | 'nuxtjs';
}
export declare class ArtifactGenerators {
    static codeBundle(input: CodegenInput): CodeArtifactBundle;
    static db(description: string): DatabaseArtifact;
    static infra(name: string): InfraArtifact;
    static docs(name: string, description: string): DocsArtifact;
    static bundleAll(input: CodegenInput): GeneratedArtifacts;
}
//# sourceMappingURL=artifactGenerators.d.ts.map