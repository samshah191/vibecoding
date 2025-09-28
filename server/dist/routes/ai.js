"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRoutes = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const aiService_1 = require("../services/aiService");
const advancedAIService_1 = require("../services/advancedAIService");
const configService_1 = require("../services/configService");
const appService_1 = require("../services/appService");
const fullStackGenerator_1 = require("../services/generator/fullStackGenerator");
const router = express_1.default.Router();
exports.aiRoutes = router;
const aiService = new aiService_1.AIService();
const advancedAIService = new advancedAIService_1.AdvancedAIService();
const appService = new appService_1.AppService();
const fullStackGenerator = new fullStackGenerator_1.FullStackGenerator();
const conversationalGenerationSchema = zod_1.z.object({
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
    platform: zod_1.z.enum(['web', 'mobile']).optional(),
    backend: zod_1.z.enum(['node', 'fastapi']).optional(),
    conversation: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant']),
        content: zod_1.z.string(),
        timestamp: zod_1.z.string().optional()
    })).optional()
});
const advancedGenerateSchema = zod_1.z.object({
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
    projectName: zod_1.z.string().optional(),
    config: zod_1.z.object({
        framework: zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            description: zod_1.z.string(),
            icon: zod_1.z.string().optional(),
            version: zod_1.z.string().optional()
        }),
        language: zod_1.z.enum(['TypeScript', 'JavaScript']),
        componentLibrary: zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            description: zod_1.z.string(),
            framework: zod_1.z.array(zod_1.z.string()),
            icon: zod_1.z.string().optional(),
            features: zod_1.z.array(zod_1.z.string())
        }).optional(),
        cssFramework: zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            description: zod_1.z.string(),
            type: zod_1.z.enum(['utility', 'component', 'css-in-js']),
            features: zod_1.z.array(zod_1.z.string())
        }),
        stateManagement: zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            description: zod_1.z.string(),
            framework: zod_1.z.array(zod_1.z.string()),
            complexity: zod_1.z.enum(['simple', 'medium', 'advanced'])
        }),
        routing: zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            description: zod_1.z.string(),
            framework: zod_1.z.array(zod_1.z.string()),
            features: zod_1.z.array(zod_1.z.string())
        }),
        database: zod_1.z.string(),
        hosting: zod_1.z.string(),
        features: zod_1.z.object({
            authentication: zod_1.z.boolean().default(false),
            realtime: zod_1.z.boolean().default(false),
            fileUpload: zod_1.z.boolean().default(false),
            payments: zod_1.z.boolean().default(false),
            notifications: zod_1.z.boolean().default(false),
            analytics: zod_1.z.boolean().default(false),
            i18n: zod_1.z.boolean().default(false),
            pwa: zod_1.z.boolean().default(false)
        })
    })
});
const generateAppSchema = zod_1.z.object({
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
    requirements: zod_1.z.array(zod_1.z.string()).optional(),
    preferences: zod_1.z.object({
        framework: zod_1.z.string().optional(),
        styling: zod_1.z.string().optional(),
        features: zod_1.z.array(zod_1.z.string()).optional()
    }).optional()
});
function buildConversationLog(existing, userMessage, assistantMessage) {
    const log = [];
    if (existing && existing.length) {
        log.push(...existing);
    }
    if (userMessage) {
        log.push(userMessage);
    }
    log.push(assistantMessage);
    return log;
}
function resolveDownloadUrl(req, appId) {
    const base = `${req.protocol}://${req.get('host')}`;
    return `${base}/api/ai/generated-apps/${appId}/download`;
}
// Conversational full-stack generation
router.post('/generate-conversational', async (req, res) => {
    try {
        const { description, platform, backend, conversation } = conversationalGenerationSchema.parse(req.body);
        const userId = req.user.userId;
        const projectSummary = await fullStackGenerator.generateProject({
            description,
            platform,
            backend,
            userId,
            conversation
        });
        const frontendInfo = {
            stack: projectSummary.platform === 'mobile' ? 'React Native + Expo' : 'React + Vite + Tailwind',
            entry: projectSummary.platform === 'mobile' ? 'App.tsx' : 'src/App.tsx',
            path: projectSummary.clientPath,
            devCommand: projectSummary.commands.client,
            env: projectSummary.environment.clientEnv
        };
        const backendInfo = {
            stack: projectSummary.backend === 'fastapi' ? 'FastAPI' : 'Express',
            entry: projectSummary.backend === 'fastapi' ? 'main.py' : 'index.js',
            path: projectSummary.serverPath,
            devCommand: projectSummary.commands.server,
            endpoints: projectSummary.apiEndpoints,
            env: projectSummary.environment.serverEnv
        };
        const databaseInfo = projectSummary.backend === 'fastapi'
            ? {
                technology: 'SQLite + SQLModel',
                notes: 'Tables are created automatically on startup via SQLModel metadata.',
                setupCommand: 'cd server && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt',
                schemaLocation: path_1.default.join(projectSummary.serverPath, 'generated.db')
            }
            : {
                technology: 'SQLite + Prisma',
                notes: 'Prisma schema lives in prisma/schema.prisma and syncs automatically via npm run prepare.',
                setupCommand: 'cd server && npm install && npm run prepare',
                schemaLocation: path_1.default.join(projectSummary.serverPath, 'prisma', 'schema.prisma')
            };
        const generatedApp = {
            id: projectSummary.appId,
            name: projectSummary.name,
            description,
            userId,
            createdAt: new Date(),
            status: 'generated',
            frontend: frontendInfo,
            backend: backendInfo,
            database: databaseInfo,
            config: {
                framework: projectSummary.platform === 'mobile' ? 'React Native' : 'React',
                language: 'TypeScript',
                styling: projectSummary.platform === 'mobile' ? 'React Native StyleSheet' : 'Tailwind CSS',
                database: databaseInfo.technology,
                hosting: 'Local development'
            },
            features: projectSummary.features,
            published: false,
            advancedConfig: undefined,
            url: undefined
        };
        const saved = await appService.createApp(generatedApp);
        const hydrated = await appService.getAppById(saved.id, userId);
        const assistantMessage = {
            role: 'assistant',
            content: `I generated a ${projectSummary.platform === 'mobile' ? 'mobile' : 'web'} project with a linked ${projectSummary.backend === 'fastapi' ? 'FastAPI' : 'Express'} backend. Download the zip, run the client and server commands, and continue iterating through the builder.`,
            timestamp: new Date().toISOString()
        };
        const maybeUserMessage = conversation && conversation.length
            ? null
            : {
                role: 'user',
                content: description,
                timestamp: new Date().toISOString()
            };
        const conversationLog = buildConversationLog(conversation, maybeUserMessage, assistantMessage);
        const downloadUrl = resolveDownloadUrl(req, projectSummary.appId);
        res.json({
            success: true,
            app: hydrated,
            project: {
                ...projectSummary,
                downloadUrl
            },
            conversation: conversationLog,
            message: 'Full-stack project generated successfully.'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        console.error('Conversational generation error:', error);
        res.status(500).json({
            error: 'Failed to generate project',
            message: 'We were unable to generate the project. Please retry with a different description.'
        });
    }
});
// Download generated archive
router.get('/generated-apps/:appId/download', async (req, res) => {
    try {
        const archivePath = fullStackGenerator.getArchivePath(req.params.appId);
        if (!fs_1.default.existsSync(archivePath)) {
            return res.status(404).json({
                error: 'Archive not found',
                message: 'The generated project archive could not be located. Generate the project again.'
            });
        }
        res.download(archivePath, path_1.default.basename(archivePath));
    }
    catch (error) {
        console.error('Download archive error:', error);
        res.status(500).json({
            error: 'Failed to download archive',
            message: 'Unable to stream the generated project archive.'
        });
    }
});
// Get framework options
router.get('/config/frameworks', async (req, res) => {
    try {
        const frameworks = configService_1.ConfigService.getFrameworkOptions();
        res.json({
            success: true,
            frameworks
        });
    }
    catch (error) {
        console.error('Get frameworks error:', error);
        res.status(500).json({
            error: 'Failed to get frameworks',
            message: 'Unable to retrieve framework options'
        });
    }
});
// Get component library options
router.get('/config/component-libraries', async (req, res) => {
    try {
        const { framework } = req.query;
        const allLibraries = configService_1.ConfigService.getComponentLibraryOptions();
        const libraries = framework
            ? allLibraries.filter(lib => lib.framework.includes(framework))
            : allLibraries;
        res.json({
            success: true,
            componentLibraries: libraries
        });
    }
    catch (error) {
        console.error('Get component libraries error:', error);
        res.status(500).json({
            error: 'Failed to get component libraries',
            message: 'Unable to retrieve component library options'
        });
    }
});
// Get CSS framework options
router.get('/config/css-frameworks', async (req, res) => {
    try {
        const cssFrameworks = configService_1.ConfigService.getCSSFrameworkOptions();
        res.json({
            success: true,
            cssFrameworks
        });
    }
    catch (error) {
        console.error('Get CSS frameworks error:', error);
        res.status(500).json({
            error: 'Failed to get CSS frameworks',
            message: 'Unable to retrieve CSS framework options'
        });
    }
});
// Get state management options
router.get('/config/state-management', async (req, res) => {
    try {
        const { framework } = req.query;
        const allStateManagement = configService_1.ConfigService.getStateManagementOptions();
        const options = framework
            ? allStateManagement.filter(option => option.framework.includes(framework))
            : allStateManagement;
        res.json({
            success: true,
            stateManagement: options
        });
    }
    catch (error) {
        console.error('Get state management error:', error);
        res.status(500).json({
            error: 'Failed to get state management options',
            message: 'Unable to retrieve state management options'
        });
    }
});
// Get routing options
router.get('/config/routing', async (req, res) => {
    try {
        const { framework } = req.query;
        const allRouting = configService_1.ConfigService.getRoutingOptions();
        const routes = framework
            ? allRouting.filter(route => route.framework.includes(framework))
            : allRouting;
        res.json({
            success: true,
            routing: routes
        });
    }
    catch (error) {
        console.error('Get routing options error:', error);
        res.status(500).json({
            error: 'Failed to get routing options',
            message: 'Unable to retrieve routing options'
        });
    }
});
// Generate advanced app with configuration builder
router.post('/generate-advanced', async (req, res) => {
    try {
        const requestData = advancedGenerateSchema.parse(req.body);
        const userId = req.user.userId;
        const validation = configService_1.ConfigService.validateConfig(requestData.config);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Invalid configuration',
                message: `Configuration validation failed: ${validation.errors.join(', ')}`
            });
        }
        console.log(`?? Generating advanced app for user ${userId}: "${requestData.description}"`);
        console.log(`???  Configuration: ${requestData.config.framework.name} + ${requestData.config.language}`);
        const generatedApp = await advancedAIService.generateAdvancedApp(requestData, userId);
        const savedApp = await appService.createApp(generatedApp);
        console.log(`? Advanced app generated successfully: ${savedApp.name} (${savedApp.id})`);
        res.json({
            success: true,
            app: savedApp,
            message: 'Advanced app generated successfully! Your application is ready with the specified configuration.'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        console.error('Advanced AI Generation Error:', error);
        res.status(500).json({
            error: 'Failed to generate advanced app',
            message: 'We encountered an error while generating your advanced app. Please try again with a different configuration.'
        });
    }
});
// Generate new app with classic AI pipeline
router.post('/generate', async (req, res) => {
    try {
        const { description, requirements, preferences } = generateAppSchema.parse(req.body);
        const userId = req.user.userId;
        if (description.trim().length < 10) {
            return res.status(400).json({
                error: 'Description too short',
                message: 'Please provide a more detailed description (at least 10 characters)'
            });
        }
        const spamKeywords = ['test', 'hello', 'hi', 'nothing', 'anything'];
        const isSpam = spamKeywords.some(keyword => description.toLowerCase().includes(keyword) && description.length < 50);
        if (isSpam) {
            return res.status(400).json({
                error: 'Invalid description',
                message: 'Please provide a meaningful description of your app idea'
            });
        }
        console.log(`?? Generating app for user ${userId}: "${description}"`);
        const generatedApp = await aiService.generateApp(description, userId);
        const savedApp = await appService.createApp(generatedApp);
        console.log(`? App generated successfully: ${savedApp.name} (${savedApp.id})`);
        res.json({
            success: true,
            app: savedApp,
            message: 'App generated successfully! Your application is ready to use.'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        console.error('AI Generation Error:', error);
        res.status(500).json({
            error: 'Failed to generate app',
            message: 'We encountered an error while generating your app. Please try again with a different description.'
        });
    }
});
// Get generation progress (mock endpoint)
router.get('/generate/:appId/progress', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user.userId;
        res.json({
            success: true,
            progress: {
                appId,
                status: 'completed',
                steps: [
                    { name: 'Analyzing requirements', status: 'completed', progress: 100 },
                    { name: 'Generating frontend', status: 'completed', progress: 100 },
                    { name: 'Creating backend APIs', status: 'completed', progress: 100 },
                    { name: 'Setting up database', status: 'completed', progress: 100 },
                    { name: 'Deploying application', status: 'completed', progress: 100 }
                ],
                overallProgress: 100
            }
        });
    }
    catch (error) {
        console.error('Progress check error:', error);
        res.status(500).json({
            error: 'Failed to get progress',
            message: 'Unable to check generation progress'
        });
    }
});
//# sourceMappingURL=ai.js.map