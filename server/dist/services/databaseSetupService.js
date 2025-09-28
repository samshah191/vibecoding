"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDatabaseSetup = ensureDatabaseSetup;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const projectRoot = path_1.default.resolve(__dirname, '..', '..');
const prismaDir = path_1.default.join(projectRoot, 'prisma');
const schemaPath = path_1.default.join(prismaDir, 'schema.prisma');
let hasRun = false;
function getNpxCommand() {
    return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}
function runPrismaCommand(args) {
    return new Promise((resolve, reject) => {
        const command = `prisma ${args.join(' ')}`;
        const prismaArgs = ['prisma', ...args];
        if (!args.includes('--schema')) {
            prismaArgs.push('--schema', schemaPath);
        }
        const child = (0, child_process_1.spawn)(getNpxCommand(), prismaArgs, {
            cwd: projectRoot,
            env: process.env,
        });
        let stdout = '';
        let stderr = '';
        child.stdout?.on('data', (data) => {
            const text = data.toString();
            stdout += text;
            process.stdout.write(`[prisma] ${text}`);
        });
        child.stderr?.on('data', (data) => {
            const text = data.toString();
            stderr += text;
            process.stderr.write(`[prisma] ${text}`);
        });
        child.on('error', (error) => {
            reject(error);
        });
        child.on('close', (code) => {
            if (code === 0) {
                resolve({ command, stdout, stderr });
            }
            else {
                const error = new Error(`Prisma command failed (${command}) with exit code ${code}.`);
                error.stdout = stdout;
                error.stderr = stderr;
                reject(error);
            }
        });
    });
}
function hasMigrations() {
    if (!fs_1.default.existsSync(prismaDir)) {
        return false;
    }
    const migrationsDir = path_1.default.join(prismaDir, 'migrations');
    if (!fs_1.default.existsSync(migrationsDir)) {
        return false;
    }
    const entries = fs_1.default.readdirSync(migrationsDir, { withFileTypes: true });
    return entries.some((entry) => entry.isDirectory());
}
function prismaSchemaExists() {
    return fs_1.default.existsSync(schemaPath);
}
async function ensureDatabaseSetup() {
    if (hasRun) {
        return {
            executed: false,
            appliedCommand: 'skipped',
            generatedClient: false,
            logs: [],
        };
    }
    if (process.env.SKIP_DB_SETUP === 'true') {
        console.log('??  SKIP_DB_SETUP is set; skipping automatic database setup.');
        hasRun = true;
        return {
            executed: false,
            appliedCommand: 'skipped',
            generatedClient: false,
            logs: [],
        };
    }
    if (!prismaSchemaExists()) {
        console.warn('??  No Prisma schema found; skipping automatic database setup.');
        hasRun = true;
        return {
            executed: false,
            appliedCommand: 'skipped',
            generatedClient: false,
            logs: [],
        };
    }
    const logs = [];
    let appliedCommand = 'skipped';
    try {
        if (hasMigrations()) {
            console.log('???  Applying Prisma migrations...');
            logs.push(await runPrismaCommand(['migrate', 'deploy']));
            appliedCommand = 'migrate-deploy';
        }
        else {
            console.log('??  No migrations found; syncing schema with `prisma db push`...');
            logs.push(await runPrismaCommand(['db', 'push']));
            appliedCommand = 'db-push';
        }
        console.log('??  Generating Prisma client...');
        logs.push(await runPrismaCommand(['generate']));
        hasRun = true;
        return {
            executed: true,
            appliedCommand,
            generatedClient: true,
            logs,
        };
    }
    catch (error) {
        console.error('?  Failed to set up Prisma database automatically.', error);
        throw error;
    }
}
//# sourceMappingURL=databaseSetupService.js.map