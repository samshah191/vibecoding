export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'USER' | 'ADMIN';
  bio?: string;
  avatar?: string;
  website?: string;
  location?: string;
  isPublic?: boolean;
  createdAt: string;
  totalApps?: number;
  totalLikes?: number;
  totalFollowers?: number;
  totalFollowing?: number;
}

export interface UserProfile extends User {
  apps: App[];
  badges?: Badge[];
  isFollowing?: boolean;
  followerCount?: number;
  followingCount?: number;
}

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

export interface UserProfile extends User {
  apps: App[];
  badges?: Badge[];
  isFollowing?: boolean;
  followerCount?: number;
  followingCount?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'achievement' | 'milestone' | 'special';
  earnedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  appId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  replies?: Comment[];
}

export interface Like {
  id: string;
  userId: string;
  appId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: User;
  following?: User;
}

export interface LeaderboardEntry {
  rank: number;
  user?: User;
  app?: App;
  score: number;
  appCount?: number;
  latestApp?: App;
}

export interface CommunityStats {
  userId: string;
  name: string;
  memberSince: string;
  totalApps: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  joinRank: number;
  achievements: {
    firstApp: boolean;
    prolificCreator: boolean;
    appMaster: boolean;
    earlyAdopter: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface App {
  id: string;
  name: string;
  description: string;
  status: 'generated' | 'building' | 'deployed' | 'error';
  features: string[];
  url?: string;
  published: boolean;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  frontend?: Record<string, unknown>;
  backend?: Record<string, unknown>;
  database?: Record<string, unknown>;
  config?: Record<string, unknown>;
  totalLikes?: number;
  totalComments?: number;
  views?: number;
  userLiked?: boolean;
}

export interface AppGenerationRequest {
  description: string;
  requirements?: string[];
  preferences?: {
    framework?: string;
    styling?: string;
    features?: string[];
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface GeneratedProjectSummary {
  appId: string;
  name: string;
  description: string;
  platform: 'web' | 'mobile';
  backend: 'node' | 'fastapi';
  clientPath: string;
  serverPath: string;
  projectRoot: string;
  archivePath: string;
  downloadUrl?: string;
  commands: {
    client: string;
    server: string;
  };
  environment: {
    clientEnv: Record<string, string>;
    serverEnv: Record<string, string>;
  };
  features: string[];
  apiEndpoints: string[];
}

export interface ConversationalGenerationRequest {
  description: string;
  platform?: 'web' | 'mobile';
  backend?: 'node' | 'fastapi';
  conversation?: ConversationMessage[];
}

export interface ConversationalGenerationResponse {
  success: boolean;
  message?: string;
  error?: string;
  app?: App;
  project?: GeneratedProjectSummary;
  conversation?: ConversationMessage[];
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  app?: T;
  apps?: T[];
  user?: User;
  token?: string;
}






