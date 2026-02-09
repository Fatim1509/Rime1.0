// Type Definitions for RIME System

export type AgentType = 'research' | 'code' | 'communication' | 'meta';
export type ActivityType = 'idle' | 'active' | 'coding' | 'debugging' | 'reading' | 'typing' | 'communicating';
export type ApplicationType = 'vscode' | 'chrome' | 'slack' | 'terminal' | 'unknown';
export type ActionType = 
  | 'web_search' 
  | 'code_fix' 
  | 'draft_message' 
  | 'schedule_event' 
  | 'open_file' 
  | 'run_command' 
  | 'explain';
export type ActionStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'executing' 
  | 'completed' 
  | 'failed';
export type AgentStatus = 'idle' | 'thinking' | 'working' | 'error';

// UI Elements detected in screen
export interface UIElement {
  type: 'button' | 'input' | 'text' | 'link' | 'code' | 'error';
  text: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

// Code context when user is coding
export interface CodeContext {
  language: string;
  fileName: string;
  lineNumber?: number;
  codeSnippet?: string;
  errors: Array<{
    message: string;
    line: number;
    severity: 'error' | 'warning';
  }>;
}

// Browser context when user is browsing
export interface BrowserContext {
  url: string;
  title: string;
  pageType: 'documentation' | 'github' | 'stackoverflow' | 'generic';
}

// Vision analysis result from Gemini
export interface VisionAnalysis {
  application: ApplicationType;
  windowTitle: string;
  userActivity: ActivityType;
  confidence: number;
  visibleText: string[];
  uiElements: UIElement[];
  codeContext?: CodeContext;
  browserContext?: BrowserContext;
  timestamp: number;
}

// Screen capture data
export interface ScreenCapture {
  id: string;
  timestamp: number;
  imageData: string; // base64 encoded
  width: number;
  height: number;
}

// Combined screen context
export interface ScreenContext {
  capture: ScreenCapture;
  analysis: VisionAnalysis;
  state: ActivityType;
}

// User intent from OmniBar or voice
export interface UserIntent {
  id: string;
  query: string;
  type: 'command' | 'question' | 'action';
  context?: Partial<ScreenContext>;
  userId: string;
  sessionId: string;
  timestamp: number;
}

// Agent result
export interface AgentResult {
  agentId: AgentType;
  confidence: number;
  actions: Action[];
  explanation: string;
  metadata?: Record<string, unknown>;
}

// Action proposed by agents
export interface Action {
  id: string;
  agentId: AgentType;
  type: ActionType;
  title: string;
  description: string;
  payload: unknown;
  confidence: number;
  status: ActionStatus;
  dependencies?: string[];
  createdAt: number;
  executedAt?: number;
  result?: unknown;
  error?: string;
}

// Agent configuration
export interface AgentConfig {
  id: AgentType;
  name: string;
  capabilities: string[];
  enabled: boolean;
  priority: number;
}

// Agent state
export interface AgentState {
  id: AgentType;
  status: AgentStatus;
  currentAction?: string;
  progress: number;
  message: string;
  lastUpdate: number;
}

// Memory item for vector store
export interface MemoryItem {
  id: string;
  type: 'preference' | 'pattern' | 'fact' | 'code_style';
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  timestamp: number;
}

// WebSocket events
export interface WSEvent {
  event: string;
  data: unknown;
}

// API response
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Configuration
export interface RimeConfig {
  port: number;
  nodeEnv: string;
  googleAI: {
    apiKey: string;
    model: string;
    visionModel: string;
    maxTokens: number;
  };
  screenService: {
    url: string;
    interval: number;
    quality: number;
    maxScreenshots: number;
  };
  database: {
    postgres: string;
    redis: string;
  };
  pinecone?: {
    apiKey: string;
    environment: string;
    indexName: string;
  };
  features: {
    mock: boolean;
    mockScenario: string;
    voice: boolean;
    screenCapture: boolean;
    vectorMemory: boolean;
  };
  integrations: {
    github?: string;
    slack?: string;
  };
}

// Mock scenario
export interface MockScenario {
  id: string;
  name: string;
  description: string;
  context: ScreenContext;
  intent: UserIntent;
  expectedActions: Action[];
}
