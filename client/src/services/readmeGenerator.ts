interface ProjectMetadata {
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  repository?: string;
  homepage?: string;
  keywords?: string[];
}

interface TechStack {
  framework: string;
  language: string;
  styling: string;
  backend?: string;
  database?: string;
  authentication?: string;
  deployment?: string;
  testing?: string;
  features?: string[];
}

interface DeploymentConfig {
  platform: string;
  url?: string;
  environmentVariables?: string[];
  buildCommand?: string;
  startCommand?: string;
  nodeVersion?: string;
}

export class ReadmeGenerator {
  private emojiMap = {
    react: '⚛️',
    vue: '💚',
    angular: '🅰️',
    next: '▲',
    nuxt: '💚',
    svelte: '🧡',
    typescript: '🔷',
    javascript: '💛',
    tailwind: '🎨',
    'styled-components': '💅',
    emotion: '👩‍🎤',
    sass: '🎯',
    express: '🚀',
    fastify: '⚡',
    nest: '🐱',
    prisma: '🔺',
    mongoose: '🍃',
    postgresql: '🐘',
    mongodb: '🍃',
    mysql: '🐬',
    redis: '🔴',
    docker: '🐳',
    kubernetes: '☸️',
    vercel: '▲',
    netlify: '🌐',
    heroku: '🟣',
    aws: '☁️',
    jest: '🃏',
    vitest: '⚡',
    cypress: '🌲',
    auth0: '🔐',
    firebase: '🔥',
    supabase: '⚡'
  };

  generateReadme(
    metadata: ProjectMetadata,
    techStack: TechStack,
    deploymentConfig?: DeploymentConfig
  ): string {
    let readme = this.generateHeader(metadata, techStack);
    readme += this.generateBadges(metadata, techStack);
    readme += this.generateDescription(metadata);
    readme += this.generateTechStack(techStack);
    readme += this.generateFeatures(techStack.features || []);
    readme += this.generateQuickStart();
    readme += this.generateInstallation(techStack);
    readme += this.generateUsage(techStack);
    readme += this.generateEnvironmentSetup(techStack);
    readme += this.generateScripts(techStack);
    
    if (deploymentConfig) {
      readme += this.generateDeployment(deploymentConfig);
    }
    
    readme += this.generateProjectStructure(techStack);
    readme += this.generateAPIDocumentation(techStack);
    readme += this.generateTesting(techStack);
    readme += this.generateDocker(techStack);
    readme += this.generateContributing();
    readme += this.generateLicense(metadata);
    readme += this.generateSupport();
    readme += this.generateAcknowledgments(techStack);

    return readme;
  }

  private generateHeader(metadata: ProjectMetadata, techStack: TechStack): string {
    const mainEmoji = this.emojiMap[techStack.framework as keyof typeof this.emojiMap] || '🚀';
    
    return `# ${mainEmoji} ${metadata.name}

> ${metadata.description}

`;
  }

  private generateBadges(metadata: ProjectMetadata, techStack: TechStack): string {
    let badges = `## 📊 Badges

![Version](https://img.shields.io/badge/version-${metadata.version}-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-${metadata.license}-green.svg)
`;

    if (techStack.framework) {
      badges += `![${techStack.framework}](https://img.shields.io/badge/${techStack.framework}-Framework-blue.svg)\n`;
    }

    if (techStack.language === 'typescript') {
      badges += `![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)\n`;
    }

    if (metadata.repository) {
      badges += `![GitHub](https://img.shields.io/github/stars/${metadata.repository}?style=social)\n`;
    }

    return badges + '\n';
  }

  private generateDescription(metadata: ProjectMetadata): string {
    return `## 📖 Description

${metadata.description}

`;
  }

  private generateTechStack(techStack: TechStack): string {
    let content = `## 🛠️ Tech Stack

### Frontend
- **Framework:** ${this.getEmojiText(techStack.framework)} ${this.capitalize(techStack.framework)}
- **Language:** ${this.getEmojiText(techStack.language)} ${this.capitalize(techStack.language)}
- **Styling:** ${this.getEmojiText(techStack.styling)} ${this.capitalize(techStack.styling)}
`;

    if (techStack.backend) {
      content += `
### Backend
- **Server:** ${this.getEmojiText(techStack.backend)} ${this.capitalize(techStack.backend)}
`;
    }

    if (techStack.database) {
      content += `- **Database:** ${this.getEmojiText(techStack.database)} ${this.capitalize(techStack.database)}
`;
    }

    if (techStack.authentication) {
      content += `- **Authentication:** ${this.getEmojiText(techStack.authentication)} ${this.capitalize(techStack.authentication)}
`;
    }

    if (techStack.testing) {
      content += `
### Testing
- **Framework:** ${this.getEmojiText(techStack.testing)} ${this.capitalize(techStack.testing)}
`;
    }

    if (techStack.deployment) {
      content += `
### Deployment
- **Platform:** ${this.getEmojiText(techStack.deployment)} ${this.capitalize(techStack.deployment)}
`;
    }

    return content + '\n';
  }

  private generateFeatures(features: string[]): string {
    if (features.length === 0) return '';

    let content = `## ✨ Features

`;

    const featureDescriptions = {
      'authentication': '🔐 User authentication and authorization',
      'responsive': '📱 Responsive design for all devices',
      'dark-mode': '🌙 Dark mode support',
      'real-time': '⚡ Real-time updates',
      'api': '🔌 RESTful API integration',
      'database': '💾 Database integration',
      'testing': '🧪 Comprehensive testing suite',
      'deployment': '🚀 Production deployment ready',
      'docker': '🐳 Docker containerization',
      'typescript': '🔷 TypeScript support',
      'pwa': '📱 Progressive Web App',
      'seo': '🔍 SEO optimized',
      'analytics': '📊 Analytics integration',
      'error-tracking': '🐛 Error tracking and monitoring',
      'caching': '⚡ Performance optimization with caching',
      'i18n': '🌍 Internationalization support'
    };

    features.forEach(feature => {
      const description = featureDescriptions[feature as keyof typeof featureDescriptions] || `✅ ${this.capitalize(feature)}`;
      content += `- ${description}\n`;
    });

    return content + '\n';
  }

  private generateQuickStart(): string {
    return `## 🚀 Quick Start

\`\`\`bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd project-name

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your application running.

`;
  }

  private generateInstallation(techStack: TechStack): string {
    let content = `## 📥 Installation

### Prerequisites

- Node.js (>=18.0.0)
- npm, yarn, or pnpm
`;

    if (techStack.database === 'postgresql') {
      content += `- PostgreSQL (>=13.0)
`;
    } else if (techStack.database === 'mongodb') {
      content += `- MongoDB (>=5.0)
`;
    }

    if (techStack.deployment === 'docker') {
      content += `- Docker (>=20.0)
- Docker Compose (>=2.0)
`;
    }

    content += `
### Step-by-step Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd project-name
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   # Using npm
   npm install
   
   # Using yarn
   yarn install
   
   # Using pnpm
   pnpm install
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   # Copy environment template
   cp .env.example .env
   
   # Edit environment variables
   nano .env
   \`\`\`
`;

    if (techStack.database) {
      content += `
4. **Database Setup**
   \`\`\`bash
   # Run database migrations
   npm run db:migrate
   
   # Seed database (optional)
   npm run db:seed
   \`\`\`
`;
    }

    content += `
5. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

`;

    return content;
  }

  private generateUsage(techStack: TechStack): string {
    let content = `## 🎯 Usage

### Development

\`\`\`bash
# Start development server
npm run dev

# Open in browser
open http://localhost:${this.getDefaultPort(techStack.framework)}
\`\`\`

### Production Build

\`\`\`bash
# Create production build
npm run build

# Start production server
npm start
\`\`\`
`;

    if (techStack.testing) {
      content += `
### Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`
`;
    }

    return content + '\n';
  }

  private generateEnvironmentSetup(techStack: TechStack): string {
    let content = `## ⚙️ Environment Variables

Create a \`.env\` file in the root directory with the following variables:

\`\`\`env
# Application
NODE_ENV=development
PORT=3000
`;

    if (techStack.backend) {
      content += `
# API Configuration
API_URL=http://localhost:5000
`;
    }

    if (techStack.database === 'postgresql') {
      content += `
# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
`;
    } else if (techStack.database === 'mongodb') {
      content += `
# Database (MongoDB)
MONGODB_URI=mongodb://localhost:27017/database_name
`;
    }

    if (techStack.authentication) {
      content += `
# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
`;
    }

    content += `
# External APIs
OPENAI_API_KEY=your-openai-api-key
\`\`\`

### Environment Files

- \`.env\` - Local development
- \`.env.example\` - Template file
- \`.env.production\` - Production environment
- \`.env.test\` - Testing environment

**⚠️ Important:** Never commit \`.env\` files to version control!

`;

    return content;
  }

  private generateScripts(techStack: TechStack): string {
    let content = `## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| \`npm run dev\` | Start development server |
| \`npm run build\` | Create production build |
| \`npm start\` | Start production server |
| \`npm run lint\` | Run ESLint |
| \`npm run lint:fix\` | Fix ESLint errors |
| \`npm run format\` | Format code with Prettier |
`;

    if (techStack.testing) {
      content += `| \`npm test\` | Run tests |
| \`npm run test:watch\` | Run tests in watch mode |
| \`npm run test:coverage\` | Run tests with coverage |
`;
    }

    if (techStack.database) {
      content += `| \`npm run db:migrate\` | Run database migrations |
| \`npm run db:seed\` | Seed database |
| \`npm run db:reset\` | Reset database |
`;
    }

    if (techStack.deployment === 'docker') {
      content += `| \`npm run docker:build\` | Build Docker image |
| \`npm run docker:run\` | Run Docker container |
| \`npm run docker:compose\` | Start with Docker Compose |
`;
    }

    return content + '\n';
  }

  private generateDeployment(config: DeploymentConfig): string {
    let content = `## 🚀 Deployment

### ${this.capitalize(config.platform)} Deployment

`;

    switch (config.platform) {
      case 'vercel':
        content += `1. **Install Vercel CLI**
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. **Deploy to Vercel**
   \`\`\`bash
   vercel
   \`\`\`

3. **Set Environment Variables**
   - Go to your Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add your production environment variables

### Auto-Deployment

Push to your main branch to trigger automatic deployment.
`;
        break;

      case 'netlify':
        content += `1. **Install Netlify CLI**
   \`\`\`bash
   npm i -g netlify-cli
   \`\`\`

2. **Deploy to Netlify**
   \`\`\`bash
   netlify deploy --prod
   \`\`\`

3. **Configure Build Settings**
   - Build command: \`${config.buildCommand || 'npm run build'}\`
   - Publish directory: \`${config.startCommand || 'dist'}\`
`;
        break;

      case 'docker':
        content += `1. **Build Docker Image**
   \`\`\`bash
   docker build -t app-name .
   \`\`\`

2. **Run Container**
   \`\`\`bash
   docker run -p 3000:3000 app-name
   \`\`\`

3. **Using Docker Compose**
   \`\`\`bash
   docker-compose up --build
   \`\`\`
`;
        break;

      default:
        content += `Follow the deployment guide for ${config.platform}.
`;
    }

    if (config.environmentVariables && config.environmentVariables.length > 0) {
      content += `
### Required Environment Variables

Make sure to set these environment variables in your deployment platform:

`;
      config.environmentVariables.forEach(env => {
        content += `- \`${env}\`\n`;
      });
    }

    return content + '\n';
  }

  private generateProjectStructure(techStack: TechStack): string {
    let structure = `## 📁 Project Structure

\`\`\`
project-name/
├── 📁 src/
│   ├── 📁 components/     # React components
│   ├── 📁 pages/          # Page components
│   ├── 📁 hooks/          # Custom hooks
│   ├── 📁 services/       # API services
│   ├── 📁 utils/          # Utility functions
│   ├── 📁 types/          # TypeScript types
│   └── 📁 styles/         # Stylesheets
├── 📁 public/             # Static assets
├── 📁 tests/              # Test files
`;

    if (techStack.backend) {
      structure += `├── 📁 server/             # Backend code
│   ├── 📁 routes/         # API routes
│   ├── 📁 models/         # Database models
│   ├── 📁 middleware/     # Express middleware
│   └── 📁 controllers/    # Route controllers
`;
    }

    if (techStack.deployment === 'docker') {
      structure += `├── 🐳 Dockerfile         # Docker configuration
├── 📄 docker-compose.yml # Docker Compose
`;
    }

    structure += `├── 📄 package.json       # Dependencies
├── 📄 .env.example       # Environment template
├── 📄 README.md          # This file
└── 📄 .gitignore         # Git ignore rules
\`\`\`

`;

    return structure;
  }

  private generateAPIDocumentation(techStack: TechStack): string {
    if (!techStack.backend) return '';

    return `## 📡 API Documentation

### Base URL
\`\`\`
http://localhost:5000/api
\`\`\`

### Authentication
All API requests require authentication via JWT token:
\`\`\`javascript
headers: {
  'Authorization': 'Bearer <your-jwt-token>'
}
\`\`\`

### Endpoints

#### Authentication
- \`POST /auth/register\` - Register new user
- \`POST /auth/login\` - User login
- \`POST /auth/logout\` - User logout
- \`GET /auth/me\` - Get current user

#### Users
- \`GET /users\` - Get all users
- \`GET /users/:id\` - Get user by ID
- \`PUT /users/:id\` - Update user
- \`DELETE /users/:id\` - Delete user

### Response Format
\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
\`\`\`

`;
  }

  private generateTesting(techStack: TechStack): string {
    if (!techStack.testing) return '';

    let content = `## 🧪 Testing

This project uses ${this.capitalize(techStack.testing)} for testing.

### Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- ComponentName.test.ts

# Run tests with coverage
npm run test:coverage
\`\`\`

### Test Structure

\`\`\`
tests/
├── __mocks__/           # Mock files
├── components/          # Component tests
├── hooks/              # Hook tests
├── pages/              # Page tests
├── services/           # Service tests
└── utils/              # Utility tests
\`\`\`

### Writing Tests

Example test file:
\`\`\`typescript
import { render, screen } from '@testing-library/react';
import Component from '../Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
\`\`\`

`;

    return content;
  }

  private generateDocker(techStack: TechStack): string {
    if (techStack.deployment !== 'docker') return '';

    return `## 🐳 Docker

### Development with Docker

\`\`\`bash
# Build and run with Docker Compose
docker-compose -f docker-compose.dev.yml up --build

# Run in background
docker-compose -f docker-compose.dev.yml up -d
\`\`\`

### Production with Docker

\`\`\`bash
# Build production image
docker build -t app-name .

# Run production container
docker run -p 3000:3000 --env-file .env app-name

# Using Docker Compose
docker-compose up --build
\`\`\`

### Docker Commands

| Command | Description |
|---------|-------------|
| \`docker-compose up\` | Start all services |
| \`docker-compose down\` | Stop all services |
| \`docker-compose logs\` | View logs |
| \`docker-compose ps\` | List running services |

`;
  }

  private generateContributing(): string {
    return `## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   \`\`\`bash
   git checkout -b feature/amazing-feature
   \`\`\`
3. **Make your changes**
4. **Run tests**
   \`\`\`bash
   npm test
   \`\`\`
5. **Commit your changes**
   \`\`\`bash
   git commit -m 'Add some amazing feature'
   \`\`\`
6. **Push to the branch**
   \`\`\`bash
   git push origin feature/amazing-feature
   \`\`\`
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Use meaningful commit messages

### Code of Conduct

Please be respectful and inclusive in all interactions.

`;
  }

  private generateLicense(metadata: ProjectMetadata): string {
    return `## 📄 License

This project is licensed under the ${metadata.license} License - see the [LICENSE](LICENSE) file for details.

`;
  }

  private generateSupport(): string {
    return `## 💬 Support

If you have any questions or need help:

- 📧 Email: support@example.com
- 💬 Discord: [Join our server](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/user/repo/issues)
- 📖 Documentation: [Project Wiki](https://github.com/user/repo/wiki)

`;
  }

  private generateAcknowledgments(techStack: TechStack): string {
    let content = `## 🙏 Acknowledgments

- Built with [${this.capitalize(techStack.framework)}](https://reactjs.org/)
`;

    if (techStack.language === 'typescript') {
      content += `- Powered by [TypeScript](https://www.typescriptlang.org/)
`;
    }

    if (techStack.styling === 'tailwind') {
      content += `- Styled with [Tailwind CSS](https://tailwindcss.com/)
`;
    }

    if (techStack.backend) {
      content += `- Backend built with [${this.capitalize(techStack.backend)}](https://expressjs.com/)
`;
    }

    content += `- Generated with ❤️ by [VibeCoding](https://vibecoding.com/)

---

**Happy Coding!** 🎉
`;

    return content;
  }

  private getEmojiText(tech: string): string {
    const emoji = this.emojiMap[tech as keyof typeof this.emojiMap];
    return emoji ? `${emoji}` : '';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getDefaultPort(framework: string): number {
    const ports = {
      react: 3000,
      next: 3000,
      vue: 5173,
      angular: 4200,
      svelte: 5173
    };
    return ports[framework as keyof typeof ports] || 3000;
  }

  generateChangelog(version: string, changes: string[]): string {
    const date = new Date().toISOString().split('T')[0];
    
    let changelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [${version}] - ${date}

### Added
`;

    changes.forEach(change => {
      changelog += `- ${change}\n`;
    });

    changelog += `
### Changed
- Updated dependencies

### Fixed
- Bug fixes and improvements

`;

    return changelog;
  }

  generateContributingGuide(): string {
    return `# Contributing Guide

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Fork and clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/project-name.git
   cd project-name
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Create a branch**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

## Coding Standards

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write descriptive variable and function names
- Add comments for complex logic

### Commit Messages
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- \`feat:\` New features
- \`fix:\` Bug fixes
- \`docs:\` Documentation changes
- \`style:\` Code style changes
- \`refactor:\` Code refactoring
- \`test:\` Test additions or modifications
- \`chore:\` Other changes

Example: \`feat: add user authentication system\`

### Testing
- Write tests for new features
- Ensure all tests pass before submitting
- Aim for high test coverage

## Pull Request Process

1. **Update documentation** if needed
2. **Run tests** and ensure they pass
3. **Update the changelog** if applicable
4. **Submit pull request** with clear description

## Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Celebrate diverse perspectives

## Getting Help

- Join our Discord community
- Ask questions in GitHub Discussions
- Read the documentation wiki

Thank you for contributing! 🎉
`;
  }
}

export const readmeGenerator = new ReadmeGenerator();