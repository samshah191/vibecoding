"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRoutes = void 0;
const express_1 = __importDefault(require("express"));
const appService_1 = require("../services/appService");
const zod_1 = require("zod");
const router = express_1.default.Router();
exports.appRoutes = router;
const appService = new appService_1.AppService();
const updateAppSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().min(1).optional(),
    published: zod_1.z.boolean().optional()
});
// Get all user apps
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const apps = await appService.getUserApps(userId);
        res.json({
            success: true,
            apps: apps.map(app => ({
                id: app.id,
                name: app.name,
                description: app.description,
                status: app.status,
                features: app.features,
                url: app.url,
                published: app.published,
                createdAt: app.createdAt,
                updatedAt: app.updatedAt
            }))
        });
    }
    catch (error) {
        console.error('Get apps error:', error);
        res.status(500).json({
            error: 'Failed to fetch apps',
            message: 'Unable to retrieve your applications'
        });
    }
});
// Get specific app by ID
router.get('/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user.userId;
        const app = await appService.getAppById(appId, userId);
        if (!app) {
            return res.status(404).json({
                error: 'App not found',
                message: 'The requested application could not be found'
            });
        }
        res.json({
            success: true,
            app
        });
    }
    catch (error) {
        console.error('Get app error:', error);
        res.status(500).json({
            error: 'Failed to fetch app',
            message: 'Unable to retrieve the application'
        });
    }
});
// Update app
router.put('/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user.userId;
        const updateData = updateAppSchema.parse(req.body);
        const updatedApp = await appService.updateApp(appId, userId, updateData);
        if (!updatedApp) {
            return res.status(404).json({
                error: 'App not found',
                message: 'The requested application could not be found'
            });
        }
        res.json({
            success: true,
            app: updatedApp,
            message: 'App updated successfully'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        console.error('Update app error:', error);
        res.status(500).json({
            error: 'Failed to update app',
            message: 'Unable to update the application'
        });
    }
});
// Delete app
router.delete('/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user.userId;
        const deleted = await appService.deleteApp(appId, userId);
        if (!deleted) {
            return res.status(404).json({
                error: 'App not found',
                message: 'The requested application could not be found'
            });
        }
        res.json({
            success: true,
            message: 'App deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete app error:', error);
        res.status(500).json({
            error: 'Failed to delete app',
            message: 'Unable to delete the application'
        });
    }
});
// Publish/unpublish app
router.post('/:appId/publish', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user.userId;
        const app = await appService.togglePublish(appId, userId);
        if (!app) {
            return res.status(404).json({
                error: 'App not found',
                message: 'The requested application could not be found'
            });
        }
        res.json({
            success: true,
            app,
            message: app.published ? 'App published successfully' : 'App unpublished successfully'
        });
    }
    catch (error) {
        console.error('Publish app error:', error);
        res.status(500).json({
            error: 'Failed to publish app',
            message: 'Unable to change publication status'
        });
    }
});
//# sourceMappingURL=apps.js.map