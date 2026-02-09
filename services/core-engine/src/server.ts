import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config, validateConfig } from './config';
import { MetaAgent } from './agents';
import { MockService } from './mock/mock-service';
import { UserIntent, Action, ScreenContext } from './types';
import { v4 as uuidv4 } from 'uuid';

// Validate configuration
validateConfig();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize services
const metaAgent = new MetaAgent();
const mockService = config.features.mock ? new MockService() : null;

// In-memory storage (replace with Redis in production)
const activeActions = new Map<string, Action>();
const sessionContexts = new Map<string, ScreenContext>();

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      version: '1.0.0',
      features: {
        mock: config.features.mock,
        voice: config.features.voice,
        screenCapture: config.features.screenCapture,
        vectorMemory: config.features.vectorMemory,
      },
      agents: metaAgent.getAllAgentStates(),
    },
    timestamp: Date.now(),
  });
});

// Get current screen context
app.get('/api/context/current', async (req, res) => {
  try {
    let context: ScreenContext;
    
    if (mockService) {
      // Mock mode
      context = mockService.getCurrentScenario().context;
    } else {
      // Real mode - would fetch from screen service
      throw new Error('Screen capture not implemented in non-mock mode');
    }
    
    res.json({
      success: true,
      data: context,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: Date.now(),
    });
  }
});

// Submit user intent
app.post('/api/intent', async (req, res) => {
  try {
    const { query, type = 'command', userId = 'default', sessionId = uuidv4() } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
        timestamp: Date.now(),
      });
    }
    
    const intent: UserIntent = {
      id: uuidv4(),
      query,
      type,
      userId,
      sessionId,
      timestamp: Date.now(),
    };
    
    // Get current context
    let context: ScreenContext;
    if (mockService) {
      context = mockService.getCurrentScenario().context;
    } else {
      context = sessionContexts.get(sessionId) || {
        capture: {
          id: uuidv4(),
          timestamp: Date.now(),
          imageData: '',
          width: 0,
          height: 0,
        },
        analysis: {
          application: 'unknown',
          windowTitle: '',
          userActivity: 'active',
          confidence: 0.5,
          visibleText: [],
          uiElements: [],
          timestamp: Date.now(),
        },
        state: 'active',
      };
    }
    
    // Execute meta-agent orchestration
    const result = await metaAgent.execute(intent, context);
    
    // Store proposed actions
    for (const action of result.actions) {
      activeActions.set(action.id, action);
    }
    
    // Emit to WebSocket clients
    io.emit('workflow:proposed', {
      intent,
      result,
      agents: metaAgent.getAllAgentStates(),
    });
    
    res.json({
      success: true,
      data: result,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error processing intent:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: Date.now(),
    });
  }
});

// Get all agent statuses
app.get('/api/agents/status', (req, res) => {
  res.json({
    success: true,
    data: metaAgent.getAllAgentStates(),
    timestamp: Date.now(),
  });
});

// Approve action
app.post('/api/actions/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const action = activeActions.get(id);
    
    if (!action) {
      return res.status(404).json({
        success: false,
        error: 'Action not found',
        timestamp: Date.now(),
      });
    }
    
    // Update action status
    action.status = 'executing';
    action.executedAt = Date.now();
    
    // Emit update
    io.emit('action:updated', action);
    
    // Simulate execution
    setTimeout(() => {
      action.status = 'completed';
      action.result = { message: 'Action completed successfully' };
      io.emit('action:updated', action);
    }, 2000);
    
    res.json({
      success: true,
      data: action,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: Date.now(),
    });
  }
});

// Reject action
app.post('/api/actions/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const action = activeActions.get(id);
    
    if (!action) {
      return res.status(404).json({
        success: false,
        error: 'Action not found',
        timestamp: Date.now(),
      });
    }
    
    action.status = 'rejected';
    io.emit('action:updated', action);
    
    res.json({
      success: true,
      data: action,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: Date.now(),
    });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current agent states
  socket.emit('agents:status', metaAgent.getAllAgentStates());
  
  socket.on('intent:submit', async (data) => {
    try {
      const { query, sessionId } = data;
      const intent: UserIntent = {
        id: uuidv4(),
        query,
        type: 'command',
        userId: socket.id,
        sessionId: sessionId || uuidv4(),
        timestamp: Date.now(),
      };
      
      let context: ScreenContext;
      if (mockService) {
        context = mockService.getCurrentScenario().context;
      } else {
        context = sessionContexts.get(intent.sessionId) || {} as ScreenContext;
      }
      
      const result = await metaAgent.execute(intent, context);
      
      for (const action of result.actions) {
        activeActions.set(action.id, action);
      }
      
      socket.emit('workflow:proposed', { intent, result });
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  });
  
  socket.on('action:approve', async ({ actionId }) => {
    const action = activeActions.get(actionId);
    if (action) {
      action.status = 'executing';
      io.emit('action:updated', action);
      
      setTimeout(() => {
        action.status = 'completed';
        io.emit('action:updated', action);
      }, 2000);
    }
  });
  
  socket.on('action:reject', ({ actionId }) => {
    const action = activeActions.get(actionId);
    if (action) {
      action.status = 'rejected';
      io.emit('action:updated', action);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log('🚀 RIME Core Engine started');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`🎭 Mock Mode: ${config.features.mock ? 'ENABLED' : 'DISABLED'}`);
  if (config.features.mock && mockService) {
    console.log(`📋 Mock Scenario: ${mockService.getCurrentScenario().name}`);
  }
  console.log('✨ Ready to orchestrate agents!');
});
