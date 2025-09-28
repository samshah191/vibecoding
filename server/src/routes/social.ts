import express from 'express';
import { supabase } from '../services/supabase';
import { AuthenticatedRequest } from '../types/auth';
import { z } from 'zod';

const router = express.Router();

// Like System Routes

// Like an app
router.post('/apps/:appId/like', async (req: AuthenticatedRequest, res) => {
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
    const { data: app } = await supabase
      .from('apps')
      .select('*')
      .eq('id', appId)
      .eq('published', true)
      .single();

    if (!app) {
      return res.status(404).json({
        error: 'App not found',
        message: 'App not found or not public'
      });
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .single();

    if (existingLike) {
      return res.status(400).json({
        error: 'Already liked',
        message: 'You have already liked this app'
      });
    }

    // Create like
    await supabase
      .from('likes')
      .insert({
        user_id: userId,
        app_id: appId
      });

    // Get updated like count
    const { count: likeCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', appId);

    res.json({
      success: true,
      message: 'App liked successfully',
      likeCount
    });
  } catch (error) {
    console.error('Like app error:', error);
    res.status(500).json({
      error: 'Failed to like app',
      message: 'Unable to like this app'
    });
  }
});

// Unlike an app
router.delete('/apps/:appId/like', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be signed in to perform this action'
      });
    }
    const { appId } = req.params;

    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .single();

    if (!existingLike) {
      return res.status(400).json({
        error: 'Not liked',
        message: 'You have not liked this app'
      });
    }

    // Remove like
    await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('app_id', appId);

    // Get updated like count
    const { count: likeCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', appId);

    res.json({
      success: true,
      message: 'App unliked successfully',
      likeCount
    });
  } catch (error) {
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { data: likes } = await supabase
      .from('likes')
      .select(`
        *,
        users!inner (
          id,
          name,
          email
        )
      `)
      .eq('app_id', appId)
      .range(skip, skip + limit - 1)
      .order('created_at', { ascending: false });

    const { count: total } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', appId);

    res.json({
      success: true,
      likes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get app likes error:', error);
    res.status(500).json({
      error: 'Failed to fetch likes',
      message: 'Unable to retrieve app likes'
    });
  }
});

// Comment System Routes

const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional()
});

// Add comment to app
router.post('/apps/:appId/comments', async (req: AuthenticatedRequest, res) => {
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
    const { data: app } = await supabase
      .from('apps')
      .select('*')
      .eq('id', appId)
      .eq('published', true)
      .single();

    if (!app) {
      return res.status(404).json({
        error: 'App not found',
        message: 'App not found or not public'
      });
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const { data: parentComment } = await supabase
        .from('comments')
        .select('*')
        .eq('id', parentId)
        .eq('app_id', appId)
        .single();

      if (!parentComment) {
        return res.status(404).json({
          error: 'Parent comment not found',
          message: 'The comment you are replying to does not exist'
        });
      }
    }

    // Create comment
    const { data: comment } = await supabase
      .from('comments')
      .insert({
        content,
        user_id: userId,
        app_id: appId,
        parent_id: parentId
      })
      .select(`
        *,
        users!inner (
          id,
          name,
          email
        ),
        replies:comments!parent_id (
          *,
          users!inner (
            id,
            name,
            email
          )
        )
      `)
      .single();

    res.status(201).json({
      success: true,
      comment,
      message: 'Comment added successfully'
    });
  } catch (error) {
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { data: comments } = await supabase
      .from('comments')
      .select(`
        *,
        users!inner (
          id,
          name,
          email
        ),
        replies:comments!parent_id (
          *,
          users!inner (
            id,
            name,
            email
          )
        )
      `)
      .eq('app_id', appId)
      .is('parent_id', null) // Only top-level comments
      .range(skip, skip + limit - 1)
      .order('created_at', { ascending: false });

    const { count: total } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', appId)
      .is('parent_id', null);

    res.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get app comments error:', error);
    res.status(500).json({
      error: 'Failed to fetch comments',
      message: 'Unable to retrieve app comments'
    });
  }
});

// Update comment
const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000)
});

router.put('/comments/:commentId', async (req: AuthenticatedRequest, res) => {
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
    const { data: existingComment } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .eq('user_id', userId)
      .single();

    if (!existingComment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'Comment not found or you do not have permission to edit it'
      });
    }

    const { data: comment } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .select(`
        *,
        users!inner (
          id,
          name,
          email
        )
      `)
      .single();

    res.json({
      success: true,
      comment,
      message: 'Comment updated successfully'
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      error: 'Failed to update comment',
      message: 'Unable to update comment'
    });
  }
});

// Delete comment
router.delete('/comments/:commentId', async (req: AuthenticatedRequest, res) => {
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
    const { data: existingComment } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .eq('user_id', userId)
      .single();

    if (!existingComment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'Comment not found or you do not have permission to delete it'
      });
    }

    // Delete comment (this will also delete replies due to cascade)
    await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      error: 'Failed to delete comment',
      message: 'Unable to delete comment'
    });
  }
});

export { router as socialRoutes };



