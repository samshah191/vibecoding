/**
 * Environment Configuration Utility
 * Handles environment-specific settings and email mapping configurations
 */

interface EnvironmentConfig {
  name: string;
  apiUrl: string;
  appUrl: string;
  githubClientId: string;
  githubRedirectUri: string;
  enableEmailMapping: boolean;
  enableDebugMode: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

class EnvironmentService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): EnvironmentConfig {
    const environment = process.env.REACT_APP_ENVIRONMENT || 'development';
    
    return {
      name: environment,
      apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      appUrl: process.env.REACT_APP_APP_URL || 'http://localhost:3000',
      githubClientId: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
      githubRedirectUri: process.env.REACT_APP_GITHUB_REDIRECT_URI || `${this.getAppUrl()}/auth/github/callback`,
      enableEmailMapping: process.env.REACT_APP_ENABLE_EMAIL_MAPPING === 'true',
      enableDebugMode: process.env.REACT_APP_ENABLE_DEBUG_MODE === 'true',
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL || '',
      supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
    };
  }

  private getAppUrl(): string {
    return process.env.REACT_APP_APP_URL || window.location.origin;
  }

  /**
   * Get current environment configuration
   */
  getConfig(): EnvironmentConfig {
    return this.config;
  }

  /**
   * Check if we're in development mode
   */
  isDevelopment(): boolean {
    return this.config.name === 'development';
  }

  /**
   * Check if we're in production mode
   */
  isProduction(): boolean {
    return this.config.name === 'production';
  }

  /**
   * Check if we're in staging mode
   */
  isStaging(): boolean {
    return this.config.name === 'staging';
  }

  /**
   * Get the appropriate API URL for the current environment
   */
  getApiUrl(): string {
    return this.config.apiUrl;
  }

  /**
   * Get GitHub OAuth configuration for current environment
   */
  getGitHubConfig() {
    return {
      clientId: this.config.githubClientId,
      redirectUri: this.config.githubRedirectUri,
      scope: 'repo user:email',
    };
  }

  /**
   * Check if email mapping is enabled
   */
  isEmailMappingEnabled(): boolean {
    return this.config.enableEmailMapping;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugModeEnabled(): boolean {
    return this.config.enableDebugMode;
  }

  /**
   * Get environment-specific email handling strategy
   */
  getEmailHandlingStrategy(): 'strict' | 'flexible' | 'permissive' {
    if (this.isProduction()) {
      return 'strict'; // Production: strict email verification
    } else if (this.isStaging()) {
      return 'flexible'; // Staging: flexible but controlled
    } else {
      return 'permissive'; // Development: permissive for testing
    }
  }

  /**
   * Get environment-specific GitHub token handling
   */
  getGitHubTokenStrategy(): 'oauth' | 'personal' | 'hybrid' {
    if (this.isProduction()) {
      return 'oauth'; // Production: OAuth flow only
    } else if (this.isStaging()) {
      return 'hybrid'; // Staging: OAuth preferred, personal fallback
    } else {
      return 'personal'; // Development: Personal token for quick testing
    }
  }

  /**
   * Handle environment-specific email conflicts
   */
  async handleEmailConflict(
    email: string,
    provider: string,
    currentUserId?: string
  ): Promise<{
    strategy: 'merge' | 'link' | 'error' | 'prompt';
    message: string;
  }> {
    const strategy = this.getEmailHandlingStrategy();

    switch (strategy) {
      case 'strict':
        // Production: Require explicit user action
        return {
          strategy: 'prompt',
          message: 'This email is associated with another account. Please choose how to proceed.'
        };

      case 'flexible':
        // Staging: Allow linking with warning
        return {
          strategy: 'link',
          message: 'Email linked to existing account. Merging data...'
        };

      case 'permissive':
        // Development: Auto-link for easy testing
        return {
          strategy: 'merge',
          message: 'Auto-linking email for development testing'
        };

      default:
        return {
          strategy: 'error',
          message: 'Unable to handle email conflict'
        };
    }
  }

  /**
   * Log debug information if enabled
   */
  debugLog(message: string, data?: any): void {
    if (this.isDebugModeEnabled()) {
      console.log(`[VibeCoding Debug - ${this.config.name}]`, message, data);
    }
  }

  /**
   * Get deployment-specific URLs
   */
  getDeploymentUrls() {
    return {
      api: this.config.apiUrl,
      app: this.config.appUrl,
      callback: this.config.githubRedirectUri,
    };
  }

  /**
   * Validate environment configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.supabaseUrl) {
      errors.push('Supabase URL is not configured');
    }

    if (!this.config.supabaseAnonKey) {
      errors.push('Supabase Anon Key is not configured');
    }

    if (this.config.enableEmailMapping && !this.config.githubClientId && this.isProduction()) {
      errors.push('GitHub Client ID is required for email mapping in production');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const environmentService = new EnvironmentService();
export type { EnvironmentConfig };