interface PrismaCommandResult {
    command: string;
    stdout: string;
    stderr: string;
}
export interface DatabaseSetupResult {
    executed: boolean;
    appliedCommand: 'migrate-deploy' | 'db-push' | 'skipped';
    generatedClient: boolean;
    logs: PrismaCommandResult[];
}
export declare function ensureDatabaseSetup(): Promise<DatabaseSetupResult>;
export {};
//# sourceMappingURL=databaseSetupService.d.ts.map