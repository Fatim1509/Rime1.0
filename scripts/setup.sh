#!/bin/bash

echo "🚀 RIME Setup Script"
echo "===================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker not found. Docker setup will be skipped." >&2; }

echo -e "${GREEN}✓ Prerequisites check passed${NC}"

# Create environment file if it doesn't exist
if [ ! -f infrastructure/.env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp infrastructure/.env.example infrastructure/.env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit infrastructure/.env with your API keys before continuing${NC}"
    echo ""
    read -p "Press enter to continue after editing .env..."
fi

# Install dependencies for core engine
echo -e "${BLUE}Installing core engine dependencies...${NC}"
cd services/core-engine
npm install
cd ../..
echo -e "${GREEN}✓ Core engine dependencies installed${NC}"

# Install dependencies for dashboard
echo -e "${BLUE}Installing dashboard dependencies...${NC}"
cd apps/dashboard
npm install
cd ../..
echo -e "${GREEN}✓ Dashboard dependencies installed${NC}"

# Setup Python virtual environment for screen service
echo -e "${BLUE}Setting up Python screen service...${NC}"
cd services/screen-service
python3 -m venv venv
source venv/bin/activate || . venv/Scripts/activate  # Windows compatibility
pip install -r requirements.txt
deactivate
cd ../..
echo -e "${GREEN}✓ Screen service setup complete${NC}"

# Build TypeScript
echo -e "${BLUE}Building TypeScript projects...${NC}"
cd services/core-engine
npm run build
cd ../..
echo -e "${GREEN}✓ TypeScript build complete${NC}"

echo ""
echo -e "${GREEN}✨ RIME setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit infrastructure/.env with your API keys"
echo "2. Run './scripts/dev-start.sh' to start all services"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For production deployment, see docs/DEPLOYMENT.md"
