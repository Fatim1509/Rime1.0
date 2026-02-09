<p align="center">
  <h1 align="center">❄️ RIME</h1>
  <p align="center"><strong>Recursive Intelligence Multi-Agent Environment</strong></p>
  <p align="center">AI as Infrastructure, Not Feature</p>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#demo">Demo</a>
</p>

---

## 🎯 What is RIME?

RIME is an **AI command center** that observes your screen, predicts your needs, and orchestrates specialized AI agents to take **autonomous action** across your development environment.

**Unlike chatbots that add noise, RIME removes it.** No more 47 tabs open. No more context switching. RIME sees what you're doing and coordinates the right agents to help.

### 🏆 Hackathon Submission
- **Google Gemini API Competition**
- **Multi-agent orchestration with real-time vision**
- **Built in 10 days**

---

## 🚀 Quick Start (2 Minutes)

```bash
# 1. Clone repository
git clone https://github.com/Fatim1509/rime.git
cd rime

# 2. Start with Docker (recommended)
cd infrastructure
docker-compose up -d

# 3. Or use mock mode (no API keys needed)
cp .env.example .env
# Edit: ENABLE_MOCK=true
docker-compose up -d

# 4. Open dashboard
open http://localhost:3000
