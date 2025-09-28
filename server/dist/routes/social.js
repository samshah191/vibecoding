"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const router = express_1.default.Router();
exports.socialRoutes = router;
const prisma = new client_1.PrismaClient();
// Like System Routes
// Like an app
router.post('/apps/:appId/like', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'You must be signed in to perform this action'
            });
        }
        const { appId } = req.params;
        // Check if app exists and is public
        const app = await prisma.app.findFirst({
            where: {
                id: appId,
                published: true
            }
        });
        if (!app) {
            return res.status(404).json({
                error: 'App not found',
                message: 'App not found or not public'
            });
        }
        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_appId: {
                    userId,
                    appId
                }
            }
        });
        if (existingLike) {
            return res.status(400).json({
                error: 'Already liked',
                message: 'You have already liked this app'
            });
        }
        // Create like
        await prisma.like.create({
            data: {
                userId,
                appId
            }
        });
        // Get updated like count
        const likeCount = await prisma.like.count({
            where: { appId }
        });
        res.json({
            success: true,
            message: 'App liked successfully',
            likeCount
        });
    }
    catch (error) {
        console.error('Like app error:', error);
        res.status(500).json({
            error: 'Failed to like app',
            message: 'Unable to like this app'
        });
    }
});
// Unlike an app
router.delete('/apps/:appId/like', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'You must be signed in to perform this action'
            });
        }
        const { appId } = req.params;
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_appId: {
                    userId,
                    appId
                }
            }
        });
        if (!existingLike) {
            return res.status(400).json({
                error: 'Not liked',
                message: 'You have not liked this app'
            });
        }
        // Remove like
        await prisma.like.delete({
            where: {
                userId_appId: {
                    userId,
                    appId
                }
            }
        });
        // Get updated like count
        const likeCount = await prisma.like.count({
            where: { appId }
        });
        res.json({
            success: true,
            message: 'App unliked successfully',
            likeCount
        });
    }
    catch (error) {
        console.error('Unlike app error:', error);
        res.status(500).json({
            error: 'Failed to unlike app',
            message: 'Unable to unlike this app'
        });
    }
});
// Get app likes
router.get('/apps/:appId/likes', async (req, res) => {
    try {
        const { appId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const likes = await prisma.like.findMany({
            where: { appId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
        const total = await prisma.like.count({
            where: { appId }
        });
        res.json({
            success: true,
            likes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get app likes error:', error);
        res.status(500).json({
            error: 'Failed to fetch likes',
            message: 'Unable to retrieve app likes'
        });
    }
});
// Comment System Routes
const createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(1000),
    parentId: zod_1.z.string().optional()
});
// Add comment to app
router.post('/apps/:appId/comments', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'You must be signed in to perform this action'
            });
        }
        const { appId } = req.params;
        const parsedBody = createCommentSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid comment data',
                details: parsedBody.error.errors
            });
        }
        const { content, parentId } = parsedBody.data;
        // Check if app exists and is public
        const app = await prisma.app.findFirst({
            where: {
                id: appId,
                published: true
            }
        });
        if (!app) {
            return res.status(404).json({
                error: 'App not found',
                message: 'App not found or not public'
            });
        }
        // If parentId is provided, check if parent comment exists
        if (parentId) {
            const parentComment = await prisma.comment.findFirst({
                where: {
                    id: parentId,
                    appId
                }
            });
            if (!parentComment) {
                return res.status(404).json({
                    error: 'Parent comment not found',
                    message: 'The comment you are replying to does not exist'
                });
            }
        }
        // Create comment
        const comment = await prisma.comment.create({
            data: {
                content,
                userId,
                appId,
                parentId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            comment,
            message: 'Comment added successfully'
        });
    }
    catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            error: 'Failed to add comment',
            message: 'Unable to add comment'
        });
    }
});
// Get app comments
router.get('/apps/:appId/comments', async (req, res) => {
    try {
        const { appId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const comments = await prisma.comment.findMany({
            where: {
                appId,
                parentId: null // Only top-level comments
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
        const total = await prisma.comment.count({
            where: {
                appId,
                parentId: null
            }
        });
        res.json({
            success: true,
            comments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get app comments error:', error);
        res.status(500).json({
            error: 'Failed to fetch comments',
            message: 'Unable to retrieve app comments'
        });
    }
});
// Update comment
const updateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(1000)
});
router.put('/comments/:commentId', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'You must be signed in to perform this action'
            });
        }
        const { commentId } = req.params;
        const parsedBody = updateCommentSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid comment data',
                details: parsedBody.error.errors
            });
        }
        const { content } = parsedBody.data;
        // Find comment and check ownership
        const existingComment = await prisma.comment.findFirst({
            where: {
                id: commentId,
                userId
            }
        });
        if (!existingComment) {
            return res.status(404).json({
                error: 'Comment not found',
                message: 'Comment not found or you do not have permission to edit it'
            });
        }
        const comment = await prisma.comment.update({
            where: { id: commentId },
            data: { content },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json({
            success: true,
            comment,
            message: 'Comment updated successfully'
        });
    }
    catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({
            error: 'Failed to update comment',
            message: 'Unable to update comment'
        });
    }
});
// Delete comment
router.delete('/comments/:commentId', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'You must be signed in to perform this action'
            });
        }
        const { commentId } = req.params;
        // Find comment and check ownership
        const existingComment = await prisma.comment.findFirst({
            where: {
                id: commentId,
                userId
            }
        });
        if (!existingComment) {
            return res.status(404).json({
                error: 'Comment not found',
                message: 'Comment not found or you do not have permission to delete it'
            });
        }
        // Delete comment (this will also delete replies due to cascade)
        await prisma.comment.delete({
            where: { id: commentId }
        });
        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            error: 'Failed to delete comment',
            message: 'Unable to delete comment'
        });
    }
});
//# sourceMappingURL=social.js.map