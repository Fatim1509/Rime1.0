# RIME: Recursive Intelligence Multi-Agent Environment

![RIME Logo](./apps/dashboard/public/logo.svg)

**AI as Infrastructure, Not Feature** - RIME is an intelligent command center that observes your screen, predicts your needs, and orchestrates specialized AI agents to take autonomous action across your development environment.

## 🚀 Quick Start

```bash
# Clone and setup
git clone <your-repo-url>
cd rime
chmod +x scripts/setup.sh
./scripts/setup.sh

# Configure environment
cp infrastructure/.env.example infrastructure/.env
# Edit .env with your API keys

# Start all services
chmod +x scripts/dev-start.sh
./scripts/dev-start.sh

# Open dashboard
open http://localhost:3000
```

## ✨ Features

### 🔍 **Real-Time Screen Intelligence**
- Continuous screen capture and analysis
- Context-aware activity detection
- Multi-modal vision understanding with Gemini 3

### 🤖 **Multi-Agent Orchestration**
- **Research Agent**: Web search, documentation lookup, Stack Overflow integration
- **Code Agent**: Error parsing, fix suggestions, code explanations
- **Communication Agent**: Message drafting, channel selection, scheduling

### 💡 **Proactive Assistance**
- Predicts needs based on screen context
- Suggests actions before you ask
- Learn from your patterns and preferences

### 🎯 **Action Timeline**
- Visual timeline of AI-proposed actions
- One-click approve/reject
- Real-time execution status
- Dependency-aware workflow management

### 🎤 **Voice Control**
- "Hey Rime" wake word activation
- Natural language commands
- Real-time transcript and feedback

### 🔌 **Deep Integrations**
- **VS Code Extension**: Inline suggestions, error detection
- **Chrome Extension**: Page content extraction, context menu
- **Browser**: Direct browser control and automation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  User Interface                      │
│  OmniBar │ Agent Swarm │ Action Stream │ Context    │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│            Orchestration Layer (Meta-Agent)          │
│        Routes │ Manages State │ Resolves Conflicts  │
└──────┬─────────────┬─────────────────┬──────────────┘
       │             │                 │
┌──────▼──┐   ┌─────▼─────┐   ┌───────▼────┐
│Research │   │   Code    │   │    Comm    │
│ Agent   │   │   Agent   │   │   Agent    │
└─────────┘   └───────────┘   └────────────┘
       │             │                 │
┌──────▼─────────────▼─────────────────▼──────────────┐
│           Gemini 3 Integration Layer                 │
│    Vision API │ Text API │ Function Calling          │
└──────┬─────────────┬─────────────────┬──────────────┘
       │             │                 │
┌──────▼─────────────▼─────────────────▼──────────────┐
│         Context & Memory Layer                       │
│  Screen │ Vector DB (Pinecone) │ State Machine      │
└──────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, TypeScript, Tailwind, Framer Motion | React framework with App Router |
| **Backend** | Node.js, Express, Socket.io, TypeScript | HTTP/WebSocket server |
| **AI** | Google Generative AI (Gemini 3) | Multimodal intelligence |
| **Screen** | Python, FastAPI, mss | Screen capture service |
| **Database** | PostgreSQL, Redis, Pinecone | Relational, cache, vector DB |
| **Infrastructure** | Docker, Docker Compose | Containerization |

## 📦 Services

### Core Engine (`services/core-engine`)
Node.js backend orchestrating all agents, managing state, and coordinating workflows.

### Screen Service (`services/screen-service`)
Python FastAPI service capturing screenshots and streaming to core engine.

### Dashboard (`apps/dashboard`)
Next.js web interface with real-time updates, command palette, and action timeline.

### VS Code Extension (`apps/vscode-extension`)
IDE integration with inline suggestions and error detection.

### Chrome Extension (`apps/chrome-extension`)
Browser integration for page content extraction and web automation.

## 🎮 Usage

### OmniBar Commands
Press `Cmd/Ctrl + Shift + Space` to open the command palette:

- 🔧 **Fix this error** - Automatically debug and suggest fixes
- 💡 **Explain this code** - Get detailed code explanations
- 🔍 **Search documentation** - Find relevant docs
- ✉️ **Draft message to...** - AI-assisted communication
- 📅 **Schedule meeting** - Smart calendar management

### Voice Commands
Say "Hey Rime" followed by:
- "Fix this error"
- "Explain this function"
- "Search for React hooks documentation"
- "Tell Sarah about the bug"

## 🧪 Mock Mode

For testing without real screen capture or API keys:

```bash
ENABLE_MOCK=true
MOCK_SCENARIO=coding
```

Built-in scenarios: `coding`, `debugging`, `research`, `communication`

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design and data flow
- [API Reference](./docs/API.md) - Complete API documentation
- [Deployment](./docs/DEPLOYMENT.md) - Deployment guides
- [Contributing](./docs/CONTRIBUTING.md) - Contribution guidelines

## 🔑 Environment Variables

```bash
# Core
PORT=4000
NODE_ENV=development

# AI
GOOGLE_AI_API_KEY=your_gemini_api_key

# Services
SCREEN_SERVICE_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379
POSTGRES_URL=postgresql://localhost:5432/rime

# Vector Database
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_environment

# Integrations (Optional)
GITHUB_TOKEN=your_github_token
SLACK_TOKEN=your_slack_token

# Features
ENABLE_MOCK=false
MOCK_SCENARIO=coding
CAPTURE_INTERVAL=3000
SCREENSHOT_QUALITY=85
```

## 🧩 Extensions

### VS Code Extension
1. Open VS Code
2. Go to Extensions
3. Install from `apps/vscode-extension`
4. Configure Rime endpoint in settings

### Chrome Extension
1. Open Chrome
2. Go to `chrome://extensions`
3. Enable Developer Mode
4. Load unpacked from `apps/chrome-extension`

## 🚢 Deployment

### Local Development
```bash
./scripts/dev-start.sh
```

### Production (Docker Compose)
```bash
cd infrastructure
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment
- **Dashboard**: Deploy to Vercel
- **Core Engine**: Deploy to Railway/Render
- **Database**: Use managed PostgreSQL, Redis, Pinecone

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed guides.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

Built with:
- [Gemini](https://ai.google.dev/) - Google's multimodal AI
- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [Pinecone](https://www.pinecone.io/) - Vector database

---

**Made with ❤️ for developers who want AI that actually helps**
