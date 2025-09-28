#!/bin/bash

# VibeCoding Netlify Deployment Script
# This script ensures optimal build environment for Netlify

echo "🚀 VibeCoding Platform - Netlify Build Starting..."

# Set Node version
export NODE_VERSION=18
export CI=false
export NPM_CONFIG_LEGACY_PEER_DEPS=true

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps

# Navigate to client and install dependencies
echo "📦 Installing client dependencies..."
cd client
npm install --legacy-peer-deps

# Build the React application
echo "🔨 Building VibeCoding client..."
npm run build

echo "✅ VibeCoding Platform build completed successfully!"
echo "📁 Build output: client/dist"