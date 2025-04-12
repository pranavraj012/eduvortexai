
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
    const GEMINI_API_KEY = "AIzaSyDSLvLlDoP-apMrXXDJksj7apmInfCnimg";
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
        Create detailed educational content about "${body.nodeTitle}" within the broader topic of "${body.topic}".
        
        Format the content using Markdown, including:
        - A brief introduction to ${body.nodeTitle}
        - Main concepts and principles
        - Examples or case studies
        - Practice exercises or questions
        - Additional resources for further learning
        
        Make the content educational, informative, and engaging for someone learning this topic.
        Use proper headings, bullet points, and formatting to organize the content.
        Keep the total length to about 800-1200 words.
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
