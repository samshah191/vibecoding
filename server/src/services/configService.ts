import {
  FrameworkOption,
  ComponentLibraryOption,
  StateManagementOption,
  CSSFrameworkOption,
  RoutingOption
} from '../types/app';

export class ConfigService {
  // Framework Options
  static getFrameworkOptions(): FrameworkOption[] {
    return [
      {
        id: 'react',
        name: 'React',
        description: 'A JavaScript library for building user interfaces',
        icon: '⚛️',
        version: '18.x'
      },
      {
        id: 'vue',
        name: 'Vue.js',
        description: 'The Progressive JavaScript Framework',
        icon: '🖖',
        version: '3.x'
      },
      {
        id: 'angular',
        name: 'Angular',
        description: 'Platform for building mobile and desktop web applications',
        icon: '🅰️',
        version: '17.x'
      },
      {
        id: 'nextjs',
        name: 'Next.js',
        description: 'The React Framework for Production',
        icon: '▲',
        version: '14.x'
      },
      {
        id: 'nuxtjs',
        name: 'Nuxt.js',
        description: 'The Intuitive Vue Framework',
        icon: '💚',
        version: '3.x'
      }
    ];
  }

  // Component Library Options
  static getComponentLibraryOptions(): ComponentLibraryOption[] {
    return [
      {
        id: 'material-ui',
        name: 'Material-UI (MUI)',
        description: 'React components implementing Google\'s Material Design',
        framework: ['react', 'nextjs'],
        icon: '🎨',
        features: ['Themes', 'Icons', 'Data Grid', 'Date Pickers']
      },
      {
        id: 'chakra-ui',
        name: 'Chakra UI',
        description: 'Simple, modular and accessible component library',
        framework: ['react', 'nextjs'],
        icon: '⚡',
        features: ['Dark Mode', 'Responsive', 'Accessible', 'TypeScript']
      },
      {
        id: 'ant-design',
        name: 'Ant Design',
        description: 'Enterprise-class UI design language and components',
        framework: ['react', 'nextjs'],
        icon: '🐜',
        features: ['Enterprise UI', 'Rich Components', 'Internationalization']
      },
      {
        id: 'vuetify',
        name: 'Vuetify',
        description: 'Material Design Component Framework for Vue.js',
        framework: ['vue', 'nuxtjs'],
        icon: '💎',
        features: ['Material Design', 'Responsive', 'SASS Variables']
      },
      {
        id: 'quasar',
        name: 'Quasar',
        description: 'High-performance Vue.js framework',
        framework: ['vue', 'nuxtjs'],
        icon: '🌌',
        features: ['Cross Platform', 'Material Design', 'Performance']
      },
      {
        id: 'angular-material',
        name: 'Angular Material',
        description: 'Material Design components for Angular',
        framework: ['angular'],
        icon: '🔷',
        features: ['Material Design', 'Accessibility', 'CDK']
      },
      {
        id: 'ng-bootstrap',
        name: 'ng-bootstrap',
        description: 'Bootstrap components for Angular',
        framework: ['angular'],
        icon: '🅱️',
        features: ['Bootstrap', 'No jQuery', 'TypeScript']
      }
    ];
  }

  // CSS Framework Options
  static getCSSFrameworkOptions(): CSSFrameworkOption[] {
    return [
      {
        id: 'tailwind',
        name: 'Tailwind CSS',
        description: 'Utility-first CSS framework',
        type: 'utility',
        features: ['Utility Classes', 'Responsive', 'Dark Mode', 'JIT Compiler']
      },
      {
        id: 'bootstrap',
        name: 'Bootstrap',
        description: 'World\'s most popular CSS framework',
        type: 'component',
        features: ['Grid System', 'Components', 'JavaScript Plugins']
      },
      {
        id: 'styled-components',
        name: 'Styled Components',
        description: 'CSS-in-JS library for styling React components',
        type: 'css-in-js',
        features: ['CSS-in-JS', 'Theming', 'Dynamic Styling', 'TypeScript']
      },
      {
        id: 'emotion',
        name: 'Emotion',
        description: 'CSS-in-JS library with excellent performance',
        type: 'css-in-js',
        features: ['Performance', 'Source Maps', 'Labels', 'Caching']
      },
      {
        id: 'bulma',
        name: 'Bulma',
        description: 'Modern CSS framework based on Flexbox',
        type: 'component',
        features: ['Flexbox', 'Modular', 'Mobile First', 'Pure CSS']
      },
      {
        id: 'scss',
        name: 'SCSS/Sass',
        description: 'CSS with superpowers',
        type: 'utility',
        features: ['Variables', 'Nesting', 'Mixins', 'Functions']
      }
    ];
  }

  // State Management Options
  static getStateManagementOptions(): StateManagementOption[] {
    return [
      {
        id: 'context',
        name: 'React Context',
        description: 'Built-in React state management',
        framework: ['react', 'nextjs'],
        complexity: 'simple'
      },
      {
        id: 'redux',
        name: 'Redux Toolkit',
        description: 'Predictable state container for JavaScript apps',
        framework: ['react', 'nextjs', 'vue', 'angular'],
        complexity: 'advanced'
      },
      {
        id: 'zustand',
        name: 'Zustand',
        description: 'Small, fast and scalable state management',
        framework: ['react', 'nextjs'],
        complexity: 'medium'
      },
      {
        id: 'jotai',
        name: 'Jotai',
        description: 'Primitive and flexible state management',
        framework: ['react', 'nextjs'],
        complexity: 'medium'
      },
      {
        id: 'valtio',
        name: 'Valtio',
        description: 'Proxy-state made simple',
        framework: ['react', 'nextjs'],
        complexity: 'simple'
      },
      {
        id: 'vuex',
        name: 'Vuex',
        description: 'Centralized state management for Vue.js',
        framework: ['vue'],
        complexity: 'medium'
      },
      {
        id: 'pinia',
        name: 'Pinia',
        description: 'Intuitive, type safe and flexible Store for Vue',
        framework: ['vue', 'nuxtjs'],
        complexity: 'medium'
      },
      {
        id: 'ngrx',
        name: 'NgRx',
        description: 'Reactive State for Angular',
        framework: ['angular'],
        complexity: 'advanced'
      },
      {
        id: 'akita',
        name: 'Akita',
        description: 'State management pattern for Angular',
        framework: ['angular'],
        complexity: 'medium'
      }
    ];
  }

  // Routing Options
  static getRoutingOptions(): RoutingOption[] {
    return [
      {
        id: 'react-router',
        name: 'React Router',
        description: 'Declarative routing for React',
        framework: ['react'],
        features: ['Dynamic Routing', 'Code Splitting', 'Nested Routes']
      },
      {
        id: 'nextjs-router',
        name: 'Next.js Router',
        description: 'Built-in file-based routing',
        framework: ['nextjs'],
        features: ['File-based', 'API Routes', 'Dynamic Routes', 'SSR/SSG']
      },
      {
        id: 'reach-router',
        name: 'Reach Router',
        description: 'Accessible router for React (legacy)',
        framework: ['react'],
        features: ['Accessibility', 'Dynamic Routing']
      },
      {
        id: 'vue-router',
        name: 'Vue Router',
        description: 'Official router for Vue.js',
        framework: ['vue'],
        features: ['Dynamic Routing', 'Nested Routes', 'Guards']
      },
      {
        id: 'nuxtjs-router',
        name: 'Nuxt.js Router',
        description: 'Built-in file-based routing for Nuxt',
        framework: ['nuxtjs'],
        features: ['File-based', 'SSR/SSG', 'Dynamic Routes', 'Middleware']
      },
      {
        id: 'angular-router',
        name: 'Angular Router',
        description: 'Built-in routing for Angular',
        framework: ['angular'],
        features: ['Guards', 'Lazy Loading', 'Resolvers', 'Route Parameters']
      }
    ];
  }

  // Get compatible options based on framework
  static getCompatibleOptions(framework: string) {
    return {
      componentLibraries: this.getComponentLibraryOptions().filter(lib => 
        lib.framework.includes(framework)
      ),
      stateManagement: this.getStateManagementOptions().filter(sm => 
        sm.framework.includes(framework)
      ),
      routing: this.getRoutingOptions().filter(r => 
        r.framework.includes(framework)
      )
    };
  }

  // Get default configuration for a framework
  static getDefaultConfig(framework: string) {
    const compatibleOptions = this.getCompatibleOptions(framework);
    
    const defaults: { [key: string]: any } = {
      react: {
        componentLibrary: 'chakra-ui',
        cssFramework: 'tailwind',
        stateManagement: 'context',
        routing: 'react-router'
      },
      nextjs: {
        componentLibrary: 'chakra-ui',
        cssFramework: 'tailwind',
        stateManagement: 'context',
        routing: 'nextjs-router'
      },
      vue: {
        componentLibrary: 'vuetify',
        cssFramework: 'tailwind',
        stateManagement: 'pinia',
        routing: 'vue-router'
      },
      nuxtjs: {
        componentLibrary: 'vuetify',
        cssFramework: 'tailwind',
        stateManagement: 'pinia',
        routing: 'nuxtjs-router'
      },
      angular: {
        componentLibrary: 'angular-material',
        cssFramework: 'scss',
        stateManagement: 'ngrx',
        routing: 'angular-router'
      }
    };

    return defaults[framework] || defaults.react;
  }

  // Validate configuration compatibility
  static validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.framework) {
      errors.push('Framework is required');
      return { valid: false, errors };
    }

    const framework = config.framework.id || config.framework;
    const compatibleOptions = this.getCompatibleOptions(framework);

    // Check component library compatibility
    if (config.componentLibrary) {
      const libId = config.componentLibrary.id || config.componentLibrary;
      const isCompatible = compatibleOptions.componentLibraries.some(lib => lib.id === libId);
      if (!isCompatible) {
        errors.push(`Component library ${libId} is not compatible with ${framework}`);
      }
    }

    // Check state management compatibility
    if (config.stateManagement) {
      const smId = config.stateManagement.id || config.stateManagement;
      const isCompatible = compatibleOptions.stateManagement.some(sm => sm.id === smId);
      if (!isCompatible) {
        errors.push(`State management ${smId} is not compatible with ${framework}`);
      }
    }

    // Check routing compatibility
    if (config.routing) {
      const routingId = config.routing.id || config.routing;
      const isCompatible = compatibleOptions.routing.some(r => r.id === routingId);
      if (!isCompatible) {
        errors.push(`Routing ${routingId} is not compatible with ${framework}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}