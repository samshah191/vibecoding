#!/bin/bash
set -e  # Exit on any error

# VibeCoding Netlify Deployment Script
# This script ensures optimal build environment for Netlify

echo "🚀 VibeCoding Platform - Netlify Build Starting..."
echo "📍 Current directory: $(pwd)"
echo "📂 Directory contents:"
ls -la

# Set Node version
export NODE_VERSION=18
export CI=false
export NPM_CONFIG_LEGACY_PEER_DEPS=true

# Check if client directory exists
if [ ! -d "client" ]; then
  echo "❌ Error: client directory not found!"
  echo "📂 Current directory structure:"
  find . -maxdepth 2 -type d
  exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps

# Navigate to client and install dependencies
echo "📦 Installing client dependencies..."
cd client

# Verify we're in the right place
echo "📍 Now in directory: $(pwd)"
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found in client directory!"
  exit 1
fi

npm install --legacy-peer-deps

# Build the React application
echo "🔨 Building VibeCoding client..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
  echo "❌ Error: Build failed - dist directory not created!"
  exit 1
fi

echo "✅ VibeCoding Platform build completed successfully!"
echo "📁 Build output: client/dist"
echo "📊 Build size:"
du -sh dist