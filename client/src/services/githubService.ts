import { supabase } from './supabase';
import { emailMappingService } from './emailMappingService';

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string;
  email: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
}

interface GitHubFile {
  name: string;
  path: string;
  content: string;
  sha?: string;
}

interface ProjectGitHubConnection {
  id: string;
  projectId: string;
  repositoryName: string;
  repositoryUrl: string;
  branch: string;
  lastSyncAt: string;
}

export class GitHubService {
  private accessToken: string | null = null;
  private baseUrl = 'https://api.github.com';

  constructor() {
    this.loadAccessToken();
  }

  private async loadAccessToken(): Promise<void> {
    try {
      // Use the provided token from environment
      const envToken = process.env.REACT_APP_GITHUB_TOKEN;
      if (envToken) {
        this.accessToken = envToken;
        return;
      }

      // Fallback to user-specific token from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('github_connections')
          .select('access_token')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          this.accessToken = data.access_token;
        }
      }
    } catch (error) {
      console.error('Failed to load GitHub access token:', error);
    }
  }

  async connectGitHub(): Promise<boolean> {
    try {
      // Initiate GitHub OAuth flow
      const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const scope = 'repo,user:email';
      
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      
      // Open GitHub OAuth in new window
      const popup = window.open(authUrl, 'github-oauth', 'width=600,height=600');
      
      return new Promise((resolve) => {
        const messageHandler = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
            const { code } = event.data;
            const success = await this.handleAuthCallback(code);
            resolve(success);
            popup?.close();
            window.removeEventListener('message', messageHandler);
          } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
            resolve(false);
            popup?.close();
            window.removeEventListener('message', messageHandler);
          }
        };

        window.addEventListener('message', messageHandler);
      });
    } catch (error) {
      console.error('GitHub connection failed:', error);
      return false;
    }
  }

  private async handleAuthCallback(code: string): Promise<boolean> {
    try {
      // Exchange code for access token via our backend
      const response = await fetch('/api/auth/github/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      
      if (data.success) {
        this.accessToken = data.accessToken;
        
        // Handle email mapping before saving connection
        const { data: { user } } = await supabase.auth.getUser();
        if (user && data.user.email) {
          const mappingResult = await emailMappingService.handleOAuthEmailMapping(
            data.user.email,
            'github',
            user.id
          );
          
          // Check for email conflicts
          if (mappingResult.user_id && mappingResult.user_id !== user.id) {
            console.warn('Email conflict detected:', {
              githubEmail: data.user.email,
              currentUser: user.id,
              existingUser: mappingResult.user_id
            });
            
            // You could handle this conflict by:
            // 1. Asking user to resolve the conflict
            // 2. Using a different email
            // 3. Merging accounts (advanced)
            // For now, we'll proceed with current user but log the conflict
          }
        }
        
        await this.saveConnection(data.accessToken, data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('GitHub auth callback failed:', error);
      return false;
    }
  }

  private async saveConnection(accessToken: string, githubUser: GitHubUser): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Use the new function to link GitHub account with flexible email matching
      const { data, error } = await supabase.rpc('link_github_account', {
        user_uuid: user.id,
        github_data: {
          id: githubUser.id.toString(),
          login: githubUser.login,
          email: githubUser.email,
          access_token: accessToken,
          avatar_url: githubUser.avatar_url,
          name: githubUser.name
        }
      });

      if (error) {
        console.error('Error linking GitHub account:', error);
        throw error;
      }

      // Also add to user_emails table for better email mapping
      if (githubUser.email) {
        await supabase
          .from('user_emails')
          .upsert({
            user_id: user.id,
            email: githubUser.email,
            provider: 'github',
            is_verified: true
          });
      }
    } catch (error) {
      console.error('Failed to save GitHub connection:', error);
      throw error;
    }
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    if (!this.accessToken) {
      throw new Error('GitHub not connected');
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/repos?sort=updated&per_page=100`, {
        headers: {
          'Authorization': `token ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      throw error;
    }
  }

  async createRepository(name: string, description: string, isPrivate: boolean = false): Promise<GitHubRepository> {
    if (!this.accessToken) {
      throw new Error('GitHub not connected');
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/repos`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          private: isPrivate,
          auto_init: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create repository: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create repository:', error);
      throw error;
    }
  }

  async pushProjectToGitHub(projectId: string, commitMessage: string): Promise<boolean> {
    try {
      // Get project connection
      const connection = await this.getProjectConnection(projectId);
      if (!connection) {
        throw new Error('Project not connected to GitHub repository');
      }

      // Get project files
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*, project_files(*)')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        throw new Error('Failed to fetch project data');
      }

      // Push files to GitHub
      const files: GitHubFile[] = project.project_files.map((file: any) => ({
        name: file.name,
        path: file.path,
        content: file.content,
      }));

      await this.updateRepositoryFiles(connection, files, commitMessage);

      // Update last sync time
      await supabase
        .from('project_github_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('project_id', projectId);

      return true;
    } catch (error) {
      console.error('Failed to push project to GitHub:', error);
      throw error;
    }
  }

  async pullFromGitHub(projectId: string): Promise<boolean> {
    try {
      const connection = await this.getProjectConnection(projectId);
      if (!connection) {
        throw new Error('Project not connected to GitHub repository');
      }

      // Get files from GitHub repository
      const files = await this.getRepositoryFiles(connection);

      // Update project files in Supabase
      for (const file of files) {
        await supabase
          .from('project_files')
          .upsert({
            project_id: projectId,
            name: file.name,
            path: file.path,
            content: file.content,
            updated_at: new Date().toISOString(),
          });
      }

      // Update last sync time
      await supabase
        .from('project_github_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('project_id', projectId);

      return true;
    } catch (error) {
      console.error('Failed to pull from GitHub:', error);
      throw error;
    }
  }

  async connectProjectToRepository(projectId: string, repositoryName: string, branch: string = 'main'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get GitHub username
      const { data: connection } = await supabase
        .from('github_connections')
        .select('github_username')
        .eq('user_id', user.id)
        .single();

      if (!connection) {
        throw new Error('GitHub not connected');
      }

      const repositoryUrl = `https://github.com/${connection.github_username}/${repositoryName}`;

      await supabase
        .from('project_github_connections')
        .upsert({
          project_id: projectId,
          repository_name: repositoryName,
          repository_url: repositoryUrl,
          branch,
          last_sync_at: new Date().toISOString(),
        });

      return true;
    } catch (error) {
      console.error('Failed to connect project to repository:', error);
      throw error;
    }
  }

  private async getProjectConnection(projectId: string): Promise<ProjectGitHubConnection | null> {
    const { data, error } = await supabase
      .from('project_github_connections')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  private async updateRepositoryFiles(connection: ProjectGitHubConnection, files: GitHubFile[], commitMessage: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('GitHub not connected');
    }

    try {
      // Get current commit SHA
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: githubConnection } = await supabase
        .from('github_connections')
        .select('github_username')
        .eq('user_id', user.id)
        .single();

      if (!githubConnection) {
        throw new Error('GitHub connection not found');
      }

      const repoOwner = githubConnection.github_username;
      const repoName = connection.repositoryName;

      // Create or update files
      for (const file of files) {
        await this.updateFile(repoOwner, repoName, file.path, file.content, commitMessage, connection.branch);
      }
    } catch (error) {
      console.error('Failed to update repository files:', error);
      throw error;
    }
  }

  private async updateFile(owner: string, repo: string, path: string, content: string, message: string, branch: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('GitHub not connected');
    }

    try {
      // Check if file exists
      let sha: string | undefined;
      try {
        const existingResponse = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
          headers: {
            'Authorization': `token ${this.accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (existingResponse.ok) {
          const existingData = await existingResponse.json();
          sha = existingData.sha;
        }
      } catch (error) {
        // File doesn't exist, will create new
      }

      // Update or create file
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
          branch,
          ...(sha && { sha }),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update file: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to update file ${path}:`, error);
      throw error;
    }
  }

  private async getRepositoryFiles(connection: ProjectGitHubConnection): Promise<GitHubFile[]> {
    if (!this.accessToken) {
      throw new Error('GitHub not connected');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: githubConnection } = await supabase
        .from('github_connections')
        .select('github_username')
        .eq('user_id', user.id)
        .single();

      if (!githubConnection) {
        throw new Error('GitHub connection not found');
      }

      const repoOwner = githubConnection.github_username;
      const repoName = connection.repositoryName;

      // Get repository tree
      const response = await fetch(`${this.baseUrl}/repos/${repoOwner}/${repoName}/git/trees/${connection.branch}?recursive=1`, {
        headers: {
          'Authorization': `token ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch repository tree: ${response.statusText}`);
      }

      const treeData = await response.json();
      const files: GitHubFile[] = [];

      // Get content for each file
      for (const item of treeData.tree) {
        if (item.type === 'blob') {
          const fileContent = await this.getFileContent(repoOwner, repoName, item.path);
          if (fileContent) {
            files.push({
              name: item.path.split('/').pop() || item.path,
              path: item.path,
              content: fileContent,
              sha: item.sha,
            });
          }
        }
      }

      return files;
    } catch (error) {
      console.error('Failed to get repository files:', error);
      throw error;
    }
  }

  private async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    if (!this.accessToken) {
      throw new Error('GitHub not connected');
    }

    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          'Authorization': `token ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.encoding === 'base64') {
        return decodeURIComponent(escape(atob(data.content)));
      }
      
      return data.content;
    } catch (error) {
      console.error(`Failed to get file content for ${path}:`, error);
      return null;
    }
  }

  async disconnectGitHub(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      await supabase
        .from('github_connections')
        .delete()
        .eq('user_id', user.id);

      this.accessToken = null;
      return true;
    } catch (error) {
      console.error('Failed to disconnect GitHub:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return !!this.accessToken;
  }
}

export const githubService = new GitHubService();