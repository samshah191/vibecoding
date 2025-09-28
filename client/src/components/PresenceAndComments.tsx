import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  X,
  User,
  Users,
  Hash,
  AtSign,
  Paperclip,
  Smile,
  MoreHorizontal,
  ThumbsUp,
  Reply,
  Edit,
  Trash2
} from 'lucide-react';

interface UserPresence {
  id: string;
  name: string;
  color: string;
  cursorPosition: { x: number; y: number };
  lastActive: Date;
  isOnline: boolean;
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatarColor: string;
  };
  content: string;
  timestamp: Date;
  replies: Reply[];
  resolved: boolean;
  file?: string;
  line?: number;
}

interface Reply {
  id: string;
  author: {
    id: string;
    name: string;
    avatarColor: string;
  };
  content: string;
  timestamp: Date;
}

const PresenceAndComments: React.FC = () => {
  const [users, setUsers] = useState<UserPresence[]>([
    {
      id: '1',
      name: 'You',
      color: '#3b82f6',
      cursorPosition: { x: 120, y: 240 },
      lastActive: new Date(),
      isOnline: true
    },
    {
      id: '2',
      name: 'Alex Johnson',
      color: '#10b981',
      cursorPosition: { x: 320, y: 180 },
      lastActive: new Date(Date.now() - 30000),
      isOnline: true
    },
    {
      id: '3',
      name: 'Sam Wilson',
      color: '#8b5cf6',
      cursorPosition: { x: 480, y: 320 },
      lastActive: new Date(Date.now() - 120000),
      isOnline: true
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      author: {
        id: '2',
        name: 'Alex Johnson',
        avatarColor: '#10b981'
      },
      content: 'This component could use some additional styling for mobile views. What do you think?',
      timestamp: new Date(Date.now() - 3600000),
      replies: [
        {
          id: 'r1',
          author: {
            id: '1',
            name: 'You',
            avatarColor: '#3b82f6'
          },
          content: 'Good point! I\'ll add responsive classes.',
          timestamp: new Date(Date.now() - 1800000)
        }
      ],
      resolved: false,
      file: 'src/components/Header.tsx',
      line: 24
    },
    {
      id: 'c2',
      author: {
        id: '3',
        name: 'Sam Wilson',
        avatarColor: '#8b5cf6'
      },
      content: 'Should we consider using a more accessible color palette here?',
      timestamp: new Date(Date.now() - 7200000),
      replies: [],
      resolved: false,
      file: 'src/styles/theme.css',
      line: 15
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Filter comments based on resolved status
  const filteredComments = showResolved 
    ? comments 
    : comments.filter(comment => !comment.resolved);

  // Scroll to bottom of comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const newCommentObj: Comment = {
      id: `c${Date.now()}`,
      author: {
        id: '1',
        name: 'You',
        avatarColor: '#3b82f6'
      },
      content: newComment,
      timestamp: new Date(),
      replies: [],
      resolved: false
    };
    
    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  const handleAddReply = (commentId: string) => {
    if (!replyContent.trim()) return;
    
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: `r${Date.now()}`,
              author: {
                id: '1',
                name: 'You',
                avatarColor: '#3b82f6'
              },
              content: replyContent,
              timestamp: new Date()
            }
          ]
        };
      }
      return comment;
    }));
    
    setReplyContent('');
    setActiveComment(null);
  };

  const toggleCommentResolved = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, resolved: !comment.resolved } 
        : comment
    ));
  };

  const handleMentionSelect = (user: UserPresence) => {
    setNewComment(prev => prev + `@${user.name} `);
    setMentionQuery('');
    setShowMentions(false);
  };

  // Simulate cursor movement
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prev => prev.map(user => {
        if (user.id === '1') { // Only move current user's cursor for demo
          return {
            ...user,
            cursorPosition: {
              x: Math.max(50, Math.min(600, user.cursorPosition.x + (Math.random() * 20 - 10))),
              y: Math.max(50, Math.min(400, user.cursorPosition.y + (Math.random() * 20 - 10)))
            },
            lastActive: new Date()
          };
        }
        return user;
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full bg-white border-l border-gray-200">
      {/* Presence Indicators */}
      <div className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4">
        <div className="mb-4" title="Online users">
          <Users className="w-5 h-5 text-gray-600" />
        </div>
        
        <div className="space-y-3">
          {users.filter(user => user.isOnline).map(user => (
            <div 
              key={user.id}
              className="relative"
              title={`${user.name} - ${user.lastActive.toLocaleTimeString()}`}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0)}
              </div>
              {user.id === '1' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Comments Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {filteredComments.length}
              </span>
            </div>
            <button 
              onClick={() => setShowResolved(!showResolved)}
              className={`text-xs px-2 py-1 rounded ${showResolved ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              title={showResolved ? "Hide resolved comments" : "Show all comments"}
            >
              {showResolved ? 'Hide Resolved' : 'Show All'}
            </button>
          </div>
        </div>
        
        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to add a comment</p>
            </div>
          ) : (
            filteredComments.map(comment => (
              <div 
                key={comment.id}
                className={`border rounded-lg p-3 ${comment.resolved ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-start">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2"
                    style={{ backgroundColor: comment.author.avatarColor }}
                  >
                    {comment.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        {comment.file && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {comment.file}:{comment.line}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => toggleCommentResolved(comment.id)}
                          className={`text-xs px-2 py-0.5 rounded ${comment.resolved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                          title={comment.resolved ? "Mark as unresolved" : "Mark as resolved"}
                        >
                          {comment.resolved ? 'Resolved' : 'Resolve'}
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                          title="More options"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <span>{comment.timestamp.toLocaleString()}</span>
                    </div>
                    
                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="flex items-start mt-2 pl-4 border-l-2 border-gray-100">
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium mr-2"
                              style={{ backgroundColor: reply.author.avatarColor }}
                            >
                              {reply.author.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-xs">{reply.author.name}</span>
                              </div>
                              <p className="text-xs text-gray-700 mt-1">{reply.content}</p>
                              <div className="flex items-center text-[10px] text-gray-500 mt-1">
                                <span>{reply.timestamp.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reply Form */}
                    {activeComment === comment.id ? (
                      <div className="mt-3 flex space-x-2">
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddReply(comment.id)}
                        />
                        <button
                          onClick={() => handleAddReply(comment.id)}
                          className="px-2 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                          title="Send reply"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setActiveComment(null)}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                          title="Cancel reply"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => setActiveComment(comment.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                          title="Reply to this comment"
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          Reply
                        </button>
                        <button 
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                          title="Like this comment"
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Like
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          <div ref={commentsEndRef} />
        </div>
        
        {/* New Comment Form */}
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
              rows={3}
            />
            
            {/* Mentions Dropdown */}
            {showMentions && mentionQuery && (
              <div className="absolute bottom-full mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {users.filter(user => 
                  user.name.toLowerCase().includes(mentionQuery.toLowerCase()) && user.id !== '1'
                ).map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleMentionSelect(user)}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100"
                  >
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm">{user.name}</span>
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <button 
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button 
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                  title="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button 
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 relative"
                  onClick={() => setShowMentions(true)}
                  title="Mention user"
                >
                  <AtSign className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className={`px-3 py-1.5 text-sm rounded flex items-center ${
                  newComment.trim()
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title="Add comment"
              >
                <Send className="w-3 h-3 mr-1" />
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresenceAndComments;