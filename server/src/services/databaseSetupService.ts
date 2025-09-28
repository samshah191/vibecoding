import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

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

const projectRoot = path.resolve(__dirname, '..', '..');
const prismaDir = path.join(projectRoot, 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');

let hasRun = false;

function getNpxCommand(): string {
  return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

function runPrismaCommand(args: string[]): Promise<PrismaCommandResult> {
  return new Promise((resolve, reject) => {
    const command = `prisma ${args.join(' ')}`;
    const prismaArgs = ['prisma', ...args];
    if (!args.includes('--schema')) {
      prismaArgs.push('--schema', schemaPath);
    }

    const child = spawn(getNpxCommand(), prismaArgs, {
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
      } else {
        const error = new Error(`Prisma command failed (${command}) with exit code ${code}.`);
        (error as any).stdout = stdout;
        (error as any).stderr = stderr;
        reject(error);
      }
    });
  });
}

function hasMigrations(): boolean {
  if (!fs.existsSync(prismaDir)) {
    return false;
  }

  const migrationsDir = path.join(prismaDir, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    return false;
  }

  const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });
  return entries.some((entry) => entry.isDirectory());
}

function prismaSchemaExists(): boolean {
  return fs.existsSync(schemaPath);
}

export async function ensureDatabaseSetup(): Promise<DatabaseSetupResult> {
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

  const logs: PrismaCommandResult[] = [];
  let appliedCommand: DatabaseSetupResult['appliedCommand'] = 'skipped';

  try {
    if (hasMigrations()) {
      console.log('???  Applying Prisma migrations...');
      logs.push(await runPrismaCommand(['migrate', 'deploy']));
      appliedCommand = 'migrate-deploy';
    } else {
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
  } catch (error) {
    console.error('?  Failed to set up Prisma database automatically.', error);
    throw error;
  }
}
