import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit, 
  Eye, 
  Download, 
  Upload,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { projectService, ProjectVersion } from '../services/collaborationService';

interface ProjectBriefProps {
  projectId: string;
  projectName: string;
  onBriefUpdate?: (brief: string) => void;
}

interface BriefVersion extends ProjectVersion {
  briefContent: string;
}

const ProjectBrief: React.FC<ProjectBriefProps> = ({ projectId, projectName, onBriefUpdate }) => {
  const [briefContent, setBriefContent] = useState('');
  const [versions, setVersions] = useState<BriefVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<BriefVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [showVersionForm, setShowVersionForm] = useState(false);

  useEffect(() => {
    fetchBriefVersions();
  }, [projectId]);

  const fetchBriefVersions = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectVersions(projectId);
      
      if (response.success) {
        const briefVersions = response.data.map((version: ProjectVersion) => ({
          ...version,
          briefContent: version.appData // In a real implementation, this would be parsed from appData
        })) as BriefVersion[];
        
        setVersions(briefVersions);
        
        // Set the latest version as current
        if (briefVersions.length > 0) {
          const latest = briefVersions[0];
          setCurrentVersion(latest);
          setBriefContent(latest.briefContent);
        }
      } else {
        setError(response.error || 'Failed to fetch brief versions');
      }
    } catch (err) {
      setError('Failed to fetch brief versions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBrief = async () => {
    if (!briefContent.trim()) {
      setError('Brief content cannot be empty');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // If we're editing an existing version, update it
      if (currentVersion) {
        // In a real implementation, we would update the version
        // For now, we'll just simulate the save
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local state
        const updatedVersions = versions.map(version => 
          version.id === currentVersion.id 
            ? { ...version, briefContent } 
            : version
        );
        
        setVersions(updatedVersions);
        setCurrentVersion({ ...currentVersion, briefContent });
      } else {
        // Create a new version
        await handleCreateVersion();
      }
      
      onBriefUpdate?.(briefContent);
    } catch (err) {
      setError('Failed to save brief');
      console.error(err);
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!briefContent.trim()) {
      setError('Brief content cannot be empty');
      return;
    }

    if (!newVersionName.trim()) {
      setError('Version name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const response = await projectService.createProjectVersion(projectId, {
        name: newVersionName,
        description: `Brief version: ${newVersionName}`,
        appData: briefContent // In a real implementation, this would be properly structured
      });
      
      if (response.success) {
        // Refresh versions
        await fetchBriefVersions();
        setShowVersionForm(false);
        setNewVersionName('');
      } else {
        setError(response.error || 'Failed to create version');
      }
    } catch (err) {
      setError('Failed to create version');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleVersionSelect = (version: BriefVersion) => {
    setCurrentVersion(version);
    setBriefContent(version.briefContent);
    setIsEditing(false);
  };

  const handleNewVersion = () => {
    setCurrentVersion(null);
    setBriefContent('');
    setIsEditing(true);
    setShowVersionForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Project Brief</h2>
            <span className="ml-3 text-sm text-gray-500">for {projectName}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    if (currentVersion) {
                      setBriefContent(currentVersion.briefContent);
                    } else {
                      setBriefContent('');
                    }
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBrief}
                  disabled={saving}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={handleNewVersion}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Version
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Version History Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <History className="w-4 h-4 mr-2" />
              Version History
            </h3>
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {versions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No versions yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {versions.map((version) => (
                  <li 
                    key={version.id}
                    className={`p-3 cursor-pointer hover:bg-gray-100 ${
                      currentVersion?.id === version.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleVersionSelect(version)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {version.name || `Version ${version.version}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {currentVersion?.id === version.id && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {showVersionForm ? (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Version</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="versionName" className="block text-sm font-medium text-gray-700 mb-1">
                    Version Name
                  </label>
                  <input
                    type="text"
                    id="versionName"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter version name"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setShowVersionForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCreateVersion}
                      disabled={saving || !newVersionName.trim() || !briefContent.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {saving ? 'Creating...' : 'Create Version'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {currentVersion ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {currentVersion.name || `Version ${currentVersion.version}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created on {new Date(currentVersion.createdAt).toLocaleDateString()} at{' '}
                        {new Date(currentVersion.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        v{currentVersion.version}
                      </span>
                    </div>
                  </div>
                  
                  {isEditing ? (
                    <textarea
                      value={briefContent}
                      onChange={(e) => setBriefContent(e.target.value)}
                      className="w-full h-96 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="Enter your project brief here..."
                    />
                  ) : (
                    <div className="prose max-w-none bg-gray-50 p-4 rounded-md min-h-96">
                      {briefContent ? (
                        <div className="whitespace-pre-wrap">{briefContent}</div>
                      ) : (
                        <div className="text-gray-500 italic">
                          No brief content available for this version.
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No version selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a version from the sidebar or create a new one.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectBrief;