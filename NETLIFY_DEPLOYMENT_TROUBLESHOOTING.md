# Netlify Deployment Configuration

## Node.js Version Specification

This project is configured to use Node.js 18.19.0 for Netlify deployments. The version is specified in multiple ways to ensure compatibility:

### 1. netlify.toml Configuration
```toml
[build.environment]
NODE_VERSION = "18.19.0"
NPM_VERSION = "10.2.3"
```

### 2. .nvmrc File
```
18.19.0
```

### 3. .node-version File
```
18.19.0
```

### 4. package.json engines Field
```json
{
  "engines": {
    "node": ">=18.19.0",
    "npm": ">=10.2.0"
  }
}
```

## Build Process

The build process is optimized for Netlify:

1. **Root Dependencies**: Install root-level dependencies
2. **Client Dependencies**: Navigate to client directory and install dependencies  
3. **Build Client**: Run the React build process
4. **Deploy**: Deploy the `client/dist` directory

## Environment Variables

Set these in your Netlify dashboard:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_API_URL`: Backend API URL (optional for client-only deployment)

## Troubleshooting

If deployment fails:

1. Check the build logs in Netlify dashboard
2. Verify Node.js version is detected correctly
3. Ensure all environment variables are set
4. Check for dependency conflicts in package-lock.json files

## Manual Deployment Test

To test the build locally:

```bash
# In root directory
npm install --legacy-peer-deps

# In client directory
cd client
npm install --legacy-peer-deps
npm run build

# Check if dist directory is created
ls -la dist/
```