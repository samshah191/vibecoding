import React, { useState, useEffect } from 'react';
import { githubService } from '../services/githubService';
import { supabase } from '../services/supabase';

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

interface ProjectGitHubConnection {
  id: string;
  projectId: string;
  repositoryName: string;
  repositoryUrl: string;
  branch: string;
  lastSyncAt: string;
}

interface GitHubIntegrationProps {
  projectId: string;
  projectName: string;
}

const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({ projectId, projectName }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [connection, setConnection] = useState<ProjectGitHubConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [commitMessage, setCommitMessage] = useState('Update from VibeCoding');

  useEffect(() => {
    checkConnection();
    loadProjectConnection();
  }, [projectId]);

  const checkConnection = async () => {
    setIsConnected(githubService.isConnected());
    if (githubService.isConnected()) {
      await loadRepositories();
    }
  };

  const loadRepositories = async () => {
    try {
      setLoading(true);
      const repos = await githubService.getRepositories();
      setRepositories(repos);
    } catch (err) {
      setError('Failed to load repositories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('project_github_connections')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (data && !error) {
        setConnection(data);
        setSelectedRepo(data.repository_name);
        setSelectedBranch(data.branch);
      }
    } catch (err) {
      console.error('Failed to load project connection:', err);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError('');
      const success = await githubService.connectGitHub();
      
      if (success) {
        setIsConnected(true);
        setSuccess('Successfully connected to GitHub!');
        await loadRepositories();
      } else {
        setError('Failed to connect to GitHub');
      }
    } catch (err) {
      setError('Failed to connect to GitHub');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      const success = await githubService.disconnectGitHub();
      
      if (success) {
        setIsConnected(false);
        setRepositories([]);
        setConnection(null);
        setSuccess('Disconnected from GitHub');
      } else {
        setError('Failed to disconnect from GitHub');
      }
    } catch (err) {
      setError('Failed to disconnect from GitHub');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectToRepo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const success = await githubService.connectProjectToRepository(
        projectId,
        selectedRepo,
        selectedBranch
      );
      
      if (success) {
        setSuccess('Project connected to repository!');
        await loadProjectConnection();
      } else {
        setError('Failed to connect project to repository');
      }
    } catch (err) {
      setError('Failed to connect project to repository');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    try {
      setLoading(true);
      setError('');
      
      const success = await githubService.pushProjectToGitHub(projectId, commitMessage);
      
      if (success) {
        setSuccess('Successfully pushed to GitHub!');
        setCommitMessage('Update from VibeCoding');
      } else {
        setError('Failed to push to GitHub');
      }
    } catch (err) {
      setError('Failed to push to GitHub');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePull = async () => {
    try {
      setLoading(true);
      setError('');
      
      const success = await githubService.pullFromGitHub(projectId);
      
      if (success) {
        setSuccess('Successfully pulled from GitHub!');
      } else {
        setError('Failed to pull from GitHub');
      }
    } catch (err) {
      setError('Failed to pull from GitHub');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepository = async () => {
    try {
      setLoading(true);
      setError('');
      
      const repo = await githubService.createRepository(
        newRepoName,
        newRepoDescription,
        newRepoPrivate
      );
      
      setSuccess(`Repository "${repo.name}" created successfully!`);
      setShowCreateRepo(false);
      setNewRepoName('');
      setNewRepoDescription('');
      setNewRepoPrivate(false);
      
      await loadRepositories();
      setSelectedRepo(repo.name);
    } catch (err) {
      setError('Failed to create repository');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">GitHub Integration</h3>
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        
        <p className="text-gray-600 mb-4">
          Connect your GitHub account to sync your VibeCoding projects with GitHub repositories.
        </p>
        
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Connect to GitHub"
          aria-label="Connect to GitHub"
        >
          {loading ? 'Connecting...' : 'Connect to GitHub'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">GitHub Integration</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-green-600">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Connected</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            title="Disconnect GitHub"
            aria-label="Disconnect GitHub"
          >
            Disconnect
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-center">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={clearMessages} className="text-red-400 hover:text-red-600" title="Close error">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex justify-between items-center">
            <p className="text-sm text-green-600">{success}</p>
            <button onClick={clearMessages} className="text-green-400 hover:text-green-600" title="Close success message">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {!connection ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Repository
            </label>
            <div className="flex space-x-2">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Select a repository"
              >
                <option value="">Choose a repository...</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.name}>
                    {repo.name} {repo.private ? '(Private)' : '(Public)'}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCreateRepo(!showCreateRepo)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                title="Create new repository"
                aria-label="Create new repository"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          {showCreateRepo && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-900">Create New Repository</h4>
              <div>
                <input
                  type="text"
                  placeholder="Repository name"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Repository name"
                />
              </div>
              <div>
                <textarea
                  placeholder="Description (optional)"
                  value={newRepoDescription}
                  onChange={(e) => setNewRepoDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  aria-label="Repository description"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="private-repo"
                  checked={newRepoPrivate}
                  onChange={(e) => setNewRepoPrivate(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="private-repo" className="text-sm text-gray-700">
                  Private repository
                </label>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateRepository}
                  disabled={!newRepoName || loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Create repository"
                  aria-label="Create repository"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowCreateRepo(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
                  title="Cancel"
                  aria-label="Cancel repository creation"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch
            </label>
            <input
              type="text"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="main"
              aria-label="Branch name"
            />
          </div>

          <button
            onClick={handleConnectToRepo}
            disabled={!selectedRepo || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Connect project to repository"
            aria-label="Connect project to repository"
          >
            {loading ? 'Connecting...' : 'Connect Project to Repository'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Connected Repository</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Repository:</strong> {connection.repositoryName}</p>
              <p><strong>Branch:</strong> {connection.branch}</p>
              <p><strong>URL:</strong> 
                <a 
                  href={connection.repositoryUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-1"
                >
                  {connection.repositoryUrl}
                </a>
              </p>
              <p><strong>Last Sync:</strong> {new Date(connection.lastSyncAt).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commit Message
            </label>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Update from VibeCoding"
              aria-label="Commit message"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handlePush}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Push changes to GitHub"
              aria-label="Push changes to GitHub"
            >
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                {loading ? 'Pushing...' : 'Push'}
              </div>
            </button>
            
            <button
              onClick={handlePull}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Pull changes from GitHub"
              aria-label="Pull changes from GitHub"
            >
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                {loading ? 'Pulling...' : 'Pull'}
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setConnection(null)}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
              title="Disconnect from repository"
              aria-label="Disconnect from repository"
            >
              Disconnect from Repository
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubIntegration;