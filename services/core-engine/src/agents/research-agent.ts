import { BaseAgent } from './base-agent';
import { UserIntent, ScreenContext, AgentResult } from '../types';

export class ResearchAgent extends BaseAgent {
  readonly id = 'research' as const;
  readonly name = 'Research Agent';
  readonly capabilities = [
    'web search',
    'documentation lookup',
    'stackoverflow search',
    'github issues',
    'find solutions',
    'search',
    'lookup',
  ];
  
  async canHandle(intent: UserIntent): Promise<boolean> {
    const query = intent.query.toLowerCase();
    
    // Trigger keywords
    const triggers = [
      'search', 'find', 'lookup', 'documentation', 'docs',
      'how to', 'how do', 'stackoverflow', 'github',
      'examples', 'tutorial', 'guide'
    ];
    
    return triggers.some(trigger => query.includes(trigger)) || 
           this.matchesCapabilities(intent);
  }
  
  async getConfidence(intent: UserIntent, context: ScreenContext): Promise<number> {
    let confidence = 0.5;
    
    const query = intent.query.toLowerCase();
    
    // High confidence triggers
    if (query.includes('search') || query.includes('find')) {
      confidence += 0.3;
    }
    
    // Context-based confidence
    if (context.analysis.userActivity === 'debugging') {
      confidence += 0.2; // More likely to need research when debugging
    }
    
    if (context.analysis.browserContext?.pageType === 'stackoverflow') {
      confidence += 0.1; // Already researching
    }
    
    // Error context boosts research need
    if (context.analysis.codeContext?.errors.length) {
      confidence += 0.15;
    }
    
    return Math.min(confidence, 1.0);
  }
  
  async execute(intent: UserIntent, context: ScreenContext): Promise<AgentResult> {
    this.setStatus('thinking', 0, 'Analyzing research query...');
    
    const actions = [];
    const query = intent.query;
    
    // Determine search strategy based on context
    if (context.analysis.codeContext?.errors.length) {
      // Error-focused research
      const error = context.analysis.codeContext.errors[0];
      
      actions.push(
        this.createAction(
          'web_search',
          'Search for error solution',
          `Search for: "${error.message}" in ${context.analysis.codeContext.language}`,
          {
            query: `${error.message} ${context.analysis.codeContext.language}`,
            sources: ['stackoverflow', 'github', 'web'],
          },
          0.85
        )
      );
      
      actions.push(
        this.createAction(
          'web_search',
          'Search documentation',
          `Find official docs for ${context.analysis.codeContext.language}`,
          {
            query: `${context.analysis.codeContext.language} documentation ${error.message}`,
            sources: ['official_docs'],
          },
          0.75
        )
      );
    } else {
      // General research
      actions.push(
        this.createAction(
          'web_search',
          'Web search',
          `Search for: "${query}"`,
          {
            query: query,
            sources: ['web', 'stackoverflow', 'github'],
          },
          0.8
        )
      );
    }
    
    this.setStatus('working', 50, 'Preparing search queries...');
    
    // Simulate search execution time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.setStatus('idle', 100, 'Research complete');
    
    return {
      agentId: this.id,
      confidence: await this.getConfidence(intent, context),
      actions,
      explanation: `I can search for solutions and documentation related to your query.`,
      metadata: {
        searchTerms: [query],
        sources: ['web', 'stackoverflow', 'github', 'docs'],
      },
    };
  }
}
