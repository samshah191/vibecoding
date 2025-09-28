import { supabase } from './supabase';
import { GeneratedApp } from '../types/app';

export class AppService {
  async createApp(appData: GeneratedApp) {
    const { data, error } = await supabase
      .from('apps')
      .insert({
        id: appData.id,
        name: appData.name,
        description: appData.description,
        user_id: appData.userId,
        status: appData.status,
        frontend: JSON.stringify(appData.frontend),
        backend: JSON.stringify(appData.backend),
        database: JSON.stringify(appData.database),
        config: JSON.stringify(appData.config),
        features: appData.features.join(','),
        url: appData.url,
        published: appData.published || false
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async getUserApps(userId: string) {
    const { data: apps, error } = await supabase
      .from('apps')
      .select('id, name, description, status, features, url, published, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Convert features string back to array
    return (apps || []).map((app: any) => ({
      ...app,
      features: app.features ? app.features.split(',') : [],
      createdAt: app.created_at,
      updatedAt: app.updated_at
    }));
  }

  async getAppById(appId: string, userId: string) {
    const { data: app, error } = await supabase
      .from('apps')
      .select('*')
      .eq('id', appId)
      .eq('user_id', userId)
      .single();
      
    if (error || !app) return null;
    
    // Parse JSON strings back to objects
    return {
      ...app,
      frontend: JSON.parse(app.frontend),
      backend: JSON.parse(app.backend),
      database: JSON.parse(app.database),
      config: JSON.parse(app.config),
      features: app.features ? app.features.split(',') : [],
      createdAt: app.created_at,
      updatedAt: app.updated_at
    };
  }

  async updateApp(appId: string, userId: string, updateData: any) {
    const { data, error } = await supabase
      .from('apps')
      .update(updateData)
      .eq('id', appId)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async deleteApp(appId: string, userId: string) {
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', appId)
      .eq('user_id', userId);
      
    return !error;
  }

  async togglePublish(appId: string, userId: string) {
    const { data: app, error: fetchError } = await supabase
      .from('apps')
      .select('published')
      .eq('id', appId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !app) return null;

    const { data: updatedApp, error: updateError } = await supabase
      .from('apps')
      .update({ published: !app.published })
      .eq('id', appId)
      .select()
      .single();
      
    if (updateError) throw updateError;
    return updatedApp;
  }

  async getPublishedApps() {
    const { data: apps, error } = await supabase
      .from('apps')
      .select(`
        id, name, description, features, url, created_at,
        users:user_id (name, email)
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (apps || []).map((app: any) => ({
      ...app,
      createdAt: app.created_at,
      user: app.users
    }));
  }
}