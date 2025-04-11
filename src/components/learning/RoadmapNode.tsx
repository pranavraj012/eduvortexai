
import { useState } from 'react';
import { RoadmapNode as RoadmapNodeType } from '@/context/LearningContext';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  ChevronRight, 
  HelpCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapNodeProps {
  node: RoadmapNodeType;
  isActive: boolean;
  onSelect: (node: RoadmapNodeType) => void;
}

const RoadmapNode = ({ node, isActive, onSelect }: RoadmapNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={cn(
        "absolute transition-all duration-300 w-48",
        isActive && "scale-105 z-10",
        isHovered && "scale-105 z-10"
      )}
      style={{ 
        left: `${node.position.x}px`, 
        top: `${node.position.y}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "glass-card rounded-lg p-4",
          node.completed && "border-edu-purple/50",
          isActive && "purple-glow border-edu-purple"
        )}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-sm line-clamp-2">{node.title}</h3>
          </div>
          <div className="flex shrink-0 ml-2">
            {node.completed ? (
              <CheckCircle className="h-5 w-5 text-edu-purple" />
            ) : (
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {node.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-xs font-medium">
            <span className="text-edu-purple">{node.xp} XP</span>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2 text-xs"
            onClick={() => onSelect(node)}
          >
            Explore
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapNode;
