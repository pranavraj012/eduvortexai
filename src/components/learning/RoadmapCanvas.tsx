
import { useRef, useEffect } from 'react';
import { RoadmapNode as RoadmapNodeType } from '@/context/LearningContext';
import RoadmapNode from './RoadmapNode';

interface RoadmapCanvasProps {
  nodes: RoadmapNodeType[];
  activeNodeId: string | null;
  onNodeSelect: (node: RoadmapNodeType) => void;
}

const RoadmapCanvas = ({ nodes, activeNodeId, onNodeSelect }: RoadmapCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw connections between nodes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    } else {
      canvas.width = 1000;
      canvas.height = 600;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    nodes.forEach(node => {
      node.connections.forEach(connectedNodeId => {
        const connectedNode = nodes.find(n => n.id === connectedNodeId);
        if (connectedNode) {
          // Calculate line start and end coordinates
          const startX = node.position.x + 72; // Half of node width
          const startY = node.position.y + 45; // Half of node height
          const endX = connectedNode.position.x + 72;
          const endY = connectedNode.position.y + 45;

          // Draw line
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          
          // Set line style based on completion status
          if (node.completed && connectedNode.completed) {
            ctx.strokeStyle = '#9b87f5'; // Completed connection
            ctx.lineWidth = 2;
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Incomplete connection
            ctx.lineWidth = 1;
          }
          
          ctx.stroke();
          
          // Draw flow animation for completed connections
          if (node.completed && connectedNode.completed) {
            const particlePos = calculateParticlePosition(startX, startY, endX, endY);
            if (particlePos) {
              ctx.beginPath();
              ctx.arc(particlePos.x, particlePos.y, 3, 0, Math.PI * 2);
              ctx.fillStyle = '#9b87f5';
              ctx.fill();
            }
          }
        }
      });
    });
  }, [nodes]);
  
  // Helper to calculate particle position for flow animation
  const calculateParticlePosition = (startX: number, startY: number, endX: number, endY: number) => {
    const now = Date.now();
    const duration = 2000; // Animation duration in ms
    const progress = (now % duration) / duration;
    
    return {
      x: startX + (endX - startX) * progress,
      y: startY + (endY - startY) * progress
    };
  };
  
  return (
    <div className="relative w-full h-[600px] overflow-auto">
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      />
      
      {nodes.map(node => (
        <RoadmapNode
          key={node.id}
          node={node}
          isActive={activeNodeId === node.id}
          onSelect={onNodeSelect}
        />
      ))}
    </div>
  );
};

export default RoadmapCanvas;
