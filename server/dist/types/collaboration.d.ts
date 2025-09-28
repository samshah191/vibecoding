export interface Project {
    id: string;
    name: string;
    description?: string;
    appData: string;
    thumbnail?: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
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
    parentProject?: Project;
    versions?: ProjectVersion[];
    collaborators?: ProjectCollaborator[];
    exports?: ProjectExport[];
}
export interface ProjectVersion {
    id: string;
    version: number;
    name?: string;
    description?: string;
    appData: string;
    changes?: string;
    createdAt: Date;
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
    invitedAt: Date;
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
    createdAt: Date;
}
export interface CreateProjectRequest {
    name: string;
    description?: string;
    appData: any;
    thumbnail?: string;
    isPublic?: boolean;
}
export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    appData?: any;
    thumbnail?: string;
    isPublic?: boolean;
}
export interface CreateVersionRequest {
    name?: string;
    description?: string;
    appData: any;
    changes?: string;
}
export interface InviteCollaboratorRequest {
    email: string;
    role?: 'viewer' | 'editor';
}
export interface ExportProjectRequest {
    type: 'zip' | 'github' | 'json';
    options?: {
        includeVersions?: boolean;
        includeComments?: boolean;
        format?: string;
    };
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
export interface ProjectStats {
    totalProjects: number;
    totalVersions: number;
    totalCollaborators: number;
    totalExports: number;
    popularProjects: Project[];
    recentActivity: Array<{
        type: 'create' | 'update' | 'fork' | 'invite' | 'export';
        project: Project;
        user: any;
        createdAt: Date;
    }>;
}
//# sourceMappingURL=collaboration.d.ts.map