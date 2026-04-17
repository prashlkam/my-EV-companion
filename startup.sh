#!/bin/bash

# Azure App Service Linux startup script
# Build the React app and start the Express server

echo "Starting Azure App Service deployment..."

# Install dependencies if node_modules doesn't exist or is empty
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the React app
echo "Building React app..."
npm run build

# Start the server
echo "Starting server on port $PORT..."
npm start
