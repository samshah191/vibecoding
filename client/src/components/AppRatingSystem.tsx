import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Flag, 
  Heart,
  Award,
  TrendingUp,
  Filter,
  ChevronDown,
  User,
  Calendar,
  Edit3,
  Trash2,
  Reply,
  MoreHorizontal
} from 'lucide-react';

interface Rating {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  review?: string;
  timestamp: string;
  helpful: number;
  notHelpful: number;
  userVote?: 'helpful' | 'not-helpful';
  isVerified: boolean;
  tags: string[];
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  distribution: { [key: number]: number };
  recentTrend: 'up' | 'down' | 'stable';
}

interface AppRatingSystemProps {
  appId: string;
  appTitle: string;
  currentUserRating?: Rating;
  onRatingSubmit?: (rating: Rating) => void;
  readOnly?: boolean;
}

const AppRatingSystem: React.FC<AppRatingSystemProps> = ({
  appId,
  appTitle,
  currentUserRating,
  onRatingSubmit,
  readOnly = false
}) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats>({
    averageRating: 0,
    totalRatings: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recentTrend: 'stable'
  });
  
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);

  const suggestedTags = [
    'Easy to use', 'Great design', 'Fast performance', 'Mobile friendly',
    'Feature rich', 'Intuitive', 'Well documented', 'Responsive',
    'Innovative', 'Professional', 'Beginner friendly', 'Advanced features'
  ];

  useEffect(() => {
    loadRatings();
    loadStats();
  }, [appId, sortBy, filterBy]);

  const loadRatings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const mockRatings: Rating[] = [
          {
            id: '1',
            userId: 'user1',
            userName: 'John Doe',
            userAvatar: '/api/placeholder/40/40',
            rating: 5,
            review: 'Amazing app! The interface is clean and intuitive. Everything works perfectly and the features are exactly what I needed.',
            timestamp: '2024-01-15T10:30:00Z',
            helpful: 12,
            notHelpful: 1,
            isVerified: true,
            tags: ['Easy to use', 'Great design', 'Feature rich']
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Jane Smith',
            userAvatar: '/api/placeholder/40/40',
            rating: 4,
            review: 'Really good app with solid functionality. A few minor issues but overall very satisfied.',
            timestamp: '2024-01-14T15:20:00Z',
            helpful: 8,
            notHelpful: 0,
            isVerified: false,
            tags: ['Fast performance', 'Mobile friendly']
          },
          {
            id: '3',
            userId: 'user3',
            userName: 'Mike Johnson',
            userAvatar: '/api/placeholder/40/40',
            rating: 5,
            review: 'Exceptional quality! This app exceeded my expectations in every way.',
            timestamp: '2024-01-13T09:15:00Z',
            helpful: 15,
            notHelpful: 2,
            isVerified: true,
            tags: ['Innovative', 'Professional']
          },
          {
            id: '4',
            userId: 'user4',
            userName: 'Sarah Wilson',
            rating: 3,
            review: 'Decent app but could use some improvements in the user interface.',
            timestamp: '2024-01-12T14:45:00Z',
            helpful: 5,
            notHelpful: 3,
            isVerified: false,
            tags: ['Needs improvement']
          }
        ];

        // Apply sorting
        const sorted = [...mockRatings].sort((a, b) => {
          switch (sortBy) {
            case 'helpful':
              return b.helpful - a.helpful;
            case 'rating':
              return b.rating - a.rating;
            case 'recent':
            default:
              return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          }
        });

        // Apply filtering
        const filtered = filterBy === 'all' 
          ? sorted 
          : sorted.filter(rating => rating.rating === parseInt(filterBy));

        setRatings(filtered);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load ratings:', error);
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        const mockStats: RatingStats = {
          averageRating: 4.3,
          totalRatings: 127,
          distribution: { 5: 65, 4: 32, 3: 18, 2: 8, 1: 4 },
          recentTrend: 'up'
        };
        setStats(mockStats);
      }, 500);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const submitRating = async () => {
    if (userRating === 0) return;
    
    setLoading(true);
    try {
      const newRating: Rating = {
        id: Date.now().toString(),
        userId: 'current-user',
        userName: 'Current User',
        userAvatar: '/api/placeholder/40/40',
        rating: userRating,
        review: userReview.trim() || undefined,
        timestamp: new Date().toISOString(),
        helpful: 0,
        notHelpful: 0,
        isVerified: true,
        tags: selectedTags
      };

      // Simulate API call
      setTimeout(() => {
        setRatings(prev => [newRating, ...prev]);
        setStats(prev => ({
          ...prev,
          totalRatings: prev.totalRatings + 1,
          averageRating: (prev.averageRating * prev.totalRatings + userRating) / (prev.totalRatings + 1),
          distribution: {
            ...prev.distribution,
            [userRating]: prev.distribution[userRating] + 1
          }
        }));
        
        if (onRatingSubmit) {
          onRatingSubmit(newRating);
        }
        
        setUserRating(0);
        setUserReview('');
        setSelectedTags([]);
        setShowReviewForm(false);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setLoading(false);
    }
  };

  const voteOnReview = async (reviewId: string, vote: 'helpful' | 'not-helpful') => {
    try {
      setRatings(prev => 
        prev.map(rating => {
          if (rating.id === reviewId) {
            const wasHelpful = rating.userVote === 'helpful';
            const wasNotHelpful = rating.userVote === 'not-helpful';
            
            let helpful = rating.helpful;
            let notHelpful = rating.notHelpful;
            
            // Remove previous vote
            if (wasHelpful) helpful--;
            if (wasNotHelpful) notHelpful--;
            
            // Add new vote if different
            const newVote = rating.userVote === vote ? undefined : vote;
            if (newVote === 'helpful') helpful++;
            if (newVote === 'not-helpful') notHelpful++;
            
            return {
              ...rating,
              helpful,
              notHelpful,
              userVote: newVote
            };
          }
          return rating;
        })
      );
    } catch (error) {
      console.error('Failed to vote on review:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const renderStars = (rating: number, interactive = false, size = 'w-5 h-5') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => interactive && setUserRating(star)}
            disabled={!interactive}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            className={`${size} transition-colors ${
              interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            } ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          >
            <Star className={size} />
          </button>
        ))}
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h3>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600">{stats.totalRatings} reviews</span>
          </div>
        </div>

        {/* Rating Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
              <div>
                <div className="text-4xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className={`w-5 h-5 ${
                  stats.recentTrend === 'up' ? 'text-green-500' : 
                  stats.recentTrend === 'down' ? 'text-red-500' : 'text-gray-400'
                }`} />
                <span className="text-sm text-gray-600">
                  {stats.recentTrend === 'up' ? 'Trending up' : 
                   stats.recentTrend === 'down' ? 'Trending down' : 'Stable'}
                </span>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.distribution[rating] || 0;
              const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Rating Form */}
      {!readOnly && !currentUserRating && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Rate this app</h4>
            {showReviewForm && (
              <button
                onClick={() => setShowReviewForm(false)}
                aria-label="Cancel writing review"
                title="Cancel writing review"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              {renderStars(userRating, true, 'w-8 h-8')}
            </div>

            {/* Review Form */}
            {(showReviewForm || userRating > 0) && (
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="review-text"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Write a Review (Optional)
                  </label>
                  <textarea
                    id="review-text"
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder="Share your experience with this app..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        aria-label={`${selectedTags.includes(tag) ? 'Remove' : 'Add'} tag: ${tag}`}
                        title={`${selectedTags.includes(tag) ? 'Remove' : 'Add'} tag: ${tag}`}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={submitRating}
                  disabled={userRating === 0 || loading}
                  aria-label={loading ? 'Submitting your rating...' : 'Submit your rating and review'}
                  title={loading ? 'Submitting your rating...' : 'Submit your rating and review'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            )}

            {!showReviewForm && userRating === 0 && (
              <button
                onClick={() => setShowReviewForm(true)}
                aria-label="Write a detailed review for this app"
                title="Write a detailed review for this app"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Write a detailed review
              </button>
            )}
          </div>
        </div>
      )}

      {/* Existing User Rating */}
      {currentUserRating && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-900">Your Review</h4>
              <button
                onClick={() => setEditingReview(currentUserRating.id)}
                aria-label="Edit your review"
                title="Edit your review"
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-4 mb-2">
              {renderStars(currentUserRating.rating)}
              <span className="text-sm text-gray-600">
                {new Date(currentUserRating.timestamp).toLocaleDateString()}
              </span>
            </div>
            {currentUserRating.review && (
              <p className="text-gray-700">{currentUserRating.review}</p>
            )}
            {currentUserRating.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {currentUserRating.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="border-t border-gray-200 pt-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                aria-label="Filter reviews by rating"
                title="Filter reviews by rating"
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort reviews by"
              title="Sort reviews by"
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most recent</option>
              <option value="helpful">Most helpful</option>
              <option value="rating">Highest rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to review this app!</p>
          </div>
        ) : (
          ratings.map(rating => (
            <div key={rating.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <img
                  src={rating.userAvatar || '/api/placeholder/40/40'}
                  alt={rating.userName}
                  className="w-10 h-10 rounded-full"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h5 className="font-medium text-gray-900">{rating.userName}</h5>
                      {rating.isVerified && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(rating.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    {renderStars(rating.rating)}
                    <span className={`text-sm font-medium ${getRatingColor(rating.rating)}`}>
                      {rating.rating}/5
                    </span>
                  </div>

                  {rating.review && (
                    <p className="text-gray-700 mb-3">{rating.review}</p>
                  )}

                  {rating.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {rating.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => voteOnReview(rating.id, 'helpful')}
                        aria-label={`Mark review as helpful (${rating.helpful} people found this helpful)`}
                        title={`Mark review as helpful (${rating.helpful} people found this helpful)`}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                          rating.userVote === 'helpful'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{rating.helpful}</span>
                      </button>
                      
                      <button
                        onClick={() => voteOnReview(rating.id, 'not-helpful')}
                        aria-label={`Mark review as not helpful (${rating.notHelpful} people marked this as not helpful)`}
                        title={`Mark review as not helpful (${rating.notHelpful} people marked this as not helpful)`}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                          rating.userVote === 'not-helpful'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>{rating.notHelpful}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        aria-label="Reply to review"
                        title="Reply to review"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        aria-label="Report review"
                        title="Report review"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {ratings.length > 0 && !loading && (
        <div className="text-center pt-6">
          <button 
            aria-label="Load more reviews"
            title="Load more reviews"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default AppRatingSystem;