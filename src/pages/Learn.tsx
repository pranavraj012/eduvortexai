
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, MessageSquare, Brain, Clock, History, Award } from 'lucide-react';
import RoadmapCanvas from '@/components/learning/RoadmapCanvas';
import AIChat from '@/components/learning/AIChat';
import { useLearning, RoadmapNode, Roadmap } from '@/context/LearningContext';
import MockAIService from '@/services/MockAIService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QuizComponent from '@/components/learning/QuizComponent';
import NodeContentViewer from '@/components/learning/NodeContentViewer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const Learn = () => {
  const { 
    activeRoadmap, 
    userRoadmaps, 
    recentRoadmaps,
    setActiveRoadmap, 
    addRoadmap, 
    completeNode,
    updateNodeContent
  } = useLearning();
  
  const [searchTopic, setSearchTopic] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeNode, setActiveNode] = useState<RoadmapNode | null>(null);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [showQuiz, setShowQuiz] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  const handleGenerateRoadmap = async () => {
    if (!searchTopic.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const newRoadmap = await MockAIService.generateRoadmap({
        topic: searchTopic,
        timeframe: timeframe || undefined
      });
      
      addRoadmap(newRoadmap);
      setActiveRoadmap(newRoadmap);
      setActiveNode(null);
      setShowQuiz(false);
      setShowContent(false);
      
      toast({
        title: "Roadmap Generated",
        description: `Learning path for "${searchTopic}" has been created.`,
      });
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate roadmap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleNodeSelect = (node: RoadmapNode) => {
    setActiveNode(node);
    setShowQuiz(false);
    setShowContent(false);
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
      
      toast({
        title: "Node Completed",
        description: `You've completed "${activeNode.title}" and earned ${activeNode.xp} XP!`,
      });
    }
  };
  
  const handleStartQuiz = () => {
    setShowQuiz(true);
    setShowContent(false);
  };
  
  const handleViewContent = () => {
    setShowContent(true);
    setShowQuiz(false);
  };
  
  const handleQuizComplete = () => {
    handleCompleteNode();
  };
  
  const handleContentUpdate = (roadmapId: string, nodeId: string, content: string) => {
    updateNodeContent(roadmapId, nodeId, content);
    
    // Update the active node with new content if it's the one being updated
    if (activeNode && activeNode.id === nodeId) {
      setActiveNode({
        ...activeNode,
        content
      });
    }
  };
  
  const selectRoadmap = (roadmap: Roadmap) => {
    setActiveRoadmap(roadmap);
    setActiveNode(null);
    setShowQuiz(false);
    setShowContent(false);
  };
  
  const renderMainContent = () => {
    if (showContent && activeRoadmap && activeNode) {
      return (
        <NodeContentViewer 
          node={activeNode}
          topic={activeRoadmap.title.replace('Learning Path:', '').trim()}
          roadmapId={activeRoadmap.id}
          onContentUpdate={handleContentUpdate}
          onClose={() => setShowContent(false)}
        />
      );
    }
    
    if (showQuiz && activeRoadmap && activeNode) {
      return (
        <QuizComponent 
          topic={activeRoadmap.title.replace('Learning Path:', '').trim()} 
          nodeId={activeNode.id}
          onComplete={handleQuizComplete}
        />
      );
    }
    
    if (activeRoadmap) {
      return (
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
      );
    }
    
    return (
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
    );
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
            <CardContent className="space-y-4">
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
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Timeframe:</span>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Any timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any timeframe</SelectItem>
                    <SelectItem value="1 week">1 Week</SelectItem>
                    <SelectItem value="1 month">1 Month</SelectItem>
                    <SelectItem value="3 months">3 Months</SelectItem>
                    <SelectItem value="6 months">6 Months</SelectItem>
                    <SelectItem value="1 year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Roadmaps */}
          {recentRoadmaps.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Roadmaps</CardTitle>
                  <History className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>Your recently created learning paths</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recentRoadmaps.map(roadmap => (
                    <li key={roadmap.id}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => selectRoadmap(roadmap)}
                      >
                        <div className="flex items-center">
                          <Brain className="h-4 w-4 mr-2 text-edu-purple" />
                          <div className="truncate">
                            {roadmap.title.replace('Learning Path:', '').trim()}
                          </div>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
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
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={handleViewContent}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Content
                  </Button>
                  
                  {!activeNode.completed ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-center"
                        onClick={handleStartQuiz}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Take Quiz
                      </Button>
                      <Button 
                        className="w-full justify-center bg-edu-purple hover:bg-edu-deepPurple"
                        onClick={handleCompleteNode}
                      >
                        Mark Complete
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full justify-center"
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
              {renderMainContent()}
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
