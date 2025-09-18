# 🚀 GitHub Deployment Guide for CATMS

This guide will help you deploy your CATMS project to GitHub with proper security and CI/CD pipeline.

## 📋 Prerequisites

- GitHub account (KusalPabasara)
- Git configured on your local machine
- Docker installed (for local testing)

## 🔧 Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com/KusalPabasara
2. **Click "New repository"**
3. **Repository settings**:
   - Name: `CATMS`
   - Description: `Clinical Appointment and Treatment Management System`
   - Visibility: Public (or Private if preferred)
   - **IMPORTANT**: Do NOT initialize with README, .gitignore, or license
4. **Click "Create repository"**

## 🔐 Step 2: Authentication Setup

Choose one of these authentication methods:

### Option A: Personal Access Token (Recommended)

1. **Generate Token**:
   - Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `workflow`, `write:packages`
   - Copy the token (save it securely!)

2. **Push to GitHub**:
   ```bash
   git push -u origin main
   # Username: KusalPabasara
   # Password: [paste your token]
   ```

### Option B: SSH Key

1. **Generate SSH Key**:
   ```bash
   ssh-keygen -t ed25519 -C "your.email@example.com"
   ```

2. **Add to GitHub**:
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub Settings > SSH and GPG keys > New SSH key
   - Paste the key

3. **Update Remote and Push**:
   ```bash
   git remote set-url origin git@github.com:KusalPabasara/CATMS.git
   git push -u origin main
   ```

### Option C: GitHub CLI

1. **Install GitHub CLI**:
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
   sudo apt update
   sudo apt install gh
   ```

2. **Authenticate and Push**:
   ```bash
   gh auth login
   git push -u origin main
   ```

## 🔒 Step 3: Configure GitHub Secrets

1. **Go to Repository Settings**:
   - Navigate to your CATMS repository
   - Click "Settings" tab
   - Click "Secrets and variables" > "Actions"

2. **Add Required Secrets**:
   ```
   MYSQL_ROOT_PASSWORD    = your_secure_root_password
   MYSQL_PASSWORD         = your_secure_database_password
   JWT_SECRET            = your_super_secure_jwt_secret_minimum_32_chars
   SMTP_PASS             = your_email_app_password (optional)
   TWILIO_AUTH_TOKEN     = your_twilio_auth_token (optional)
   STRIPE_SECRET_KEY     = your_stripe_secret_key (optional)
   ```

3. **Add Optional Secrets** (if using these services):
   ```
   SMTP_HOST             = smtp.gmail.com
   SMTP_USER             = your_email@gmail.com
   TWILIO_ACCOUNT_SID    = your_twilio_account_sid
   TWILIO_PHONE_NUMBER   = your_twilio_phone_number
   STRIPE_PUBLISHABLE_KEY = your_stripe_publishable_key
   ```

## 🚀 Step 4: Enable GitHub Actions

1. **Go to Actions Tab**:
   - In your CATMS repository
   - Click "Actions" tab
   - Click "I understand my workflows, go ahead and enable them"

2. **Verify Workflow**:
   - The CI/CD pipeline should be automatically enabled
   - You can see the workflow file at `.github/workflows/ci-cd.yml`

## 🧪 Step 5: Test CI/CD Pipeline

1. **Make a Test Change**:
   ```bash
   # Edit a file (e.g., README.md)
   echo "# Test Update" >> README.md
   git add README.md
   git commit -m "Test CI/CD pipeline"
   git push origin main
   ```

2. **Check Actions**:
   - Go to Actions tab in your repository
   - You should see the workflow running
   - Check for any errors and fix them

## 📊 Step 6: Monitor Deployment

### GitHub Actions Workflow

The CI/CD pipeline includes:

1. **Test Stage**:
   - Unit tests for backend and frontend
   - Integration tests with test database
   - Code quality checks

2. **Security Stage**:
   - Vulnerability scanning with Trivy
   - Dependency security audit
   - Container image scanning

3. **Build Stage**:
   - Multi-stage Docker builds
   - Image optimization
   - Registry push to GitHub Container Registry

4. **Deploy Stage**:
   - Production deployment
   - Health checks
   - Rollback capability

### Monitoring Commands

```bash
# Check repository status
git status

# View recent commits
git log --oneline -5

# Check remote configuration
git remote -v

# View GitHub Actions logs
# (Go to Actions tab in GitHub web interface)
```

## 🔧 Step 7: Local Development Workflow

After setting up GitHub:

1. **Clone for Development**:
   ```bash
   git clone https://github.com/KusalPabasara/CATMS.git
   cd CATMS
   ```

2. **Set up Environment**:
   ```bash
   cp env.production.example .env.production
   # Edit .env.production with your settings
   ```

3. **Run Locally**:
   ```bash
   make dev
   ```

4. **Make Changes and Push**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Failed**:
   - Check your GitHub credentials
   - Verify token permissions
   - Try SSH instead of HTTPS

2. **Push Rejected**:
   - Check if repository exists
   - Verify remote URL
   - Pull latest changes first

3. **CI/CD Pipeline Fails**:
   - Check GitHub Secrets are set
   - Review Actions logs
   - Fix any code issues

4. **Docker Build Fails**:
   - Check Dockerfile syntax
   - Verify all files are committed
   - Check for missing dependencies

### Debug Commands

```bash
# Check git configuration
git config --list

# Check remote URLs
git remote -v

# Check branch status
git branch -a

# View commit history
git log --oneline

# Check file status
git status

# Check ignored files
git check-ignore -v *
```

## 📚 Repository Structure

After successful push, your repository will contain:

```
CATMS/
├── .github/workflows/     # CI/CD pipeline
├── backend/               # Node.js API server
├── frontend/              # React frontend
├── database/              # Database schema and migrations
├── nginx/                 # Nginx configuration
├── scripts/               # Deployment scripts
├── docker-compose.*.yml   # Docker environments
├── Dockerfile.*           # Container definitions
├── .gitignore            # Git ignore rules
├── README.md             # Project documentation
├── DEPLOYMENT.md         # Deployment guide
└── Makefile              # Management commands
```

## 🎯 Next Steps

1. **Set up Production Environment**:
   - Configure your production server
   - Set up domain and SSL certificates
   - Configure monitoring and logging

2. **Database Setup**:
   - Set up production MySQL database
   - Run migrations
   - Configure backups

3. **Security Hardening**:
   - Update default passwords
   - Configure firewall rules
   - Set up SSL/TLS certificates

4. **Monitoring**:
   - Set up application monitoring
   - Configure log aggregation
   - Set up alerting

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check the DEPLOYMENT.md file
4. Create an issue in the GitHub repository

## ✅ Success Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] GitHub Secrets configured
- [ ] GitHub Actions enabled
- [ ] CI/CD pipeline working
- [ ] Local development setup complete
- [ ] Documentation reviewed

---

**Congratulations!** Your CATMS project is now successfully deployed to GitHub with full CI/CD pipeline support! 🎉
