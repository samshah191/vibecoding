// @ts-nocheck
import path from 'path';
import fs from 'fs-extra';
import archiver from 'archiver';

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

const WEB_FEATURES = [
    'Responsive landing page with hero section',
    'Call-to-action wired to backend idea capture',
    'Instructional next steps for extending the build'
];
const MOBILE_FEATURES = [
    'Native screens styled for light/dark mode',
    'Integrated API calls to the generated backend',
    'Idea submission flow with instant feedback'
];
function slugify(input) {
    const base = input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return base || 'ai-app';
}
function titleCase(input) {
    return input
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
async function writeFiles(baseDir, files) {
    for (const [relativePath, contents] of Object.entries(files)) {
        const absolute = path.join(baseDir, relativePath);
        await fs.ensureDir(path.dirname(absolute));
        await fs.writeFile(absolute, contents, 'utf8');
    }
}
class FullStackGenerator {
    constructor(baseDir = undefined) {
        const defaultBase = path.resolve(process.cwd(), '..', 'generated-projects');
        this.outputRoot = baseDir ? path.resolve(baseDir) : defaultBase;
    }
    async generateProject(options) {
        const platform = options.platform || 'web';
        const backend = options.backend || (platform === 'mobile' ? 'fastapi' : 'node');
        const appName = titleCase(options.description).slice(0, 60) || 'AI Generated App';
        const appSlug = slugify(appName);
        const appId = `${appSlug}-${Date.now()}`;
        const projectRoot = path.join(this.outputRoot, appId);
        const clientPath = path.join(projectRoot, platform === 'mobile' ? 'mobile' : 'client');
        const serverPath = path.join(projectRoot, 'server');
        await fs.ensureDir(projectRoot);
        const baseFeatures = platform === 'mobile' ? MOBILE_FEATURES : WEB_FEATURES;
        if (platform === 'mobile') {
            await this.generateReactNativeClient({ clientPath, appName, backend });
        }
        else {
            await this.generateReactWebClient({ clientPath, appName, backend, description: options.description, features: baseFeatures });
        }
        if (backend === 'fastapi') {
            await this.generateFastAPIBackend({ serverPath, appName, description: options.description, features: baseFeatures });
        }
        else {
            await this.generateExpressBackend({ serverPath, appName, description: options.description, features: baseFeatures });
        }
        await this.generateProjectReadme({ projectRoot, appName, platform, backend });
        const archivePath = path.join(this.outputRoot, `${appId}.zip`);
        await this.createArchive(projectRoot, archivePath);
        const commands = {
            client: platform === 'mobile'
                ? 'cd mobile && npm install && npm start'
                : 'cd client && npm install && npm run dev',
            server: backend === 'fastapi'
                ? 'cd server && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload'
                : 'cd server && npm install && npm run dev'
        };
        return {
            appId,
            name: appName,
            description: options.description,
            platform,
            backend,
            clientPath,
            serverPath,
            projectRoot,
            archivePath,
            commands,
            environment: {
                clientEnv: platform === 'mobile'
                    ? { EXPO_PUBLIC_API_URL: backend === 'fastapi' ? 'http://localhost:8000' : 'http://localhost:4000' }
                    : { VITE_API_URL: backend === 'fastapi' ? 'http://localhost:8000' : 'http://localhost:4000' },
                serverEnv: backend === 'fastapi' ? {} : { PORT: '4000' }
            },
            features: baseFeatures,
            apiEndpoints: ['GET /api/app-info', 'POST /api/ideas']
        };
    }
    async generateReactWebClient(params) {
        const { clientPath, appName, backend, description, features } = params;
        const apiBase = backend === 'fastapi' ? 'http://localhost:8000' : 'http://localhost:4000';
        const packageJson = {
            name: `${slugify(appName)}-server`,
            version: '1.0.0',
            main: 'index.js',
            scripts: {
                dev: 'nodemon index.js',
                start: 'node index.js',
                'db:push': 'prisma db push',
                'db:generate': 'prisma generate',
                prepare: 'npm run db:push && npm run db:generate'
            },
            dependencies: {
                cors: '^2.8.5',
                express: '^4.19.2',
                dotenv: '^16.4.5',
                '@prisma/client': '^5.17.0'
            },
            devDependencies: {
                nodemon: '^3.1.0',
                prisma: '^5.17.0'
            }
        };
        const prismaSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./generated.db"
}

model Idea {
  id        String   @id @default(cuid())
  text      String
  createdAt DateTime @default(now())
}
`;
        const files = {
            'requirements.txt': 'fastapi==0.111.0\nuvicorn==0.30.1\npydantic==2.8.2\nsqlmodel==0.0.14\n',
            'main.py': `from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Session, create_engine, select

app = FastAPI(title="${appName} API", version="1.0.0")

DATABASE_URL = "sqlite:///./generated.db"
engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

origins = [
    "http://localhost:5173",
    "http://localhost:19006",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Idea(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class IdeaRequest(BaseModel):
    idea: str

class AppSummary(BaseModel):
    name: str
    mission: str
    featureHighlights: List[str]
    nextSteps: List[str]
    recentIdeas: List[str]

def fetch_recent_ideas(limit: int = 10) -> List[str]:
    with Session(engine) as session:
        results = session.exec(
            select(Idea).order_by(Idea.created_at.desc()).limit(limit)
        ).all()
        return [record.text for record in results]

def build_summary() -> AppSummary:
    return AppSummary(
        name="${appName}",
        mission="An AI generated experience built to realise: ${sanitizedDescription}.",
        featureHighlights=${featureList},
        nextSteps=[
            "Wire this template into your data models and persistence layer.",
            "Use the conversational builder to refine flows and copy.",
            "Deploy the generated project with your preferred CI pipeline."
        ],
        recentIdeas=fetch_recent_ideas()
    )

@app.on_event('startup')
def on_startup() -> None:
    SQLModel.metadata.create_all(engine)

@app.get('/api/app-info', response_model=AppSummary)
def get_app_info():
    return build_summary()

@app.post('/api/ideas')
def capture_idea(payload: IdeaRequest):
    idea = payload.idea.strip()
    if not idea:
        raise HTTPException(status_code=400, detail="Idea text is required")

    with Session(engine) as session:
        record = Idea(text=idea)
        session.add(record)
        session.commit()

    return {
        "message": "Idea captured successfully. Extend this endpoint to persist the backlog.",
        "ideas": fetch_recent_ideas(),
    }

if __name__ == '__main__':
    import uvicorn
    SQLModel.metadata.create_all(engine)
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
`
        };        await writeFiles(serverPath, files);
    }
    async generateFastAPIBackend(params) {
        const { serverPath, appName, description, features } = params;
        const sanitizedDescription = description.trim().replace(/"/g, '\"');
        const featureList = JSON.stringify(features, null, 2).replace(/\n/g, '\n        ');
        const files = {
            'requirements.txt': 'fastapi==0.111.0\nuvicorn==0.30.1\npydantic==2.8.2\n',
            'main.py': `from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="${appName} API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://localhost:19006",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IdeaRequest(BaseModel):
    idea: str

class AppSummary(BaseModel):
    name: str
    mission: str
    featureHighlights: List[str]
    nextSteps: List[str]

stored_ideas: List[str] = []

def build_summary() -> AppSummary:
    return AppSummary(
        name="${appName}",
        mission="An AI generated experience built to realise: ${sanitizedDescription}.",
        featureHighlights=${featureList},
        nextSteps=[
            "Wire this template into your data models and persistence layer.",
            "Use the conversational builder to refine flows and copy.",
            "Deploy the generated project with your preferred CI pipeline."
        ]
    )

@app.get('/api/app-info', response_model=AppSummary)
def get_app_info():
    return build_summary()

@app.post('/api/ideas')
def capture_idea(payload: IdeaRequest):
    idea = payload.idea.strip()
    if not idea:
        raise HTTPException(status_code=400, detail="Idea text is required")

    stored_ideas.insert(0, idea)
    del stored_ideas[10:]

    return {
        "message": "Idea captured successfully. Extend this endpoint to persist the backlog.",
        "ideas": stored_ideas,
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
`
        };
        await writeFiles(serverPath, files);
    }
    async generateProjectReadme(params) {
        const { projectRoot, appName, platform, backend } = params;
        const content = `# ${appName}

This project was generated automatically by the VibeCoding full-stack agent.

## Stacks

- **Frontend**: ${platform === 'mobile' ? 'React Native + Expo' : 'React + Vite + Tailwind CSS'}
- **Backend**: ${backend === 'fastapi' ? 'FastAPI (Python)' : 'Express (Node.js)'}

## Getting Started

1. Install dependencies and start the frontend:
   ${platform === 'mobile' ? 'cd mobile\nnpm install\nnpm start' : 'cd client\nnpm install\nnpm run dev'}

2. Install dependencies and start the backend:
   ${backend === 'fastapi' ? 'cd server\npython -m venv venv\nsource venv/bin/activate\npip install -r requirements.txt\nuvicorn main:app --reload' : 'cd server\nnpm install\nnpm run prepare\nnpm run dev'}

3. Update any API URLs inside .env files if you change ports.

Happy building!`;
        await writeFiles(projectRoot, { 'README.md': content });
    }
    async createArchive(sourceDir, archivePath) {
        await fs.ensureDir(path.dirname(archivePath));
        await new Promise((resolve, reject) => {
            const output = fs.createWriteStream(archivePath);
            const archive = (0, archiver)('zip', { zlib: { level: 9 } });
            output.on('close', () => resolve());
            archive.on('error', (error) => reject(error));
            archive.pipe(output);
            archive.directory(sourceDir, false);
            archive.finalize();
        });
    }
    getArchivePath(appId) {
        return path.join(this.outputRoot, `${appId}.zip`);
    }
    getProjectRoot(appId) {
        return path.join(this.outputRoot, appId);
    }
    getOutputRoot() {
        return this.outputRoot;
    }
}
//# sourceMappingURL=fullStackGenerator.js.map
export { FullStackGenerator };
