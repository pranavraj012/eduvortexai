
interface RoadmapGenerationParams {
  topic: string;
  timeframe?: string;
}

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xp: number;
  position: { x: number; y: number };
  connections: string[];
  content: string | null;
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
  createdAt: string;
}

import { supabase } from '@/integrations/supabase/client';

class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async callGeminiAPI(prompt: string) {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          type: 'generateContent',
          prompt: prompt
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error calling Gemini API via edge function:', error);
      throw error;
    }
  }

  async generateRoadmap(params: RoadmapGenerationParams): Promise<Roadmap> {
    const { topic, timeframe } = params;
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          type: 'generateRoadmap',
          topic,
          timeframe
        }
      });

      if (error) {
        console.error('Error from edge function (generateRoadmap):', error);
        throw error;
      }
      
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        const content = data.candidates[0].content.parts[0].text;
        let jsonStart = content.indexOf('{');
        let jsonEnd = content.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
          console.error('JSON data not found in response:', content);
          throw new Error("JSON data not found in response");
        }
        
        const jsonString = content.substring(jsonStart, jsonEnd);
        let roadmap;
        
        try {
          roadmap = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError, 'JSON string:', jsonString);
          throw new Error("Failed to parse roadmap JSON: " + parseError.message);
        }
        
        // Add current timestamp
        roadmap.createdAt = new Date().toISOString();
        
        // Ensure all nodes have content property set to null
        roadmap.nodes = roadmap.nodes.map((node: any) => ({
          ...node,
          content: node.content === undefined ? null : node.content
        }));
        
        // Ensure we have at least 10 nodes for a comprehensive roadmap
        if (roadmap.nodes.length < 10) {
          console.warn(`Generated roadmap has only ${roadmap.nodes.length} nodes, which is less than expected.`);
        }
        
        return roadmap;
      } else {
        console.error('Invalid response structure from Gemini API:', data);
        throw new Error("Invalid response structure from Gemini API");
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw error;
    }
  }

  async generateNodeContent(topic: string, nodeTitle: string): Promise<{ content: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          type: 'generateNodeContent',
          topic,
          nodeTitle
        }
      });

      if (error) {
        console.error('Error from edge function (generateNodeContent):', error);
        throw error;
      }
      
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        const content = data.candidates[0].content.parts[0].text;
        
        return { content };
      } else {
        console.error('Invalid response structure from Gemini API:', data);
        throw new Error("Invalid response structure from Gemini API");
      }
    } catch (error) {
      console.error('Error generating node content:', error);
      throw error;
    }
  }

  async generateQuiz(topic: string, nodeId: string): Promise<any> {
    const prompt = `
      Create a quiz about "${topic}" for a learning platform.
      
      Format your response as a JSON object with the following structure:
      {
        "nodeId": "${nodeId}",
        "questions": [
          {
            "id": "q1",
            "question": "Question text",
            "options": [
              { "id": "a", "text": "Option A" },
              { "id": "b", "text": "Option B" },
              { "id": "c", "text": "Option C" },
              { "id": "d", "text": "Option D" }
            ],
            "correctOption": "a",
            "explanation": "Explanation why this answer is correct"
          }
        ]
      }
      
      Create 5 multiple-choice questions that test understanding of important concepts related to ${topic}.
      Each question should have 4 options (a, b, c, d) with only one correct answer.
      Include an explanation for why the correct answer is right.
      Make sure the questions cover different aspects of the topic.
    `;
    
    try {
      const response = await this.callGeminiAPI(prompt);
      
      if (response.candidates && response.candidates.length > 0 && 
          response.candidates[0].content && 
          response.candidates[0].content.parts && 
          response.candidates[0].content.parts.length > 0) {
        
        const content = response.candidates[0].content.parts[0].text;
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
      console.error('Error generating quiz:', error);
      throw error;
    }
  }
}

export default GeminiService;
