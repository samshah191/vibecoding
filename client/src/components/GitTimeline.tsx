import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  Plus,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Circle,
  CheckCircle,
  AlertCircle,
  FileDiff,
  Code,
  Database,
  Settings,
  Package
} from 'lucide-react';

interface Commit {
  id: string;
  message: string;
  author: string;
  date: Date;
  branch: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  status: 'success' | 'pending' | 'failed';
}

interface Branch {
  id: string;
  name: string;
  commits: Commit[];
  isActive: boolean;
}

const GitTimeline: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: 'main',
      name: 'main',
      isActive: true,
      commits: [
        {
          id: 'c1',
          message: 'Initial commit',
          author: 'You',
          date: new Date(Date.now() - 3600000),
          branch: 'main',
          filesChanged: 12,
          additions: 245,
          deletions: 0,
          status: 'success'
        },
        {
          id: 'c2',
          message: 'Add authentication system',
          author: 'You',
          date: new Date(Date.now() - 7200000),
          branch: 'main',
          filesChanged: 8,
          additions: 187,
          deletions: 12,
          status: 'success'
        }
      ]
    },
    {
      id: 'feature-1',
      name: 'feature/user-profile',
      isActive: false,
      commits: [
        {
          id: 'f1',
          message: 'Add user profile page',
          author: 'You',
          date: new Date(Date.now() - 1800000),
          branch: 'feature/user-profile',
          filesChanged: 5,
          additions: 124,
          deletions: 3,
          status: 'success'
        },
        {
          id: 'f2',
          message: 'Implement avatar upload',
          author: 'You',
          date: new Date(Date.now() - 3600000),
          branch: 'feature/user-profile',
          filesChanged: 3,
          additions: 67,
          deletions: 2,
          status: 'success'
        }
      ]
    }
  ]);

  const [activeBranch, setActiveBranch] = useState('main');
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());
  const [newBranchName, setNewBranchName] = useState('');

  const toggleCommitDetails = (commitId: string) => {
    const newExpanded = new Set(expandedCommits);
    if (newExpanded.has(commitId)) {
      newExpanded.delete(commitId);
    } else {
      newExpanded.add(commitId);
    }
    setExpandedCommits(newExpanded);
  };

  const createNewBranch = () => {
    if (!newBranchName.trim()) return;
    
    const newBranch: Branch = {
      id: newBranchName.toLowerCase().replace(/\s+/g, '-'),
      name: newBranchName,
      isActive: false,
      commits: []
    };
    
    setBranches([...branches, newBranch]);
    setNewBranchName('');
  };

  const getCommitIcon = (status: Commit['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Circle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'ts':
      case 'tsx':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <Settings className="w-4 h-4 text-green-500" />;
      case 'md':
        return <FileDiff className="w-4 h-4 text-gray-500" />;
      case 'sql':
        return <Database className="w-4 h-4 text-purple-500" />;
      case 'package':
        return <Package className="w-4 h-4 text-orange-500" />;
      default:
        return <FileDiff className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Git Timeline</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="New branch name"
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && createNewBranch()}
            />
            <button
              onClick={createNewBranch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Create branch"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button 
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Branch Tabs */}
      <div className="flex border-b border-gray-200">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => setActiveBranch(branch.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeBranch === branch.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <GitBranch className="w-3 h-3" />
              <span>{branch.name}</span>
              {branch.isActive && (
                <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">
                  Active
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="p-4">
        {branches
          .find((branch) => branch.id === activeBranch)
          ?.commits.map((commit) => (
            <div key={commit.id} className="mb-4 last:mb-0">
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {getCommitIcon(commit.status)}
                  </div>
                  <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                </div>
                
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{commit.message}</h4>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                        <span>{commit.author}</span>
                        <span>{commit.date.toLocaleString()}</span>
                        <span>{commit.filesChanged} files changed</span>
                        <span className="text-green-600">+{commit.additions}</span>
                        <span className="text-red-600">-{commit.deletions}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCommitDetails(commit.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                      title="View details"
                    >
                      {expandedCommits.has(commit.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Commit Details */}
                  {expandedCommits.has(commit.id) && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                      <div className="text-sm font-medium text-gray-900 mb-2">Files Changed</div>
                      <div className="space-y-2">
                        {[
                          'src/components/UserProfile.tsx',
                          'src/pages/ProfilePage.tsx',
                          'src/styles/profile.css'
                        ].map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center space-x-2">
                              {getFileIcon(file)}
                              <span className="text-sm">{file}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className="text-green-600">+12</span>
                              <span className="text-red-600">-3</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                            View Diff
                          </button>
                          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                            Rollback
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Commit ID: {commit.id.substring(0, 7)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No commits on this branch</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default GitTimeline;