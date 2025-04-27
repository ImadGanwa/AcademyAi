#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Current directory: $(pwd)"
echo "Listing source files:"
ls -la src/

# Install dependencies
npm install --production=false

# Create dist directory if it doesn't exist
mkdir -p dist

# Build the project
echo "Running TypeScript compilation..."
npx tsc --project tsconfig.json

# Verify the build output
echo "Compiled files in dist:"
ls -la dist/

# Copy necessary files
cp package.json dist/
cp package-lock.json dist/

# Verify app.js exists
if [ ! -f "dist/app.js" ]; then
    echo "Error: app.js not found in dist directory"
    echo "Contents of src directory:"
    ls -la src/
    exit 1
fi 