import { BaseAgent } from './base-agent';
import { UserIntent, ScreenContext, AgentResult, Action } from '../types';
import { ResearchAgent } from './research-agent';
import { CodeAgent } from './code-agent';
import { CommunicationAgent } from './comm-agent';

export class MetaAgent extends BaseAgent {
  readonly id = 'meta' as const;
  readonly name = 'Meta Agent';
  readonly capabilities = ['orchestrate', 'coordinate', 'resolve conflicts'];
  
  private agents: BaseAgent[];
  
  constructor() {
    super();
    this.agents = [
      new ResearchAgent(),
      new CodeAgent(),
      new CommunicationAgent(),
    ];
  }
  
  async canHandle(intent: UserIntent): Promise<boolean> {
    // Meta agent can always handle by delegating
    return true;
  }
  
  async getConfidence(intent: UserIntent, context: ScreenContext): Promise<number> {
    // Meta agent confidence is the max of all sub-agents
    const confidences = await Promise.all(
      this.agents.map(agent => agent.getConfidence(intent, context))
    );
    return Math.max(...confidences);
  }
  
  async execute(intent: UserIntent, context: ScreenContext): Promise<AgentResult> {
    this.setStatus('thinking', 0, 'Analyzing intent and selecting agents...');
    
    // Step 1: Query all agents for their confidence
    const agentConfidences = await Promise.all(
      this.agents.map(async (agent) => ({
        agent,
        confidence: await agent.getConfidence(intent, context),
        canHandle: await agent.canHandle(intent),
      }))
    );
    
    // Step 2: Filter and sort by confidence
    const capableAgents = agentConfidences
      .filter(ac => ac.canHandle && ac.confidence > 0.4)
      .sort((a, b) => b.confidence - a.confidence);
    
    if (capableAgents.length === 0) {
      // No agent can handle this - return generic response
      return {
        agentId: this.id,
        confidence: 0.3,
        actions: [],
        explanation: "I'm not sure how to help with that. Could you rephrase your request?",
      };
    }
    
    this.setStatus('working', 30, `Delegating to ${capableAgents.length} agent(s)...`);
    
    // Step 3: Execute top agents (max 3)
    const topAgents = capableAgents.slice(0, 3);
    const results = await Promise.all(
      topAgents.map(ac => ac.agent.execute(intent, context))
    );
    
    this.setStatus('working', 70, 'Combining results...');
    
    // Step 4: Combine and deduplicate actions
    const allActions: Action[] = [];
    const actionSignatures = new Set<string>();
    
    for (const result of results) {
      for (const action of result.actions) {
        const signature = `${action.type}:${action.title}`;
        if (!actionSignatures.has(signature)) {
          actionSignatures.add(signature);
          allActions.push(action);
        }
      }
    }
    
    // Step 5: Resolve conflicts and prioritize
    const prioritizedActions = this.prioritizeActions(allActions, context);
    
    // Step 6: Set dependencies for sequential execution
    this.setActionDependencies(prioritizedActions);
    
    this.setStatus('idle', 100, 'Orchestration complete');
    
    return {
      agentId: this.id,
      confidence: topAgents[0].confidence,
      actions: prioritizedActions,
      explanation: this.generateExplanation(topAgents, prioritizedActions),
      metadata: {
        agentsUsed: topAgents.map(ac => ac.agent.id),
        totalActionsProposed: allActions.length,
      },
    };
  }
  
  /**
   * Prioritize actions based on confidence and context
   */
  private prioritizeActions(actions: Action[], context: ScreenContext): Action[] {
    return actions.sort((a, b) => {
      // Higher confidence first
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      
      // Prioritize fixes when there are errors
      if (context.analysis.codeContext?.errors.length) {
        if (a.type === 'code_fix' && b.type !== 'code_fix') return -1;
        if (b.type === 'code_fix' && a.type !== 'code_fix') return 1;
      }
      
      // Prioritize explanations for learning
      if (a.type === 'explain' && b.type !== 'explain') return -1;
      if (b.type === 'explain' && a.type !== 'explain') return 1;
      
      return 0;
    });
  }
  
  /**
   * Set dependencies for actions that should execute sequentially
   */
  private setActionDependencies(actions: Action[]): void {
    for (let i = 1; i < actions.length; i++) {
      const current = actions[i];
      const previous = actions[i - 1];
      
      // Research should happen before code fixes
      if (current.type === 'code_fix' && previous.type === 'web_search') {
        current.dependencies = [previous.id];
      }
      
      // Messages should be drafted after analysis
      if (current.type === 'draft_message' && 
          (previous.type === 'code_fix' || previous.type === 'explain')) {
        current.dependencies = [previous.id];
      }
    }
  }
  
  /**
   * Generate explanation combining all agent responses
   */
  private generateExplanation(
    agents: Array<{ agent: BaseAgent; confidence: number }>,
    actions: Action[]
  ): string {
    if (agents.length === 0) {
      return "I couldn't find any agents to help with that.";
    }
    
    if (agents.length === 1) {
      return `I'll help you with that using the ${agents[0].agent.name}.`;
    }
    
    const agentNames = agents.map(a => a.agent.name).join(' and ');
    return `I'll coordinate the ${agentNames} to help you. ${actions.length} action${actions.length > 1 ? 's' : ''} proposed.`;
  }
  
  /**
   * Get state of all agents
   */
  getAllAgentStates() {
    return this.agents.map(agent => agent.getState());
  }
}
