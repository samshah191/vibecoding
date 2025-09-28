import OpenAI from 'openai';
import { AppConfig, GeneratedApp } from '../types/app';

// Initialize OpenAI client with optional API key
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

export class AIService {
  async generateApp(description: string, userId: string): Promise<GeneratedApp> {
    try {
      // Check if OpenAI is available, otherwise use fallback
      if (!openai) {
        console.log('🔄 OpenAI API key not configured, using fallback app generation...');
        return this.generateFallbackApp(description, userId);
      }

      // Try with OpenAI API
      const prompt = this.buildPrompt(description);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert full-stack developer who creates complete web applications. 
            Generate a comprehensive app structure based on user descriptions.
            Always include: frontend components, backend API endpoints, database schema, authentication flow, and deployment configuration.
            Respond with valid JSON containing all necessary code and configuration.
            Focus on creating production-ready, secure, and scalable applications.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      const response = completion.choices[0].message.content;
      return this.parseAIResponse(response!, description, userId);
    } catch (error) {
      console.error('AI Generation Error:', error);
      
      // If OpenAI fails (quota exceeded, API issues, etc.), use fallback generation
      console.log('🔄 OpenAI API unavailable, using fallback app generation...');
      return this.generateFallbackApp(description, userId);
    }
  }

  private generateFallbackApp(description: string, userId: string): GeneratedApp {
    return {
      id: this.generateAppId(),
      name: this.extractAppName(description),
      description: description,
      userId,
      createdAt: new Date(),
      status: 'generated',
      frontend: this.generateDefaultFrontend(description),
      backend: this.generateDefaultBackend(description),
      database: this.generateDefaultDatabase(),
      config: {
        framework: 'React',
        language: 'TypeScript',
        styling: 'Tailwind CSS',
        database: 'PostgreSQL',
        hosting: 'Docker'
      },
      features: this.generateDefaultFeatures(description),
      url: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/${this.generateAppId()}`
    };
  }

  private buildPrompt(description: string): string {
    return `Create a complete web application based on this description: "${description}"`;
  }

  private parseAIResponse(response: string, description: string, userId: string): GeneratedApp {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        id: this.generateAppId(),
        name: parsedResponse.name || this.extractAppName(description),
        description: parsedResponse.description || description,
        userId,
        createdAt: new Date(),
        status: 'generated',
        frontend: parsedResponse.frontend || this.generateDefaultFrontend(description),
        backend: parsedResponse.backend || this.generateDefaultBackend(description),
        database: parsedResponse.database || this.generateDefaultDatabase(),
        config: {
          framework: 'React',
          language: 'TypeScript',
          styling: 'Tailwind CSS',
          database: 'PostgreSQL',
          hosting: 'Docker'
        },
        features: parsedResponse.features || this.generateDefaultFeatures(description),
        url: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/${this.generateAppId()}`
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.generateFallbackApp(description, userId);
    }
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
    
    return 'MyApp';
  }

  private generateDefaultFeatures(description: string): string[] {
    const baseFeatures = ['User Authentication', 'Responsive Design', 'Database Integration'];
    
    if (description.includes('dashboard')) baseFeatures.push('Analytics Dashboard');
    if (description.includes('chat') || description.includes('message')) baseFeatures.push('Real-time Messaging');
    if (description.includes('payment') || description.includes('subscription')) baseFeatures.push('Payment Integration');
    
    return baseFeatures;
  }

  private generateDefaultFrontend(description: string): any {
    return {
      'App.tsx': `// Generated React App
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Welcome to ${this.extractAppName(description)}</h1>
    </div>
  );
}

export default App;`
    };
  }

  private generateDefaultBackend(description: string): any {
    return {
      'server.js': `// Generated Express Server
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});`
    };
  }

  private generateDefaultDatabase(): any {
    return {
      schema: `-- Generated PostgreSQL Schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
    };
  }
}