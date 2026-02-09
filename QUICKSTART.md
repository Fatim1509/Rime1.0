# RIME Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites Check
```bash
node --version  # Should be 18+
python3 --version  # Should be 3.11+
docker --version  # Optional but recommended
```

### Installation

#### Option 1: Quick Start (Recommended)
```bash
# Clone the repository
git clone <your-repo-url>
cd rime

# Run setup (installs dependencies)
chmod +x scripts/setup.sh
./scripts/setup.sh

# Configure environment
cp infrastructure/.env.example infrastructure/.env
# Edit .env with your API keys (see below)

# Start all services
chmod +x scripts/dev-start.sh
./scripts/dev-start.sh
```

#### Option 2: Docker Compose
```bash
cd infrastructure
cp .env.example .env
# Edit .env with your API keys
docker-compose up -d
```

### Required API Keys

Edit `infrastructure/.env`:

```bash
# Minimum required for demo:
ENABLE_MOCK=true  # No API keys needed!

# For full functionality:
GOOGLE_AI_API_KEY=your_gemini_api_key  # Get from https://ai.google.dev/
```

Optional integrations:
```bash
PINECONE_API_KEY=your_key  # For vector memory
GITHUB_TOKEN=your_token    # For GitHub integration
SLACK_BOT_TOKEN=your_token # For Slack integration
```

### Access Points

After starting services:
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:4000
- **API Health**: http://localhost:4000/health
- **Screen Service**: http://localhost:8000

## 🎮 Using RIME

### 1. Command Palette (OmniBar)
Press `Cmd/Ctrl + Shift + Space` anywhere in the dashboard:
```
"fix this error"
"explain this code"
"search for React hooks documentation"
"tell Sarah about this bug"
"schedule meeting with team"
```

### 2. Voice Commands
Click the microphone icon or say:
```
"Hey Rime, fix this error"
"Hey Rime, explain this function"
"Hey Rime, search for documentation"
```

### 3. VS Code Extension
```bash
# Install from source
cd apps/vscode-extension
npm install
npm run build
# Press F5 in VS Code to test

# Commands:
Cmd+Shift+P → "RIME: Explain This Code"
Cmd+Shift+P → "RIME: Fix This Error"
```

### 4. Chrome Extension
```bash
# Install from source
1. Open chrome://extensions
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select apps/chrome-extension folder

# Usage:
- Right-click selected text → "Ask RIME about this"
- Click extension icon → "Analyze This Page"
```

## 🎬 Demo Mode

Perfect for testing without API keys:

```bash
# In infrastructure/.env
ENABLE_MOCK=true
MOCK_SCENARIO=coding  # Options: coding, debugging, research, communication
```

Mock mode provides:
- ✅ Realistic screen context
- ✅ Pre-configured scenarios
- ✅ Simulated agent responses
- ✅ All UI features working

## 🐛 Troubleshooting

### Service won't start
```bash
# Check if ports are already in use
lsof -i :3000  # Dashboard
lsof -i :4000  # Core Engine
lsof -i :8000  # Screen Service

# Kill existing processes if needed
kill -9 <PID>
```

### WebSocket connection failed
```bash
# Verify core engine is running
curl http://localhost:4000/health

# Check environment variables
cat infrastructure/.env | grep URL
```

### Screen capture not working
```bash
# Enable mock mode (works without display)
ENABLE_MOCK=true

# Or check display environment
echo $DISPLAY  # Should show :0 or similar
```

### Build errors
```bash
# Clean and reinstall
cd services/core-engine
rm -rf node_modules package-lock.json
npm install

cd ../../apps/dashboard
rm -rf node_modules package-lock.json .next
npm install
```

## 📊 Verify Installation

Run these checks:

```bash
# 1. Health checks
curl http://localhost:4000/health
curl http://localhost:8000/health

# 2. Test API
curl -X POST http://localhost:4000/api/intent \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'

# 3. Check WebSocket
# Open browser console at http://localhost:3000
# Should see: "✅ WebSocket connected"
```

## 🎯 First Actions

Try these commands in the OmniBar:

1. **"fix this error"** → See Code Agent in action
2. **"search for documentation"** → See Research Agent
3. **"tell Sarah about this"** → See Communication Agent
4. **Any custom query** → See Meta Agent orchestration

## 📚 Next Steps

- Read [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for system design
- Read [API.md](./docs/API.md) for API reference
- Read [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for production setup
- Check [CONTRIBUTING.md](./docs/CONTRIBUTING.md) to contribute

## 💡 Pro Tips

1. **Use Mock Mode First**: Get familiar with the UI without API keys
2. **Try Different Scenarios**: Change MOCK_SCENARIO in .env
3. **Watch the Action Stream**: See how agents propose and execute actions
4. **Check Agent States**: Monitor the Agent Swarm panel
5. **Use Keyboard Shortcuts**: ⌘⇧Space for OmniBar, ESC to close

## 🆘 Getting Help

- **Issues**: Check GitHub Issues
- **Docs**: Read docs/ folder
- **Logs**: Check terminal output
- **Health**: Visit /health endpoints

---

**You're ready to experience AI-powered development! 🎉**
