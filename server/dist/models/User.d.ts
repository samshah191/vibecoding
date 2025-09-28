export declare class User {
    static create(userData: {
        email: string;
        password: string;
        name?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static findByEmail(email: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    static findById(id: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    static updateById(id: string, userData: {
        name?: string;
        email?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static deleteById(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        bio: string | null;
        avatar: string | null;
        website: string | null;
        location: string | null;
        isPublic: boolean;
        createdAt: Date;
        updatedAt: Date;
        totalApps: number;
        totalLikes: number;
        totalFollowers: number;
        totalFollowing: number;
    }>;
    static getUserApps(userId: string): Promise<{
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
    }[]>;
}
//# sourceMappingURL=User.d.ts.map