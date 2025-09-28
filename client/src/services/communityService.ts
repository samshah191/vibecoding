import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export interface CommunityUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  totalApps: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  isFollowing?: boolean;
  badges?: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface AppWithStats {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  isPublic: boolean;
  views: number;
  totalLikes: number;
  totalComments: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  user: CommunityUser;
  score: number;
  category: 'apps' | 'likes' | 'followers' | 'engagement';
}

class CommunityService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private currentUser: any = null;

  constructor() {
    this.initAuth();
  }

  private async initAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      this.currentUser = session.user;
    }

    supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
    });
  }

  // Real-time subscriptions
  subscribeToAppLikes(appId: string) {
    const channelName = `app-likes:${appId}`;
    
    if (this.channels.has(channelName)) {
      return;
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'likes',
        filter: `app_id=eq.${appId}`,
      }, (payload) => {
        this.handleLikeChange(payload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
  }

  subscribeToComments(appId: string) {
    const channelName = `app-comments:${appId}`;
    
    if (this.channels.has(channelName)) {
      return;
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `app_id=eq.${appId}`,
      }, (payload) => {
        this.handleCommentChange(payload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
  }

  subscribeToUserFollows(userId: string) {
    const channelName = `user-follows:${userId}`;
    
    if (this.channels.has(channelName)) {
      return;
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'follows',
        filter: `following_id=eq.${userId}`,
      }, (payload) => {
        this.handleFollowChange(payload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
  }

  subscribeToFeaturedApps() {
    const channelName = 'featured-apps';
    
    if (this.channels.has(channelName)) {
      return;
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'apps',
        filter: 'is_public=eq.true',
      }, (payload) => {
        this.handleFeaturedAppChange(payload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
  }

  // User management
  async getUserProfile(userId: string): Promise<CommunityUser | null> {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select(`
          *,
          user_badges(
            badges(
              id,
              name,
              description,
              icon
            ),
            earned_at
          )
        `)
        .eq('id', userId)
        .eq('is_public', true)
        .single();

      if (error || !profile) {
        return null;
      }

      const badges = profile.user_badges?.map((ub: any) => ({
        ...ub.badges,
        earnedAt: ub.earned_at,
      })) || [];

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        bio: profile.bio,
        website: profile.website,
        location: profile.location,
        totalApps: profile.total_apps,
        totalLikes: profile.total_likes,
        totalFollowers: profile.total_followers,
        totalFollowing: profile.total_following,
        badges,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async getUserApps(userId: string): Promise<AppWithStats[]> {
    try {
      const { data: apps, error } = await supabase
        .from('apps')
        .select(`
          id,
          name,
          description,
          views,
          total_likes,
          total_comments,
          created_at,
          is_public,
          users!inner(
            id,
            name,
            avatar
          )
        `)
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return apps?.map(app => ({
        id: app.id,
        name: app.name,
        description: app.description,
        isPublic: app.is_public,
        views: app.views,
        totalLikes: app.total_likes,
        totalComments: app.total_comments,
        createdAt: app.created_at,
        user: {
          id: (app.users as any).id,
          name: (app.users as any).name,
          avatar: (app.users as any).avatar,
        },
      })) || [];
    } catch (error) {
      console.error('Error fetching user apps:', error);
      return [];
    }
  }

  // Follow system
  async followUser(userId: string): Promise<boolean> {
    if (!this.currentUser) {
      toast.error('Please log in to follow users');
      return false;
    }

    if (this.currentUser.id === userId) {
      toast.error('You cannot follow yourself');
      return false;
    }

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: this.currentUser.id,
          following_id: userId,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('You are already following this user');
        } else {
          throw error;
        }
        return false;
      }

      // Update follower/following counts
      await this.updateFollowCounts(this.currentUser.id, userId);

      toast.success('Successfully followed user!');
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
      return false;
    }
  }

  async unfollowUser(userId: string): Promise<boolean> {
    if (!this.currentUser) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', this.currentUser.id)
        .eq('following_id', userId);

      if (error) {
        throw error;
      }

      // Update follower/following counts
      await this.updateFollowCounts(this.currentUser.id, userId);

      toast.success('Successfully unfollowed user');
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
      return false;
    }
  }

  async isFollowing(userId: string): Promise<boolean> {
    if (!this.currentUser || this.currentUser.id === userId) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', this.currentUser.id)
        .eq('following_id', userId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  private async updateFollowCounts(followerId: string, followingId: string) {
    // Update follower count for the followed user
    const { data: followingCount } = await supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', followingId);

    await supabase
      .from('users')
      .update({ total_followers: followingCount || 0 })
      .eq('id', followingId);

    // Update following count for the current user
    const { data: followersCount } = await supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', followerId);

    await supabase
      .from('users')
      .update({ total_following: followersCount || 0 })
      .eq('id', followerId);
  }

  // Like system
  async likeApp(appId: string): Promise<boolean> {
    if (!this.currentUser) {
      toast.error('Please log in to like apps');
      return false;
    }

    try {
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: this.currentUser.id,
          app_id: appId,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('You have already liked this app');
        } else {
          throw error;
        }
        return false;
      }

      // Update like count for the app
      await this.updateAppLikeCount(appId);

      toast.success('App liked!');
      return true;
    } catch (error) {
      console.error('Error liking app:', error);
      toast.error('Failed to like app');
      return false;
    }
  }

  async unlikeApp(appId: string): Promise<boolean> {
    if (!this.currentUser) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', this.currentUser.id)
        .eq('app_id', appId);

      if (error) {
        throw error;
      }

      // Update like count for the app
      await this.updateAppLikeCount(appId);

      toast.success('Like removed');
      return true;
    } catch (error) {
      console.error('Error unliking app:', error);
      toast.error('Failed to unlike app');
      return false;
    }
  }

  async isAppLiked(appId: string): Promise<boolean> {
    if (!this.currentUser) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', this.currentUser.id)
        .eq('app_id', appId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  private async updateAppLikeCount(appId: string) {
    const { data: likeCount } = await supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('app_id', appId);

    await supabase
      .from('apps')
      .update({ total_likes: likeCount || 0 })
      .eq('id', appId);
  }

  // Comments system
  async getAppComments(appId: string): Promise<Comment[]> {
    try {
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          users!inner(
            id,
            name,
            avatar
          )
        `)
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return comments?.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        user: {
          id: (comment.users as any).id,
          name: (comment.users as any).name,
          avatar: (comment.users as any).avatar,
        },
      })) || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  async addComment(appId: string, content: string): Promise<boolean> {
    if (!this.currentUser) {
      toast.error('Please log in to comment');
      return false;
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return false;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: this.currentUser.id,
          app_id: appId,
          content: content.trim(),
        });

      if (error) {
        throw error;
      }

      // Update comment count for the app
      await this.updateAppCommentCount(appId);

      toast.success('Comment added!');
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      return false;
    }
  }

  private async updateAppCommentCount(appId: string) {
    const { data: commentCount } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('app_id', appId);

    await supabase
      .from('apps')
      .update({ total_comments: commentCount || 0 })
      .eq('id', appId);
  }

  // Leaderboard
  async getLeaderboard(category: 'apps' | 'likes' | 'followers' = 'apps', limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      let orderBy: string;
      switch (category) {
        case 'likes':
          orderBy = 'total_likes';
          break;
        case 'followers':
          orderBy = 'total_followers';
          break;
        default:
          orderBy = 'total_apps';
      }

      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, avatar, bio, website, location, total_apps, total_likes, total_followers, total_following')
        .eq('is_public', true)
        .order(orderBy, { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return users?.map((user, index) => ({
        rank: index + 1,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          website: user.website,
          location: user.location,
          totalApps: user.total_apps,
          totalLikes: user.total_likes,
          totalFollowers: user.total_followers,
          totalFollowing: user.total_following,
        },
        score: (user as any)[orderBy],
        category,
      })) || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // Featured apps
  async getFeaturedApps(limit: number = 20): Promise<AppWithStats[]> {
    try {
      const { data: apps, error } = await supabase
        .from('apps')
        .select(`
          id,
          name,
          description,
          views,
          total_likes,
          total_comments,
          created_at,
          is_public,
          users!inner(
            id,
            name,
            avatar
          )
        `)
        .eq('is_public', true)
        .order('total_likes', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const appsWithLikeStatus = await Promise.all(
        (apps || []).map(async (app) => {
          const isLiked = await this.isAppLiked(app.id);
          return {
            id: app.id,
            name: app.name,
            description: app.description,
            isPublic: app.is_public,
            views: app.views,
            totalLikes: app.total_likes,
            totalComments: app.total_comments,
            createdAt: app.created_at,
            user: {
              id: (app.users as any).id,
              name: (app.users as any).name,
              avatar: (app.users as any).avatar,
            },
            isLiked,
          };
        })
      );

      return appsWithLikeStatus;
    } catch (error) {
      console.error('Error fetching featured apps:', error);
      return [];
    }
  }

  // Badge system
  async checkAndAwardBadges(userId: string) {
    if (!userId) return;

    try {
      const { data: user } = await supabase
        .from('users')
        .select('total_apps, total_likes, total_followers')
        .eq('id', userId)
        .single();

      if (!user) return;

      const badgesToAward: string[] = [];

      // Check badge criteria
      if (user.total_apps >= 1) badgesToAward.push('First App');
      if (user.total_likes >= 100) badgesToAward.push('Popular Creator');
      if (user.total_apps >= 25) badgesToAward.push('Prolific Builder');
      if (user.total_followers >= 50) badgesToAward.push('Community Leader');

      // Award badges that haven't been earned yet
      for (const badgeName of badgesToAward) {
        const { data: badge } = await supabase
          .from('badges')
          .select('id')
          .eq('name', badgeName)
          .single();

        if (badge) {
          // Check if badge already exists for user
          const { data: existingBadge } = await supabase
            .from('user_badges')
            .select('id')
            .eq('user_id', userId)
            .eq('badge_id', badge.id)
            .single();

          if (!existingBadge) {
            const { error } = await supabase
              .from('user_badges')
              .insert({
                user_id: userId,
                badge_id: badge.id,
              });

            if (!error) {
              toast.success(`🎉 Badge earned: ${badgeName}!`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  }

  // Event handlers for real-time updates
  private handleLikeChange(payload: any) {
    this.emit('like_changed', payload);
  }

  private handleCommentChange(payload: any) {
    this.emit('comment_changed', payload);
  }

  private handleFollowChange(payload: any) {
    this.emit('follow_changed', payload);
  }

  private handleFeaturedAppChange(payload: any) {
    this.emit('featured_app_changed', payload);
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Cleanup
  unsubscribeAll() {
    this.channels.forEach(channel => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }
}

// Singleton instance
export const communityService = new CommunityService();