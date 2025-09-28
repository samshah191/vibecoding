interface DockerConfig {
  framework: string;
  language: string;
  nodeVersion: string;
  buildTool: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  outputDir: string;
  port: number;
  features: string[];
  environment: 'development' | 'production';
  multiStage?: boolean;
  healthCheck?: boolean;
  nonRootUser?: boolean;
}

interface DockerFile {
  name: string;
  content: string;
  description: string;
}

export class DockerConfigGenerator {
  private baseImages = {
    node: {
      '18': 'node:18-alpine',
      '19': 'node:19-alpine',
      '20': 'node:20-alpine',
      'latest': 'node:20-alpine'
    } as Record<string, string>,
    nginx: 'nginx:alpine'
  };

  generateDockerfile(config: DockerConfig): DockerFile {
    let content = '';

    if (config.multiStage && config.environment === 'production') {
      content = this.generateMultiStageDockerfile(config);
    } else {
      content = this.generateSingleStageDockerfile(config);
    }

    return {
      name: 'Dockerfile',
      content,
      description: `Dockerfile for ${config.framework} application`
    };
  }

  generateDockerCompose(config: DockerConfig, services: string[] = []): DockerFile {
    const hasDatabase = services.includes('database');
    const hasRedis = services.includes('redis');
    const hasNginx = services.includes('nginx');

    let content = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${config.port}:${config.port}"
    environment:
      - NODE_ENV=production
      - PORT=${config.port}
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:`;

    if (hasDatabase) {
      content += `
      - database`;
    }

    if (hasRedis) {
      content += `
      - redis`;
    }

    content += `
    restart: unless-stopped
    networks:
      - app-network`;

    if (hasDatabase) {
      content += `

  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=\${DB_NAME:-app_db}
      - POSTGRES_USER=\${DB_USER:-postgres}
      - POSTGRES_PASSWORD=\${DB_PASSWORD:-password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER:-postgres}"]
      interval: 30s
      timeout: 10s
      retries: 3`;
    }

    if (hasRedis) {
      content += `

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3`;
    }

    if (hasNginx) {
      content += `

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network`;
    }

    content += `

networks:
  app-network:
    driver: bridge`;

    if (hasDatabase) {
      content += `

volumes:
  postgres_data:`;
    }

    return {
      name: 'docker-compose.yml',
      content,
      description: 'Docker Compose configuration for multi-service setup'
    };
  }

  generateDockerComposeDev(config: DockerConfig): DockerFile {
    const content = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "${config.port}:${config.port}"
    environment:
      - NODE_ENV=development
      - PORT=${config.port}
      - CHOKIDAR_USEPOLLING=true
    volumes:
      - .:/app
      - /app/node_modules
    stdin_open: true
    tty: true
    restart: unless-stopped
    networks:
      - dev-network

  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=app_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - dev-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - dev-network

networks:
  dev-network:
    driver: bridge

volumes:
  postgres_dev_data:`;

    return {
      name: 'docker-compose.dev.yml',
      content,
      description: 'Docker Compose configuration for development environment'
    };
  }

  generateDockerfileDev(config: DockerConfig): DockerFile {
    const baseImage = this.baseImages.node[config.nodeVersion] || this.baseImages.node.latest;
    const packageManager = config.packageManager;

    let content = `# Development Dockerfile
FROM ${baseImage}

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nextjs -u 1001

# Install dependencies
RUN apk add --no-cache libc6-compat

# Enable corepack for yarn/pnpm support
RUN corepack enable

# Copy package files
COPY package*.json ./
`;

    if (packageManager === 'yarn') {
      content += `COPY yarn.lock ./\n`;
    } else if (packageManager === 'pnpm') {
      content += `COPY pnpm-lock.yaml ./\n`;
    }

    content += `
# Install dependencies
RUN ${this.getInstallCommand(packageManager)}

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE ${config.port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${config.port}/health || exit 1

# Start development server
CMD ["${this.getDevCommand(config)}"]`;

    return {
      name: 'Dockerfile.dev',
      content,
      description: 'Development Dockerfile with hot reloading support'
    };
  }

  generateDockerIgnore(): DockerFile {
    const content = `# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Production build
build
dist
out
.next

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE and editor files
.vscode
.idea
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Vue.js build output
dist/

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Git
.git
.gitignore
README.md
CHANGELOG.md
LICENSE

# Docker
Dockerfile*
docker-compose*
.dockerignore

# Testing
coverage/
.jest-cache/
.pytest_cache/

# Backup files
*.bak
*.backup`;

    return {
      name: '.dockerignore',
      content,
      description: 'Docker ignore file to exclude unnecessary files from build context'
    };
  }

  generateNginxConfig(config: DockerConfig): DockerFile {
    const content = `worker_processes 1;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Upstream backend
    upstream backend {
        server app:${config.port} max_fails=3 fail_timeout=30s;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name _;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Static files caching
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            try_files $uri @backend;
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }

        # Health check
        location /health {
            proxy_pass http://backend;
            access_log off;
        }

        # All other requests
        location / {
            try_files $uri $uri/ @backend;
        }

        location @backend {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}`;

    return {
      name: 'nginx.conf',
      content,
      description: 'Nginx reverse proxy configuration with SSL and security headers'
    };
  }

  generateKubernetesDeployment(config: DockerConfig, appName: string): DockerFile {
    const content = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}
  labels:
    app: ${appName}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
    spec:
      containers:
      - name: ${appName}
        image: ${appName}:latest
        ports:
        - containerPort: ${config.port}
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "${config.port}"
        envFrom:
        - configMapRef:
            name: ${appName}-config
        - secretRef:
            name: ${appName}-secrets
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: ${config.port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: ${config.port}
          initialDelaySeconds: 5
          periodSeconds: 5
      imagePullSecrets:
      - name: regcred
---
apiVersion: v1
kind: Service
metadata:
  name: ${appName}-service
spec:
  selector:
    app: ${appName}
  ports:
    - protocol: TCP
      port: 80
      targetPort: ${config.port}
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${appName}-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - ${appName}.example.com
    secretName: ${appName}-tls
  rules:
  - host: ${appName}.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${appName}-service
            port:
              number: 80`;

    return {
      name: 'k8s-deployment.yaml',
      content,
      description: 'Kubernetes deployment, service, and ingress configuration'
    };
  }

  private generateMultiStageDockerfile(config: DockerConfig): string {
    const baseImage = this.baseImages.node[config.nodeVersion] || this.baseImages.node.latest;
    const packageManager = config.packageManager;

    let content = `# Multi-stage Dockerfile for production
FROM ${baseImage} AS deps
WORKDIR /app

# Install dependencies
RUN apk add --no-cache libc6-compat
RUN corepack enable

# Copy package files
COPY package*.json ./
`;

    if (packageManager === 'yarn') {
      content += `COPY yarn.lock ./\n`;
    } else if (packageManager === 'pnpm') {
      content += `COPY pnpm-lock.yaml ./\n`;
    }

    content += `
# Install dependencies
RUN ${this.getInstallCommand(packageManager, true)}

# Build stage
FROM ${baseImage} AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN ${this.getBuildCommand(config)}

# Production stage
FROM ${baseImage} AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/${config.outputDir} ./${config.outputDir}
COPY --from=builder /app/package*.json ./
`;

    if (config.framework === 'next') {
      content += `
# Copy Next.js build files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
`;
    }

    content += `
# Install production dependencies only
RUN ${this.getInstallCommand(packageManager, true)}

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE ${config.port}

# Environment variables
ENV NODE_ENV=production
ENV PORT=${config.port}
`;

    if (config.healthCheck) {
      content += `
# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${config.port}/health || exit 1
`;
    }

    content += `
# Start application
CMD ["${this.getStartCommand(config)}"]`;

    return content;
  }

  private generateSingleStageDockerfile(config: DockerConfig): string {
    const baseImage = this.baseImages.node[config.nodeVersion] || this.baseImages.node.latest;
    const packageManager = config.packageManager;

    let content = `# Single-stage Dockerfile
FROM ${baseImage}

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat curl

# Enable corepack
RUN corepack enable

# Copy package files
COPY package*.json ./
`;

    if (packageManager === 'yarn') {
      content += `COPY yarn.lock ./\n`;
    } else if (packageManager === 'pnpm') {
      content += `COPY pnpm-lock.yaml ./\n`;
    }

    content += `
# Install dependencies
RUN ${this.getInstallCommand(packageManager)}

# Copy source code
COPY . .

# Build application (if needed)
`;

    if (config.environment === 'production') {
      content += `RUN ${this.getBuildCommand(config)}\n`;
    }

    if (config.nonRootUser) {
      content += `
# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs
`;
    }

    content += `
# Expose port
EXPOSE ${config.port}

# Environment variables
ENV NODE_ENV=${config.environment}
ENV PORT=${config.port}
`;

    if (config.healthCheck) {
      content += `
# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${config.port}/health || exit 1
`;
    }

    content += `
# Start application
CMD ["${config.environment === 'production' ? this.getStartCommand(config) : this.getDevCommand(config)}"]`;

    return content;
  }

  private getInstallCommand(packageManager: string, productionOnly: boolean = false): string {
    const prodFlag = productionOnly ? ' --production' : '';
    
    switch (packageManager) {
      case 'yarn':
        return productionOnly ? 'yarn install --frozen-lockfile --production' : 'yarn install --frozen-lockfile';
      case 'pnpm':
        return `pnpm install${productionOnly ? ' --prod' : ''}`;
      default:
        return `npm ci${prodFlag}`;
    }
  }

  private getBuildCommand(config: DockerConfig): string {
    switch (config.packageManager) {
      case 'yarn':
        return 'yarn build';
      case 'pnpm':
        return 'pnpm build';
      default:
        return 'npm run build';
    }
  }

  private getStartCommand(config: DockerConfig): string {
    if (config.framework === 'next') {
      return 'node server.js';
    }
    
    switch (config.packageManager) {
      case 'yarn':
        return 'yarn start';
      case 'pnpm':
        return 'pnpm start';
      default:
        return 'npm start';
    }
  }

  private getDevCommand(config: DockerConfig): string {
    switch (config.packageManager) {
      case 'yarn':
        return 'yarn dev';
      case 'pnpm':
        return 'pnpm dev';
      default:
        return 'npm run dev';
    }
  }

  generateAllDockerFiles(config: DockerConfig, services: string[] = []): DockerFile[] {
    const files: DockerFile[] = [];

    // Core Docker files
    files.push(this.generateDockerfile(config));
    files.push(this.generateDockerIgnore());

    // Development files
    if (config.environment === 'development') {
      files.push(this.generateDockerfileDev(config));
      files.push(this.generateDockerComposeDev(config));
    }

    // Production files
    if (services.length > 0) {
      files.push(this.generateDockerCompose(config, services));
    }

    // Nginx configuration if nginx service is included
    if (services.includes('nginx')) {
      files.push(this.generateNginxConfig(config));
    }

    return files;
  }
}

export const dockerConfigGenerator = new DockerConfigGenerator();