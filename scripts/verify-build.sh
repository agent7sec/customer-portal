#!/bin/bash
set -e

echo "🔍 Running type check..."
npm run type-check

echo "📝 Running linting..."
npm run lint

echo "🧪 Running unit tests..."
npm test

echo "🏗️ Building application..."
npm run build

echo "✅ Verifying build output..."
if [ ! -d "dist" ]; then
  echo "❌ Error: Build output directory not found"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "❌ Error: index.html not found in build output"
  exit 1
fi

echo "🎉 Build verification complete!"
