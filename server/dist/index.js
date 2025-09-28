"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const client_1 = require("@prisma/client");
const http_1 = __importDefault(require("http"));
const databaseSetupService_1 = require("./services/databaseSetupService");
const socket_1 = require("./services/realtime/socket");
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5000;
async function startServer() {
    let setupResult;
    try {
        setupResult = await (0, databaseSetupService_1.ensureDatabaseSetup)();
    }
    catch (error) {
        console.error('Failed to prepare database schema:', error);
        process.exit(1);
    }
    try {
        await prisma.$connect();
        console.log('???  Database connected successfully');
        if (setupResult?.executed) {
            console.log(`? Prisma schema applied via ${setupResult.appliedCommand}`);
        }
        const server = http_1.default.createServer(app_1.app);
        (0, socket_1.initSocket)(server);
        server.listen(PORT, () => {
            console.log(`?? VibeCoding server running on port ${PORT}`);
            console.log(`?? Health check: http://localhost:${PORT}/health`);
            console.log(`?? API docs: http://localhost:${PORT}/api`);
            console.log('?? WebSocket: initialized');
        });
    }
    catch (error) {
        console.error('? Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('?? SIGTERM received, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('?? SIGINT received, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map