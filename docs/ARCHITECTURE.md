# RIME Architecture

## Overview

RIME (Recursive Intelligence Multi-Agent Environment) is a distributed system that coordinates multiple specialized AI agents to assist developers in their workflow.

## System Architecture

### Layer 1: User Interface
- **Dashboard (Next.js)**: Web-based command center
- **VS Code Extension**: IDE integration
- **Chrome Extension**: Browser integration
- **OmniBar**: Universal command palette

### Layer 2: Orchestration
- **Meta Agent**: Coordinates all specialist agents
- **State Machine**: Tracks user activity and context
- **WebSocket Server**: Real-time bidirectional communication
- **REST API**: HTTP endpoints for actions

### Layer 3: Specialist Agents
- **Research Agent**: Web search, documentation lookup
- **Code Agent**: Error analysis, code fixes, explanations
- **Communication Agent**: Message drafting, scheduling

### Layer 4: Intelligence
- **Gemini Vision**: Screen capture analysis
- **Gemini Text**: Natural language understanding
- **Vector Memory (Pinecone)**: Long-term memory and patterns

### Layer 5: Context & Data
- **Screen Capture Service**: Real-time screen monitoring
- **PostgreSQL**: Relational data storage
- **Redis**: Session and cache management
- **Pinecone**: Vector embeddings for memory

## Data Flow

### 1. Screen Analysis Flow
```
User Screen
  → Screen Capture Service (Python/mss)
  → Base64 JPEG encoding
  → WebSocket to Core Engine
  → Gemini Vision API
  → VisionAnalysis object
  → State Machine update
  → Context broadcast to clients
```

### 2. Intent Processing Flow
```
User Input (OmniBar/Voice)
  → Core Engine receives intent
  → Meta Agent queries all specialist agents
  → Each agent returns confidence score
  → Top 1-3 agents selected
  → Agents execute in parallel/sequence
  → Actions proposed to user
  → User approval/rejection
  → Action execution
  → Result broadcast
```

### 3. Action Execution Flow
```
User approves action
  → Action status: pending → approved
  → Core Engine processes action
  → External API calls (GitHub, Slack, etc.)
  → Action status: executing → completed
  → Result stored
  → WebSocket broadcast to all clients
```

## State Machine

### User States
- **idle**: No activity detected
- **active**: General computer use
- **coding**: Writing code
- **debugging**: Errors present
- **reading**: Documentation/articles
- **typing**: Communication apps
- **communicating**: Slack/email active

### State Transitions
```
coding → debugging (error detected)
debugging → reading (switched to docs)
reading → coding (returned to editor)
any → communicating (opened Slack)
idle → active (user interaction)
```

## Agent Orchestration

### Meta Agent Decision Tree
1. Receive UserIntent
2. For each agent:
   - Call `canHandle(intent)`
   - Get `getConfidence(intent, context)`
3. Filter agents with confidence > 0.4
4. Sort by confidence descending
5. Execute top 3 agents in parallel
6. Combine and deduplicate actions
7. Set action dependencies
8. Return prioritized action list

### Action Prioritization
- Higher confidence actions first
- Code fixes prioritized when errors present
- Explanations for learning
- Research before fixes (dependency)
- Communication after analysis (dependency)

## Communication Protocols

### WebSocket Events (Server → Client)
- `agents:status` - Agent state updates
- `workflow:proposed` - New actions available
- `action:updated` - Action status changed
- `context:update` - Screen context changed
- `workflow:complete` - All actions done

### WebSocket Events (Client → Server)
- `intent:submit` - User command
- `action:approve` - Approve action
- `action:reject` - Reject action
- `context:request` - Request fresh context

### REST Endpoints
```
GET  /health                    # System health
GET  /api/context/current       # Current screen context
POST /api/intent               # Submit user intent
GET  /api/agents/status        # All agent statuses
POST /api/actions/:id/approve  # Approve action
POST /api/actions/:id/reject   # Reject action
```

## Security Considerations

### API Key Management
- All API keys in environment variables
- Never committed to version control
- Separate keys for dev/staging/prod

### Data Privacy
- Screen captures stored temporarily (max 50)
- No persistent storage of screenshots
- User data encrypted at rest
- Secure WebSocket connections (WSS in prod)

### Rate Limiting
- Gemini API: Respect rate limits
- WebSocket: Connection limits per client
- Screen capture: Max 1 capture per 3 seconds

## Scalability

### Horizontal Scaling
- Core Engine: Stateless, can run multiple instances
- Load balancer distributes WebSocket connections
- Redis for shared state
- PostgreSQL for persistent data

### Vertical Scaling
- Screen Service: CPU-intensive (screenshot processing)
- Core Engine: Memory for active sessions
- Database: Increase based on user count

## Monitoring

### Health Checks
- `/health` endpoints on all services
- Agent status tracking
- WebSocket connection monitoring
- Database connection pooling

### Metrics
- Intent processing time
- Agent response time
- Action success/failure rate
- User activity distribution

## Error Handling

### Graceful Degradation
- Screen capture fails → use last known capture
- Gemini API fails → fallback to mock responses
- Agent timeout → exclude from results
- WebSocket disconnect → auto-reconnect

### Retry Logic
- Exponential backoff for API calls
- Max 3 retries for critical operations
- Circuit breaker for failing services

## Deployment Architecture

### Development
```
localhost:3000 → Dashboard
localhost:4000 → Core Engine
localhost:8000 → Screen Service
localhost:5432 → PostgreSQL
localhost:6379 → Redis
```

### Production
```
vercel.app → Dashboard (CDN)
railway.app → Core Engine (containerized)
heroku.com → Screen Service (containerized)
aws.com → PostgreSQL (RDS)
redis.com → Redis (managed)
pinecone.io → Vector DB (managed)
```

## Future Enhancements

### Planned Features
- Multi-screen support
- Team collaboration mode
- Custom agent creation
- Workflow automation
- Mobile app (React Native)
- Voice assistant integration
- Browser automation (Playwright)
- IDE plugins (JetBrains, Sublime)

### Architecture Improvements
- Event sourcing for action history
- GraphQL API
- Microservices architecture
- Kubernetes orchestration
- Real-time collaboration (CRDT)
