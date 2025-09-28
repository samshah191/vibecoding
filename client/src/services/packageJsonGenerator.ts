interface ProjectDependencies {
  [key: string]: string;
}

interface ProjectMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository?: {
    type: string;
    url: string;
  };
  keywords?: string[];
}

interface PackageJsonConfig {
  framework: 'react' | 'vue' | 'angular' | 'next' | 'nuxt' | 'svelte' | 'vanilla';
  language: 'typescript' | 'javascript';
  styling: 'tailwind' | 'styled-components' | 'emotion' | 'sass' | 'css';
  stateManagement?: 'redux' | 'zustand' | 'mobx' | 'recoil' | 'context' | 'pinia';
  router?: 'react-router' | 'vue-router' | 'angular-router' | 'next-router';
  testing?: 'jest' | 'vitest' | 'cypress' | 'testing-library';
  bundler?: 'vite' | 'webpack' | 'parcel' | 'rollup';
  backend?: 'express' | 'fastify' | 'nest' | 'koa' | 'hapi';
  database?: 'prisma' | 'mongoose' | 'sequelize' | 'typeorm' | 'drizzle';
  authentication?: 'auth0' | 'firebase' | 'supabase' | 'clerk' | 'nextauth';
  deployment?: 'vercel' | 'netlify' | 'heroku' | 'aws' | 'docker';
  features?: string[];
}

export class PackageJsonGenerator {
  private dependencyVersions: Record<string, ProjectDependencies> = {
    react: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0'
    },
    vue: {
      'vue': '^3.3.0',
      '@vue/cli-service': '^5.0.0',
      '@vue/compiler-sfc': '^3.3.0'
    },
    angular: {
      '@angular/core': '^16.0.0',
      '@angular/common': '^16.0.0',
      '@angular/platform-browser': '^16.0.0',
      '@angular/platform-browser-dynamic': '^16.0.0'
    },
    next: {
      'next': '^14.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0'
    },
    nuxt: {
      'nuxt': '^3.8.0',
      'vue': '^3.3.0'
    },
    svelte: {
      'svelte': '^4.0.0',
      '@sveltejs/kit': '^1.20.0'
    },
    typescript: {
      'typescript': '^5.0.0',
      '@types/node': '^20.0.0',
      'ts-node': '^10.9.0'
    },
    tailwind: {
      'tailwindcss': '^3.3.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0'
    },
    'styled-components': {
      'styled-components': '^6.0.0',
      '@types/styled-components': '^5.1.0'
    },
    emotion: {
      '@emotion/react': '^11.11.0',
      '@emotion/styled': '^11.11.0'
    },
    sass: {
      'sass': '^1.66.0',
      'sass-loader': '^13.3.0'
    },
    redux: {
      '@reduxjs/toolkit': '^1.9.0',
      'react-redux': '^8.1.0'
    },
    zustand: {
      'zustand': '^4.4.0'
    },
    mobx: {
      'mobx': '^6.10.0',
      'mobx-react-lite': '^4.0.0'
    },
    recoil: {
      'recoil': '^0.7.0'
    },
    pinia: {
      'pinia': '^2.1.0'
    },
    'react-router': {
      'react-router-dom': '^6.15.0'
    },
    'vue-router': {
      'vue-router': '^4.2.0'
    },
    jest: {
      'jest': '^29.6.0',
      '@testing-library/jest-dom': '^6.1.0'
    },
    vitest: {
      'vitest': '^0.34.0'
    },
    cypress: {
      'cypress': '^13.0.0'
    },
    'testing-library': {
      '@testing-library/react': '^13.4.0',
      '@testing-library/user-event': '^14.4.0'
    },
    vite: {
      'vite': '^4.4.0',
      '@vitejs/plugin-react': '^4.0.0'
    },
    webpack: {
      'webpack': '^5.88.0',
      'webpack-cli': '^5.1.0',
      'webpack-dev-server': '^4.15.0'
    },
    express: {
      'express': '^4.18.0',
      '@types/express': '^4.17.0',
      'cors': '^2.8.0',
      'helmet': '^7.0.0'
    },
    fastify: {
      'fastify': '^4.21.0',
      '@fastify/cors': '^8.3.0'
    },
    nest: {
      '@nestjs/core': '^10.0.0',
      '@nestjs/common': '^10.0.0',
      '@nestjs/platform-express': '^10.0.0'
    },
    prisma: {
      'prisma': '^5.2.0',
      '@prisma/client': '^5.2.0'
    },
    mongoose: {
      'mongoose': '^7.5.0',
      '@types/mongoose': '^5.11.0'
    },
    auth0: {
      '@auth0/auth0-react': '^2.2.0'
    },
    firebase: {
      'firebase': '^10.1.0'
    },
    supabase: {
      '@supabase/supabase-js': '^2.26.0'
    }
  };

  private buildScripts: Record<string, Record<string, string>> = {
    react: {
      'start': 'react-scripts start',
      'build': 'react-scripts build',
      'test': 'react-scripts test',
      'eject': 'react-scripts eject'
    },
    'react-vite': {
      'dev': 'vite',
      'build': 'tsc && vite build',
      'preview': 'vite preview',
      'test': 'vitest'
    },
    vue: {
      'serve': 'vue-cli-service serve',
      'build': 'vue-cli-service build',
      'test:unit': 'vue-cli-service test:unit',
      'lint': 'vue-cli-service lint'
    },
    'vue-vite': {
      'dev': 'vite',
      'build': 'vue-tsc --noEmit && vite build',
      'preview': 'vite preview'
    },
    angular: {
      'ng': 'ng',
      'start': 'ng serve',
      'build': 'ng build',
      'test': 'ng test',
      'lint': 'ng lint'
    },
    next: {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start',
      'lint': 'next lint'
    },
    nuxt: {
      'build': 'nuxt build',
      'dev': 'nuxt dev',
      'generate': 'nuxt generate',
      'preview': 'nuxt preview'
    },
    svelte: {
      'dev': 'vite dev',
      'build': 'vite build',
      'preview': 'vite preview'
    },
    express: {
      'start': 'node dist/index.js',
      'dev': 'ts-node-dev --respawn --transpile-only src/index.ts',
      'build': 'tsc',
      'test': 'jest'
    }
  };

  generatePackageJson(config: PackageJsonConfig, metadata: ProjectMetadata): object {
    const packageJson: any = {
      name: metadata.name,
      version: metadata.version,
      description: metadata.description,
      author: metadata.author,
      license: metadata.license,
      private: true,
      scripts: this.generateScripts(config),
      dependencies: this.generateDependencies(config),
      devDependencies: this.generateDevDependencies(config),
      ...(metadata.repository && { repository: metadata.repository }),
      ...(metadata.keywords && { keywords: metadata.keywords })
    };

    // Add framework-specific configurations
    this.addFrameworkSpecificConfig(packageJson, config);

    return packageJson;
  }

  private generateScripts(config: PackageJsonConfig): Record<string, string> {
    let scripts: Record<string, string> = {};

    // Base scripts based on framework and bundler
    if (config.framework === 'react') {
      scripts = config.bundler === 'vite' 
        ? { ...this.buildScripts['react-vite'] }
        : { ...this.buildScripts.react };
    } else if (config.framework === 'vue') {
      scripts = config.bundler === 'vite'
        ? { ...this.buildScripts['vue-vite'] }
        : { ...this.buildScripts.vue };
    } else if (config.framework in this.buildScripts) {
      scripts = { ...this.buildScripts[config.framework] };
    }

    // Add backend scripts if backend framework is specified
    if (config.backend && config.backend in this.buildScripts) {
      const backendScripts = this.buildScripts[config.backend];
      Object.keys(backendScripts).forEach(key => {
        scripts[`server:${key}`] = backendScripts[key];
      });
    }

    // Add testing scripts
    if (config.testing === 'cypress') {
      scripts['test:e2e'] = 'cypress run';
      scripts['test:e2e:open'] = 'cypress open';
    }

    // Add linting and formatting scripts
    scripts['lint'] = config.language === 'typescript' 
      ? 'eslint . --ext .ts,.tsx --fix'
      : 'eslint . --ext .js,.jsx --fix';
    scripts['format'] = 'prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}"';

    // Add Docker scripts if deployment includes docker
    if (config.deployment === 'docker') {
      scripts['docker:build'] = 'docker build -t app .';
      scripts['docker:run'] = 'docker run -p 3000:3000 app';
      scripts['docker:compose'] = 'docker-compose up --build';
    }

    return scripts;
  }

  private generateDependencies(config: PackageJsonConfig): ProjectDependencies {
    let dependencies: ProjectDependencies = {};

    // Framework dependencies
    if (config.framework in this.dependencyVersions) {
      dependencies = { ...dependencies, ...this.dependencyVersions[config.framework] };
    }

    // Language dependencies
    if (config.language === 'typescript' && config.framework !== 'angular') {
      dependencies = { ...dependencies, ...this.dependencyVersions.typescript };
    }

    // Styling dependencies
    if (config.styling in this.dependencyVersions) {
      dependencies = { ...dependencies, ...this.dependencyVersions[config.styling] };
    }

    // State management
    if (config.stateManagement && config.stateManagement in this.dependencyVersions) {
      dependencies = { ...dependencies, ...this.dependencyVersions[config.stateManagement] };
    }

    // Router
    if (config.router && config.router in this.dependencyVersions) {
      dependencies = { ...dependencies, ...this.dependencyVersions[config.router] };
    }

    // Backend dependencies
    if (config.backend && config.backend in this.dependencyVersions) {
      dependencies = { ...dependencies, ...this.dependencyVersions[config.backend] };
    }

    // Database dependencies
    if (config.database && config.database in this.dependencyVersions) {
      dependencies = { ...dependencies, ...this.dependencyVersions[config.database] };
    }

    // Authentication dependencies
    if (config.authentication && config.authentication in this.dependencyVersions) {
      dependencies = { ...dependencies, ...this.dependencyVersions[config.authentication] };
    }

    // Feature-specific dependencies
    if (config.features) {
      config.features.forEach(feature => {
        if (feature in this.dependencyVersions) {
          dependencies = { ...dependencies, ...this.dependencyVersions[feature] };
        }
      });
    }

    return dependencies;
  }

  private generateDevDependencies(config: PackageJsonConfig): ProjectDependencies {
    let devDependencies: ProjectDependencies = {};

    // Bundler dependencies
    if (config.bundler && config.bundler in this.dependencyVersions) {
      devDependencies = { ...devDependencies, ...this.dependencyVersions[config.bundler] };
    }

    // Testing dependencies
    if (config.testing && config.testing in this.dependencyVersions) {
      devDependencies = { ...devDependencies, ...this.dependencyVersions[config.testing] };
    }

    // TypeScript dev dependencies
    if (config.language === 'typescript') {
      devDependencies = {
        ...devDependencies,
        'typescript': '^5.0.0',
        '@types/node': '^20.0.0'
      };

      if (config.framework === 'react') {
        devDependencies['@types/react'] = '^18.2.0';
        devDependencies['@types/react-dom'] = '^18.2.0';
      }
    }

    // ESLint and Prettier
    devDependencies = {
      ...devDependencies,
      'eslint': '^8.47.0',
      'prettier': '^3.0.0',
      '@typescript-eslint/eslint-plugin': '^6.4.0',
      '@typescript-eslint/parser': '^6.4.0'
    };

    // Framework-specific dev dependencies
    if (config.framework === 'react') {
      devDependencies = {
        ...devDependencies,
        'eslint-plugin-react': '^7.33.0',
        'eslint-plugin-react-hooks': '^4.6.0'
      };
    }

    // Development server dependencies
    if (config.backend === 'express') {
      devDependencies = {
        ...devDependencies,
        'ts-node-dev': '^2.0.0',
        'nodemon': '^3.0.0'
      };
    }

    return devDependencies;
  }

  private addFrameworkSpecificConfig(packageJson: any, config: PackageJsonConfig): void {
    // Add browserslist for React
    if (config.framework === 'react') {
      packageJson.browserslist = {
        production: [
          '>0.2%',
          'not dead',
          'not op_mini all'
        ],
        development: [
          'last 1 chrome version',
          'last 1 firefox version',
          'last 1 safari version'
        ]
      };
    }

    // Add engines field
    packageJson.engines = {
      node: '>=18.0.0',
      npm: '>=8.0.0'
    };

    // Add ESLint config for specific frameworks
    if (config.framework === 'react') {
      packageJson.eslintConfig = {
        extends: [
          'react-app',
          'react-app/jest'
        ]
      };
    }

    // Add Prettier config
    packageJson.prettier = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2
    };

    // Add type field for modern packages
    if (config.bundler === 'vite' || config.framework === 'next') {
      packageJson.type = 'module';
    }
  }

  generateTsConfig(config: PackageJsonConfig): any {
    const baseConfig: any = {
      compilerOptions: {
        target: 'ES2020',
        lib: ['DOM', 'DOM.Iterable', 'ES6'],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noFallthroughCasesInSwitch: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx'
      },
      include: [
        'src'
      ],
      exclude: [
        'node_modules'
      ]
    };

    // Framework-specific adjustments
    if (config.framework === 'next') {
      baseConfig.compilerOptions = {
        ...baseConfig.compilerOptions,
        incremental: true,
        plugins: [
          {
            name: 'next'
          }
        ],
        paths: {
          '@/*': ['./src/*']
        }
      };
      baseConfig.include = ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'];
    }

    if (config.framework === 'vue') {
      baseConfig.compilerOptions.jsx = 'preserve';
      baseConfig.include = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'];
    }

    if (config.backend) {
      baseConfig.compilerOptions.noEmit = false;
      baseConfig.compilerOptions.outDir = './dist';
      baseConfig.compilerOptions.rootDir = './src';
    }

    return baseConfig;
  }

  generateEslintConfig(config: PackageJsonConfig): any {
    const baseConfig: any = {
      env: {
        browser: true,
        es2021: true,
        node: true
      },
      extends: [
        'eslint:recommended'
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      plugins: [],
      rules: {
        'indent': ['error', 2],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always']
      }
    };

    if (config.language === 'typescript') {
      baseConfig.extends.push('@typescript-eslint/recommended');
      baseConfig.plugins.push('@typescript-eslint');
    }

    if (config.framework === 'react') {
      baseConfig.extends.push('plugin:react/recommended', 'plugin:react-hooks/recommended');
      baseConfig.plugins.push('react', 'react-hooks');
      baseConfig.parserOptions = {
        ...baseConfig.parserOptions,
        ecmaFeatures: {
          jsx: true
        }
      };
      baseConfig.rules = {
        ...baseConfig.rules,
        'react/react-in-jsx-scope': 'off'
      };
    }

    if (config.framework === 'vue') {
      baseConfig.extends.push('plugin:vue/vue3-essential');
      baseConfig.plugins.push('vue');
    }

    return baseConfig;
  }
}

export const packageJsonGenerator = new PackageJsonGenerator();