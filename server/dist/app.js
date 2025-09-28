"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./routes/auth");
const apps_1 = require("./routes/apps");
const ai_1 = require("./routes/ai");
const community_1 = require("./routes/community");
const social_1 = require("./routes/social");
const leaderboard_1 = require("./routes/leaderboard");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_2 = require("./middleware/auth");
const projects_1 = __importDefault(require("./routes/projects"));
const collaboration_1 = __importDefault(require("./routes/collaboration"));
const orchestration_1 = __importDefault(require("./routes/orchestration"));
const lifecycle_1 = __importDefault(require("./routes/lifecycle"));
const team_1 = __importDefault(require("./routes/team"));
const marketplace_1 = __importDefault(require("./routes/marketplace"));
const billing_1 = __importDefault(require("./routes/billing"));
const security_1 = __importDefault(require("./routes/security"));
const waf_1 = require("./services/security/waf");
const admin_1 = __importDefault(require("./routes/admin"));
const devops_1 = __importDefault(require("./routes/devops"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// WAF middleware (simple rules, can be tuned via /api/security/waf/rules)
app.use(waf_1.wafMiddleware);
// Routes
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/apps', auth_2.authenticateToken, apps_1.appRoutes);
app.use('/api/ai', auth_2.authenticateToken, ai_1.aiRoutes);
app.use('/api/community', community_1.communityRoutes);
app.use('/api/social', auth_2.authenticateToken, social_1.socialRoutes);
app.use('/api/leaderboard', leaderboard_1.leaderboardRoutes);
app.use('/api/projects', auth_2.authenticateToken, projects_1.default);
app.use('/api/collaboration', auth_2.authenticateToken, collaboration_1.default);
app.use('/api/orchestration', auth_2.authenticateToken, orchestration_1.default);
app.use('/api/lifecycle', auth_2.authenticateToken, lifecycle_1.default);
app.use('/api/team', auth_2.authenticateToken, team_1.default);
app.use('/api/marketplace', marketplace_1.default);
app.use('/api/billing', billing_1.default);
app.use('/api/security', security_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/devops', devops_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'VibeCoding Base44 Clone is running!',
        timestamp: new Date().toISOString()
    });
});
// API info
app.get('/api', (req, res) => {
    res.json({
        name: 'VibeCoding API',
        version: '1.0.0',
        description: 'AI-powered vibe coding platform - Base44 clone',
        endpoints: {
            auth: '/api/auth',
            apps: '/api/apps',
            ai: '/api/ai'
        }
    });
});
// Error handling
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});
//# sourceMappingURL=app.js.map