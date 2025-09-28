-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    bio TEXT,
    avatar TEXT,
    website TEXT,
    location TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_apps INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_followers INTEGER DEFAULT 0,
    total_following INTEGER DEFAULT 0,
    role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN'))
);

-- Create apps table
CREATE TABLE public.apps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'generated',
    frontend TEXT NOT NULL,
    backend TEXT NOT NULL,
    database TEXT NOT NULL,
    config TEXT NOT NULL,
    features TEXT NOT NULL,
    url TEXT,
    published BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    app_data TEXT NOT NULL,
    thumbnail TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    parent_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    fork_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0
);

-- Create project_versions table
CREATE TABLE public.project_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    version INTEGER NOT NULL,
    name TEXT,
    description TEXT,
    app_data TEXT NOT NULL,
    changes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    UNIQUE(project_id, version)
);

-- Create project_collaborators table
CREATE TABLE public.project_collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    UNIQUE(project_id, user_id)
);

-- Create project_exports table
CREATE TABLE public.project_exports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    export_type TEXT NOT NULL,
    export_data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, app_id)
);

-- Create follows table
CREATE TABLE public.follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- Create comments table
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table
CREATE TABLE public.badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Create collaboration_sessions table for real-time features
CREATE TABLE public.collaboration_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    cursor_position JSONB,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_typing BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create real-time presence table
CREATE TABLE public.user_presence (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Apps policies
CREATE POLICY "Users can view public apps" ON public.apps
    FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own apps" ON public.apps
    FOR ALL USING (user_id = auth.uid());

-- Projects policies
CREATE POLICY "Users can view public projects or own projects" ON public.projects
    FOR SELECT USING (
        is_public = true 
        OR user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.project_collaborators 
            WHERE project_id = projects.id 
            AND user_id = auth.uid() 
            AND status = 'accepted'
        )
    );

CREATE POLICY "Users can manage own projects" ON public.projects
    FOR ALL USING (user_id = auth.uid());

-- Project collaborators policies
CREATE POLICY "Users can view collaborators of accessible projects" ON public.project_collaborators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id 
            AND (user_id = auth.uid() OR is_public = true)
        )
    );

CREATE POLICY "Project owners can manage collaborators" ON public.project_collaborators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id 
            AND user_id = auth.uid()
        )
    );

-- Likes policies
CREATE POLICY "Users can view all likes" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON public.likes
    FOR ALL USING (user_id = auth.uid());

-- Follows policies
CREATE POLICY "Users can view all follows" ON public.follows
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON public.follows
    FOR ALL USING (follower_id = auth.uid());

-- Comments policies
CREATE POLICY "Users can view comments on public apps" ON public.comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.apps 
            WHERE id = app_id 
            AND is_public = true
        )
    );

CREATE POLICY "Users can manage own comments" ON public.comments
    FOR ALL USING (user_id = auth.uid());

-- Badges policies
CREATE POLICY "Users can view all badges" ON public.badges
    FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "Users can view all user badges" ON public.user_badges
    FOR SELECT USING (true);

-- Collaboration sessions policies
CREATE POLICY "Users can manage own collaboration sessions" ON public.collaboration_sessions
    FOR ALL USING (user_id = auth.uid());

-- User presence policies
CREATE POLICY "Users can view presence of accessible projects" ON public.user_presence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id 
            AND (user_id = auth.uid() OR is_public = true)
        )
    );

CREATE POLICY "Users can manage own presence" ON public.user_presence
    FOR ALL USING (user_id = auth.uid());

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON public.apps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user creation from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_apps_user_id ON public.apps(user_id);
CREATE INDEX idx_apps_is_public ON public.apps(is_public);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_is_public ON public.projects(is_public);
CREATE INDEX idx_project_collaborators_project_id ON public.project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user_id ON public.project_collaborators(user_id);
CREATE INDEX idx_likes_app_id ON public.likes(app_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_comments_app_id ON public.comments(app_id);
CREATE INDEX idx_collaboration_sessions_project_id ON public.collaboration_sessions(project_id);
CREATE INDEX idx_user_presence_project_id ON public.user_presence(project_id);

-- Insert default badges
INSERT INTO public.badges (name, description, icon) VALUES
('First App', 'Created your first app', '🚀'),
('Popular Creator', 'Received 100+ likes', '⭐'),
('Community Helper', 'Helped 10+ users', '🤝'),
('Prolific Builder', 'Created 25+ apps', '🏗️'),
('Collaboration Expert', 'Collaborated on 10+ projects', '👥'),
('Open Source Hero', 'Made 10+ public projects', '💝');

-- Create user_emails table for managing multiple email addresses
CREATE TABLE public.user_emails (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'github', 'google', 'manual', 'supabase', etc.
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, email, provider)
);

-- Create github_connections table
CREATE TABLE public.github_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    github_user_id TEXT NOT NULL,
    github_username TEXT NOT NULL,
    github_email TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    avatar_url TEXT,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(github_user_id)
);

-- Create project_files table
CREATE TABLE public.project_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    content TEXT NOT NULL,
    file_type TEXT,
    size INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, path)
);

-- Create project_github_connections table
CREATE TABLE public.project_github_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    repository_name TEXT NOT NULL,
    repository_url TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id)
);

-- Enable RLS for new tables
ALTER TABLE public.user_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_github_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables

-- User emails policies
CREATE POLICY "Users can view own emails" ON public.user_emails
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own emails" ON public.user_emails
    FOR ALL USING (user_id = auth.uid());

-- GitHub connections policies
CREATE POLICY "Users can view own GitHub connections" ON public.github_connections
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own GitHub connections" ON public.github_connections
    FOR ALL USING (user_id = auth.uid());

-- Project files policies
CREATE POLICY "Users can view files of accessible projects" ON public.project_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id 
            AND (user_id = auth.uid() OR is_public = true
                OR EXISTS (
                    SELECT 1 FROM public.project_collaborators 
                    WHERE project_id = projects.id 
                    AND user_id = auth.uid() 
                    AND status = 'accepted'
                )
            )
        )
    );

CREATE POLICY "Project owners and editors can manage files" ON public.project_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id 
            AND user_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM public.project_collaborators 
            WHERE project_id = project_files.project_id 
            AND user_id = auth.uid() 
            AND role = 'editor'
            AND status = 'accepted'
        )
    );

-- Project GitHub connections policies
CREATE POLICY "Users can view GitHub connections of accessible projects" ON public.project_github_connections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id 
            AND (user_id = auth.uid() OR is_public = true
                OR EXISTS (
                    SELECT 1 FROM public.project_collaborators 
                    WHERE project_id = projects.id 
                    AND user_id = auth.uid() 
                    AND status = 'accepted'
                )
            )
        )
    );

CREATE POLICY "Project owners can manage GitHub connections" ON public.project_github_connections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id 
            AND user_id = auth.uid()
        )
    );

-- Create triggers for updated_at timestamps on new tables
CREATE TRIGGER update_user_emails_updated_at BEFORE UPDATE ON public.user_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_connections_updated_at BEFORE UPDATE ON public.github_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_files_updated_at BEFORE UPDATE ON public.project_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for new tables
CREATE INDEX idx_user_emails_user_id ON public.user_emails(user_id);
CREATE INDEX idx_user_emails_email ON public.user_emails(email);
CREATE INDEX idx_user_emails_provider ON public.user_emails(provider);
CREATE INDEX idx_github_connections_user_id ON public.github_connections(user_id);
CREATE INDEX idx_github_connections_github_user_id ON public.github_connections(github_user_id);
CREATE INDEX idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX idx_project_github_connections_project_id ON public.project_github_connections(project_id);

-- Create function to find or create user by email mapping
CREATE OR REPLACE FUNCTION public.find_or_create_user_by_email(
    email_address TEXT,
    provider_name TEXT DEFAULT 'manual',
    user_name TEXT DEFAULT NULL,
    github_user_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    existing_user_id UUID;
    new_user_id UUID;
BEGIN
    -- First, try to find existing user by email in user_emails table
    SELECT user_id INTO existing_user_id
    FROM public.user_emails 
    WHERE email = email_address
    LIMIT 1;
    
    -- If found, return existing user
    IF existing_user_id IS NOT NULL THEN
        -- Add this email/provider combination if it doesn't exist
        INSERT INTO public.user_emails (user_id, email, provider, is_verified)
        VALUES (existing_user_id, email_address, provider_name, true)
        ON CONFLICT (user_id, email, provider) DO NOTHING;
        
        RETURN existing_user_id;
    END IF;
    
    -- If not found, try to find by main users table email
    SELECT id INTO existing_user_id
    FROM public.users 
    WHERE email = email_address
    LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Add this email to user_emails table
        INSERT INTO public.user_emails (user_id, email, provider, is_primary, is_verified)
        VALUES (existing_user_id, email_address, provider_name, true, true)
        ON CONFLICT (user_id, email, provider) DO NOTHING;
        
        RETURN existing_user_id;
    END IF;
    
    -- If no existing user found, we cannot create a new one here
    -- as this should be handled by Supabase Auth
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to link GitHub account to existing user
CREATE OR REPLACE FUNCTION public.link_github_account(
    user_uuid UUID,
    github_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    github_email TEXT;
BEGIN
    -- Extract GitHub email
    github_email := github_data->>'email';
    
    -- Insert or update GitHub connection
    INSERT INTO public.github_connections (
        user_id,
        github_user_id,
        github_username,
        github_email,
        access_token,
        avatar_url
    ) VALUES (
        user_uuid,
        github_data->>'id',
        github_data->>'login',
        github_email,
        github_data->>'access_token',
        github_data->>'avatar_url'
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        github_user_id = EXCLUDED.github_user_id,
        github_username = EXCLUDED.github_username,
        github_email = EXCLUDED.github_email,
        access_token = EXCLUDED.access_token,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();
    
    -- Add GitHub email to user_emails if provided and not exists
    IF github_email IS NOT NULL THEN
        INSERT INTO public.user_emails (user_id, email, provider, is_verified)
        VALUES (user_uuid, github_email, 'github', true)
        ON CONFLICT (user_id, email, provider) DO NOTHING;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;