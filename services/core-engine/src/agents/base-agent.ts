import { AgentType, UserIntent, ScreenContext, AgentResult, Action, ActionType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseAgent {
  abstract readonly id: AgentType;
  abstract readonly name: string;
  abstract readonly capabilities: string[];
  
  protected status: 'idle' | 'thinking' | 'working' | 'error' = 'idle';
  protected currentAction?: string;
  protected progress: number = 0;
  protected message: string = '';
  
  /**
   * Determine if this agent can handle the given intent
   */
  abstract canHandle(intent: UserIntent): Promise<boolean>;
  
  /**
   * Execute the intent and return proposed actions
   */
  abstract execute(intent: UserIntent, context: ScreenContext): Promise<AgentResult>;
  
  /**
   * Get confidence score for handling this intent (0-1)
   */
  abstract getConfidence(intent: UserIntent, context: ScreenContext): Promise<number>;
  
  /**
   * Create a new action
   */
  protected createAction(
    type: ActionType,
    title: string,
    description: string,
    payload: unknown,
    confidence: number = 0.8
  ): Action {
    return {
      id: uuidv4(),
      agentId: this.id,
      type,
      title,
      description,
      payload,
      confidence,
      status: 'pending',
      createdAt: Date.now(),
    };
  }
  
  /**
   * Update agent status
   */
  protected setStatus(
    status: 'idle' | 'thinking' | 'working' | 'error',
    progress: number = 0,
    message: string = ''
  ): void {
    this.status = status;
    this.progress = progress;
    this.message = message;
  }
  
  /**
   * Get current agent state
   */
  getState() {
    return {
      id: this.id,
      status: this.status,
      currentAction: this.currentAction,
      progress: this.progress,
      message: this.message,
      lastUpdate: Date.now(),
    };
  }
  
  /**
   * Reset agent to idle state
   */
  reset(): void {
    this.status = 'idle';
    this.currentAction = undefined;
    this.progress = 0;
    this.message = '';
  }
  
  /**
   * Extract keywords from intent query
   */
  protected extractKeywords(query: string): string[] {
    const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'this', 'that', 'how', 'what']);
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }
  
  /**
   * Check if intent mentions any of the agent's capabilities
   */
  protected matchesCapabilities(intent: UserIntent): boolean {
    const keywords = this.extractKeywords(intent.query);
    return this.capabilities.some(capability => 
      keywords.some(keyword => capability.toLowerCase().includes(keyword))
    );
  }
}
