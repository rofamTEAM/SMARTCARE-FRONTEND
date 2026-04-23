#!/bin/bash

# Clear Next.js build cache
echo "Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

echo "Cache cleared successfully!"
echo "Run 'npm run dev' to start the development server"
