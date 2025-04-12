
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
          }]
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
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
      
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
        
        Include 8-12 nodes for a comprehensive learning path covering beginner, intermediate, and advanced topics.
        Position the nodes in a logical layout where x and y values are between 0 and 1000.
        Make connections reflect logical dependencies between topics.
        Use descriptive titles and informative descriptions for each node.
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
          }]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API call failed: ${response.status} ${errorText}`);
      }
      
      return new Response(await response.text(), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (body.type === 'generateNodeContent') {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
      
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
          }]
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
