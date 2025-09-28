import React, { useState, useEffect } from 'react';
import { UserProfile, App, Badge, CommunityStats } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserProfileComponentProps {
  userId: string;
  onClose?: () => void;
}

const UserProfileComponent: React.FC<UserProfileComponentProps> = ({ userId, onClose }) => {
  const { user: currentUser, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'apps' | 'badges' | 'stats'>('apps');

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/community/users/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.user);
      } else {
        toast.error(data.message || 'Failed to load user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/leaderboard/users/${userId}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <h2 className="text-xl font-bold mb-4">User Not Found</h2>
          <p className="text-gray-600 mb-4">This user profile could not be found or is private.</p>
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                {profile.name?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.name || 'Anonymous User'}</h1>
                <p className="text-blue-100">{profile.email}</p>
                <p className="text-blue-100 text-sm mt-1">
                  Member since {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30"
            >
              ✕
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.apps?.length || 0}</div>
              <div className="text-blue-100 text-sm">Apps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-blue-100 text-sm">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-blue-100 text-sm">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-blue-100 text-sm">Following</div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="p-6">
          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('apps')}
              className={`pb-2 px-1 font-medium ${
                activeTab === 'apps'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Apps ({profile.apps?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-2 px-1 font-medium ${
                activeTab === 'stats'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Statistics
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'apps' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.apps && profile.apps.length > 0 ? (
                profile.apps.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">{app.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{app.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{formatDate(app.createdAt)}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        app.status === 'deployed' ? 'bg-green-100 text-green-800' :
                        app.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No apps created yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">Member Since</h3>
                <p className="text-2xl font-bold text-blue-600">{formatDate(stats.memberSince)}</p>
                <p className="text-gray-600 text-sm mt-1">Join Rank: #{stats.joinRank}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">Achievements</h3>
                <div className="space-y-2">
                  <div className={`flex items-center space-x-2 ${stats.achievements.firstApp ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{stats.achievements.firstApp ? '✅' : '⭕'}</span>
                    <span>First App Created</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${stats.achievements.prolificCreator ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{stats.achievements.prolificCreator ? '✅' : '⭕'}</span>
                    <span>Prolific Creator (10+ apps)</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${stats.achievements.appMaster ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{stats.achievements.appMaster ? '✅' : '⭕'}</span>
                    <span>App Master (50+ apps)</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${stats.achievements.earlyAdopter ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{stats.achievements.earlyAdopter ? '✅' : '⭕'}</span>
                    <span>Early Adopter (Top 100)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileComponent;