import express from 'express';
import axios, { AxiosError } from 'axios';
import { supabase } from '../services/supabase';

interface GitHubConnection {
  access_token: string;
  github_username: string;
}

interface ProjectData {
  id: string;
  user_id: string;
  project_files: Array<{
    name: string;
    path: string;
    content: string;
  }>;
  project_github_connections: Array<{
    repository_name: string;
    repository_url: string;
    branch: string;
    last_sync_at: string;
  }>;
}

const router = express.Router();

// GitHub OAuth callback
router.post('/auth/github/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: 'Authorization code is required' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({ success: false, error: 'Failed to get access token' });
    }

    // Get user information from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const githubUser = userResponse.data;

    // Get user's emails (including private ones)
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const emails = emailResponse.data;
    const primaryEmail = emails.find((email: any) => email.primary)?.email || githubUser.email;
    const verifiedEmails = emails.filter((email: any) => email.verified).map((email: any) => email.email);

    // Enhanced user data with all emails
    const enhancedGithubUser = {
      ...githubUser,
      email: primaryEmail,
      emails: verifiedEmails,
      primary_email: primaryEmail
    };

    res.json({
      success: true,
      accessToken: access_token,
      user: enhancedGithubUser,
      emailMapping: {
        primary: primaryEmail,
        verified: verifiedEmails,
        total: emails.length
      }
    });
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json({ 
        success: false, 
        error: error.response.data.message || 'GitHub API error' 
      });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

// Get GitHub repositories for authenticated user
router.get('/repositories', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get GitHub access token from database
    const { data: connection, error: connectionError } = await supabase
      .from('github_connections')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (connectionError || !connection) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    const githubConnection = connection as GitHubConnection;

    // Fetch repositories from GitHub
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${githubConnection.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      params: {
        sort: 'updated',
        per_page: 100,
      },
    });

    res.json(reposResponse.data);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Create a new GitHub repository
router.post('/repositories', async (req, res) => {
  try {
    const { name, description, private: isPrivate } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get GitHub access token from database
    const { data: connection, error: connectionError } = await supabase
      .from('github_connections')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (connectionError || !connection) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    const githubConnection = connection as GitHubConnection;

    // Create repository on GitHub
    const repoResponse = await axios.post('https://api.github.com/user/repos', {
      name,
      description,
      private: isPrivate,
      auto_init: true,
    }, {
      headers: {
        'Authorization': `token ${githubConnection.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    res.json(repoResponse.data);
  } catch (error) {
    console.error('Error creating repository:', error);
    if (error instanceof AxiosError && error.response) {
      res.status(error.response.status).json({ error: error.response.data.message });
    } else {
      res.status(500).json({ error: 'Failed to create repository' });
    }
  }
});

// Sync project with GitHub repository
router.post('/sync/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { action, commitMessage } = req.body; // action: 'push' | 'pull'
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get project and GitHub connection
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        project_files(*),
        project_github_connections(*)
      `)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectData = project as ProjectData;

    if (!projectData.project_github_connections || projectData.project_github_connections.length === 0) {
      return res.status(400).json({ error: 'Project not connected to GitHub repository' });
    }

    const connection = projectData.project_github_connections[0];

    // Get GitHub access token
    const { data: githubConnection, error: githubError } = await supabase
      .from('github_connections')
      .select('access_token, github_username')
      .eq('user_id', user.id)
      .single();

    if (githubError || !githubConnection) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    const gitHubAuth = githubConnection as GitHubConnection;

    if (action === 'push') {
      // Push files to GitHub
      for (const file of projectData.project_files) {
        await updateGitHubFile(
          gitHubAuth.access_token,
          gitHubAuth.github_username,
          connection.repository_name,
          file.path,
          file.content,
          commitMessage || 'Update from VibeCoding',
          connection.branch
        );
      }

      // Update last sync time
      await (supabase
        .from('project_github_connections') as any)
        .update({ last_sync_at: new Date().toISOString() })
        .eq('project_id', projectId);

      res.json({ success: true, message: 'Project pushed to GitHub successfully' });
    } else if (action === 'pull') {
      // Pull files from GitHub
      const files = await getGitHubRepositoryFiles(
        gitHubAuth.access_token,
        gitHubAuth.github_username,
        connection.repository_name,
        connection.branch
      );

      // Update project files
      for (const file of files) {
        await (supabase
          .from('project_files') as any)
          .upsert({
            project_id: projectId,
            name: file.name,
            path: file.path,
            content: file.content,
            updated_at: new Date().toISOString(),
          });
      }

      // Update last sync time
      await (supabase
        .from('project_github_connections') as any)
        .update({ last_sync_at: new Date().toISOString() })
        .eq('project_id', projectId);

      res.json({ success: true, message: 'Project pulled from GitHub successfully' });
    } else {
      res.status(400).json({ error: 'Invalid action. Use "push" or "pull"' });
    }
  } catch (error) {
    console.error('Error syncing project:', error);
    res.status(500).json({ error: 'Failed to sync project' });
  }
});

// Helper function to update a file in GitHub
async function updateGitHubFile(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string
): Promise<void> {
  try {
    // Check if file exists
    let sha: string | undefined;
    try {
      const existingResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          params: { ref: branch },
        }
      );
      sha = existingResponse.data.sha;
    } catch (error) {
      // File doesn't exist, will create new
    }

    // Update or create file
    await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
        ...(sha && { sha }),
      },
      {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
  } catch (error) {
    console.error(`Failed to update file ${path}:`, error);
    throw error;
  }
}

// Helper function to get repository files
async function getGitHubRepositoryFiles(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string
): Promise<Array<{ name: string; path: string; content: string }>> {
  try {
    // Get repository tree
    const treeResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}`,
      {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        params: { recursive: 1 },
      }
    );

    const files = [];

    // Get content for each file
    for (const item of treeResponse.data.tree) {
      if (item.type === 'blob') {
        try {
          const fileResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`,
            {
              headers: {
                'Authorization': `token ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            }
          );

          const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
          files.push({
            name: item.path.split('/').pop() || item.path,
            path: item.path,
            content,
          });
        } catch (error) {
          console.error(`Failed to get content for ${item.path}:`, error);
        }
      }
    }

    return files;
  } catch (error) {
    console.error('Failed to get repository files:', error);
    throw error;
  }
}

export default router;

// Handle email conflicts and user mapping
router.post('/resolve-email-conflict', async (req, res) => {
  try {
    const { email, resolution, targetUserId } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    switch (resolution) {
      case 'add_email':
        // Add email to current user
        const { error: addError } = await (supabase
          .from('user_emails') as any)
          .upsert({
            user_id: user.id,
            email,
            provider: 'github',
            is_verified: true
          });
        
        if (addError) {
          return res.status(400).json({ error: 'Failed to add email' });
        }
        
        res.json({ success: true, message: 'Email added successfully' });
        break;

      case 'use_different_email':
        // User should provide a different email
        res.json({ 
          success: true, 
          message: 'Please use a different email address',
          action: 'select_different_email'
        });
        break;

      case 'merge_accounts':
        // Advanced: Merge accounts (requires additional implementation)
        res.json({ 
          success: false, 
          message: 'Account merging not yet implemented',
          action: 'contact_support'
        });
        break;

      default:
        res.status(400).json({ error: 'Invalid resolution option' });
    }
  } catch (error) {
    console.error('Error resolving email conflict:', error);
    res.status(500).json({ error: 'Failed to resolve email conflict' });
  }
});