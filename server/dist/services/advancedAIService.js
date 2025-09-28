"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedAIService = void 0;
const openai_1 = __importDefault(require("openai"));
const configService_1 = require("./configService");
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
class AdvancedAIService {
    async generateAdvancedApp(request, userId) {
        try {
            // Validate configuration
            const validation = configService_1.ConfigService.validateConfig(request.config);
            if (!validation.valid) {
                throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
            }
            // Build enhanced prompt with configuration
            const prompt = this.buildAdvancedPrompt(request.description, request.config);
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: this.getSystemPrompt(request.config)
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 6000
            });
            const response = completion.choices[0].message.content;
            return this.parseAdvancedResponse(response, request, userId);
        }
        catch (error) {
            console.error('Advanced AI Generation Error:', error);
            // Fallback to basic generation
            console.log('🔄 Advanced generation failed, using fallback...');
            return this.generateFallbackApp(request, userId);
        }
    }
    getSystemPrompt(config) {
        const framework = config.framework.name;
        const componentLib = config.componentLibrary?.name || 'Custom Components';
        const cssFramework = config.cssFramework.name;
        const stateManagement = config.stateManagement.name;
        const routing = config.routing.name;
        const language = config.language;
        return `You are an expert full-stack developer specializing in ${framework} applications.

**Current Configuration:**
- Framework: ${framework}
- Language: ${language}
- Component Library: ${componentLib}
- CSS Framework: ${cssFramework}
- State Management: ${stateManagement}
- Routing: ${routing}

**Your task:**
1. Generate production-ready ${framework} applications with ${language}
2. Use ${componentLib} for UI components when applicable
3. Implement styling with ${cssFramework}
4. Use ${stateManagement} for state management
5. Configure routing with ${routing}
6. Follow modern best practices and patterns
7. Include proper TypeScript types if TypeScript is selected
8. Generate clean, maintainable, and scalable code

**Response Format:**
Provide a detailed JSON response with complete file structures, component code, configuration files, and setup instructions.
Focus on creating a fully functional application that follows the specified technology choices.`;
    }
    buildAdvancedPrompt(description, config) {
        const features = this.getEnabledFeatures(config.features);
        return `
Create a complete ${config.framework.name} application based on this description: "${description}"

**Technical Requirements:**
- Framework: ${config.framework.name} (${config.framework.version})
- Language: ${config.language}
- Component Library: ${config.componentLibrary?.name || 'Custom Components'}
- CSS Framework: ${config.cssFramework.name}
- State Management: ${config.stateManagement.name}
- Routing: ${config.routing.name}

**Required Features:**
${features.map(feature => `- ${feature}`).join('\n')}

**Implementation Guidelines:**

1. **Project Structure:**
   ${this.getProjectStructureGuidelines(config)}

2. **Component Architecture:**
   ${this.getComponentGuidelines(config)}

3. **State Management:**
   ${this.getStateManagementGuidelines(config)}

4. **Styling:**
   ${this.getStylingGuidelines(config)}

5. **Routing:**
   ${this.getRoutingGuidelines(config)}

**Expected Deliverables:**
- Complete file structure with all necessary files
- Main application components
- Configuration files (package.json, config files)
- Setup and installation instructions
- Environment variables and deployment configuration

Make the application production-ready with proper error handling, loading states, and responsive design.
Ensure all code follows modern best practices and is properly typed (if TypeScript).
`;
    }
    getEnabledFeatures(features) {
        const enabledFeatures = [];
        if (features.authentication)
            enabledFeatures.push('User Authentication & Authorization');
        if (features.realtime)
            enabledFeatures.push('Real-time Updates (WebSockets/SSE)');
        if (features.fileUpload)
            enabledFeatures.push('File Upload & Management');
        if (features.payments)
            enabledFeatures.push('Payment Integration');
        if (features.notifications)
            enabledFeatures.push('Push Notifications');
        if (features.analytics)
            enabledFeatures.push('Analytics & Tracking');
        if (features.i18n)
            enabledFeatures.push('Internationalization (i18n)');
        if (features.pwa)
            enabledFeatures.push('Progressive Web App (PWA)');
        return enabledFeatures;
    }
    getProjectStructureGuidelines(config) {
        const framework = config.framework.id;
        const structures = {
            react: `
- src/
  - components/
    - ui/ (reusable UI components)
    - common/ (shared components)
  - pages/
  - hooks/
  - services/
  - utils/
  - types/ (if TypeScript)
  - styles/`,
            vue: `
- src/
  - components/
    - ui/
    - common/
  - views/
  - composables/
  - services/
  - utils/
  - types/ (if TypeScript)
  - styles/`,
            angular: `
- src/
  - app/
    - components/
    - services/
    - modules/
    - guards/
    - interfaces/ (if TypeScript)
    - styles/`,
            nextjs: `
- pages/ or app/ (App Router)
- components/
  - ui/
  - common/
- lib/
- hooks/
- styles/
- types/ (if TypeScript)`,
            nuxtjs: `
- pages/
- components/
  - ui/
  - common/
- composables/
- plugins/
- middleware/
- types/ (if TypeScript)`
        };
        return structures[framework] || structures.react;
    }
    getComponentGuidelines(config) {
        const componentLib = config.componentLibrary?.name;
        if (componentLib) {
            return `Use ${componentLib} components as the foundation. Create custom components that extend or compose ${componentLib} components. Follow the component library's theming and customization patterns.`;
        }
        return 'Create custom reusable components following atomic design principles. Implement a consistent design system with shared styling patterns.';
    }
    getStateManagementGuidelines(config) {
        const stateManagement = config.stateManagement.id;
        const guidelines = {
            context: 'Use React Context for global state. Create separate contexts for different domains (auth, theme, etc.). Use useReducer for complex state logic.',
            redux: 'Use Redux Toolkit with createSlice and RTK Query. Organize by feature slices. Implement proper middleware for async actions.',
            zustand: 'Create focused stores for different features. Use immer for immutable updates. Implement persistence where needed.',
            jotai: 'Use atomic state management. Create atoms for different state pieces. Compose atoms for derived state.',
            valtio: 'Use proxy-based state. Create stores with nested objects. Use subscriptions for reactive updates.',
            vuex: 'Use modules to organize state. Implement actions, mutations, and getters properly. Use strict mode in development.',
            pinia: 'Create stores with composition API style. Use computed properties for derived state. Implement proper TypeScript support.',
            ngrx: 'Use feature stores with actions, reducers, and effects. Implement proper state normalization. Use selectors for data access.',
            akita: 'Create entity stores for data management. Use queries for reactive data access. Implement proper CRUD operations.'
        };
        return guidelines[stateManagement] || guidelines.context;
    }
    getStylingGuidelines(config) {
        const cssFramework = config.cssFramework.id;
        const guidelines = {
            tailwind: 'Use Tailwind utility classes. Create custom components using @apply directive. Set up proper color palette and spacing scale.',
            bootstrap: 'Use Bootstrap grid system and components. Customize with SCSS variables. Create custom utility classes as needed.',
            'styled-components': 'Create styled components with TypeScript support. Use ThemeProvider for consistent theming. Implement responsive design with theme breakpoints.',
            emotion: 'Use css prop for styling. Create reusable styled components. Implement proper theme configuration.',
            bulma: 'Use Bulma classes and modifiers. Customize with SCSS variables. Create custom components following Bulma patterns.',
            scss: 'Create organized SCSS structure with variables, mixins, and functions. Use BEM methodology for class naming.'
        };
        return guidelines[cssFramework] || guidelines.tailwind;
    }
    getRoutingGuidelines(config) {
        const routing = config.routing.id;
        const guidelines = {
            'react-router': 'Use React Router v6 with createBrowserRouter. Implement nested routes and lazy loading. Add route guards for protected routes.',
            'nextjs-router': 'Use Next.js App Router (recommended) or Pages Router. Implement dynamic routes and API routes. Use middleware for authentication.',
            'vue-router': 'Configure Vue Router with proper route definitions. Implement navigation guards. Use lazy loading for code splitting.',
            'nuxtjs-router': 'Use file-based routing. Implement middleware for route protection. Configure dynamic routes properly.',
            'angular-router': 'Configure Angular Router with proper route guards. Implement lazy loading modules. Use resolvers for data fetching.'
        };
        return guidelines[routing] || guidelines['react-router'];
    }
    parseAdvancedResponse(response, request, userId) {
        try {
            // Clean up the response to extract JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
            return {
                id: this.generateAppId(),
                name: request.projectName || parsedResponse.name || this.extractAppName(request.description),
                description: parsedResponse.description || request.description,
                userId,
                createdAt: new Date(),
                status: 'generated',
                frontend: parsedResponse.frontend || this.generateAdvancedFrontend(request),
                backend: parsedResponse.backend || this.generateAdvancedBackend(request),
                database: parsedResponse.database || this.generateAdvancedDatabase(request),
                config: {
                    framework: request.config.framework.name,
                    language: request.config.language,
                    styling: request.config.cssFramework.name,
                    database: request.config.database,
                    hosting: request.config.hosting
                },
                advancedConfig: request.config,
                features: parsedResponse.features || this.generateAdvancedFeatures(request),
                url: `${process.env.APP_BASE_URL}/${this.generateAppId()}`
            };
        }
        catch (error) {
            console.error('Failed to parse advanced AI response:', error);
            return this.generateFallbackApp(request, userId);
        }
    }
    generateAdvancedFrontend(request) {
        const framework = request.config.framework.id;
        const language = request.config.language;
        const componentLib = request.config.componentLibrary?.id;
        const cssFramework = request.config.cssFramework.id;
        // Generate framework-specific code structure
        if (framework === 'react' || framework === 'nextjs') {
            return this.generateReactFrontend(request);
        }
        else if (framework === 'vue' || framework === 'nuxtjs') {
            return this.generateVueFrontend(request);
        }
        else if (framework === 'angular') {
            return this.generateAngularFrontend(request);
        }
        return this.generateReactFrontend(request); // Default fallback
    }
    generateReactFrontend(request) {
        const config = request.config;
        const isTypeScript = config.language === 'TypeScript';
        const ext = isTypeScript ? 'tsx' : 'jsx';
        const appName = this.extractAppName(request.description);
        return {
            [`App.${ext}`]: this.generateReactApp(config, appName, isTypeScript),
            [`components/Layout.${ext}`]: this.generateReactLayout(config, isTypeScript),
            [`pages/Dashboard.${ext}`]: this.generateReactDashboard(config, appName, isTypeScript),
            'package.json': this.generatePackageJson(config, appName),
            ...(isTypeScript && { 'tsconfig.json': this.generateTSConfig() }),
            'tailwind.config.js': config.cssFramework.id === 'tailwind' ? this.generateTailwindConfig() : null,
            'vite.config.js': this.generateViteConfig(config)
        };
    }
    generateVueFrontend(request) {
        const config = request.config;
        const isTypeScript = config.language === 'TypeScript';
        const ext = isTypeScript ? 'vue' : 'vue';
        const appName = this.extractAppName(request.description);
        return {
            'App.vue': this.generateVueApp(config, appName),
            'components/Layout.vue': this.generateVueLayout(config),
            'views/Dashboard.vue': this.generateVueDashboard(config, appName),
            'package.json': this.generateVuePackageJson(config, appName),
            ...(isTypeScript && { 'tsconfig.json': this.generateTSConfig() }),
            'vite.config.js': this.generateVueViteConfig(config)
        };
    }
    generateAngularFrontend(request) {
        const config = request.config;
        const appName = this.extractAppName(request.description);
        return {
            'app.component.ts': this.generateAngularApp(config, appName),
            'components/layout/layout.component.ts': this.generateAngularLayout(config),
            'pages/dashboard/dashboard.component.ts': this.generateAngularDashboard(config, appName),
            'package.json': this.generateAngularPackageJson(config, appName),
            'angular.json': this.generateAngularConfig(config),
            'tsconfig.json': this.generateAngularTSConfig()
        };
    }
    // Helper methods for generating specific framework files
    generateReactApp(config, appName, isTypeScript) {
        const imports = this.getReactImports(config, isTypeScript);
        const routing = this.getReactRouting(config);
        const stateProvider = this.getReactStateProvider(config);
        return `${imports}

function App() {
  return (
    ${stateProvider}
      ${routing}
    ${stateProvider.includes('<') ? stateProvider.split('<')[0].replace('<', '</') + '>' : ''}
  );
}

export default App;`;
    }
    getReactImports(config, isTypeScript) {
        const imports = ['import React from \'react\';'];
        if (config.routing.id === 'react-router') {
            imports.push('import { BrowserRouter as Router, Routes, Route } from \'react-router-dom\';');
        }
        if (config.componentLibrary?.id === 'chakra-ui') {
            imports.push('import { ChakraProvider } from \'@chakra-ui/react\';');
        }
        else if (config.componentLibrary?.id === 'material-ui') {
            imports.push('import { ThemeProvider, createTheme } from \'@mui/material/styles\';');
        }
        if (config.stateManagement.id === 'redux') {
            imports.push('import { Provider } from \'react-redux\';');
            imports.push('import { store } from \'./store\';');
        }
        return imports.join('\n');
    }
    getReactRouting(config) {
        if (config.routing.id === 'react-router') {
            return `<Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>`;
        }
        return '<Dashboard />';
    }
    getReactStateProvider(config) {
        if (config.stateManagement.id === 'redux') {
            return '<Provider store={store}>';
        }
        else if (config.componentLibrary?.id === 'chakra-ui') {
            return '<ChakraProvider>';
        }
        else if (config.componentLibrary?.id === 'material-ui') {
            return '<ThemeProvider theme={createTheme()}>';
        }
        return '<>';
    }
    // ... Additional helper methods for other frameworks would go here
    generateAdvancedBackend(request) {
        // Generate backend based on requirements
        return {
            'server.js': this.generateExpressServer(request),
            'routes/api.js': this.generateAPIRoutes(request),
            'middleware/auth.js': request.config.features.authentication ? this.generateAuthMiddleware() : null
        };
    }
    generateAdvancedDatabase(request) {
        return {
            'schema.prisma': this.generatePrismaSchema(request),
            'migrations/': this.generateMigrations(request)
        };
    }
    generateAdvancedFeatures(request) {
        const features = ['Responsive Design', 'Modern Architecture'];
        if (request.config.features.authentication)
            features.push('Authentication & Authorization');
        if (request.config.features.realtime)
            features.push('Real-time Updates');
        if (request.config.features.fileUpload)
            features.push('File Upload');
        if (request.config.features.payments)
            features.push('Payment Integration');
        if (request.config.features.notifications)
            features.push('Push Notifications');
        if (request.config.features.analytics)
            features.push('Analytics');
        if (request.config.features.i18n)
            features.push('Internationalization');
        if (request.config.features.pwa)
            features.push('Progressive Web App');
        return features;
    }
    // Additional helper methods would be implemented here...
    generatePackageJson(config, appName) {
        return {
            name: appName.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            type: 'module',
            scripts: {
                dev: 'vite',
                build: 'vite build',
                preview: 'vite preview'
            },
            dependencies: this.getDependencies(config),
            devDependencies: this.getDevDependencies(config)
        };
    }
    getDependencies(config) {
        const deps = {};
        // Framework
        if (config.framework.id === 'react') {
            deps.react = '^18.2.0';
            deps['react-dom'] = '^18.2.0';
        }
        // Component Library
        if (config.componentLibrary?.id === 'chakra-ui') {
            deps['@chakra-ui/react'] = '^2.8.2';
            deps['@emotion/react'] = '^11.11.1';
            deps['@emotion/styled'] = '^11.11.0';
        }
        // CSS Framework
        if (config.cssFramework.id === 'tailwind') {
            // Tailwind is usually a dev dependency
        }
        // State Management
        if (config.stateManagement.id === 'redux') {
            deps['@reduxjs/toolkit'] = '^1.9.7';
            deps['react-redux'] = '^8.1.3';
        }
        // Routing
        if (config.routing.id === 'react-router') {
            deps['react-router-dom'] = '^6.18.0';
        }
        return deps;
    }
    getDevDependencies(config) {
        const devDeps = {
            vite: '^4.5.0',
            '@vitejs/plugin-react': '^4.1.1'
        };
        if (config.language === 'TypeScript') {
            devDeps.typescript = '^5.2.2';
            devDeps['@types/react'] = '^18.2.37';
            devDeps['@types/react-dom'] = '^18.2.15';
        }
        if (config.cssFramework.id === 'tailwind') {
            devDeps.tailwindcss = '^3.3.5';
            devDeps.autoprefixer = '^10.4.16';
            devDeps.postcss = '^8.4.31';
        }
        return devDeps;
    }
    // Placeholder implementations for other generation methods
    generateTSConfig() { return {}; }
    generateTailwindConfig() { return {}; }
    generateViteConfig(config) { return {}; }
    generateReactLayout(config, isTypeScript) { return ''; }
    generateReactDashboard(config, appName, isTypeScript) { return ''; }
    generateVueApp(config, appName) { return ''; }
    generateVueLayout(config) { return ''; }
    generateVueDashboard(config, appName) { return ''; }
    generateVuePackageJson(config, appName) { return {}; }
    generateVueViteConfig(config) { return {}; }
    generateAngularApp(config, appName) { return ''; }
    generateAngularLayout(config) { return ''; }
    generateAngularDashboard(config, appName) { return ''; }
    generateAngularPackageJson(config, appName) { return {}; }
    generateAngularConfig(config) { return {}; }
    generateAngularTSConfig() { return {}; }
    generateExpressServer(request) { return ''; }
    generateAPIRoutes(request) { return ''; }
    generateAuthMiddleware() { return ''; }
    generatePrismaSchema(request) { return ''; }
    generateMigrations(request) { return {}; }
    generateAppId() {
        return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    extractAppName(description) {
        const words = description.toLowerCase().split(' ');
        const relevantWords = words.filter(word => word.length > 3 && !['application', 'app', 'website', 'platform', 'system', 'tool'].includes(word));
        if (relevantWords.length > 0) {
            return relevantWords.slice(0, 2).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') + 'App';
        }
        return 'MyApp';
    }
    generateFallbackApp(request, userId) {
        return {
            id: this.generateAppId(),
            name: request.projectName || this.extractAppName(request.description),
            description: request.description,
            userId,
            createdAt: new Date(),
            status: 'generated',
            frontend: this.generateAdvancedFrontend(request),
            backend: this.generateAdvancedBackend(request),
            database: this.generateAdvancedDatabase(request),
            config: {
                framework: request.config.framework.name,
                language: request.config.language,
                styling: request.config.cssFramework.name,
                database: request.config.database,
                hosting: request.config.hosting
            },
            advancedConfig: request.config,
            features: this.generateAdvancedFeatures(request),
            url: `${process.env.APP_BASE_URL}/${this.generateAppId()}`
        };
    }
}
exports.AdvancedAIService = AdvancedAIService;
//# sourceMappingURL=advancedAIService.js.map