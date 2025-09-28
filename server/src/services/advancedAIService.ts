// Advanced AI Service with fallback generation
// This service provides enhanced app generation capabilities
import { AdvancedAppConfig, AdvancedGenerationRequest, GeneratedApp } from '../types/app';
import { ConfigService } from './configService';

export class AdvancedAIService {
  async generateAdvancedApp(request: AdvancedGenerationRequest, userId: string): Promise<GeneratedApp> {
    try {
      console.log('🚀 Generating advanced app with fallback system...');
      
      // Since OpenAI is optional, use sophisticated fallback generation
      return this.generateFallbackApp(request, userId);
    } catch (error) {
      console.error('Advanced AI Generation Error:', error);
      return this.generateFallbackApp(request, userId);
    }
  }

  private generateFallbackApp(request: AdvancedGenerationRequest, userId: string): GeneratedApp {
    const config = request.config;
    const appName = this.extractAppName(request.description);
    
    return {
      id: this.generateAppId(),
      name: appName,
      description: request.description,
      userId,
      createdAt: new Date(),
      status: 'generated',
      frontend: this.generateAdvancedFrontend(request),
      backend: this.generateAdvancedBackend(request),
      database: this.generateAdvancedDatabase(config),
      config: {
        framework: config.framework.name,
        language: config.language,
        styling: config.cssFramework.name,
        database: 'PostgreSQL',
        hosting: 'Docker'
      },
      features: this.getEnabledFeatures(config.features),
      url: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/${this.generateAppId()}`
    };
  }

  private generateAppId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  private extractAppName(description: string): string {
    const words = description.toLowerCase().split(' ');
    const relevantWords = words.filter(word => 
      word.length > 3 && !['application', 'app', 'website', 'platform', 'system', 'tool'].includes(word)
    );
    
    if (relevantWords.length > 0) {
      return relevantWords.slice(0, 2).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('') + 'App';
    }
    
    return 'VibeCodingApp';
  }

  private getEnabledFeatures(features: AdvancedAppConfig['features']): string[] {
    const enabledFeatures: string[] = ['Modern UI/UX'];
    
    if (features.authentication) enabledFeatures.push('User Authentication');
    if (features.realtime) enabledFeatures.push('Real-time Updates');
    if (features.fileUpload) enabledFeatures.push('File Upload');
    if (features.payments) enabledFeatures.push('Payment Integration');
    if (features.notifications) enabledFeatures.push('Push Notifications');
    if (features.analytics) enabledFeatures.push('Analytics Dashboard');
    if (features.i18n) enabledFeatures.push('Multi-language Support');
    if (features.pwa) enabledFeatures.push('Progressive Web App');

    return enabledFeatures;
  }

  private generateAdvancedFrontend(request: AdvancedGenerationRequest): any {
    const framework = request.config.framework.name;
    const cssFramework = request.config.cssFramework.name;
    const appName = this.extractAppName(request.description);
    
    return {
      'App.tsx': `// ${appName} - Generated with ${framework}
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-xl font-bold text-gray-900">${appName}</h1>
              <div className="space-x-4">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Dashboard</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Get Started</button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ${appName}</h2>
            <p className="text-lg text-gray-600 mb-8">${request.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Feature 1</h3>
                <p className="text-gray-600">Amazing functionality that solves your problems.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Feature 2</h3>
                <p className="text-gray-600">Advanced capabilities for power users.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Feature 3</h3>
                <p className="text-gray-600">Seamless integration with your workflow.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;`,
      'package.json': `{
  "name": "${appName.toLowerCase()}",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "${cssFramework === 'Tailwind CSS' ? '@tailwindcss/typography' : 'styled-components'}": "latest"
  }
}`
    };
  }

  private generateAdvancedBackend(request: AdvancedGenerationRequest): any {
    const appName = this.extractAppName(request.description);
    
    return {
      'server.js': `// ${appName} Backend Server
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '${appName} API is running',
    version: '1.0.0',
    description: '${request.description}'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(\`🚀 ${appName} server running on port \${port}\`);
});`,
      'package.json': `{
  "name": "${appName.toLowerCase()}-api",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}`
    };
  }

  private generateAdvancedDatabase(config: AdvancedAppConfig): any {
    return {
      schema: `-- ${config.framework.name} Application Database Schema
-- Generated for advanced application

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url VARCHAR(500),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user_id ON user_profiles(user_id);`
    };
  }
}