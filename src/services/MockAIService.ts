
import GeminiService from './GeminiService';

interface RoadmapGenerationParams {
  topic: string;
  timeframe?: string;
}

interface AIResponse {
  content: string;
  timestamp: string;
}

class MockAIService {
  private static geminiApiKey: string = 'AIzaSyDSLvLlDoP-apMrXXDJksj7apmInfCnimg';
  private static geminiService: GeminiService | null = null;

  static setGoogleApiKey(apiKey: string) {
    this.geminiApiKey = apiKey;
    this.geminiService = new GeminiService(apiKey);
    console.info('Google API key configured successfully');
  }

  static async generateRoadmap(params: RoadmapGenerationParams) {
    try {
      if (!this.geminiService) {
        this.geminiService = new GeminiService(this.geminiApiKey);
      }
      
      const result = await this.geminiService.generateRoadmap(params);
      
      // Ensure we have a reasonable number of nodes (10-15)
      if (result.nodes && result.nodes.length < 10) {
        console.warn(`Generated roadmap has only ${result.nodes.length} nodes, which is less than expected.`);
      }
      
      return result;
    } catch (error) {
      console.error('Error in generateRoadmap:', error);
      throw error;
    }
  }

  static async generateNodeContent(topic: string, nodeTitle: string) {
    try {
      if (!this.geminiService) {
        this.geminiService = new GeminiService(this.geminiApiKey);
      }
      
      return await this.geminiService.generateNodeContent(topic, nodeTitle);
    } catch (error) {
      console.error('Error in generateNodeContent:', error);
      throw error;
    }
  }

  static async generateQuiz(topic: string, nodeId: string) {
    try {
      if (!this.geminiService) {
        this.geminiService = new GeminiService(this.geminiApiKey);
      }
      
      return await this.geminiService.generateQuiz(topic, nodeId);
    } catch (error) {
      console.error('Error in generateQuiz:', error);
      throw error;
    }
  }

  static async chatWithAI(message: string): Promise<AIResponse> {
    try {
      if (!this.geminiService) {
        this.geminiService = new GeminiService(this.geminiApiKey);
      }
      
      // Use Gemini API for chat responses
      const response = await this.geminiService.callGeminiAPI(
        `You are an AI learning assistant helping a user with their education. 
         Respond to this message in a helpful, educational manner: "${message}"`
      );
      
      if (response.candidates && response.candidates.length > 0 && 
          response.candidates[0].content && 
          response.candidates[0].content.parts && 
          response.candidates[0].content.parts.length > 0) {
        
        const content = response.candidates[0].content.parts[0].text;
        return {
          content,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error("Invalid response from Gemini API");
      }
    } catch (error) {
      console.error('Error in chatWithAI:', error);
      
      // Fallback response if API fails
      return {
        content: "I'm sorry, I encountered an issue processing your request. Could you try asking again?",
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Initialize the API key
MockAIService.setGoogleApiKey('AIzaSyDSLvLlDoP-apMrXXDJksj7apmInfCnimg');

export default MockAIService;
