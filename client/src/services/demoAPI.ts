import { User, App, AppGenerationRequest, APIResponse, ConversationalGenerationRequest, ConversationalGenerationResponse, GeneratedProjectSummary, ConversationMessage } from '../types';

// Demo mode configuration
const DEMO_MODE = false; // Toggle demo data providers

// Demo user data
const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@vibecoding.com',
  name: 'Demo User',
  role: 'USER',
  createdAt: new Date().toISOString(),
};

// Demo apps data
const DEMO_APPS: App[] = [
  {
    id: 'demo-app-1',
    name: 'Task Management Pro',
    description: 'A comprehensive task management application with team collaboration features, real-time updates, and analytics dashboard.',
    features: ['Task boards', 'Team collaboration', 'Time tracking', 'Progress analytics', 'File attachments'],
    status: 'generated',
    published: true,
    url: 'https://demo-task-app.vibecoding.com',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-app-2',
    name: 'E-commerce Store',
    description: 'Modern online store with product catalog, shopping cart, payment integration, and order management system.',
    features: ['Product catalog', 'Shopping cart', 'Payment integration', 'Order management', 'Customer reviews'],
    status: 'generated',
    published: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-app-3',
    name: 'Social Network for Professionals',
    description: 'Professional networking platform with user profiles, connections, messaging, and industry insights.',
    features: ['User profiles', 'Professional connections', 'Messaging system', 'Industry news', 'Event networking'],
    status: 'building',
    published: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const extractAppName = (description: string): string => {
  const trimmed = description.trim();
  if (!trimmed) {
    return 'AI Generated App';
  }

  const words = trimmed.split(/\s+/).slice(0, 4);
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'AI Generated App';
};

const generateFeatures = (description: string): string[] => {
  const baseFeatures = [
    'Responsive UI shell for instant iteration',
    'Linked API endpoints ready for extension',
    'Setup instructions in README to get running fast'
  ];

  const normalized = description.toLowerCase();
  if (normalized.includes('chat') || normalized.includes('message')) {
    baseFeatures.push('Real-time messaging scaffold with placeholder data');
  }
  if (normalized.includes('dashboard')) {
    baseFeatures.push('Dashboard layout with starter analytics widgets');
  }
  if (normalized.includes('mobile')) {
    baseFeatures.push('Mobile-first navigation and adaptive breakpoints');
  }

  return baseFeatures.slice(0, 4);
};



// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Demo Auth API
export const demoAuthAPI = {
  login: async (email: string, password: string): Promise<APIResponse<{ user: User; token: string }>> => {
    await delay(800); // Simulate network delay
    
    // Accept demo credentials or any email/password for demo
    if ((email === 'demo@vibecoding.com' && password === 'demo123') || 
        email.includes('@') && password.length >= 6) {
      return {
        success: true,
        user: { ...DEMO_USER, email },
        token: 'demo-token-' + Date.now(),
        message: 'Welcome to VibeCoding Demo!',
      };
    }
    
    throw new Error('Invalid credentials. Try demo@vibecoding.com / demo123');
  },

  register: async (email: string, password: string, name?: string): Promise<APIResponse<{ user: User; token: string }>> => {
    await delay(1000);
    
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    return {
      success: true,
      user: { ...DEMO_USER, email, name: name || 'New User' },
      token: 'demo-token-' + Date.now(),
      message: 'Account created successfully! Welcome to VibeCoding!',
    };
  },

  getProfile: async (): Promise<APIResponse<{ user: User }>> => {
    await delay(300);
    return {
      success: true,
      user: DEMO_USER,
    };
  },
};

// Demo Apps API
export const demoAppsAPI = {
  getAll: async (): Promise<APIResponse<App[]>> => {
    await delay(500);
    return {
      success: true,
      data: DEMO_APPS,
    };
  },

  getById: async (appId: string): Promise<APIResponse<App>> => {
    await delay(300);
    const app = DEMO_APPS.find(a => a.id === appId);
    if (!app) {
      throw new Error('App not found');
    }
    return {
      success: true,
      app,
    };
  },

  update: async (appId: string, data: Partial<App>): Promise<APIResponse<App>> => {
    await delay(400);
    const appIndex = DEMO_APPS.findIndex(a => a.id === appId);
    if (appIndex === -1) {
      throw new Error('App not found');
    }
    
    DEMO_APPS[appIndex] = { ...DEMO_APPS[appIndex], ...data, updatedAt: new Date().toISOString() };
    return {
      success: true,
      app: DEMO_APPS[appIndex],
    };
  },

  delete: async (appId: string): Promise<APIResponse> => {
    await delay(500);
    const appIndex = DEMO_APPS.findIndex(a => a.id === appId);
    if (appIndex === -1) {
      throw new Error('App not found');
    }
    
    DEMO_APPS.splice(appIndex, 1);
    return {
      success: true,
      message: 'App deleted successfully',
    };
  },

  togglePublish: async (appId: string): Promise<APIResponse<App>> => {
    await delay(600);
    const appIndex = DEMO_APPS.findIndex(a => a.id === appId);
    if (appIndex === -1) {
      throw new Error('App not found');
    }
    
    DEMO_APPS[appIndex].published = !DEMO_APPS[appIndex].published;
    DEMO_APPS[appIndex].updatedAt = new Date().toISOString();
    
    return {
      success: true,
      app: DEMO_APPS[appIndex],
      message: DEMO_APPS[appIndex].published ? 'App published successfully!' : 'App unpublished',
    };
  },
};

// Demo AI API
export const demoAiAPI = {
  generateApp: async (request: AppGenerationRequest): Promise<APIResponse<App>> => {
    await delay(2000);

    const newApp: App = {
      id: 'demo-app-' + Date.now(),
      name: extractAppName(request.description),
      description: request.description,
      features: generateFeatures(request.description),
      status: 'generated',
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    DEMO_APPS.unshift(newApp);

    return {
      success: true,
      app: newApp,
      message: 'Your app has been generated successfully!',
    };
  },

  getGenerationProgress: async (_appId: string): Promise<APIResponse> => {
    await delay(200);
    return {
      success: true,
      data: { progress: 100 },
    };
  },

  generateConversationalApp: async (request: ConversationalGenerationRequest): Promise<ConversationalGenerationResponse> => {
    await delay(1500);

    const project: GeneratedProjectSummary = {
      appId: 'demo-convo-' + Date.now(),
      name: extractAppName(request.description),
      description: request.description,
      platform: request.platform || 'web',
      backend: request.backend || 'node',
      clientPath: '/demo/projects/client',
      serverPath: '/demo/projects/server',
      projectRoot: '/demo/projects',
      archivePath: '/demo/projects/archive.zip',
      downloadUrl: 'https://example.com/demo-project.zip',
      commands: {
        client: 'cd client && npm install && npm run dev',
        server: 'cd server && npm install && npm run dev',
      },
      environment: {
        clientEnv: { VITE_API_URL: 'http://localhost:4000' },
        serverEnv: { PORT: '4000' },
      },
      features: generateFeatures(request.description),
      apiEndpoints: ['GET /api/app-info', 'POST /api/ideas'],
    };

    const assistantMessage: ConversationMessage = {
      role: 'assistant',
      content: 'Here is a templated project ready to download. Run the client and server commands to see it in action.',
      timestamp: new Date().toISOString(),
    };

    const conversation: ConversationMessage[] = [
      ...(request.conversation || []),
      {
        role: 'user',
        content: request.description,
        timestamp: new Date().toISOString(),
      },
      assistantMessage,
    ];

    return {
      success: true,
      project,
      conversation,
      message: 'Demo project generated successfully.',
    };
  },
};

// Export demo mode flag and APIs
export { DEMO_MODE };
export default {
  authAPI: demoAuthAPI,
  appsAPI: demoAppsAPI,
  aiAPI: demoAiAPI,
};
