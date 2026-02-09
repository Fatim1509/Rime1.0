#!/bin/bash

echo "🎯 Starting RIME Development Environment"
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if .env exists
if [ ! -f infrastructure/.env ]; then
    echo "❌ .env file not found. Please run ./scripts/setup.sh first"
    exit 1
fi

# Load environment variables
export $(cat infrastructure/.env | xargs)

echo -e "${BLUE}Starting services...${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start screen service (Python)
echo -e "${BLUE}[1/3] Starting Screen Capture Service...${NC}"
cd services/screen-service
if [ -d "venv" ]; then
    source venv/bin/activate || . venv/Scripts/activate
fi
python capture.py &
SCREEN_PID=$!
cd ../..
echo -e "${GREEN}✓ Screen service started on port 8000${NC}"

# Wait for screen service to be ready
sleep 2

# Start core engine (Node.js)
echo -e "${BLUE}[2/3] Starting Core Engine...${NC}"
cd services/core-engine
npm run dev &
CORE_PID=$!
cd ../..
echo -e "${GREEN}✓ Core engine started on port 4000${NC}"

# Wait for core engine to be ready
sleep 3

# Start dashboard (Next.js)
echo -e "${BLUE}[3/3] Starting Dashboard...${NC}"
cd apps/dashboard
npm run dev &
DASHBOARD_PID=$!
cd ../..
echo -e "${GREEN}✓ Dashboard started on port 3000${NC}"

echo ""
echo -e "${GREEN}✨ All services running!${NC}"
echo ""
echo "🔗 Services:"
echo "   Dashboard:      http://localhost:3000"
echo "   Core Engine:    http://localhost:4000"
echo "   Screen Service: http://localhost:8000"
echo ""
echo "📊 Health Checks:"
echo "   curl http://localhost:4000/health"
echo "   curl http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
