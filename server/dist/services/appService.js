"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AppService {
    async createApp(appData) {
        return prisma.app.create({
            data: {
                id: appData.id,
                name: appData.name,
                description: appData.description,
                userId: appData.userId,
                status: appData.status,
                frontend: JSON.stringify(appData.frontend),
                backend: JSON.stringify(appData.backend),
                database: JSON.stringify(appData.database),
                config: JSON.stringify(appData.config),
                features: appData.features.join(','),
                url: appData.url,
                published: appData.published || false
            }
        });
    }
    async getUserApps(userId) {
        const apps = await prisma.app.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                status: true,
                features: true,
                url: true,
                published: true,
                createdAt: true,
                updatedAt: true
            }
        });
        // Convert features string back to array
        return apps.map(app => ({
            ...app,
            features: app.features ? app.features.split(',') : []
        }));
    }
    async getAppById(appId, userId) {
        const app = await prisma.app.findFirst({
            where: {
                id: appId,
                userId
            }
        });
        if (!app)
            return null;
        // Parse JSON strings back to objects
        return {
            ...app,
            frontend: JSON.parse(app.frontend),
            backend: JSON.parse(app.backend),
            database: JSON.parse(app.database),
            config: JSON.parse(app.config),
            features: app.features ? app.features.split(',') : []
        };
    }
    async updateApp(appId, userId, updateData) {
        return prisma.app.updateMany({
            where: {
                id: appId,
                userId
            },
            data: updateData
        });
    }
    async deleteApp(appId, userId) {
        const result = await prisma.app.deleteMany({
            where: {
                id: appId,
                userId
            }
        });
        return result.count > 0;
    }
    async togglePublish(appId, userId) {
        const app = await prisma.app.findFirst({
            where: {
                id: appId,
                userId
            }
        });
        if (!app)
            return null;
        return prisma.app.update({
            where: { id: appId },
            data: { published: !app.published }
        });
    }
    async getPublishedApps() {
        return prisma.app.findMany({
            where: { published: true },
            select: {
                id: true,
                name: true,
                description: true,
                features: true,
                url: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
exports.AppService = AppService;
//# sourceMappingURL=appService.js.map