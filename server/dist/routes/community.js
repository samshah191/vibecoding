"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const router = express_1.default.Router();
exports.communityRoutes = router;
const prisma = new client_1.PrismaClient();
// User Profile Routes
// Get user profile by ID
router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                apps: {
                    where: {
                        published: true
                    },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User profile not found'
            });
        }
        res.json({
            success: true,
            user
        });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            error: 'Failed to fetch user profile',
            message: 'Unable to retrieve user profile'
        });
    }
});
// Update user profile (basic version)
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional()
});
router.put('/profile', async (req, res) => {
    try {
        const userId = req.user.userId;
        const updateData = updateProfileSchema.parse(req.body);
        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        });
        res.json({
            success: true,
            user,
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: 'Failed to update profile',
            message: 'Unable to update your profile'
        });
    }
});
// Get all public users for discovery
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                apps: {
                    where: { published: true },
                    select: {
                        id: true,
                        name: true,
                        description: true
                    },
                    take: 3
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
        const total = await prisma.user.count();
        res.json({
            success: true,
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Failed to fetch users',
            message: 'Unable to retrieve users'
        });
    }
});
//# sourceMappingURL=community.js.map