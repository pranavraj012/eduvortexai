
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
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
  createdAt: string;
}

class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Making this method public to fix the error
  public async callGeminiAPI(prompt: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API call failed: ${response.status} ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  async generateRoadmap(params: RoadmapGenerationParams): Promise<Roadmap> {
    const { topic, timeframe } = params;
    
    const timeframePrompt = timeframe 
      ? `Design this roadmap to be completable within ${timeframe}.` 
      : "Design this roadmap with a reasonable timeframe.";
    
    const prompt = `
      Create a learning roadmap for the topic: "${topic}". ${timeframePrompt}
      
      Format your response as a JSON object with the following structure:
      {
        "id": "unique-id",
        "title": "Learning Path: ${topic}",
        "description": "A detailed description of this learning path",
        "nodes": [
          {
            "id": "node-1",
            "title": "Node Title",
            "description": "Brief description of this learning node",
            "completed": false,
            "xp": 100,
            "position": { "x": 0, "y": 0 },
            "connections": ["node-2", "node-3"]
          }
        ]
      }
      
      Include 5-8 nodes for a complete but concise learning path.
      Position the nodes in a logical layout where x and y values are between 0 and 1000.
      Make connections reflect logical dependencies between topics.
      Use descriptive titles and informative descriptions for each node.
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
        
        const jsonString = content.substring(jsonStart, jsonEnd);
        const roadmap = JSON.parse(jsonString);
        
        // Add current timestamp
        roadmap.createdAt = new Date().toISOString();
        
        return roadmap;
      } else {
        throw new Error("Invalid response structure from Gemini API");
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      
      // Return a fallback roadmap if API fails
      return this.generateFallbackRoadmap(topic);
    }
  }

  async generateNodeContent(topic: string, nodeTitle: string): Promise<{ content: string }> {
    const prompt = `
      Create detailed educational content about "${nodeTitle}" within the broader topic of "${topic}".
      
      Format the content using Markdown, including:
      - A brief introduction to ${nodeTitle}
      - Main concepts and principles
      - Examples or case studies
      - Practice exercises or questions
      - Additional resources for further learning
      
      Make the content educational, informative, and engaging for someone learning this topic.
      Use proper headings, bullet points, and formatting to organize the content.
      Keep the total length to about 800-1200 words.
    `;
    
    try {
      const response = await this.callGeminiAPI(prompt);
      
      if (response.candidates && response.candidates.length > 0 && 
          response.candidates[0].content && 
          response.candidates[0].content.parts && 
          response.candidates[0].content.parts.length > 0) {
        
        const content = response.candidates[0].content.parts[0].text;
        
        return { content };
      } else {
        throw new Error("Invalid response structure from Gemini API");
      }
    } catch (error) {
      console.error('Error generating node content:', error);
      
      // Return fallback content
      return {
        content: `# ${nodeTitle}\n\n*Content generation is currently unavailable. Please try again later.*`
      };
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
        
        const jsonString = content.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonString);
      } else {
        throw new Error("Invalid response structure from Gemini API");
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      
      // Return a fallback quiz
      return this.generateFallbackQuiz(nodeId);
    }
  }

  private generateFallbackRoadmap(topic: string): Roadmap {
    return {
      id: `fallback-${Date.now()}`,
      title: `Learning Path: ${topic}`,
      description: `A learning roadmap for understanding ${topic}`,
      nodes: [
        {
          id: 'node-1',
          title: 'Introduction to the Topic',
          description: 'Basic understanding and fundamental concepts',
          completed: false,
          xp: 100,
          position: { x: 100, y: 200 },
          connections: ['node-2']
        },
        {
          id: 'node-2',
          title: 'Key Principles',
          description: 'Core theories and important principles',
          completed: false,
          xp: 150,
          position: { x: 300, y: 300 },
          connections: ['node-3', 'node-4']
        },
        {
          id: 'node-3',
          title: 'Practical Applications',
          description: 'Real-world applications and case studies',
          completed: false,
          xp: 200,
          position: { x: 500, y: 200 },
          connections: ['node-5']
        },
        {
          id: 'node-4',
          title: 'Advanced Concepts',
          description: 'Deep dive into complex aspects',
          completed: false,
          xp: 250,
          position: { x: 500, y: 400 },
          connections: ['node-5']
        },
        {
          id: 'node-5',
          title: 'Mastery & Specialization',
          description: 'Expert-level knowledge and specialized topics',
          completed: false,
          xp: 300,
          position: { x: 700, y: 300 },
          connections: []
        }
      ],
      createdAt: new Date().toISOString()
    };
  }

  private generateFallbackQuiz(nodeId: string): any {
    return {
      nodeId,
      questions: [
        {
          id: 'q1',
          question: 'Which of the following is a common best practice?',
          options: [
            { id: 'a', text: 'Option A - Correct answer' },
            { id: 'b', text: 'Option B' },
            { id: 'c', text: 'Option C' },
            { id: 'd', text: 'Option D' }
          ],
          correctOption: 'a',
          explanation: 'This is the correct answer because...'
        },
        {
          id: 'q2',
          question: 'What is an important concept to understand?',
          options: [
            { id: 'a', text: 'Option A' },
            { id: 'b', text: 'Option B - Correct answer' },
            { id: 'c', text: 'Option C' },
            { id: 'd', text: 'Option D' }
          ],
          correctOption: 'b',
          explanation: 'This is the correct answer because...'
        }
      ]
    };
  }
}

export default GeminiService;
