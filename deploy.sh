#!/bin/bash

# Azure App Service deployment script

echo "Starting deployment..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the app
echo "Building the app..."
npm run build

# Copy web.config to dist folder
echo "Copying web.config to dist..."
cp web.config dist/

echo "Deployment complete!"
