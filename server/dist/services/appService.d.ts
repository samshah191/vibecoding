import { GeneratedApp } from '../types/app';
export declare class AppService {
    createApp(appData: GeneratedApp): Promise<{
        id: string;
        name: string;
        isPublic: boolean;
        createdAt: Date;
        updatedAt: Date;
        totalLikes: number;
        description: string;
        userId: string;
        status: string;
        frontend: string;
        backend: string;
        database: string;
        config: string;
        features: string;
        url: string | null;
        published: boolean;
        views: number;
        totalComments: number;
    }>;
    getUserApps(userId: string): Promise<{
        features: string[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: string;
        url: string | null;
        published: boolean;
    }[]>;
    getAppById(appId: string, userId: string): Promise<{
        frontend: any;
        backend: any;
        database: any;
        config: any;
        features: string[];
        id: string;
        name: string;
        isPublic: boolean;
        createdAt: Date;
        updatedAt: Date;
        totalLikes: number;
        description: string;
        userId: string;
        status: string;
        url: string | null;
        published: boolean;
        views: number;
        totalComments: number;
    } | null>;
    updateApp(appId: string, userId: string, updateData: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteApp(appId: string, userId: string): Promise<boolean>;
    togglePublish(appId: string, userId: string): Promise<{
        id: string;
        name: string;
        isPublic: boolean;
        createdAt: Date;
        updatedAt: Date;
        totalLikes: number;
        description: string;
        userId: string;
        status: string;
        frontend: string;
        backend: string;
        database: string;
        config: string;
        features: string;
        url: string | null;
        published: boolean;
        views: number;
        totalComments: number;
    } | null>;
    getPublishedApps(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        user: {
            email: string;
            name: string | null;
        };
        description: string;
        features: string;
        url: string | null;
    }[]>;
}
//# sourceMappingURL=appService.d.ts.map