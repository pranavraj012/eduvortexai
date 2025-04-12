import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log environment status for debugging
    console.log("Edge function invoked");
    const hasEnvVar = !!Deno.env.get("GEMINI_API_KEY");
    console.log("Has GEMINI_API_KEY environment variable:", hasEnvVar);
    
    // Use environment variable from Supabase Edge Functions configuration
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AIzaSyDSLvLlDoP-apMrXXDJksj7apmInfCnimg";
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const body = await req.json();
    
    // Handle different request types
    if (body.type === 'generateContent') {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: body.prompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 4096
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API call failed: ${response.status} ${errorText}`);
      }
      
      return new Response(await response.text(), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (body.type === 'generateRoadmap') {
      console.log("Generating roadmap for topic:", body.topic);
      
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const timeframePrompt = body.timeframe 
        ? `Design this roadmap to be completable within ${body.timeframe}.` 
        : "Design this roadmap with a reasonable timeframe.";
      
      const prompt = `
        Create a comprehensive learning roadmap for the topic: "${body.topic}". ${timeframePrompt}
        
        Format your response as a JSON object with the following structure:
        {
          "id": "unique-id",
          "title": "Learning Path: ${body.topic}",
          "description": "A detailed description of this learning path",
          "nodes": [
            {
              "id": "node-1",
              "title": "Node Title",
              "description": "Brief description of this learning node",
              "completed": false,
              "xp": 100,
              "position": { "x": 0, "y": 0 },
              "connections": ["node-2", "node-3"],
              "content": null
            }
          ]
        }
        
        IMPORTANT REQUIREMENTS:
        1. Include EXACTLY 10-15 nodes (no more, no less) for a comprehensive learning path
        2. Cover beginner, intermediate, and advanced topics
        3. Position the nodes in a logical layout where x and y values are between 0 and 1000
        4. Make connections reflect logical dependencies between topics
        5. Use descriptive titles and informative descriptions for each node
        6. Ensure node IDs follow the pattern 'node-1', 'node-2', etc.
        7. Make sure all connections reference only valid node IDs
        8. Set all 'completed' fields to false
        9. Assign XP values between 50-200 based on the node's difficulty
        10. Set all 'content' fields to null
        
        Analyze the topic thoroughly and create a well-structured learning path that helps someone progress from beginner to advanced level in this subject.
      `;
      
      console.log("Sending prompt to Gemini API");
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error response:`, errorText);
        throw new Error(`Gemini API call failed: ${response.status} ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log("Received response from Gemini API");
      
      // Extract the JSON from the response
      if (responseData.candidates && responseData.candidates.length > 0 && 
          responseData.candidates[0].content && 
          responseData.candidates[0].content.parts && 
          responseData.candidates[0].content.parts.length > 0) {
          
        const content = responseData.candidates[0].content.parts[0].text;
        
        console.log("Extracting JSON from response");
        try {
          let jsonStart = content.indexOf('{');
          let jsonEnd = content.lastIndexOf('}') + 1;
          
          if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error("JSON data not found in response");
          }
          
          const jsonString = content.substring(jsonStart, jsonEnd);
          const roadmap = JSON.parse(jsonString);
          
          // Validate roadmap structure
          if (!roadmap.nodes || !Array.isArray(roadmap.nodes)) {
            throw new Error("Invalid roadmap structure: nodes array is missing");
          }
          
          if (roadmap.nodes.length < 10) {
            throw new Error(`Roadmap has only ${roadmap.nodes.length} nodes, which is less than the required minimum of 10`);
          }
          
          // Add timestamp
          roadmap.createdAt = new Date().toISOString();
          
          // Validate all connections reference valid nodes
          const nodeIds = roadmap.nodes.map(node => node.id);
          roadmap.nodes.forEach(node => {
            if (node.connections) {
              node.connections = node.connections.filter(connId => nodeIds.includes(connId));
            }
          });
          
          console.log(`Successfully generated roadmap with ${roadmap.nodes.length} nodes`);
          
          return new Response(JSON.stringify(roadmap), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (parseError) {
          console.error('Failed to parse roadmap JSON:', parseError);
          throw new Error(`Failed to parse roadmap JSON: ${parseError.message}`);
        }
      } else {
        console.error('Invalid response structure from Gemini API:', responseData);
        throw new Error("Invalid response structure from Gemini API");
      }
    } else if (body.type === 'generateNodeContent') {
      console.log(`Generating content for node "${body.nodeTitle}" in topic "${body.topic}"`);
      
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const prompt = `
        Create comprehensive, educational content about "${body.nodeTitle}" within the broader topic of "${body.topic}".
        
        Format the content using Markdown, and include ALL of the following sections:
        
        ## Introduction
        - Give a clear, engaging introduction to ${body.nodeTitle}
        - Explain why this topic is important in the context of ${body.topic}
        - Provide a brief overview of what the reader will learn
        
        ## Key Concepts
        - Explain 3-5 fundamental concepts related to ${body.nodeTitle}
        - Use clear explanations with real-world examples
        - Include any relevant formulas, principles, or theories
        
        ## Practical Applications
        - Show how ${body.nodeTitle} is used in real-world scenarios
        - Give specific examples of implementations or use cases
        - Explain the benefits and potential challenges
        
        ## Learning Exercises
        - Provide 2-3 hands-on exercises or projects for practice
        - Include step-by-step instructions
        - Explain what skills each exercise will help develop
        
        ## Additional Resources
        - List 3-5 high-quality resources for further learning (books, courses, websites, videos)
        - Briefly describe what each resource offers
        
        ## Summary
        - Summarize the key takeaways
        - Explain how this topic connects to other areas in ${body.topic}
        - Suggest next steps for continued learning
        
        Make the content educational, detailed, and engaging for someone learning this topic.
        Use proper Markdown formatting including headings, bullet points, code blocks where relevant, and emphasis.
        Aim for approximately 1500-2000 words of substantial, educational content.
        Focus on accuracy, clarity, and educational value.
        
        DO NOT INCLUDE ANY DISCLAIMERS OR NOTES ABOUT BEING AN AI.
        DO NOT MENTION THAT YOU ARE AN AI ASSISTANT.
        WRITE AS AN EDUCATIONAL EXPERT IN THIS FIELD.
      `;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 8192
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API call failed: ${response.status} ${errorText}`);
      }
      
      return new Response(await response.text(), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (body.type === 'generateQuiz') {
      console.log(`Generating quiz for "${body.topic}" (node ID: ${body.nodeId})`);
      
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const prompt = `
        Create a quiz about "${body.topic}" for a learning platform.
        
        Format your response as a JSON object with the following structure:
        {
          "nodeId": "${body.nodeId}",
          "questions": [
            {
              "id": "q1",
              "question": "Question text",
              "options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
              ],
              "correctOption": "Option A",
              "explanation": "Explanation why this answer is correct"
            }
          ]
        }
        
        IMPORTANT REQUIREMENTS:
        1. Create EXACTLY 5 multiple-choice questions (no more, no less)
        2. Each question must test understanding of important concepts related to ${body.topic}
        3. Each question must have EXACTLY 4 options
        4. There must be only one correct answer per question
        5. Include a detailed explanation for why the correct answer is right
        6. Make sure the options array contains only the text of each option (not objects)
        7. The correctOption field must match EXACTLY one of the strings in the options array
        8. Questions should cover different aspects of the topic
        9. Make questions challenging but fair for someone learning this topic
      `;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API call failed: ${response.status} ${errorText}`);
      }
      
      return new Response(await response.text(), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (body.type === 'chatWithAI') {
      console.log("Processing chat message");
      
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI learning assistant helping a user with their education. 
                     Respond to this message in a helpful, educational manner: "${body.message}"`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API call failed: ${response.status} ${errorText}`);
      }
      
      return new Response(await response.text(), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid request type');
    }
  } catch (error) {
    console.error('Error in Gemini function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
