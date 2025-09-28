import React, { useState, useEffect } from 'react';
import { User, App, LeaderboardEntry } from '../types';
import UserProfileComponent from './UserProfile';
import toast from 'react-hot-toast';

const CommunityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discover' | 'creators' | 'apps'>('discover');
  const [discoveryApps, setDiscoveryApps] = useState<App[]>([]);
  const [creatorLeaderboard, setCreatorLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [appLeaderboard, setAppLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    fetchCommunityData();
  }, [activeTab, sortBy]);

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'discover') {
        await fetchDiscoveryFeed();
      } else if (activeTab === 'creators') {
        await fetchCreatorLeaderboard();
        await fetchUsers();
      } else if (activeTab === 'apps') {
        await fetchAppLeaderboard();
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
      toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscoveryFeed = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/leaderboard/discovery?sortBy=${sortBy}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setDiscoveryApps(data.apps);
      }
    } catch (error) {
      console.error('Error fetching discovery feed:', error);
    }
  };

  const fetchCreatorLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leaderboard/creators?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setCreatorLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching creator leaderboard:', error);
    }
  };

  const fetchAppLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leaderboard/apps?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setAppLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching app leaderboard:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/community/users?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-gray-600">Discover amazing apps and connect with creators</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'discover'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🌟 Discover
          </button>
          <button
            onClick={() => setActiveTab('creators')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'creators'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Creators
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'apps'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🚀 Top Apps
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
            {/* Discover Tab */}
            {activeTab === 'discover' && (
              <div>
                {/* Sort Options */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Latest Apps</h2>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Sort apps by"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>

                {/* Apps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discoveryApps.length > 0 ? (
                    discoveryApps.map((app) => (
                      <div key={app.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-semibold text-lg text-gray-900">{app.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            app.status === 'deployed' ? 'bg-green-100 text-green-800' :
                            app.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{app.description}</p>
                        
                        {app.user && (
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {app.user.name?.charAt(0).toUpperCase() || app.user.email.charAt(0).toUpperCase()}
                            </div>
                            <button
                              onClick={() => setSelectedUser(app.user!.id)}
                              className="text-sm text-gray-700 hover:text-blue-600 font-medium"
                            >
                              {app.user.name || 'Anonymous'}
                            </button>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{formatDate(app.createdAt)}</span>
                          <div className="flex items-center space-x-3">
                            <span>❤️ {app.totalLikes || 0}</span>
                            <span>💬 {app.totalComments || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No apps found. Be the first to create one!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Creators Tab */}
            {activeTab === 'creators' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Leaderboard */}
                <div>
                  <h2 className="text-xl font-semibold mb-6">🏆 Top Creators</h2>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {creatorLeaderboard.length > 0 ? (
                      creatorLeaderboard.map((entry) => (
                        <div key={entry.user?.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getRankEmoji(entry.rank)}</span>
                            <span className="font-bold text-gray-500 w-8">#{entry.rank}</span>
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                              {entry.user?.name?.charAt(0).toUpperCase() || entry.user?.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <button
                                onClick={() => entry.user && setSelectedUser(entry.user.id)}
                                className="font-medium text-gray-900 hover:text-blue-600"
                              >
                                {entry.user?.name || 'Anonymous'}
                              </button>
                              <p className="text-sm text-gray-500">{entry.appCount} apps</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-blue-600">{entry.score}</div>
                            <div className="text-xs text-gray-500">points</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No creators found yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* All Users */}
                <div>
                  <h2 className="text-xl font-semibold mb-6">👥 Community Members</h2>
                  <div className="space-y-3">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <button
                                  onClick={() => setSelectedUser(user.id)}
                                  className="font-medium text-gray-900 hover:text-blue-600"
                                >
                                  {user.name || 'Anonymous'}
                                </button>
                                <p className="text-sm text-gray-500">Joined {formatDate(user.createdAt)}</p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {(user as any).apps?.length || 0} apps
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No users found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Top Apps Tab */}
            {activeTab === 'apps' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">🚀 Most Popular Apps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {appLeaderboard.length > 0 ? (
                    appLeaderboard.map((entry) => (
                      <div key={entry.app?.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl">{getRankEmoji(entry.rank)}</span>
                          <span className="font-bold text-gray-500">#{entry.rank}</span>
                        </div>
                        
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{entry.app?.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{entry.app?.description}</p>
                        
                        {entry.app?.user && (
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {entry.app.user.name?.charAt(0).toUpperCase() || entry.app.user.email.charAt(0).toUpperCase()}
                            </div>
                            <button
                              onClick={() => entry.app?.user && setSelectedUser(entry.app.user.id)}
                              className="text-sm text-gray-700 hover:text-blue-600 font-medium"
                            >
                              {entry.app.user.name || 'Anonymous'}
                            </button>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{entry.app && formatDate(entry.app.createdAt)}</span>
                          <div className="font-semibold text-blue-600">{entry.score} pts</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No apps in leaderboard yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Modal */}
        {selectedUser && (
          <UserProfileComponent
            userId={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </div>
    </div>
  );
};

export default CommunityDashboard;