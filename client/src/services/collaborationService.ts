// Frontend service for collaboration features
import api from './api';
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Project, ProjectVersion, ProjectCollaborator, ProjectExport, ProjectListQuery } from '../types';

// Export types
export type { Project, ProjectVersion, ProjectCollaborator, ProjectExport, ProjectListQuery };

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  isTyping: boolean;
  role: 'owner' | 'editor' | 'viewer';
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
  selection?: {
    start: number;
    end: number;
  };
}

export interface CollaborationEvent {
  type: 'cursor_move' | 'typing_start' | 'typing_stop' | 'user_join' | 'user_leave' | 'code_change';
  userId: string;
  data: any;
  timestamp: string;
}

export class RealtimeCollaborationService {
  private channel: RealtimeChannel | null = null;
  private projectId: string | null = null;
  private currentUser: any = null;
  private collaborators: Map<string, CollaborationUser> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

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

  async joinProject(projectId: string, role: 'owner' | 'editor' | 'viewer' = 'viewer') {
    if (this.channel) {
      await this.leaveProject();
    }

    this.projectId = projectId;
    
    // Create realtime channel for the project
    this.channel = supabase.channel(`project:${projectId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: this.currentUser?.id },
      },
    });

    // Listen for user presence changes
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = this.channel!.presenceState();
        this.updateCollaborators(presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this.handleUserJoin(newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this.handleUserLeave(leftPresences);
      })
      
      // Listen for broadcast events
      .on('broadcast', { event: 'cursor_move' }, (payload) => {
        this.handleCursorMove(payload);
      })
      .on('broadcast', { event: 'typing_start' }, (payload) => {
        this.handleTypingStart(payload);
      })
      .on('broadcast', { event: 'typing_stop' }, (payload) => {
        this.handleTypingStop(payload);
      })
      .on('broadcast', { event: 'code_change' }, (payload) => {
        this.handleCodeChange(payload);
      })
      
      // Listen for database changes
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_collaborators',
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        this.handleCollaboratorChange(payload);
      })
      
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await this.trackPresence(role);
          this.emit('connected', { projectId });
        }
      });

    return this.channel;
  }

  async leaveProject() {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.projectId = null;
    this.collaborators.clear();
    this.emit('disconnected', {});
  }

  private async trackPresence(role: string) {
    if (!this.channel || !this.currentUser) return;

    // Get user profile for presence data
    const { data: profile } = await supabase
      .from('users')
      .select('name, email, avatar')
      .eq('id', this.currentUser.id)
      .single();

    await this.channel.track({
      user_id: this.currentUser.id,
      name: profile?.name || this.currentUser.email?.split('@')[0],
      email: this.currentUser.email,
      avatar: profile?.avatar,
      role,
      joined_at: new Date().toISOString(),
      cursor: null,
      is_typing: false,
    });
  }

  // Cursor tracking
  updateCursor(position: CursorPosition) {
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: {
        user_id: this.currentUser?.id,
        position,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Typing indicators
  startTyping(elementId?: string) {
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'typing_start',
      payload: {
        user_id: this.currentUser?.id,
        element_id: elementId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  stopTyping() {
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'typing_stop',
      payload: {
        user_id: this.currentUser?.id,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Code synchronization
  broadcastCodeChange(change: {
    file: string;
    operation: 'insert' | 'delete' | 'replace';
    position: number;
    content: string;
    length?: number;
  }) {
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'code_change',
      payload: {
        user_id: this.currentUser?.id,
        change,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Event handlers
  private updateCollaborators(presenceState: any) {
    this.collaborators.clear();
    
    Object.values(presenceState).forEach((presences: any) => {
      presences.forEach((presence: any) => {
        this.collaborators.set(presence.user_id, {
          id: presence.user_id,
          name: presence.name,
          email: presence.email,
          avatar: presence.avatar,
          cursor: presence.cursor,
          isTyping: presence.is_typing,
          role: presence.role,
        });
      });
    });

    this.emit('collaborators_updated', Array.from(this.collaborators.values()));
  }

  private handleUserJoin(newPresences: any[]) {
    newPresences.forEach((presence) => {
      const user = {
        id: presence.user_id,
        name: presence.name,
        email: presence.email,
        avatar: presence.avatar,
        role: presence.role,
      };
      
      toast.success(`${user.name} joined the project`, {
        icon: '👋',
        duration: 2000,
      });
      
      this.emit('user_joined', user);
    });
  }

  private handleUserLeave(leftPresences: any[]) {
    leftPresences.forEach((presence) => {
      const user = {
        id: presence.user_id,
        name: presence.name,
        email: presence.email,
      };
      
      this.collaborators.delete(presence.user_id);
      
      toast(`${user.name} left the project`, {
        icon: '👋',
        duration: 2000,
      });
      
      this.emit('user_left', user);
    });
  }

  private handleCursorMove(payload: any) {
    const { user_id, position } = payload.payload;
    
    if (user_id === this.currentUser?.id) return; // Ignore own cursor
    
    const collaborator = this.collaborators.get(user_id);
    if (collaborator) {
      collaborator.cursor = position;
      this.emit('cursor_moved', { userId: user_id, position });
    }
  }

  private handleTypingStart(payload: any) {
    const { user_id, element_id } = payload.payload;
    
    if (user_id === this.currentUser?.id) return;
    
    const collaborator = this.collaborators.get(user_id);
    if (collaborator) {
      collaborator.isTyping = true;
      this.emit('typing_started', { userId: user_id, elementId: element_id });
    }
  }

  private handleTypingStop(payload: any) {
    const { user_id } = payload.payload;
    
    if (user_id === this.currentUser?.id) return;
    
    const collaborator = this.collaborators.get(user_id);
    if (collaborator) {
      collaborator.isTyping = false;
      this.emit('typing_stopped', { userId: user_id });
    }
  }

  private handleCodeChange(payload: any) {
    const { user_id, change } = payload.payload;
    
    if (user_id === this.currentUser?.id) return; // Ignore own changes
    
    this.emit('code_changed', { userId: user_id, change });
  }

  private handleCollaboratorChange(payload: any) {
    // Handle database changes to collaborators
    this.emit('collaborator_db_changed', payload);
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

  // Getters
  getCollaborators(): CollaborationUser[] {
    return Array.from(this.collaborators.values());
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isConnected(): boolean {
    return this.channel !== null && this.projectId !== null;
  }

  getProjectId(): string | null {
    return this.projectId;
  }

  // Collaboration persistence
  async saveCollaborationSession() {
    if (!this.projectId || !this.currentUser) return;

    const collaborators = Array.from(this.collaborators.values());
    
    await supabase
      .from('collaboration_sessions')
      .upsert({
        project_id: this.projectId,
        user_id: this.currentUser.id,
        cursor_position: collaborators.find(c => c.id === this.currentUser.id)?.cursor,
        last_seen: new Date().toISOString(),
        is_typing: false,
      });
  }

  async loadCollaborationHistory(projectId: string) {
    const { data: sessions } = await supabase
      .from('collaboration_sessions')
      .select(`\
        *,\
        users:user_id (\
          name,\
          email,\
          avatar\
        )\
      `)
      .eq('project_id', projectId)
      .order('last_seen', { ascending: false });

    return sessions || [];
  }
}

// Singleton instance
export const realtimeCollaboration = new RealtimeCollaborationService();

// Project management
export const projectService = {
  // Get all projects
  getProjects: async (params: ProjectListQuery = {}) => {
    try {
      const response = await api.get('/projects', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get a specific project
  getProject: async (id: string) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Create a new project
  createProject: async (projectData: Partial<Project>) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update a project
  updateProject: async (id: string, projectData: Partial<Project>) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (id: string) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Get project versions
  getProjectVersions: async (projectId: string) => {
    try {
      const response = await api.get(`/projects/${projectId}/versions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project versions:', error);
      throw error;
    }
  },

  // Create a new version
  createProjectVersion: async (projectId: string, versionData: Partial<ProjectVersion>) => {
    try {
      const response = await api.post(`/projects/${projectId}/versions`, versionData);
      return response.data;
    } catch (error) {
      console.error('Error creating project version:', error);
      throw error;
    }
  },

  // Restore to a specific version
  restoreProjectVersion: async (projectId: string, versionId: string) => {
    try {
      const response = await api.post(`/projects/${projectId}/versions/${versionId}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error restoring project version:', error);
      throw error;
    }
  }
};

// Legacy API-based collaboration features (will be deprecated)
export const legacyCollaborationService = {
  // Get project collaborators
  getCollaborators: async (projectId: string) => {
    try {
      const response = await api.get(`/collaboration/${projectId}/collaborators`);
      return response.data;
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      throw error;
    }
  },

  // Invite collaborator
  inviteCollaborator: async (projectId: string, collaboratorData: { email: string; role?: 'viewer' | 'editor' }) => {
    try {
      const response = await api.post(`/collaboration/${projectId}/collaborators`, collaboratorData);
      return response.data;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      throw error;
    }
  },

  // Update collaborator status
  updateCollaboratorStatus: async (projectId: string, collaboratorId: string, statusData: { status: 'accepted' | 'declined' }) => {
    try {
      const response = await api.put(`/collaboration/${projectId}/collaborators/${collaboratorId}`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating collaborator status:', error);
      throw error;
    }
  },

  // Remove collaborator
  removeCollaborator: async (projectId: string, collaboratorId: string) => {
    try {
      const response = await api.delete(`/collaboration/${projectId}/collaborators/${collaboratorId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  },

  // Fork (duplicate) a project
  forkProject: async (projectId: string, forkData: { name?: string; description?: string }) => {
    try {
      const response = await api.post(`/collaboration/${projectId}/fork`, forkData);
      return response.data;
    } catch (error) {
      console.error('Error forking project:', error);
      throw error;
    }
  },

  // Export project data
  exportProject: async (projectId: string, exportData: { type: 'zip' | 'github' | 'json'; options?: any }) => {
    try {
      const response = await api.post(`/collaboration/${projectId}/export`, exportData);
      return response.data;
    } catch (error) {
      console.error('Error exporting project:', error);
      throw error;
    }
  }
};