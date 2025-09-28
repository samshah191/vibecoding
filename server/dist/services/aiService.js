"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
class AIService {
    async generateApp(description, userId) {
        try {
            // First try with OpenAI API
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
            return this.parseAIResponse(response, description, userId);
        }
        catch (error) {
            console.error('AI Generation Error:', error);
            // If OpenAI fails (quota exceeded, API issues, etc.), use fallback generation
            console.log('🔄 OpenAI API unavailable, using fallback app generation...');
            return this.generateFallbackApp(description, userId);
        }
    }
    buildPrompt(description) {
        return `
Create a complete web application based on this description: "${description}"

Please generate a production-ready application with:

1. **Frontend (React + TypeScript)**:
   - Modern React components with hooks
   - Responsive design with Tailwind CSS
   - Proper routing and navigation
   - Form handling and validation
   - State management

2. **Backend (Node.js + Express)**:
   - RESTful API endpoints
   - Input validation and sanitization
   - Error handling middleware
   - Authentication and authorization
   - Database integration

3. **Database (PostgreSQL)**:
   - Proper schema design
   - Relationships and constraints
   - Indexes for performance
   - Migration scripts

4. **Security & Best Practices**:
   - JWT authentication
   - Password hashing
   - Input validation
   - CORS configuration
   - Rate limiting

5. **Deployment Ready**:
   - Docker configuration
   - Environment variables
   - Health checks
   - Logging

Structure the response as JSON with these sections:
- name: Creative app name
- description: Detailed app description
- frontend: Complete React components
- backend: Express routes and controllers
- database: Prisma schema
- features: List of implemented features
- deployment: Docker and configuration files

Make it fully functional and ready to deploy immediately.
The app should solve real user problems and provide genuine value.
`;
    }
    parseAIResponse(response, description, userId) {
        try {
            // Clean up the response to extract JSON
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
                url: `${process.env.APP_BASE_URL}/${this.generateAppId()}`
            };
        }
        catch (error) {
            console.error('Failed to parse AI response:', error);
            return this.generateFallbackApp(description, userId);
        }
    }
    generateAppId() {
        return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    extractAppName(description) {
        // Extract a reasonable app name from description
        const words = description.toLowerCase().split(' ');
        const relevantWords = words.filter(word => word.length > 3 && !['application', 'app', 'website', 'platform', 'system', 'tool'].includes(word));
        if (relevantWords.length > 0) {
            return relevantWords.slice(0, 2).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') + 'App';
        }
        return 'MyApp';
    }
    generateDefaultFeatures(description) {
        const baseFeatures = ['User Authentication', 'Responsive Design', 'Database Integration'];
        // Add context-specific features based on description
        if (description.includes('dashboard'))
            baseFeatures.push('Analytics Dashboard');
        if (description.includes('chat') || description.includes('message'))
            baseFeatures.push('Real-time Messaging');
        if (description.includes('payment') || description.includes('subscription'))
            baseFeatures.push('Payment Integration');
        if (description.includes('notification'))
            baseFeatures.push('Push Notifications');
        if (description.includes('upload') || description.includes('file'))
            baseFeatures.push('File Upload');
        return baseFeatures;
    }
    generateDefaultFrontend(description) {
        const appName = this.extractAppName(description);
        return {
            pages: {
                'App.tsx': `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;`,
                'pages/Dashboard.tsx': `import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        // Replace with actual API call
        setData([]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to ${appName}</h1>
        <p className="text-gray-600 mt-2">Hello, {user?.name || user?.email}!</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Stats</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-semibold">{data.length}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
            <p className="text-gray-600">No recent activity</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Actions</h2>
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;`
            },
            components: {
                'Navbar.tsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            ${appName}
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">Welcome, {user.name || user.email}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;`
            }
        };
    }
    generateDefaultBackend(description) {
        return {
            routes: {
                'auth.ts': `import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { z } from 'zod';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
});

export { router as authRoutes };`
            }
        };
    }
    generateDefaultDatabase() {
        return {
            schema: {
                'User': {
                    id: 'String @id @default(cuid())',
                    email: 'String @unique',
                    password: 'String',
                    name: 'String?',
                    createdAt: 'DateTime @default(now())',
                    updatedAt: 'DateTime @updatedAt'
                }
            },
            migrations: []
        };
    }
    generateFallbackApp(description, userId) {
        return {
            id: this.generateAppId(),
            name: this.extractAppName(description),
            description,
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
            url: `${process.env.APP_BASE_URL}/${this.generateAppId()}`
        };
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map