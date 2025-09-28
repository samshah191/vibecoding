import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  User, 
  Calendar,
  Search,
  Download,
  Upload,
  Tag,
  Eye,
  EyeOff
} from 'lucide-react';

export interface CodeComment {
  id: string;
  lineNumber?: number;
  filePath: string;
  content: string;
  author: string;
  timestamp: Date;
  type: 'comment' | 'todo' | 'fixme' | 'note' | 'documentation';
  tags: string[];
  resolved: boolean;
}

export interface Documentation {
  id: string;
  title: string;
  content: string;
  type: 'api' | 'component' | 'guide' | 'readme' | 'changelog';
  author: string;
  lastModified: Date;
  tags: string[];
  version: string;
}

interface CodeDocumentationProps {
  comments: CodeComment[];
  documentation: Documentation[];
  currentFile?: string;
  onAddComment: (comment: Omit<CodeComment, 'id' | 'timestamp'>) => void;
  onUpdateComment: (id: string, comment: Partial<CodeComment>) => void;
  onDeleteComment: (id: string) => void;
  onAddDocumentation: (doc: Omit<Documentation, 'id' | 'lastModified'>) => void;
  onUpdateDocumentation: (id: string, doc: Partial<Documentation>) => void;
  onDeleteDocumentation: (id: string) => void;
  onExportDocumentation: () => void;
  onImportDocumentation: (file: File) => void;
}

export const CodeDocumentation: React.FC<CodeDocumentationProps> = ({
  comments,
  documentation,
  currentFile,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddDocumentation,
  onUpdateDocumentation,
  onDeleteDocumentation,
  onExportDocumentation,
  onImportDocumentation
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'documentation'>('comments');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);
  
  const [newComment, setNewComment] = useState<Partial<CodeComment>>({
    content: '',
    type: 'comment',
    tags: [],
    resolved: false,
    author: 'Current User',
    filePath: currentFile || ''
  });

  const [newDoc, setNewDoc] = useState<Partial<Documentation>>({
    title: '',
    content: '',
    type: 'guide',
    tags: [],
    author: 'Current User',
    version: '1.0.0'
  });

  const [newTag, setNewTag] = useState('');

  const filteredComments = comments.filter(comment => {
    const matchesFile = !currentFile || comment.filePath === currentFile;
    const matchesSearch = !searchTerm || 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || comment.type === filterType;
    const matchesResolved = showResolved || !comment.resolved;
    
    return matchesFile && matchesSearch && matchesType && matchesResolved;
  });

  const filteredDocumentation = documentation.filter(doc => {
    const matchesSearch = !searchTerm ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleAddComment = useCallback(() => {
    if (newComment.content?.trim()) {
      onAddComment(newComment as Omit<CodeComment, 'id' | 'timestamp'>);
      setNewComment({
        content: '',
        type: 'comment',
        tags: [],
        resolved: false,
        author: 'Current User',
        filePath: currentFile || ''
      });
      setShowAddForm(false);
    }
  }, [newComment, onAddComment, currentFile]);

  const handleAddDocumentation = useCallback(() => {
    if (newDoc.title?.trim() && newDoc.content?.trim()) {
      onAddDocumentation(newDoc as Omit<Documentation, 'id' | 'lastModified'>);
      setNewDoc({
        title: '',
        content: '',
        type: 'guide',
        tags: [],
        author: 'Current User',
        version: '1.0.0'
      });
      setShowAddForm(false);
    }
  }, [newDoc, onAddDocumentation]);

  const handleAddTag = useCallback((isComment: boolean) => {
    if (newTag.trim()) {
      if (isComment) {
        setNewComment(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag.trim()]
        }));
      } else {
        setNewDoc(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag.trim()]
        }));
      }
      setNewTag('');
    }
  }, [newTag]);

  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportDocumentation(file);
    }
  }, [onImportDocumentation]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'todo': return 'text-blue-600 bg-blue-50';
      case 'fixme': return 'text-red-600 bg-red-50';
      case 'note': return 'text-green-600 bg-green-50';
      case 'documentation': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Code Documentation & Comments
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onExportDocumentation}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title="Export Documentation"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <label className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer" title="Import Documentation">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json,.md,.txt"
                onChange={handleFileImport}
                className="hidden"
                aria-label="Import documentation file"
              />
            </label>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === 'comments' ? 'Comment' : 'Doc'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Comments ({filteredComments.length})
          </button>
          <button
            onClick={() => setActiveTab('documentation')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'documentation'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Documentation ({filteredDocumentation.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            {activeTab === 'comments' ? (
              <>
                <option value="comment">Comments</option>
                <option value="todo">TODO</option>
                <option value="fixme">FIXME</option>
                <option value="note">Notes</option>
              </>
            ) : (
              <>
                <option value="api">API</option>
                <option value="component">Component</option>
                <option value="guide">Guide</option>
                <option value="readme">README</option>
              </>
            )}
          </select>
          
          {activeTab === 'comments' && (
            <button
              onClick={() => setShowResolved(!showResolved)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                showResolved
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {showResolved ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showResolved ? 'Hide' : 'Show'} Resolved
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'comments' ? (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={`border rounded-lg p-4 ${
                  comment.resolved 
                    ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600 opacity-75' 
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getTypeColor(comment.type)}`}>
                      {comment.type}
                    </span>
                    {comment.lineNumber && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Line {comment.lineNumber}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateComment(comment.id, { resolved: !comment.resolved })}
                      className={`text-xs px-2 py-1 rounded ${
                        comment.resolved
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}
                    >
                      {comment.resolved ? 'Resolved' : 'Open'}
                    </button>
                    
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-900 dark:text-white mb-3">{comment.content}</p>
                
                {comment.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {comment.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {comment.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(comment.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {filteredComments.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No comments found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Add comments to start documenting your code.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocumentation.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {doc.title}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded dark:bg-blue-900 dark:text-blue-300">
                      {doc.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteDocumentation(doc.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete documentation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-gray-900 dark:text-white mb-4 whitespace-pre-wrap">
                  {doc.content.substring(0, 200)}
                  {doc.content.length > 200 && '...'}
                </div>
                
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {doc.author}
                  </span>
                  <span>v{doc.version}</span>
                </div>
              </div>
            ))}
            
            {filteredDocumentation.length === 0 && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No documentation found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Add documentation to help others understand your code.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Add {activeTab === 'comments' ? 'Comment' : 'Documentation'}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Close form"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {activeTab === 'comments' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comment Type
                    </label>
                    <select
                      value={newComment.type || 'comment'}
                      onChange={(e) => setNewComment(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      aria-label="Comment type"
                    >
                      <option value="comment">Comment</option>
                      <option value="todo">TODO</option>
                      <option value="fixme">FIXME</option>
                      <option value="note">Note</option>
                      <option value="documentation">Documentation</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Line Number
                      </label>
                      <input
                        type="number"
                        value={newComment.lineNumber || ''}
                        onChange={(e) => setNewComment(prev => ({ 
                          ...prev, 
                          lineNumber: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="42"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        File Path
                      </label>
                      <input
                        type="text"
                        value={newComment.filePath || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, filePath: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="src/components/Component.tsx"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comment Content
                    </label>
                    <textarea
                      value={newComment.content || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter your comment here..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newDoc.title || ''}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Documentation Title"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        value={newDoc.type || 'guide'}
                        onChange={(e) => setNewDoc(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        aria-label="Documentation type"
                      >
                        <option value="api">API</option>
                        <option value="component">Component</option>
                        <option value="guide">Guide</option>
                        <option value="readme">README</option>
                        <option value="changelog">Changelog</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Version
                      </label>
                      <input
                        type="text"
                        value={newDoc.version || ''}
                        onChange={(e) => setNewDoc(prev => ({ ...prev, version: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="1.0.0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    <textarea
                      value={newDoc.content || ''}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter documentation content..."
                    />
                  </div>
                </>
              )}
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(activeTab === 'comments' ? newComment.tags : newDoc.tags)?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {tag}
                      <button
                        onClick={() => {
                          if (activeTab === 'comments') {
                            setNewComment(prev => ({
                              ...prev,
                              tags: prev.tags?.filter(t => t !== tag) || []
                            }));
                          } else {
                            setNewDoc(prev => ({
                              ...prev,
                              tags: prev.tags?.filter(t => t !== tag) || []
                            }));
                          }
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(activeTab === 'comments');
                      }
                    }}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    onClick={() => handleAddTag(activeTab === 'comments')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={activeTab === 'comments' ? handleAddComment : handleAddDocumentation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add {activeTab === 'comments' ? 'Comment' : 'Documentation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeDocumentation;