import { MockScenario, ScreenContext, UserIntent, VisionAnalysis, ScreenCapture } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock service providing demo scenarios when ENABLE_MOCK=true
 */
export class MockService {
  private scenarios: Map<string, MockScenario>;
  private currentScenario: string = 'coding';
  
  constructor() {
    this.scenarios = new Map();
    this.initializeScenarios();
  }
  
  private initializeScenarios() {
    // Scenario 1: Coding with Error
    this.scenarios.set('coding', {
      id: 'coding',
      name: 'Coding Scenario',
      description: 'User coding in VS Code with a React TypeScript error',
      context: this.createCodingContext(),
      intent: {
        id: uuidv4(),
        query: 'fix this error',
        type: 'command',
        userId: 'demo-user',
        sessionId: uuidv4(),
        timestamp: Date.now(),
      },
      expectedActions: [],
    });
    
    // Scenario 2: Debugging
    this.scenarios.set('debugging', {
      id: 'debugging',
      name: 'Debugging Scenario',
      description: 'User debugging with multiple errors',
      context: this.createDebuggingContext(),
      intent: {
        id: uuidv4(),
        query: 'help me debug this',
        type: 'command',
        userId: 'demo-user',
        sessionId: uuidv4(),
        timestamp: Date.now(),
      },
      expectedActions: [],
    });
    
    // Scenario 3: Research
    this.scenarios.set('research', {
      id: 'research',
      name: 'Research Scenario',
      description: 'User searching for documentation',
      context: this.createResearchContext(),
      intent: {
        id: uuidv4(),
        query: 'search for React hooks documentation',
        type: 'command',
        userId: 'demo-user',
        sessionId: uuidv4(),
        timestamp: Date.now(),
      },
      expectedActions: [],
    });
    
    // Scenario 4: Communication
    this.scenarios.set('communication', {
      id: 'communication',
      name: 'Communication Scenario',
      description: 'User wants to message teammate',
      context: this.createCommunicationContext(),
      intent: {
        id: uuidv4(),
        query: 'tell Sarah about this bug',
        type: 'command',
        userId: 'demo-user',
        sessionId: uuidv4(),
        timestamp: Date.now(),
      },
      expectedActions: [],
    });
  }
  
  getScenario(scenarioId: string): MockScenario | undefined {
    return this.scenarios.get(scenarioId);
  }
  
  getCurrentScenario(): MockScenario {
    const scenario = this.scenarios.get(this.currentScenario);
    if (!scenario) {
      throw new Error(`Scenario ${this.currentScenario} not found`);
    }
    return scenario;
  }
  
  setCurrentScenario(scenarioId: string): void {
    if (!this.scenarios.has(scenarioId)) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }
    this.currentScenario = scenarioId;
  }
  
  /**
   * Get mock screen capture
   */
  getMockScreenCapture(): ScreenCapture {
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      imageData: 'base64_mock_image_data_here',
      width: 1920,
      height: 1080,
    };
  }
  
  /**
   * Get mock vision analysis based on current scenario
   */
  getMockVisionAnalysis(): VisionAnalysis {
    const scenario = this.getCurrentScenario();
    return scenario.context.analysis;
  }
  
  private createCodingContext(): ScreenContext {
    return {
      capture: this.getMockScreenCapture(),
      analysis: {
        application: 'vscode',
        windowTitle: 'App.tsx - my-react-app',
        userActivity: 'coding',
        confidence: 0.9,
        visibleText: ['import React', 'useState', 'useEffect', 'function App'],
        uiElements: [
          {
            type: 'error',
            text: "Property 'map' does not exist on type 'never'",
            bounds: { x: 100, y: 500, width: 400, height: 20 },
            confidence: 0.95,
          },
        ],
        codeContext: {
          language: 'typescript',
          fileName: 'App.tsx',
          lineNumber: 24,
          codeSnippet: 'const items = data.results.map(item => item.id);',
          errors: [
            {
              message: "Property 'map' does not exist on type 'never'",
              line: 24,
              severity: 'error',
            },
          ],
        },
        timestamp: Date.now(),
      },
      state: 'coding',
    };
  }
  
  private createDebuggingContext(): ScreenContext {
    return {
      capture: this.getMockScreenCapture(),
      analysis: {
        application: 'vscode',
        windowTitle: 'index.ts - backend',
        userActivity: 'debugging',
        confidence: 0.85,
        visibleText: ['express', 'router', 'middleware', 'async'],
        uiElements: [],
        codeContext: {
          language: 'typescript',
          fileName: 'index.ts',
          lineNumber: 42,
          errors: [
            {
              message: 'Cannot find module dotenv',
              line: 1,
              severity: 'error',
            },
            {
              message: 'Async function lacks await expression',
              line: 42,
              severity: 'warning',
            },
          ],
        },
        timestamp: Date.now(),
      },
      state: 'debugging',
    };
  }
  
  private createResearchContext(): ScreenContext {
    return {
      capture: this.getMockScreenCapture(),
      analysis: {
        application: 'chrome',
        windowTitle: 'React Hooks - React Documentation',
        userActivity: 'reading',
        confidence: 0.9,
        visibleText: ['useState', 'useEffect', 'useContext', 'documentation'],
        uiElements: [],
        browserContext: {
          url: 'https://react.dev/reference/react',
          title: 'React Hooks - React Documentation',
          pageType: 'documentation',
        },
        timestamp: Date.now(),
      },
      state: 'reading',
    };
  }
  
  private createCommunicationContext(): ScreenContext {
    return {
      capture: this.getMockScreenCapture(),
      analysis: {
        application: 'slack',
        windowTitle: 'Slack - Engineering Team',
        userActivity: 'typing',
        confidence: 0.85,
        visibleText: ['#engineering', '#general', 'Sarah Chen', 'Message'],
        uiElements: [],
        timestamp: Date.now(),
      },
      state: 'typing',
    };
  }
}
