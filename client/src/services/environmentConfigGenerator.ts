interface EnvironmentVariable {
  key: string;
  value: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'url' | 'secret';
  category: 'app' | 'database' | 'auth' | 'api' | 'deployment' | 'monitoring';
  example?: string;
  validation?: string;
}

interface EnvironmentTemplate {
  name: string;
  description: string;
  framework: string;
  variables: EnvironmentVariable[];
}

export class EnvironmentConfigGenerator {
  private templates: Record<string, EnvironmentTemplate> = {
    'react-basic': {
      name: 'React Basic',
      description: 'Basic environment configuration for React applications',
      framework: 'react',
      variables: [
        {
          key: 'REACT_APP_NAME',
          value: '',
          description: 'Application name displayed in the browser',
          required: false,
          type: 'string',
          category: 'app',
          example: 'My React App'
        },
        {
          key: 'REACT_APP_VERSION',
          value: '1.0.0',
          description: 'Application version',
          required: false,
          type: 'string',
          category: 'app'
        },
        {
          key: 'REACT_APP_API_URL',
          value: 'http://localhost:5000/api',
          description: 'Backend API base URL',
          required: true,
          type: 'url',
          category: 'api',
          example: 'https://api.example.com'
        },
        {
          key: 'REACT_APP_ENVIRONMENT',
          value: 'development',
          description: 'Current environment (development/staging/production)',
          required: true,
          type: 'string',
          category: 'app',
          validation: 'development|staging|production'
        }
      ]
    },
    'next-fullstack': {
      name: 'Next.js Full-Stack',
      description: 'Comprehensive environment configuration for Next.js applications',
      framework: 'next',
      variables: [
        {
          key: 'NODE_ENV',
          value: 'development',
          description: 'Node.js environment',
          required: true,
          type: 'string',
          category: 'app',
          validation: 'development|production|test'
        },
        {
          key: 'NEXTAUTH_URL',
          value: 'http://localhost:3000',
          description: 'NextAuth.js URL for authentication',
          required: true,
          type: 'url',
          category: 'auth',
          example: 'https://yourapp.com'
        },
        {
          key: 'NEXTAUTH_SECRET',
          value: '',
          description: 'Secret key for NextAuth.js JWT encryption',
          required: true,
          type: 'secret',
          category: 'auth',
          example: 'your-super-secret-key'
        },
        {
          key: 'DATABASE_URL',
          value: '',
          description: 'Database connection string',
          required: true,
          type: 'url',
          category: 'database',
          example: 'postgresql://user:password@localhost:5432/database'
        }
      ]
    },
    'express-api': {
      name: 'Express API',
      description: 'Environment configuration for Express.js API servers',
      framework: 'express',
      variables: [
        {
          key: 'NODE_ENV',
          value: 'development',
          description: 'Node.js environment',
          required: true,
          type: 'string',
          category: 'app'
        },
        {
          key: 'PORT',
          value: '5000',
          description: 'Server port number',
          required: true,
          type: 'number',
          category: 'app'
        },
        {
          key: 'JWT_SECRET',
          value: '',
          description: 'Secret key for JWT token signing',
          required: true,
          type: 'secret',
          category: 'auth',
          example: 'your-jwt-secret-key'
        },
        {
          key: 'JWT_EXPIRE',
          value: '7d',
          description: 'JWT token expiration time',
          required: false,
          type: 'string',
          category: 'auth',
          example: '1d, 7d, 30d'
        },
        {
          key: 'DATABASE_URL',
          value: '',
          description: 'Database connection string',
          required: true,
          type: 'url',
          category: 'database'
        },
        {
          key: 'CORS_ORIGIN',
          value: 'http://localhost:3000',
          description: 'Allowed CORS origins',
          required: true,
          type: 'url',
          category: 'app'
        }
      ]
    },
    'vue-spa': {
      name: 'Vue.js SPA',
      description: 'Environment configuration for Vue.js single page applications',
      framework: 'vue',
      variables: [
        {
          key: 'VUE_APP_NAME',
          value: '',
          description: 'Application name',
          required: false,
          type: 'string',
          category: 'app'
        },
        {
          key: 'VUE_APP_API_URL',
          value: 'http://localhost:5000/api',
          description: 'Backend API base URL',
          required: true,
          type: 'url',
          category: 'api'
        },
        {
          key: 'VUE_APP_ENVIRONMENT',
          value: 'development',
          description: 'Application environment',
          required: true,
          type: 'string',
          category: 'app'
        }
      ]
    }
  };

  private commonVariables: EnvironmentVariable[] = [
    {
      key: 'OPENAI_API_KEY',
      value: '',
      description: 'OpenAI API key for AI features',
      required: false,
      type: 'secret',
      category: 'api',
      example: 'sk-...'
    },
    {
      key: 'STRIPE_PUBLISHABLE_KEY',
      value: '',
      description: 'Stripe publishable key for payments',
      required: false,
      type: 'string',
      category: 'api',
      example: 'pk_test_...'
    },
    {
      key: 'STRIPE_SECRET_KEY',
      value: '',
      description: 'Stripe secret key for payments',
      required: false,
      type: 'secret',
      category: 'api',
      example: 'sk_test_...'
    },
    {
      key: 'GOOGLE_CLIENT_ID',
      value: '',
      description: 'Google OAuth client ID',
      required: false,
      type: 'string',
      category: 'auth',
      example: '123456789-abc.googleusercontent.com'
    },
    {
      key: 'GOOGLE_CLIENT_SECRET',
      value: '',
      description: 'Google OAuth client secret',
      required: false,
      type: 'secret',
      category: 'auth'
    },
    {
      key: 'GITHUB_CLIENT_ID',
      value: '',
      description: 'GitHub OAuth client ID',
      required: false,
      type: 'string',
      category: 'auth'
    },
    {
      key: 'GITHUB_CLIENT_SECRET',
      value: '',
      description: 'GitHub OAuth client secret',
      required: false,
      type: 'secret',
      category: 'auth'
    },
    {
      key: 'EMAIL_FROM',
      value: '',
      description: 'Email address for sending emails',
      required: false,
      type: 'string',
      category: 'api',
      example: 'noreply@yourapp.com'
    },
    {
      key: 'SMTP_HOST',
      value: '',
      description: 'SMTP server host',
      required: false,
      type: 'string',
      category: 'api',
      example: 'smtp.gmail.com'
    },
    {
      key: 'SMTP_PORT',
      value: '587',
      description: 'SMTP server port',
      required: false,
      type: 'number',
      category: 'api'
    },
    {
      key: 'SMTP_USER',
      value: '',
      description: 'SMTP username',
      required: false,
      type: 'string',
      category: 'api'
    },
    {
      key: 'SMTP_PASS',
      value: '',
      description: 'SMTP password',
      required: false,
      type: 'secret',
      category: 'api'
    },
    {
      key: 'REDIS_URL',
      value: 'redis://localhost:6379',
      description: 'Redis connection URL for caching',
      required: false,
      type: 'url',
      category: 'database'
    },
    {
      key: 'LOG_LEVEL',
      value: 'info',
      description: 'Application log level',
      required: false,
      type: 'string',
      category: 'monitoring',
      validation: 'error|warn|info|debug'
    },
    {
      key: 'SENTRY_DSN',
      value: '',
      description: 'Sentry DSN for error tracking',
      required: false,
      type: 'url',
      category: 'monitoring'
    }
  ];

  generateEnvironmentFile(
    framework: string,
    features: string[] = [],
    customVariables: EnvironmentVariable[] = []
  ): string {
    const template = this.getTemplate(framework);
    const variables = [...template.variables];

    // Add feature-specific variables
    features.forEach(feature => {
      variables.push(...this.getFeatureVariables(feature));
    });

    // Add custom variables
    variables.push(...customVariables);

    // Sort variables by category and importance
    const sortedVariables = this.sortVariables(variables);

    return this.formatEnvironmentFile(sortedVariables, false);
  }

  generateEnvironmentExample(
    framework: string,
    features: string[] = [],
    customVariables: EnvironmentVariable[] = []
  ): string {
    const template = this.getTemplate(framework);
    const variables = [...template.variables];

    // Add feature-specific variables
    features.forEach(feature => {
      variables.push(...this.getFeatureVariables(feature));
    });

    // Add custom variables
    variables.push(...customVariables);

    // Sort variables by category and importance
    const sortedVariables = this.sortVariables(variables);

    return this.formatEnvironmentFile(sortedVariables, true);
  }

  generateDockerEnv(
    framework: string,
    features: string[] = []
  ): string {
    const baseVariables: EnvironmentVariable[] = [
      {
        key: 'NODE_ENV',
        value: 'production',
        description: 'Node.js environment for Docker',
        required: true,
        type: 'string',
        category: 'app'
      },
      {
        key: 'PORT',
        value: '3000',
        description: 'Container port',
        required: true,
        type: 'number',
        category: 'app'
      }
    ];

    const template = this.getTemplate(framework);
    const variables = [...baseVariables, ...template.variables];

    // Add feature-specific variables
    features.forEach(feature => {
      variables.push(...this.getFeatureVariables(feature));
    });

    // Filter out development-specific variables
    const productionVariables = variables.filter(v => 
      !v.key.includes('localhost') && 
      !v.value.includes('localhost')
    );

    return this.formatEnvironmentFile(productionVariables, true);
  }

  generateKubernetesConfigMap(
    framework: string,
    appName: string,
    features: string[] = []
  ): string {
    const template = this.getTemplate(framework);
    const variables = [...template.variables];

    // Add feature-specific variables
    features.forEach(feature => {
      variables.push(...this.getFeatureVariables(feature));
    });

    // Filter non-secret variables for ConfigMap
    const configVariables = variables.filter(v => v.type !== 'secret');

    let yaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${appName}-config
  labels:
    app: ${appName}
data:
`;

    configVariables.forEach(variable => {
      const value = variable.example || variable.value || '';
      yaml += `  ${variable.key}: "${value}"\n`;
    });

    return yaml;
  }

  generateKubernetesSecret(
    framework: string,
    appName: string,
    features: string[] = []
  ): string {
    const template = this.getTemplate(framework);
    const variables = [...template.variables];

    // Add feature-specific variables
    features.forEach(feature => {
      variables.push(...this.getFeatureVariables(feature));
    });

    // Filter secret variables for Secret
    const secretVariables = variables.filter(v => v.type === 'secret');

    let yaml = `apiVersion: v1
kind: Secret
metadata:
  name: ${appName}-secrets
  labels:
    app: ${appName}
type: Opaque
stringData:
`;

    secretVariables.forEach(variable => {
      yaml += `  ${variable.key}: ""\n`;
    });

    return yaml;
  }

  private getTemplate(framework: string): EnvironmentTemplate {
    const templateKey = this.findTemplateKey(framework);
    return this.templates[templateKey] || this.templates['react-basic'];
  }

  private findTemplateKey(framework: string): string {
    if (framework === 'react') return 'react-basic';
    if (framework === 'next') return 'next-fullstack';
    if (framework === 'express') return 'express-api';
    if (framework === 'vue') return 'vue-spa';
    return 'react-basic';
  }

  private getFeatureVariables(feature: string): EnvironmentVariable[] {
    const featureVariables: Record<string, EnvironmentVariable[]> = {
      'authentication': this.commonVariables.filter(v => v.category === 'auth'),
      'payments': this.commonVariables.filter(v => v.key.includes('STRIPE')),
      'ai': this.commonVariables.filter(v => v.key.includes('OPENAI')),
      'email': this.commonVariables.filter(v => v.key.includes('EMAIL') || v.key.includes('SMTP')),
      'monitoring': this.commonVariables.filter(v => v.category === 'monitoring'),
      'caching': this.commonVariables.filter(v => v.key.includes('REDIS'))
    };

    return featureVariables[feature] || [];
  }

  private sortVariables(variables: EnvironmentVariable[]): EnvironmentVariable[] {
    const categoryOrder = ['app', 'database', 'auth', 'api', 'deployment', 'monitoring'];
    
    return variables.sort((a, b) => {
      // Sort by category first
      const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      if (categoryDiff !== 0) return categoryDiff;
      
      // Then by required status (required first)
      if (a.required !== b.required) return a.required ? -1 : 1;
      
      // Finally by alphabetical order
      return a.key.localeCompare(b.key);
    });
  }

  private formatEnvironmentFile(variables: EnvironmentVariable[], isExample: boolean): string {
    let content = `# Environment Configuration
# Generated by VibeCoding Platform
# 
# Copy this file to .env and update the values
# Never commit .env files to version control!

`;

    const categories = this.groupByCategory(variables);

    Object.entries(categories).forEach(([category, vars]) => {
      content += `# ${category.toUpperCase()} CONFIGURATION\n`;
      content += `# ${'-'.repeat(50)}\n\n`;

      vars.forEach(variable => {
        // Add description as comment
        content += `# ${variable.description}\n`;
        
        if (variable.example) {
          content += `# Example: ${variable.example}\n`;
        }
        
        if (variable.validation) {
          content += `# Valid values: ${variable.validation}\n`;
        }
        
        if (variable.required) {
          content += `# REQUIRED\n`;
        }
        
        // Add the variable
        const value = isExample ? (variable.example || '') : variable.value;
        content += `${variable.key}=${value}\n\n`;
      });
    });

    content += `# Additional Notes:
# - Restart your application after changing environment variables
# - Use strong, unique values for secrets and API keys
# - Consider using a password manager for sensitive values
# - For production, use your hosting platform's environment variable system
`;

    return content;
  }

  private groupByCategory(variables: EnvironmentVariable[]): Record<string, EnvironmentVariable[]> {
    return variables.reduce((groups, variable) => {
      const category = variable.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(variable);
      return groups;
    }, {} as Record<string, EnvironmentVariable[]>);
  }

  getAvailableTemplates(): { key: string; name: string; description: string; framework: string; }[] {
    return Object.entries(this.templates).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description,
      framework: template.framework
    }));
  }

  getTemplateVariables(templateKey: string): EnvironmentVariable[] {
    return this.templates[templateKey]?.variables || [];
  }

  getCommonVariables(): EnvironmentVariable[] {
    return this.commonVariables;
  }

  validateEnvironmentFile(content: string): { valid: boolean; errors: string[]; warnings: string[]; } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const lines = content.split('\n');
    const variables = new Set<string>();
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) return;
      
      // Check for valid variable format
      if (!trimmed.includes('=')) {
        errors.push(`Line ${index + 1}: Invalid format. Expected KEY=value`);
        return;
      }
      
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      
      // Check for duplicate variables
      if (variables.has(key)) {
        warnings.push(`Line ${index + 1}: Duplicate variable "${key}"`);
      }
      variables.add(key);
      
      // Check for common issues
      if (!key) {
        errors.push(`Line ${index + 1}: Empty variable name`);
      }
      
      if (key.includes(' ')) {
        errors.push(`Line ${index + 1}: Variable name "${key}" contains spaces`);
      }
      
      if (key.toLowerCase() !== key.toUpperCase() && key !== key.toUpperCase()) {
        warnings.push(`Line ${index + 1}: Variable "${key}" should be UPPERCASE`);
      }
      
      // Check for potentially sensitive values
      if (value && !value.startsWith('"') && !value.startsWith("'")) {
        if (value.includes(' ') && !key.includes('URL')) {
          warnings.push(`Line ${index + 1}: Value for "${key}" contains spaces, consider quoting`);
        }
      }
      
      // Check for empty required values (basic check)
      if (!value && key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')) {
        warnings.push(`Line ${index + 1}: "${key}" appears to be required but is empty`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const environmentConfigGenerator = new EnvironmentConfigGenerator();