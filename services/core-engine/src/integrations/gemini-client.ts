import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { VisionAnalysis, ScreenCapture } from '../types';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private textModel: any;
  private visionModel: any;
  
  constructor() {
    if (!config.googleAI.apiKey) {
      throw new Error('Google AI API key not configured');
    }
    
    this.genAI = new GoogleGenerativeAI(config.googleAI.apiKey);
    this.textModel = this.genAI.getGenerativeModel({ model: config.googleAI.model });
    this.visionModel = this.genAI.getGenerativeModel({ model: config.googleAI.visionModel });
  }
  
  /**
   * Analyze screenshot using Gemini Vision
   */
  async analyzeScreen(capture: ScreenCapture): Promise<VisionAnalysis> {
    const prompt = `Analyze this screenshot and extract:
1. Application type (vscode, chrome, slack, terminal, or unknown)
2. Window title
3. User activity (idle, active, coding, debugging, reading, typing, communicating)
4. Visible text elements (max 20 important ones)
5. UI elements with approximate bounds (buttons, inputs, code blocks, errors)
6. Code context (if in editor: language, file name, errors visible)
7. Browser context (if in browser: URL if visible, page type)

Return ONLY valid JSON with this exact structure:
{
  "application": "vscode|chrome|slack|terminal|unknown",
  "windowTitle": "string",
  "userActivity": "idle|active|coding|debugging|reading|typing|communicating",
  "confidence": 0.0-1.0,
  "visibleText": ["string"],
  "uiElements": [{
    "type": "button|input|text|link|code|error",
    "text": "string",
    "bounds": {"x": 0, "y": 0, "width": 0, "height": 0},
    "confidence": 0.0-1.0
  }],
  "codeContext": {
    "language": "string",
    "fileName": "string",
    "lineNumber": 0,
    "codeSnippet": "string",
    "errors": [{"message": "string", "line": 0, "severity": "error|warning"}]
  },
  "browserContext": {
    "url": "string",
    "title": "string",
    "pageType": "documentation|github|stackoverflow|generic"
  }
}`;
    
    try {
      const imageParts = [
        {
          inlineData: {
            data: capture.imageData,
            mimeType: 'image/jpeg',
          },
        },
      ];
      
      const result = await this.visionModel.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const analysis: VisionAnalysis = JSON.parse(jsonMatch[0]);
      analysis.timestamp = capture.timestamp;
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing screen:', error);
      
      // Return fallback analysis
      return this.createFallbackAnalysis(capture.timestamp);
    }
  }
  
  /**
   * Generate text completion
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }
  
  /**
   * Generate embeddings for vector storage
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
  
  /**
   * Create fallback analysis when Gemini fails
   */
  private createFallbackAnalysis(timestamp: number): VisionAnalysis {
    return {
      application: 'unknown',
      windowTitle: 'Unknown',
      userActivity: 'active',
      confidence: 0.3,
      visibleText: [],
      uiElements: [],
      timestamp,
    };
  }
}
