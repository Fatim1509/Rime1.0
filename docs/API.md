# RIME API Reference

## Base URL
```
Development: http://localhost:4000
Production: https://your-domain.com/api
```

## Authentication
Currently no authentication required. Add JWT/API keys for production.

## REST API

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "features": {
      "mock": false,
      "voice": true,
      "screenCapture": true,
      "vectorMemory": true
    },
    "agents": [...]
  },
  "timestamp": 1704067200000
}
```

### Get Current Context
```http
GET /api/context/current
```

**Response:**
```json
{
  "success": true,
  "data": {
    "capture": {
      "id": "capture_123",
      "timestamp": 1704067200000,
      "imageData": "base64...",
      "width": 1920,
      "height": 1080
    },
    "analysis": {
      "application": "vscode",
      "windowTitle": "App.tsx",
      "userActivity": "coding",
      "confidence": 0.9,
      "visibleText": [...],
      "uiElements": [...],
      "codeContext": {...}
    },
    "state": "coding"
  }
}
```

### Submit Intent
```http
POST /api/intent
Content-Type: application/json

{
  "query": "fix this error",
  "type": "command",
  "userId": "user_123",
  "sessionId": "session_456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": "meta",
    "confidence": 0.85,
    "actions": [
      {
        "id": "action_789",
        "agentId": "code",
        "type": "code_fix",
        "title": "Fix TypeScript error",
        "description": "Add type annotation",
        "confidence": 0.9,
        "status": "pending",
        "payload": {...}
      }
    ],
    "explanation": "I'll help you fix this error"
  }
}
```

### Get Agent Status
```http
GET /api/agents/status
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "research",
      "status": "idle",
      "progress": 0,
      "message": "",
      "lastUpdate": 1704067200000
    }
  ]
}
```

### Approve Action
```http
POST /api/actions/:id/approve
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "action_789",
    "status": "executing",
    "executedAt": 1704067200000
  }
}
```

### Reject Action
```http
POST /api/actions/:id/reject
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "action_789",
    "status": "rejected"
  }
}
```

## WebSocket API

### Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:4000');
```

### Events: Server → Client

#### agents:status
Agent state updates
```json
[
  {
    "id": "research",
    "status": "working",
    "progress": 50,
    "message": "Searching for solutions..."
  }
]
```

#### workflow:proposed
New actions available
```json
{
  "intent": {...},
  "result": {
    "actions": [...],
    "explanation": "..."
  }
}
```

#### action:updated
Action status changed
```json
{
  "id": "action_123",
  "status": "completed",
  "result": {...}
}
```

#### context:update
Screen context changed
```json
{
  "capture": {...},
  "analysis": {...}
}
```

### Events: Client → Server

#### intent:submit
Submit user command
```json
{
  "query": "search for React hooks",
  "sessionId": "session_123"
}
```

#### action:approve
Approve action
```json
{
  "actionId": "action_456"
}
```

#### action:reject
Reject action
```json
{
  "actionId": "action_456"
}
```

## Screen Service API

### Health Check
```http
GET http://localhost:8000/health
```

### Manual Capture
```http
POST http://localhost:8000/capture
```

### Get Latest Screenshot
```http
GET http://localhost:8000/capture/latest
```

### WebSocket Stream
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  const { event: eventType, data } = JSON.parse(event.data);
  if (eventType === 'screen:capture') {
    // Handle screenshot
  }
};
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Query is required",
  "timestamp": 1704067200000
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Action not found",
  "timestamp": 1704067200000
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "timestamp": 1704067200000
}
```

## Rate Limits

- REST API: 100 requests/minute per IP
- WebSocket: 10 connections per IP
- Screen Capture: 1 capture/3 seconds

## SDK Examples

### JavaScript/TypeScript
```typescript
import { RimeClient } from '@rime/client';

const client = new RimeClient('http://localhost:4000');

// Submit intent
const result = await client.submitIntent('fix this error');

// Approve action
await client.approveAction(result.actions[0].id);

// Listen to updates
client.on('action:updated', (action) => {
  console.log('Action updated:', action);
});
```

### Python
```python
from rime import RimeClient

client = RimeClient('http://localhost:4000')

# Submit intent
result = client.submit_intent('search for docs')

# Approve action
client.approve_action(result['actions'][0]['id'])
```
