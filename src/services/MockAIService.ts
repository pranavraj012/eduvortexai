import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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

  static setGoogleApiKey(apiKey: string) {
    this.geminiApiKey = apiKey;
    console.info('Google API key configured successfully');
  }

  static async generateRoadmap(params: RoadmapGenerationParams) {
    try {
      console.log('Calling generateRoadmap with params:', params);
      
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          type: 'generateRoadmap',
          topic: params.topic,
          timeframe: params.timeframe
        }
      });
      
      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }
      
      // For direct calls to the edge function, the response is the roadmap itself
      if (!data.id || !data.nodes) {
        throw new Error('Invalid roadmap structure returned from API');
      }
      
      // Ensure we have a reasonable number of nodes (10-15)
      if (data.nodes && data.nodes.length < 10) {
        console.warn(`Generated roadmap has only ${data.nodes.length} nodes, which is less than expected.`);
        toast({
          title: "Warning",
          description: "Generated roadmap has fewer nodes than expected. You might want to regenerate it.",
          variant: "default"
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error in generateRoadmap:', error);
      throw error;
    }
  }

  static async generateNodeContent(topic: string, nodeTitle: string) {
    try {
      console.log('Calling generateNodeContent for:', nodeTitle);
      
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          type: 'generateNodeContent',
          topic,
          nodeTitle
        }
      });
      
      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }
      
      // Extract content from the Gemini API response
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        const content = data.candidates[0].content.parts[0].text;
        return { content };
      } else {
        throw new Error("Invalid response from Gemini API");
      }
    } catch (error) {
      console.error('Error in generateNodeContent:', error);
      throw error;
    }
  }

  static async generateQuiz(topic: string, nodeId: string) {
    try {
      console.log('Calling generateQuiz for:', topic);
      
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          type: 'generateQuiz',
          topic,
          nodeId
        }
      });
      
      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }
      
      // Extract the quiz data from the Gemini API response
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        const content = data.candidates[0].content.parts[0].text;
        let jsonStart = content.indexOf('{');
        let jsonEnd = content.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error("JSON data not found in response");
        }
        
        try {
          const jsonString = content.substring(jsonStart, jsonEnd);
          return JSON.parse(jsonString);
        } catch (parseError) {
          console.error('Failed to parse quiz JSON:', parseError);
          throw new Error("Failed to parse quiz JSON: " + parseError.message);
        }
      } else {
        throw new Error("Invalid response structure from Gemini API");
      }
    } catch (error) {
      console.error('Error in generateQuiz:', error);
      throw error;
    }
  }

  static async chatWithAI(message: string): Promise<AIResponse> {
    try {
      console.log('Calling chatWithAI with message:', message);
      
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          type: 'chatWithAI',
          message
        }
      });
      
      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }
      
      // Extract content from the Gemini API response
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        const content = data.candidates[0].content.parts[0].text;
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
