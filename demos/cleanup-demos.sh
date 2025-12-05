#!/bin/bash

# Cleanup demo artifacts and restore original state

set -e

echo "🧹 Cleaning up demo artifacts..."
echo ""

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Remove demo branches
echo "Removing demo branches..."
git branch -D demo/backward-compatible 2>/dev/null && echo "  ✅ Removed demo/backward-compatible" || true
git branch -D demo/breaking-consumer 2>/dev/null && echo "  ✅ Removed demo/breaking-consumer" || true
git branch -D demo/breaking-provider 2>/dev/null && echo "  ✅ Removed demo/breaking-provider" || true
git branch -D demo/schema-mismatch 2>/dev/null && echo "  ✅ Removed demo/schema-mismatch" || true

# Ensure on main branch
echo ""
echo "Switching to main branch..."
git checkout main 2>/dev/null || true
echo "  ✅ On main branch"

# Clean any uncommitted changes
echo ""
echo "Resetting any uncommitted changes..."
git reset --hard HEAD
echo "  ✅ Working directory clean"

# Stop any running providers
echo ""
echo "Stopping any running providers..."
pkill -f "node.*provider" 2>/dev/null && echo "  ✅ Provider stopped" || echo "  ℹ️  No provider running"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Cleanup Complete! ✅                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Your repository is now back to its original state."
echo ""
