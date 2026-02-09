import { BaseAgent } from './base-agent';
import { UserIntent, ScreenContext, AgentResult } from '../types';

export class CommunicationAgent extends BaseAgent {
  readonly id = 'communication' as const;
  readonly name = 'Communication Agent';
  readonly capabilities = [
    'draft message',
    'send message',
    'schedule meeting',
    'calendar',
    'email',
    'slack',
    'notify',
    'remind',
  ];
  
  async canHandle(intent: UserIntent): Promise<boolean> {
    const query = intent.query.toLowerCase();
    
    // Trigger keywords
    const triggers = [
      'tell', 'message', 'send', 'email', 'slack', 'notify',
      'schedule', 'meeting', 'calendar', 'remind', 'ask',
      'draft', 'write to', 'contact'
    ];
    
    return triggers.some(trigger => query.includes(trigger)) || 
           this.matchesCapabilities(intent);
  }
  
  async getConfidence(intent: UserIntent, context: ScreenContext): Promise<number> {
    let confidence = 0.3;
    
    const query = intent.query.toLowerCase();
    
    // High confidence triggers
    if (query.includes('message') || query.includes('tell')) {
      confidence += 0.4;
    }
    
    if (query.includes('schedule') || query.includes('meeting')) {
      confidence += 0.3;
    }
    
    // Context-based confidence
    if (context.analysis.application === 'slack') {
      confidence += 0.2;
    }
    
    if (context.analysis.userActivity === 'typing') {
      confidence += 0.1;
    }
    
    // Extract recipient name for higher confidence
    if (this.extractRecipient(query)) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }
  
  async execute(intent: UserIntent, context: ScreenContext): Promise<AgentResult> {
    this.setStatus('thinking', 0, 'Understanding communication intent...');
    
    const actions = [];
    const query = intent.query;
    const recipient = this.extractRecipient(query);
    
    if (query.toLowerCase().includes('schedule') || query.toLowerCase().includes('meeting')) {
      // Meeting scheduling
      actions.push(
        this.createAction(
          'schedule_event',
          'Schedule meeting',
          `Create calendar invite${recipient ? ` for ${recipient}` : ''}`,
          {
            recipient: recipient || 'team',
            subject: this.extractSubject(query),
            suggestedTimes: this.generateTimeSlots(),
          },
          0.75
        )
      );
    } else {
      // Message drafting
      const draftMessage = this.generateDraftMessage(query, context);
      
      actions.push(
        this.createAction(
          'draft_message',
          `Draft message${recipient ? ` to ${recipient}` : ''}`,
          'AI-generated message based on your intent',
          {
            recipient: recipient || 'Unknown',
            subject: this.extractSubject(query),
            message: draftMessage,
            suggestedChannel: this.suggestChannel(context),
          },
          0.8
        )
      );
      
      // Suggest follow-up
      if (query.toLowerCase().includes('bug') || query.toLowerCase().includes('issue')) {
        actions.push(
          this.createAction(
            'draft_message',
            'Add follow-up reminder',
            'Set reminder to check for response',
            {
              reminderTime: '2 hours',
              message: 'Check if ' + (recipient || 'recipient') + ' responded',
            },
            0.6
          )
        );
      }
    }
    
    this.setStatus('working', 60, 'Drafting message...');
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    this.setStatus('idle', 100, 'Draft ready');
    
    return {
      agentId: this.id,
      confidence: await this.getConfidence(intent, context),
      actions,
      explanation: `I can help you communicate effectively.`,
      metadata: {
        recipient: recipient,
        communicationType: query.includes('schedule') ? 'meeting' : 'message',
      },
    };
  }
  
  private extractRecipient(query: string): string | null {
    // Simple name extraction - in real implementation, use NLP
    const patterns = [
      /(?:tell|message|send to|email|ask)\s+(\w+)/i,
      /(?:for|with)\s+(\w+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }
  
  private extractSubject(query: string): string {
    // Extract subject from query
    const about = query.match(/about\s+(.+)/i);
    if (about) return about[1];
    
    // Fallback to first few words
    return query.split(' ').slice(0, 5).join(' ');
  }
  
  private generateDraftMessage(query: string, context: ScreenContext): string {
    // Mock message generation - in real implementation, use Gemini
    const recipient = this.extractRecipient(query) || 'there';
    
    let message = `Hey ${recipient},\n\n`;
    
    if (context.analysis.codeContext?.errors.length) {
      const error = context.analysis.codeContext.errors[0];
      message += `I'm encountering an issue: "${error.message}" on line ${error.line}. `;
      message += `Could you take a look when you get a chance?\n\n`;
    } else {
      message += `${query}\n\n`;
    }
    
    message += `Thanks!`;
    
    return message;
  }
  
  private suggestChannel(context: ScreenContext): string {
    if (context.analysis.codeContext?.errors.length) {
      return '#engineering-help';
    }
    return '#general';
  }
  
  private generateTimeSlots(): string[] {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return [
      `Tomorrow at 2:00 PM`,
      `Tomorrow at 3:30 PM`,
      `${tomorrow.toLocaleDateString()} at 10:00 AM`,
    ];
  }
}
