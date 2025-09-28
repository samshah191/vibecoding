// Collaboration types
export interface Project {
  id: string;
  name: string;
  description?: string;
  appData: string;
  thumbnail?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  parentProjectId?: string;
  forkCount: number;
  viewCount: number;
  user?: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  parentProject?: {
    id: string;
    name: string;
    user?: {
      name?: string;
    };
  };
  versions?: ProjectVersion[];
  collaborators?: ProjectCollaborator[];
  exports?: ProjectExport[];
  _count?: {
    versions: number;
    collaborators: number;
    forks: number;
    exports: number;
  };
}

export interface ProjectVersion {
  id: string;
  version: number;
  name?: string;
  description?: string;
  appData: string;
  changes?: string;
  createdAt: string;
  projectId: string;
  userId: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface ProjectCollaborator {
  id: string;
  projectId: string;
  userId: string;
  role: 'viewer' | 'editor';
  invitedAt: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  user?: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  inviter?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface ProjectExport {
  id: string;
  projectId: string;
  userId: string;
  exportType: 'zip' | 'github' | 'json';
  exportData: string;
  createdAt: string;
}

export interface ProjectListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isPublic?: boolean;
  userId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'forkCount' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}