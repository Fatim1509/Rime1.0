import dotenv from 'dotenv';
import { RimeConfig } from './types';

// Load environment variables
dotenv.config({ path: '../../infrastructure/.env' });

export const config: RimeConfig = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  googleAI: {
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    visionModel: process.env.GEMINI_VISION_MODEL || 'gemini-2.0-flash-exp',
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '1000', 10),
  },
  
  screenService: {
    url: process.env.SCREEN_SERVICE_URL || 'http://localhost:8000',
    interval: parseInt(process.env.CAPTURE_INTERVAL || '3000', 10),
    quality: parseInt(process.env.SCREENSHOT_QUALITY || '85', 10),
    maxScreenshots: parseInt(process.env.MAX_SCREENSHOTS || '50', 10),
  },
  
  database: {
    postgres: process.env.POSTGRES_URL || 'postgresql://localhost:5432/rime',
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  pinecone: process.env.PINECONE_API_KEY ? {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT || 'gcp-starter',
    indexName: process.env.PINECONE_INDEX_NAME || 'rime-memory',
  } : undefined,
  
  features: {
    mock: process.env.ENABLE_MOCK === 'true',
    mockScenario: process.env.MOCK_SCENARIO || 'coding',
    voice: process.env.ENABLE_VOICE !== 'false',
    screenCapture: process.env.ENABLE_SCREEN_CAPTURE !== 'false',
    vectorMemory: process.env.ENABLE_VECTOR_MEMORY !== 'false',
  },
  
  integrations: {
    github: process.env.GITHUB_TOKEN,
    slack: process.env.SLACK_BOT_TOKEN,
  },
};

// Validate required configuration
export function validateConfig(): void {
  const errors: string[] = [];
  
  if (!config.features.mock && !config.googleAI.apiKey) {
    errors.push('GOOGLE_AI_API_KEY is required when mock mode is disabled');
  }
  
  if (config.features.vectorMemory && !config.pinecone) {
    errors.push('PINECONE_API_KEY is required when vector memory is enabled');
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\nPlease check your .env file');
    process.exit(1);
  }
}
