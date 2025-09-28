import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ilroebcnrmryadofbjfc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm9lYmNucm1yeWFkb2ZiamZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjYxOTgsImV4cCI6MjA3NDQ0MjE5OH0.3F1H8RGu-F-gGm0pYapJ56f6dLZJHe93ockByxvUtmw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types based on your current schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          bio: string | null
          avatar: string | null
          website: string | null
          location: string | null
          is_public: boolean
          created_at: string
          updated_at: string
          total_apps: number
          total_likes: number
          total_followers: number
          total_following: number
          role: 'USER' | 'ADMIN'
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          bio?: string | null
          avatar?: string | null
          website?: string | null
          location?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          total_apps?: number
          total_likes?: number
          total_followers?: number
          total_following?: number
          role?: 'USER' | 'ADMIN'
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          bio?: string | null
          avatar?: string | null
          website?: string | null
          location?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          total_apps?: number
          total_likes?: number
          total_followers?: number
          total_following?: number
          role?: 'USER' | 'ADMIN'
        }
      }
      apps: {
        Row: {
          id: string
          name: string
          description: string
          user_id: string
          status: string
          frontend: string
          backend: string
          database: string
          config: string
          features: string
          url: string | null
          published: boolean
          is_public: boolean
          views: number
          total_likes: number
          total_comments: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          user_id: string
          status?: string
          frontend: string
          backend: string
          database: string
          config: string
          features: string
          url?: string | null
          published?: boolean
          is_public?: boolean
          views?: number
          total_likes?: number
          total_comments?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          user_id?: string
          status?: string
          frontend?: string
          backend?: string
          database?: string
          config?: string
          features?: string
          url?: string | null
          published?: boolean
          is_public?: boolean
          views?: number
          total_likes?: number
          total_comments?: number
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          app_data: string
          thumbnail: string | null
          is_public: boolean
          created_at: string
          updated_at: string
          user_id: string
          parent_project_id: string | null
          fork_count: number
          view_count: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          app_data: string
          thumbnail?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
          parent_project_id?: string | null
          fork_count?: number
          view_count?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          app_data?: string
          thumbnail?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
          parent_project_id?: string | null
          fork_count?: number
          view_count?: number
        }
      }
      project_collaborators: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          invited_at: string
          invited_by: string
          status: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: string
          invited_at?: string
          invited_by: string
          status?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          invited_at?: string
          invited_by?: string
          status?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          app_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          app_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          app_id?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          app_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          app_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          app_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type SupabaseClient = typeof supabase