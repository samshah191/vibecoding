import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface ExportFile {
  path: string;
  content: string;
  type: 'file' | 'folder';
}

export interface ExportOptions {
  includeNodeModules?: boolean;
  includeDotFiles?: boolean;
  includeDocumentation?: boolean;
  includeTests?: boolean;
  format?: 'zip' | 'tar';
  compression?: 'none' | 'deflate' | 'store';
}

export interface ProjectExportData {
  name: string;
  description: string;
  version: string;
  framework: string;
  language: string;
  files: ExportFile[];
  packageJson?: any;
  readmeContent?: string;
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
}

class CodeExportService {
  /**
   * Export project as ZIP file
   */
  async exportAsZip(
    projectData: ProjectExportData,
    options: ExportOptions = {}
  ): Promise<void> {
    const {
      includeNodeModules = false,
      includeDotFiles = true,
      includeDocumentation = true,
      includeTests = true,
      compression = 'deflate'
    } = options;

    try {
      const zip = new JSZip();
      
      // Add project files
      await this.addFilesToZip(zip, projectData.files, {
        includeNodeModules,
        includeDotFiles,
        includeTests
      });

      // Add package.json
      if (projectData.packageJson) {
        zip.file('package.json', JSON.stringify(projectData.packageJson, null, 2));
      } else {
        zip.file('package.json', this.generatePackageJson(projectData));
      }

      // Add README.md
      if (includeDocumentation) {
        const readmeContent = projectData.readmeContent || this.generateReadme(projectData);
        zip.file('README.md', readmeContent);
      }

      // Add .gitignore
      if (includeDotFiles) {
        zip.file('.gitignore', this.generateGitignore(projectData.framework));
      }

      // Add framework-specific config files
      this.addFrameworkConfigs(zip, projectData.framework, projectData.language);

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: compression === 'none' ? 'STORE' : 'DEFLATE',
        compressionOptions: {
          level: compression === 'deflate' ? 6 : 0
        }
      });

      const fileName = `${projectData.name.toLowerCase().replace(/\s+/g, '-')}-${projectData.version || '1.0.0'}.zip`;
      saveAs(zipBlob, fileName);

    } catch (error) {
      console.error('Failed to export project:', error);
      throw new Error('Failed to export project as ZIP');
    }
  }

  /**
   * Export individual component
   */
  async exportComponent(
    componentName: string,
    componentCode: string,
    componentType: string = 'tsx'
  ): Promise<void> {
    try {
      const blob = new Blob([componentCode], { type: 'text/plain;charset=utf-8' });
      const fileName = `${componentName}.${componentType}`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Failed to export component:', error);
      throw new Error('Failed to export component');
    }
  }

  /**
   * Export multiple components as ZIP
   */
  async exportComponents(
    components: { name: string; code: string; type: string; path?: string }[],
    projectName: string = 'components'
  ): Promise<void> {
    try {
      const zip = new JSZip();
      
      components.forEach(component => {
        const filePath = component.path || `${component.name}.${component.type}`;
        zip.file(filePath, component.code);
      });

      // Add a simple README for the components
      const readmeContent = this.generateComponentsReadme(components, projectName);
      zip.file('README.md', readmeContent);

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE'
      });

      const fileName = `${projectName.toLowerCase().replace(/\s+/g, '-')}-components.zip`;
      saveAs(zipBlob, fileName);

    } catch (error) {
      console.error('Failed to export components:', error);
      throw new Error('Failed to export components');
    }
  }

  /**
   * Create project structure preview
   */
  generateProjectStructure(files: ExportFile[]): string {
    const structure: string[] = [];
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));
    
    sortedFiles.forEach(file => {
      const depth = (file.path.match(/\//g) || []).length;
      const indent = '  '.repeat(depth);
      const fileName = file.path.split('/').pop() || file.path;
      const icon = file.type === 'folder' ? '📁' : this.getFileIcon(fileName);
      
      structure.push(`${indent}${icon} ${fileName}`);
    });

    return structure.join('\n');
  }

  /**
   * Get export statistics
   */
  getExportStats(files: ExportFile[]): {
    totalFiles: number;
    totalSize: number;
    fileTypes: { [key: string]: number };
    structure: string;
  } {
    const stats = {
      totalFiles: files.filter(f => f.type === 'file').length,
      totalSize: files.reduce((sum, file) => sum + (file.content?.length || 0), 0),
      fileTypes: {} as { [key: string]: number },
      structure: this.generateProjectStructure(files)
    };

    files.forEach(file => {
      if (file.type === 'file') {
        const ext = file.path.split('.').pop()?.toLowerCase() || 'unknown';
        stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
      }
    });

    return stats;
  }

  // Private helper methods
  private async addFilesToZip(
    zip: JSZip,
    files: ExportFile[],
    options: { includeNodeModules: boolean; includeDotFiles: boolean; includeTests: boolean }
  ): Promise<void> {
    for (const file of files) {
      // Skip certain files based on options
      if (!options.includeNodeModules && file.path.includes('node_modules')) continue;
      if (!options.includeDotFiles && file.path.startsWith('.')) continue;
      if (!options.includeTests && this.isTestFile(file.path)) continue;

      if (file.type === 'file' && file.content) {
        zip.file(file.path, file.content);
      } else if (file.type === 'folder') {
        zip.folder(file.path);
      }
    }
  }

  private generatePackageJson(projectData: ProjectExportData): string {
    const packageJson = {
      name: projectData.name.toLowerCase().replace(/\s+/g, '-'),
      version: projectData.version || '1.0.0',
      description: projectData.description || 'Generated by VibeCoding',
      private: true,
      scripts: this.getScriptsForFramework(projectData.framework),
      dependencies: projectData.dependencies || this.getDefaultDependencies(projectData.framework),
      devDependencies: projectData.devDependencies || this.getDefaultDevDependencies(projectData.framework, projectData.language),
      keywords: ['vibecoding', 'generated', projectData.framework],
      author: 'VibeCoding AI',
      license: 'MIT'
    };

    return JSON.stringify(packageJson, null, 2);
  }

  private generateReadme(projectData: ProjectExportData): string {
    return `# ${projectData.name}

${projectData.description || 'A project generated by VibeCoding AI'}

## Technology Stack

- **Framework:** ${projectData.framework}
- **Language:** ${projectData.language}
- **Version:** ${projectData.version || '1.0.0'}

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or extract this project
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

${this.getScriptDocumentation(projectData.framework)}

## Project Structure

\`\`\`
${this.generateProjectStructure(projectData.files)}
\`\`\`

## Built with VibeCoding

This project was generated using [VibeCoding](https://vibecoding.com) - AI-powered application development platform.

## License

This project is licensed under the MIT License.
`;
  }

  private generateComponentsReadme(
    components: { name: string; code: string; type: string; path?: string }[],
    projectName: string
  ): string {
    return `# ${projectName} Components

This package contains ${components.length} reusable components exported from VibeCoding.

## Components

${components.map(comp => `- **${comp.name}** (${comp.type})`).join('\n')}

## Usage

Each component is self-contained and can be imported into your project:

\`\`\`javascript
import { ${components[0]?.name} } from './${components[0]?.name}';
\`\`\`

## Generated by VibeCoding

These components were generated using [VibeCoding](https://vibecoding.com) - AI-powered application development platform.
`;
  }

  private generateGitignore(framework: string): string {
    const common = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
`;

    const frameworkSpecific: { [key: string]: string } = {
      react: `
# React
.eslintcache
`,
      nextjs: `
# Next.js
.next/
out/
`,
      vue: `
# Vue
.nuxt/
`,
      angular: `
# Angular
/tmp/
/out-tsc/
*.tsbuildinfo
`
    };

    return common + (frameworkSpecific[framework.toLowerCase()] || '');
  }

  private addFrameworkConfigs(zip: JSZip, framework: string, language: string): void {
    const configs: { [key: string]: () => void } = {
      react: () => {
        if (language === 'TypeScript') {
          zip.file('tsconfig.json', this.generateTSConfig('react'));
        }
        zip.file('.eslintrc.json', this.generateESLintConfig('react'));
      },
      nextjs: () => {
        zip.file('next.config.js', this.generateNextConfig());
        if (language === 'TypeScript') {
          zip.file('tsconfig.json', this.generateTSConfig('nextjs'));
        }
      },
      vue: () => {
        zip.file('vite.config.js', this.generateViteConfig());
        if (language === 'TypeScript') {
          zip.file('tsconfig.json', this.generateTSConfig('vue'));
        }
      },
      angular: () => {
        zip.file('angular.json', this.generateAngularConfig());
        if (language === 'TypeScript') {
          zip.file('tsconfig.json', this.generateTSConfig('angular'));
        }
      }
    };

    const configGenerator = configs[framework.toLowerCase()];
    if (configGenerator) {
      configGenerator();
    }
  }

  private getScriptsForFramework(framework: string): { [key: string]: string } {
    const scripts: { [key: string]: { [key: string]: string } } = {
      react: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject'
      },
      nextjs: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      vue: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      angular: {
        ng: 'ng',
        start: 'ng serve',
        build: 'ng build',
        test: 'ng test',
        lint: 'ng lint'
      }
    };

    return scripts[framework.toLowerCase()] || scripts.react;
  }

  private getDefaultDependencies(framework: string): { [key: string]: string } {
    const deps: { [key: string]: { [key: string]: string } } = {
      react: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-scripts': '^5.0.1'
      },
      nextjs: {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      vue: {
        vue: '^3.3.0',
        vite: '^4.0.0'
      },
      angular: {
        '@angular/animations': '^16.0.0',
        '@angular/common': '^16.0.0',
        '@angular/compiler': '^16.0.0',
        '@angular/core': '^16.0.0',
        '@angular/platform-browser': '^16.0.0',
        '@angular/platform-browser-dynamic': '^16.0.0',
        '@angular/router': '^16.0.0'
      }
    };

    return deps[framework.toLowerCase()] || deps.react;
  }

  private getDefaultDevDependencies(framework: string, language: string): { [key: string]: string } {
    const common: { [key: string]: string } = language === 'TypeScript' ? {
      typescript: '^5.0.0',
      '@types/node': '^20.0.0'
    } : {};

    const frameworkDevDeps: { [key: string]: { [key: string]: string } } = {
      react: {
        ...common,
        ...(language === 'TypeScript' ? {
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0'
        } : {})
      },
      nextjs: {
        ...common,
        ...(language === 'TypeScript' ? {
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0'
        } : {})
      },
      vue: {
        ...common,
        '@vitejs/plugin-vue': '^4.0.0'
      },
      angular: {
        ...common,
        '@angular/cli': '^16.0.0',
        '@angular/compiler-cli': '^16.0.0'
      }
    };

    return frameworkDevDeps[framework.toLowerCase()] || frameworkDevDeps.react;
  }

  private getScriptDocumentation(framework: string): string {
    const docs: { [key: string]: string } = {
      react: `- \`npm run start\` - Runs the app in development mode
- \`npm run build\` - Builds the app for production
- \`npm run test\` - Launches the test runner`,
      nextjs: `- \`npm run dev\` - Runs the app in development mode
- \`npm run build\` - Builds the app for production
- \`npm run start\` - Runs the built app in production mode`,
      vue: `- \`npm run dev\` - Runs the app in development mode
- \`npm run build\` - Builds the app for production
- \`npm run preview\` - Preview the production build`,
      angular: `- \`npm run start\` - Runs the app in development mode
- \`npm run build\` - Builds the app for production
- \`npm run test\` - Runs unit tests`
    };

    return docs[framework.toLowerCase()] || docs.react;
  }

  private generateTSConfig(framework: string): string {
    const configs: { [key: string]: any } = {
      react: {
        compilerOptions: {
          target: 'es5',
          lib: ['dom', 'dom.iterable', 'es6'],
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
        include: ['src']
      },
      nextjs: {
        compilerOptions: {
          target: 'es5',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'node',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: { '@/*': ['./src/*'] }
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules']
      }
    };

    return JSON.stringify(configs[framework] || configs.react, null, 2);
  }

  private generateESLintConfig(framework: string): string {
    const config = {
      extends: ['react-app', 'react-app/jest'],
      rules: {}
    };

    return JSON.stringify(config, null, 2);
  }

  private generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
`;
  }

  private generateViteConfig(): string {
    return `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
`;
  }

  private generateAngularConfig(): string {
    const config = {
      $schema: './node_modules/@angular/cli/lib/config/schema.json',
      version: 1,
      newProjectRoot: 'projects',
      projects: {
        app: {
          projectType: 'application',
          schematics: {},
          root: '',
          sourceRoot: 'src',
          prefix: 'app',
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:browser',
              options: {
                outputPath: 'dist',
                index: 'src/index.html',
                main: 'src/main.ts',
                polyfills: ['zone.js'],
                tsConfig: 'tsconfig.app.json',
                assets: ['src/favicon.ico', 'src/assets'],
                styles: ['src/styles.css'],
                scripts: []
              }
            }
          }
        }
      }
    };

    return JSON.stringify(config, null, 2);
  }

  private isTestFile(path: string): boolean {
    return /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(path) || 
           path.includes('__tests__') || 
           path.includes('/tests/');
  }

  private getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const icons: { [key: string]: string } = {
      js: '📄',
      jsx: '⚛️',
      ts: '🔷',
      tsx: '⚛️',
      vue: '💚',
      css: '🎨',
      scss: '🎨',
      html: '🌐',
      json: '📋',
      md: '📝',
      png: '🖼️',
      jpg: '🖼️',
      svg: '🎨',
      gif: '🖼️'
    };

    return icons[extension || ''] || '📄';
  }
}

export const codeExportService = new CodeExportService();
export default codeExportService;