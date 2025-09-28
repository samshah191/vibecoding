# GitHub Integration Guide

This guide will help you integrate your VibeCoding platform with GitHub for version control and collaboration.

## Setup Steps

1. Create a GitHub repository for your project
2. Configure GitHub OAuth app for authentication
3. Set up environment variables
4. Push your code to GitHub

## Environment Variables

Add these to your .env files:

```bash
# Client (.env)
VITE_GITHUB_CLIENT_ID=your_github_client_id_here

# Server (.env)
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

## GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth app
3. Fill in your app details
4. Copy the Client ID and Client Secret to your .env files

## Features

- User authentication via GitHub
- Repository management
- Code synchronization
- Collaboration features

## Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- Regularly rotate your secrets