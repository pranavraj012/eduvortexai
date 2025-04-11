
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, MessageSquare, Brain } from 'lucide-react';
import RoadmapCanvas from '@/components/learning/RoadmapCanvas';
import AIChat from '@/components/learning/AIChat';
import { useLearning, RoadmapNode } from '@/context/LearningContext';
import MockAIService from '@/services/MockAIService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QuizComponent from '@/components/learning/QuizComponent';

const Learn = () => {
  const { activeRoadmap, userRoadmaps, setActiveRoadmap, addRoadmap, completeNode } = useLearning();
  const [searchTopic, setSearchTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeNode, setActiveNode] = useState<RoadmapNode | null>(null);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [showQuiz, setShowQuiz] = useState(false);
  
  const handleGenerateRoadmap = async () => {
    if (!searchTopic.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const newRoadmap = await MockAIService.generateRoadmap(searchTopic);
      addRoadmap(newRoadmap);
      setActiveRoadmap(newRoadmap);
      setActiveNode(null);
      setShowQuiz(false);
    } catch (error) {
      console.error('Error generating roadmap:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleNodeSelect = (node: RoadmapNode) => {
    setActiveNode(node);
    setShowQuiz(false);
  };
  
  const handleCompleteNode = () => {
    if (activeRoadmap && activeNode) {
      completeNode(activeRoadmap.id, activeNode.id);
      setShowQuiz(false);
      
      // Update active node reference to reflect completion
      const updatedNode = activeRoadmap.nodes.find(n => n.id === activeNode.id);
      if (updatedNode) {
        setActiveNode(updatedNode);
      }
    }
  };
  
  const handleStartQuiz = () => {
    setShowQuiz(true);
  };
  
  const handleQuizComplete = () => {
    handleCompleteNode();
  };
  
  return (
    <div className="container mx-auto py-6 h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Learning Hub</span>
        </h1>
        <p className="text-muted-foreground">
          Create personalized learning paths or explore the AI assistant.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search and Generate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Generate Learning Path</CardTitle>
              <CardDescription>Create a personalized roadmap for any topic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  placeholder="Enter a topic..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleGenerateRoadmap} 
                  disabled={!searchTopic.trim() || isGenerating}
                  className="bg-edu-purple hover:bg-edu-deepPurple"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Generating
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Node Details */}
          {activeNode && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{activeNode.title}</CardTitle>
                <CardDescription className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Learning Node
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{activeNode.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">XP: </span>
                    <span className="font-medium text-edu-purple">{activeNode.xp}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Status: </span>
                    <span className={`font-medium ${activeNode.completed ? 'text-green-500' : 'text-yellow-500'}`}>
                      {activeNode.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {!activeNode.completed && (
                    <>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleStartQuiz}
                      >
                        Take Quiz
                      </Button>
                      <Button 
                        className="flex-1 bg-edu-purple hover:bg-edu-deepPurple"
                        onClick={handleCompleteNode}
                      >
                        Mark Complete
                      </Button>
                    </>
                  )}
                  {activeNode.completed && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleStartQuiz}
                    >
                      Retake Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* AI Chat on mobile */}
          <div className="block lg:hidden">
            <h2 className="text-lg font-medium mb-2">AI Assistant</h2>
            <div className="h-[400px]">
              <AIChat />
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="mb-4">
              <TabsTrigger value="roadmap" className="flex items-center">
                <Brain className="mr-2 h-4 w-4" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                AI Assistant
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="roadmap" className="h-[calc(100%-48px)]">
              {showQuiz && activeRoadmap && activeNode ? (
                <QuizComponent 
                  topic={activeRoadmap.title.replace('Learning Path:', '').trim()} 
                  nodeId={activeNode.id}
                  onComplete={handleQuizComplete}
                />
              ) : activeRoadmap ? (
                <div className="glass-card p-4 rounded-lg h-full overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium">{activeRoadmap.title}</h2>
                    
                    <div className="text-sm text-muted-foreground">
                      {activeRoadmap.nodes.filter(n => n.completed).length} / {activeRoadmap.nodes.length} completed
                    </div>
                  </div>
                  
                  <div className="h-[calc(100%-40px)] overflow-hidden">
                    <RoadmapCanvas 
                      nodes={activeRoadmap.nodes} 
                      activeNodeId={activeNode?.id || null}
                      onNodeSelect={handleNodeSelect}
                    />
                  </div>
                </div>
              ) : (
                <div className="glass-card p-6 rounded-lg h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <Brain className="h-16 w-16 mx-auto mb-4 text-edu-purple opacity-50" />
                    <h2 className="text-xl font-medium mb-2">No Active Roadmap</h2>
                    <p className="text-muted-foreground mb-4">
                      Generate a learning path to get started with your personalized learning journey.
                    </p>
                    <Button 
                      className="bg-edu-purple hover:bg-edu-deepPurple"
                      onClick={() => document.querySelector('input')?.focus()}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Create a Roadmap
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="assistant" className="h-[calc(100%-48px)] hidden lg:block">
              <AIChat />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Learn;
