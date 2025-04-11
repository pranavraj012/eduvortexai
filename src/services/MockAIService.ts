
import { Roadmap, RoadmapNode } from '@/context/LearningContext';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface AIChat {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

class MockAIService {
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static googleApiKey: string | null = null;

  static setGoogleApiKey(apiKey: string) {
    this.googleApiKey = apiKey;
    console.log('Google API key configured successfully');
  }

  // This method would use the Google API when fully implemented
  // Currently still using mock data
  static async generateRoadmap(topic: string): Promise<Roadmap> {
    await this.delay(1500); // Simulate API call delay
    
    // In a full implementation, this would use the Google API
    // if (this.googleApiKey) {
    //   // Make actual API call to Google's Gemini API
    // }
    
    const nodes = this.generateNodesForTopic(topic);
    
    return {
      id: `roadmap-${Date.now()}`,
      title: `Learning Path: ${topic}`,
      description: `A comprehensive learning path for mastering ${topic}.`,
      nodes,
      createdAt: new Date().toISOString()
    };
  }
  
  static async generateQuiz(topic: string, nodeId: string): Promise<QuizQuestion[]> {
    await this.delay(1000); // Simulate API call delay
    
    return [
      {
        id: `q1-${nodeId}`,
        question: `What is the most fundamental concept in ${topic}?`,
        options: [
          `Basic principle of ${topic}`,
          `Advanced application of ${topic}`,
          `History of ${topic}`,
          `Future developments in ${topic}`
        ],
        correctAnswer: `Basic principle of ${topic}`
      },
      {
        id: `q2-${nodeId}`,
        question: `Which of these is NOT related to ${topic}?`,
        options: [
          `Core ${topic} theory`,
          `Unrelated subject`,
          `${topic} in practice`,
          `${topic} case studies`
        ],
        correctAnswer: `Unrelated subject`
      },
      {
        id: `q3-${nodeId}`,
        question: `How would you apply ${topic} in a real-world scenario?`,
        options: [
          `By ignoring practical considerations`,
          `By studying only the theory`,
          `By applying theoretical knowledge to practical problems`,
          `By avoiding the use of ${topic} altogether`
        ],
        correctAnswer: `By applying theoretical knowledge to practical problems`
      },
    ];
  }
  
  static async chatWithAI(message: string): Promise<AIChat> {
    await this.delay(800); // Simulate API call delay
    
    let response = '';
    
    if (message.toLowerCase().includes('help')) {
      response = "I can help you with your learning journey. You can ask me to explain concepts, generate quizzes, or create personalized learning paths.";
    } else if (message.toLowerCase().includes('explain')) {
      const topic = message.replace(/explain/i, '').trim();
      response = `${topic} is a fascinating subject that involves understanding key principles and applying them in various contexts. The core concepts include theoretical foundations and practical applications.`;
    } else if (message.toLowerCase().includes('quiz')) {
      response = "I can generate quizzes on any topic. Just navigate to a learning node and click the 'Generate Quiz' button.";
    } else if (message.toLowerCase().includes('roadmap')) {
      response = "I can create personalized learning roadmaps. Go to the Learn page and enter a topic to generate a customized learning path.";
    } else {
      response = "I'm your AI learning assistant. I can help explain concepts, generate quizzes, and create personalized learning paths. What would you like to learn today?";
    }
    
    return {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };
  }
  
  private static generateNodesForTopic(topic: string): RoadmapNode[] {
    let nodeCount = 5;
    let nodes: RoadmapNode[] = [];
    
    const baseX = 300;
    const baseY = 200;
    const spacingX = 250;
    const spacingY = 150;
    
    for (let i = 0; i < nodeCount; i++) {
      const position = { 
        x: baseX + (i % 3) * spacingX + (Math.random() * 50 - 25), 
        y: baseY + Math.floor(i / 3) * spacingY + (Math.random() * 50 - 25) 
      };
      
      const node: RoadmapNode = {
        id: `node-${i}-${Date.now()}`,
        title: this.generateNodeTitle(topic, i),
        description: this.generateNodeDescription(topic, i),
        completed: false,
        xp: 50 + i * 10,
        position,
        connections: []
      };
      
      // Add connections to previous nodes (except for the first node)
      if (i > 0) {
        // Connect to previous node
        node.connections.push(nodes[i-1].id);
        
        // Connect to a random earlier node (for more interesting graph)
        if (i > 1 && Math.random() > 0.5) {
          const randomIndex = Math.floor(Math.random() * (i - 1));
          node.connections.push(nodes[randomIndex].id);
        }
      }
      
      nodes.push(node);
    }
    
    return nodes;
  }
  
  private static generateNodeTitle(topic: string, index: number): string {
    const starter = [
      "Introduction to",
      "Fundamentals of",
      "Advanced",
      "Practical",
      "Understanding",
      "Mastering",
      "Exploring",
      "Deep Dive into",
      "Applied"
    ];
    
    const ender = [
      "Concepts",
      "Theory",
      "Principles",
      "Applications",
      "Frameworks",
      "Methodologies",
      "Practices",
      "Foundations"
    ];
    
    if (index === 0) {
      return `Introduction to ${topic}`;
    } else if (index === 1) {
      return `${topic} Fundamentals`;
    } else if (index === 4) {
      return `Advanced ${topic}`;
    } else {
      const start = starter[Math.floor(Math.random() * starter.length)];
      const end = ender[Math.floor(Math.random() * ender.length)];
      return `${start} ${topic} ${end}`;
    }
  }
  
  private static generateNodeDescription(topic: string, index: number): string {
    const descriptions = [
      `Learn the core principles and foundational concepts of ${topic}.`,
      `Explore the practical applications and real-world examples of ${topic}.`,
      `Dive deep into the advanced techniques and methodologies in ${topic}.`,
      `Understand the theoretical framework and historical development of ${topic}.`,
      `Master the essential skills and best practices in ${topic}.`
    ];
    
    return descriptions[index % descriptions.length];
  }
}

export default MockAIService;
