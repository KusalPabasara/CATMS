#!/bin/bash

# GitHub Setup Script for CATMS
# This script helps you push the CATMS project to GitHub

echo "🚀 CATMS GitHub Setup"
echo "====================="
echo ""

# Check if git is configured
if ! git config --global user.name > /dev/null 2>&1; then
    echo "❌ Git is not configured. Please run:"
    echo "   git config --global user.name 'Your Name'"
    echo "   git config --global user.email 'your.email@example.com'"
    echo ""
    exit 1
fi

echo "✅ Git is configured"
echo ""

# Check if repository exists
echo "📋 GitHub Repository Setup Instructions:"
echo "1. Go to https://github.com/KusalPabasara"
echo "2. Click 'New repository'"
echo "3. Name: CATMS"
echo "4. Description: Clinical Appointment and Treatment Management System"
echo "5. Make it Public (or Private if preferred)"
echo "6. DO NOT initialize with README, .gitignore, or license"
echo "7. Click 'Create repository'"
echo ""

read -p "Press Enter after creating the repository..."

# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Remote origin already configured"
else
    echo "❌ Remote origin not found. Please check repository creation."
    exit 1
fi

echo ""
echo "🔐 Authentication Options:"
echo "1. Personal Access Token (Recommended)"
echo "2. SSH Key"
echo "3. GitHub CLI"
echo ""

echo "For Personal Access Token:"
echo "1. Go to GitHub Settings > Developer settings > Personal access tokens"
echo "2. Generate new token with 'repo' permissions"
echo "3. Copy the token"
echo ""

echo "For SSH Key:"
echo "1. Generate SSH key: ssh-keygen -t ed25519 -C 'your.email@example.com'"
echo "2. Add to GitHub: Settings > SSH and GPG keys"
echo "3. Use SSH URL: git@github.com:KusalPabasara/CATMS.git"
echo ""

echo "🚀 Push Commands:"
echo ""
echo "Option 1 - Using Personal Access Token:"
echo "git push -u origin main"
echo "(Enter your GitHub username and use token as password)"
echo ""
echo "Option 2 - Using SSH:"
echo "git remote set-url origin git@github.com:KusalPabasara/CATMS.git"
echo "git push -u origin main"
echo ""
echo "Option 3 - Using GitHub CLI:"
echo "gh auth login"
echo "git push -u origin main"
echo ""

echo "📊 After successful push, your repository will be available at:"
echo "https://github.com/KusalPabasara/CATMS"
echo ""

echo "🔧 Next Steps:"
echo "1. Set up GitHub Secrets for CI/CD:"
echo "   - Go to repository Settings > Secrets and variables > Actions"
echo "   - Add these secrets:"
echo "     * MYSQL_ROOT_PASSWORD"
echo "     * MYSQL_PASSWORD" 
echo "     * JWT_SECRET"
echo "     * SMTP_PASS (if using email)"
echo "     * TWILIO_AUTH_TOKEN (if using SMS)"
echo "     * STRIPE_SECRET_KEY (if using payments)"
echo ""
echo "2. Enable GitHub Actions:"
echo "   - Go to Actions tab in your repository"
echo "   - Enable workflows"
echo ""
echo "3. Test deployment:"
echo "   - Make a small change and push"
echo "   - Check Actions tab for CI/CD pipeline"
echo ""

echo "✅ Setup complete! Your CATMS project is ready for GitHub."
