import { supabase } from './supabase';

interface UserEmail {
  id: string;
  user_id: string;
  email: string;
  provider: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailMappingResult {
  user_id: string | null;
  is_new_email: boolean;
  existing_emails: UserEmail[];
}

export class EmailMappingService {
  /**
   * Find user by email across all email sources
   */
  async findUserByEmail(email: string): Promise<string | null> {
    try {
      // First check user_emails table
      const { data: emailData, error: emailError } = await supabase
        .from('user_emails')
        .select('user_id')
        .eq('email', email)
        .limit(1)
        .single();

      if (emailData && !emailError) {
        return emailData.user_id;
      }

      // Fallback to main users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1)
        .single();

      if (userData && !userError) {
        return userData.id;
      }

      return null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Add email to user's email collection
   */
  async addEmailToUser(
    userId: string,
    email: string,
    provider: string,
    isPrimary: boolean = false,
    isVerified: boolean = true
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_emails')
        .upsert({
          user_id: userId,
          email,
          provider,
          is_primary: isPrimary,
          is_verified: isVerified
        });

      if (error) {
        console.error('Error adding email to user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding email to user:', error);
      return false;
    }
  }

  /**
   * Get all emails for a user
   */
  async getUserEmails(userId: string): Promise<UserEmail[]> {
    try {
      const { data, error } = await supabase
        .from('user_emails')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false });

      if (error) {
        console.error('Error getting user emails:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user emails:', error);
      return [];
    }
  }

  /**
   * Set primary email for user
   */
  async setPrimaryEmail(userId: string, email: string): Promise<boolean> {
    try {
      // First, unset all primary flags for this user
      await supabase
        .from('user_emails')
        .update({ is_primary: false })
        .eq('user_id', userId);

      // Then set the specified email as primary
      const { error } = await supabase
        .from('user_emails')
        .update({ is_primary: true })
        .eq('user_id', userId)
        .eq('email', email);

      if (error) {
        console.error('Error setting primary email:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error setting primary email:', error);
      return false;
    }
  }

  /**
   * Handle email mapping for OAuth providers
   */
  async handleOAuthEmailMapping(
    email: string,
    provider: string,
    currentUserId?: string
  ): Promise<EmailMappingResult> {
    try {
      // Look for existing user with this email
      const existingUserId = await this.findUserByEmail(email);
      
      if (existingUserId) {
        // Email belongs to existing user
        if (currentUserId && existingUserId !== currentUserId) {
          // Different user owns this email - potential conflict
          const existingEmails = await this.getUserEmails(existingUserId);
          return {
            user_id: existingUserId,
            is_new_email: false,
            existing_emails: existingEmails
          };
        }
        
        // Same user or no current user - add email if not exists
        await this.addEmailToUser(existingUserId, email, provider);
        const emails = await this.getUserEmails(existingUserId);
        
        return {
          user_id: existingUserId,
          is_new_email: false,
          existing_emails: emails
        };
      }
      
      // New email
      if (currentUserId) {
        // Add to current user
        await this.addEmailToUser(currentUserId, email, provider);
        const emails = await this.getUserEmails(currentUserId);
        
        return {
          user_id: currentUserId,
          is_new_email: true,
          existing_emails: emails
        };
      }
      
      // No current user and no existing user with this email
      return {
        user_id: null,
        is_new_email: true,
        existing_emails: []
      };
    } catch (error) {
      console.error('Error handling OAuth email mapping:', error);
      return {
        user_id: null,
        is_new_email: false,
        existing_emails: []
      };
    }
  }

  /**
   * Remove email from user
   */
  async removeEmailFromUser(userId: string, email: string, provider: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_emails')
        .delete()
        .eq('user_id', userId)
        .eq('email', email)
        .eq('provider', provider);

      if (error) {
        console.error('Error removing email from user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing email from user:', error);
      return false;
    }
  }

  /**
   * Check if email conflicts exist and provide resolution options
   */
  async checkEmailConflicts(email: string, currentUserId: string): Promise<{
    hasConflict: boolean;
    conflictUserId?: string;
    resolutionOptions: string[];
  }> {
    try {
      const existingUserId = await this.findUserByEmail(email);
      
      if (existingUserId && existingUserId !== currentUserId) {
        return {
          hasConflict: true,
          conflictUserId: existingUserId,
          resolutionOptions: [
            'merge_accounts',
            'use_different_email',
            'override_existing'
          ]
        };
      }
      
      return {
        hasConflict: false,
        resolutionOptions: ['add_email']
      };
    } catch (error) {
      console.error('Error checking email conflicts:', error);
      return {
        hasConflict: false,
        resolutionOptions: []
      };
    }
  }

  /**
   * Sync user's primary email with Supabase Auth email
   */
  async syncWithAuth(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return false;

      // Ensure user's auth email is in user_emails table
      if (user.email) {
        await this.addEmailToUser(user.id, user.email, 'supabase', true, true);
      }

      return true;
    } catch (error) {
      console.error('Error syncing with auth:', error);
      return false;
    }
  }
}

export const emailMappingService = new EmailMappingService();