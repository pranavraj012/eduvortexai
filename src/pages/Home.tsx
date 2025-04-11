
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  ChevronRight, 
  GraduationCap, 
  LineChart, 
  MessageSquare, 
  Network, 
  Trophy
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mx-auto space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative space-y-8">
        <div className="absolute -z-10 inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-edu-purple/20 via-transparent to-transparent"></div>
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold animate-fade-in">
            <span className="text-gradient">Learning Reimagined</span> with AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{animationDelay: "0.2s"}}>
            Discover personalized learning paths powered by artificial intelligence
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{animationDelay: "0.4s"}}>
          <Button asChild size="lg" className="purple-glow bg-gradient-to-r from-edu-purple to-edu-brightBlue hover:opacity-90">
            <Link to="/learn">
              Start Learning
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/learn">
              Explore Paths
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-10">
        <h2 className="text-3xl font-bold text-center mb-12">
          <span className="text-gradient">Key Features</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card p-6 rounded-xl transition-all hover:scale-105 duration-300">
            <div className="h-12 w-12 rounded-lg bg-edu-purple/20 flex items-center justify-center mb-4">
              <Network className="h-6 w-6 text-edu-purple" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalized Roadmaps</h3>
            <p className="text-muted-foreground">
              AI-generated learning paths customized to your specific goals, experience level, and learning style.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="glass-card p-6 rounded-xl transition-all hover:scale-105 duration-300">
            <div className="h-12 w-12 rounded-lg bg-edu-purple/20 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-edu-purple" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Learning Assistant</h3>
            <p className="text-muted-foreground">
              Get instant explanations, answers to questions, and guidance from your personal AI tutor.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="glass-card p-6 rounded-xl transition-all hover:scale-105 duration-300">
            <div className="h-12 w-12 rounded-lg bg-edu-purple/20 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-edu-purple" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Quizzes</h3>
            <p className="text-muted-foreground">
              Test your knowledge with dynamically generated quizzes that adapt to your learning progress.
            </p>
          </div>
          
          {/* Feature 4 */}
          <div className="glass-card p-6 rounded-xl transition-all hover:scale-105 duration-300">
            <div className="h-12 w-12 rounded-lg bg-edu-purple/20 flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-edu-purple" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Achievements & Rewards</h3>
            <p className="text-muted-foreground">
              Stay motivated with a gamified learning experience, unlocking achievements as you progress.
            </p>
          </div>
          
          {/* Feature 5 */}
          <div className="glass-card p-6 rounded-xl transition-all hover:scale-105 duration-300">
            <div className="h-12 w-12 rounded-lg bg-edu-purple/20 flex items-center justify-center mb-4">
              <LineChart className="h-6 w-6 text-edu-purple" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-muted-foreground">
              Visualize your learning journey with detailed analytics and progress tracking.
            </p>
          </div>
          
          {/* Feature 6 */}
          <div className="glass-card p-6 rounded-xl transition-all hover:scale-105 duration-300">
            <div className="h-12 w-12 rounded-lg bg-edu-purple/20 flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-edu-purple" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Knowledge Graph</h3>
            <p className="text-muted-foreground">
              Explore connected concepts through an interactive knowledge graph visualization.
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="glass-card rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Your Learning?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Start your personalized learning journey today with EduVortex's AI-powered platform.
        </p>
        <Button asChild size="lg" className="purple-glow bg-gradient-to-r from-edu-purple to-edu-brightBlue hover:opacity-90">
          <Link to="/learn">
            Get Started Now
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
};

export default Home;
