import express from 'express';
import { supabase } from '../services/supabase';
import { AuthenticatedRequest } from '../types/auth';
import { z } from 'zod';

const router = express.Router();

// User Profile Routes

// Get user profile by ID
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Get user's published apps separately
    const { data: apps } = await supabase
      .from('apps')
      .select('id, name, description, created_at')
      .eq('user_id', userId)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      user: {
        ...user,
        createdAt: user.created_at,
        apps: apps || []
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch user profile',
      message: 'Unable to retrieve user profile'
    });
  }
});

// Update user profile
const updateProfileSchema = z.object({
  name: z.string().min(1).optional()
});

router.put('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const updateData = updateProfileSchema.parse(req.body);

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, name, created_at')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: {
        ...user,
        createdAt: user.created_at
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Get users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get total count
    const { count: total } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // For each user, get their published apps (simplified for performance)
    const usersWithApps = await Promise.all(
      (users || []).map(async (user) => {
        const { data: apps } = await supabase
          .from('apps')
          .select('id, name, description')
          .eq('user_id', user.id)
          .eq('published', true)
          .limit(3);

        return {
          ...user,
          createdAt: user.created_at,
          apps: apps || []
        };
      })
    );

    res.json({
      success: true,
      users: usersWithApps,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'Unable to retrieve users'
    });
  }
});

export { router as communityRoutes };