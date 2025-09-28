import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const router = express.Router();

// Create server-side Supabase client with service role key for admin operations
const supabaseUrl = 'https://ilroebcnrmryadofbjfc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm9lYmNucm1yeWFkb2ZiamZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg2NjE5OCwiZXhwIjoyMDc0NDQyMTk4fQ.FPMEQMVpBYz6lVS5hHlKksbdcyUCHzsoWZsGbsYYE-k'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const adminEmailAllowlist = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean);

function resolveRoleForEmail(email: string): 'USER' | 'ADMIN' {
  return adminEmailAllowlist.includes(email.toLowerCase()) ? 'ADMIN' : 'USER';
}


const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Register new user (using Supabase Auth)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    
    // Determine role based on allowlist
    const role = resolveRoleForEmail(email);

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now
      user_metadata: {
        name: name || email.split('@')[0],
        role,
      },
    });

    if (error) {
      return res.status(400).json({ 
        error: error.message,
        message: 'Failed to create account. Please try again.'
      });
    }

    if (!data.user) {
      return res.status(400).json({ 
        error: 'User creation failed',
        message: 'Failed to create account. Please try again.'
      });
    }

    // Create user profile in public.users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email,
          name: name || email.split('@')[0],
          role,
        }
      ]);

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Don't fail the registration if profile creation fails
    }
    
    res.status(201).json({
      success: true,
      user: { 
        id: data.user.id, 
        email: data.user.email, 
        name: name || email.split('@')[0],
        role,
        createdAt: data.user.created_at
      },
      message: 'Account created successfully!'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'An error occurred while creating your account. Please try again.'
    });
  }
});

// Login user (using Supabase Auth)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ 
        error: 'Invalid credentials',
        message: 'The email or password you entered is incorrect.'
      });
    }

    if (!data.user || !data.session) {
      return res.status(400).json({ 
        error: 'Invalid credentials',
        message: 'The email or password you entered is incorrect.'
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    res.json({
      success: true,
      token: data.session.access_token,
      user: { 
        id: data.user.id, 
        email: data.user.email!, 
        name: profile?.name || data.user.email?.split('@')[0],
        role: profile?.role || 'USER',
        createdAt: data.user.created_at
      },
      message: 'Login successful!'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'An error occurred while logging in. Please try again.'
    });
  }
});

// Get current user profile (using Supabase Auth)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar,
        website: profile.website,
        location: profile.location,
        isPublic: profile.is_public,
        role: profile.role,
        totalApps: profile.total_apps,
        totalLikes: profile.total_likes,
        totalFollowers: profile.total_followers,
        totalFollowing: profile.total_following,
        createdAt: profile.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

export { router as authRoutes };