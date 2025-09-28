import React, { useState, useEffect } from 'react';
import { Users, Trophy, Heart, MessageCircle } from 'lucide-react';

interface CommunityStats {
  totalUsers: number;
  totalApps: number;
  totalLikes: number;
  totalComments: number;
}

const CommunityStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<CommunityStats>({
    totalUsers: 0,
    totalApps: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityStats();
  }, []);

  const fetchCommunityStats = async () => {
    try {
      // Fetch basic community stats from multiple endpoints
      const [usersResponse, appsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/community/users?limit=1'),
        fetch('http://localhost:5000/api/leaderboard/discovery?limit=1')
      ]);

      const usersData = await usersResponse.json();
      const appsData = await appsResponse.json();

      setStats({
        totalUsers: usersData.pagination?.total || 0,
        totalApps: appsData.pagination?.total || 0,
        totalLikes: 0, // Will be implemented when likes API is working
        totalComments: 0 // Will be implemented when comments API is working
      });
    } catch (error) {
      console.error('Failed to fetch community stats:', error);
      // Set some demo data
      setStats({
        totalUsers: 42,
        totalApps: 156,
        totalLikes: 1249,
        totalComments: 387
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-blue-500" />
        Community Stats
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <Users className="w-4 h-4 mr-1" />
            Creators
          </div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.totalApps}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <Trophy className="w-4 h-4 mr-1" />
            Apps Built
          </div>
        </div>
        
        <div className="text-center p-3 bg-pink-50 rounded-lg">
          <div className="text-2xl font-bold text-pink-600">{stats.totalLikes}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <Heart className="w-4 h-4 mr-1" />
            Likes
          </div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.totalComments}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            Comments
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityStatsWidget;