
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RoadmapNode } from '@/context/LearningContext';
import { Loader2, BookOpen, Download, Share2 } from 'lucide-react';
import MarkdownContent from './MarkdownContent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface NodeContentViewerProps {
  node: RoadmapNode;
  topic: string;
  roadmapId: string;
  onContentUpdate: (roadmapId: string, nodeId: string, content: string) => void;
  onClose: () => void;
}

const NodeContentViewer: React.FC<NodeContentViewerProps> = ({ 
  node, 
  topic, 
  roadmapId,
  onContentUpdate,
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(!node.content);
  
  // Generate content if it doesn't exist yet
  React.useEffect(() => {
    const generateContent = async () => {
      if (!node.content) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke('gemini-api', {
            body: {
              type: 'generateNodeContent',
              topic,
              nodeTitle: node.title
            }
          });
          
          if (error) {
            throw new Error(`Error from edge function: ${error.message}`);
          }
          
          if (data.candidates && data.candidates.length > 0 && 
              data.candidates[0].content && 
              data.candidates[0].content.parts && 
              data.candidates[0].content.parts.length > 0) {
            
            const content = data.candidates[0].content.parts[0].text;
            onContentUpdate(roadmapId, node.id, content);
          } else {
            throw new Error("Generated content is empty or invalid format");
          }
        } catch (error) {
          console.error("Error generating node content:", error);
          toast({
            title: "Error generating content",
            description: "Unable to generate learning content. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    generateContent();
  }, [node.id, node.content, onContentUpdate, roadmapId, topic]);
  
  const handleDownloadContent = () => {
    if (!node.content) return;
    
    const blob = new Blob([node.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${node.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Content downloaded",
      description: "Learning material has been downloaded as markdown file.",
    });
  };
  
  const handleShareContent = () => {
    if (navigator.share && node.content) {
      navigator.share({
        title: node.title,
        text: `Check out this learning material about ${node.title}`,
        url: window.location.href
      }).catch((error) => console.log('Error sharing', error));
    } else {
      toast({
        title: "Share not supported",
        description: "Sharing is not supported on this device or browser."
      });
    }
  };
  
  const handleRetryGeneration = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          type: 'generateNodeContent',
          topic,
          nodeTitle: node.title
        }
      });
      
      if (error) {
        throw new Error(`Error from edge function: ${error.message}`);
      }
      
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        const content = data.candidates[0].content.parts[0].text;
        onContentUpdate(roadmapId, node.id, content);
        toast({
          title: "Content regenerated",
          description: "New learning content has been generated successfully.",
        });
      } else {
        throw new Error("Generated content is empty or invalid format");
      }
    } catch (error) {
      console.error("Error regenerating node content:", error);
      toast({
        title: "Error generating content",
        description: "Unable to regenerate learning content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-edu-purple" />
          <h3 className="text-lg font-medium mb-2">Generating Learning Content</h3>
          <p className="text-muted-foreground">
            Our AI is creating personalized content for {node.title}...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="glass-card p-6 rounded-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-edu-purple" />
          <h2 className="text-xl font-medium">{node.title}</h2>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handleDownloadContent} title="Download content">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleShareContent} title="Share content">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2">
        {node.content ? (
          <MarkdownContent content={node.content} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No content available.</p>
            <Button onClick={handleRetryGeneration}>
              Retry Content Generation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeContentViewer;
