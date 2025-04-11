
import { Roadmap, RoadmapNode } from "@/context/LearningContext";

interface GeminiAPIParams {
  topic: string;
  timeframe?: string;
}

class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }

  async generateRoadmap({ topic, timeframe }: GeminiAPIParams): Promise<Roadmap> {
    const timeframeText = timeframe ? `within ${timeframe}` : "with no specific timeframe";
    
    const prompt = `Create a comprehensive learning roadmap for the topic: "${topic}" ${timeframeText}.
    
    Format your response as a JSON with this exact structure:
    {
      "title": "Learning Path: [TOPIC]",
      "description": "[BRIEF_DESCRIPTION]",
      "nodes": [
        {
          "id": "[AUTO_GENERATED_UUID]",
          "title": "[NODE_TITLE]",
          "description": "[NODE_DESCRIPTION]",
          "xp": [EXPERIENCE_POINTS_BETWEEN_10_AND_50],
          "position": {
            "x": [X_COORDINATE_BETWEEN_0_AND_800],
            "y": [Y_COORDINATE_BETWEEN_0_AND_500]
          },
          "connections": ["IDS_OF_CONNECTED_NODES"],
          "completed": false,
          "content": null
        }
      ]
    }
    
    Include 5-8 learning nodes. Each node should represent a key concept or skill within the topic.
    Arrange nodes in a logical sequence with proper connections between them.
    Position coordinates should create a visual flow from left to right or top to bottom.
    Ensure all IDs are properly referenced in connections arrays.
    Do not include any explanatory text outside the JSON structure.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      
      // Extract the JSON from the response
      if (response.candidates && response.candidates.length > 0 && 
          response.candidates[0].content && 
          response.candidates[0].content.parts && 
          response.candidates[0].content.parts.length > 0) {
        
        const responseText = response.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const roadmapData = JSON.parse(jsonMatch[0]);
          
          // Add additional fields to make it compatible with our Roadmap type
          const roadmap: Roadmap = {
            ...roadmapData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          };
          
          return roadmap;
        } else {
          throw new Error("Could not parse roadmap JSON from response");
        }
      } else {
        throw new Error("Invalid response from Gemini API");
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
      throw error;
    }
  }

  async generateNodeContent(topic: string, nodeTitle: string): Promise<{ content: string }> {
    const prompt = `Create comprehensive learning content for the topic "${nodeTitle}" within the broader subject of "${topic}".
    
    Format your response as educational material with markdown formatting including:
    - Clear headings and subheadings
    - Bullet points for key concepts
    - Code examples where applicable
    - Brief exercises or reflection questions
    - Links to further resources (if relevant)
    
    The content should be detailed enough to help someone learn this concept thoroughly but concise enough to be consumed in 10-15 minutes.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      
      if (response.candidates && response.candidates.length > 0 && 
          response.candidates[0].content && 
          response.candidates[0].content.parts && 
          response.candidates[0].content.parts.length > 0) {
        
        const content = response.candidates[0].content.parts[0].text;
        return { content };
      } else {
        throw new Error("Invalid response from Gemini API");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  }

  async generateQuiz(topic: string, nodeId: string): Promise<any[]> {
    const prompt = `Create a quiz with 5 questions about "${topic}". 
    
    Format your response as a JSON array with this exact structure:
    [
      {
        "id": "[AUTO_GENERATED_UUID]",
        "question": "[QUESTION_TEXT]",
        "options": ["[OPTION_1]", "[OPTION_2]", "[OPTION_3]", "[OPTION_4]"],
        "correctAnswer": "[CORRECT_OPTION_TEXT_EXACT_MATCH]"
      }
    ]
    
    Ensure each question has exactly 4 options.
    The correctAnswer must exactly match one of the options provided.
    Questions should test understanding rather than just recall.
    Do not include any explanatory text outside the JSON array.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      
      if (response.candidates && response.candidates.length > 0 && 
          response.candidates[0].content && 
          response.candidates[0].content.parts && 
          response.candidates[0].content.parts.length > 0) {
        
        const responseText = response.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response text
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const quizData = JSON.parse(jsonMatch[0]);
          return quizData;
        } else {
          throw new Error("Could not parse quiz JSON from response");
        }
      } else {
        throw new Error("Invalid response from Gemini API");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      throw error;
    }
  }
}

export default GeminiService;
