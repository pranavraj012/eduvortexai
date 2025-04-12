import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const spotlightRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setOpacity(1);
  }, []);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlightRef.current) return;
    
    const rect = spotlightRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPosition({ x, y });
  };
  
  return (
    <div
      ref={spotlightRef}
      className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-500",
        className
      )}
      style={{ opacity }}
      onMouseMove={handleMouseMove}
    >
      <div 
        className="absolute h-[500px] w-[500px] rounded-full blur-[100px]"
        style={{
          left: position.x - 250,
          top: position.y - 250,
          background: fill,
          opacity: 0.5,
        }}
      />
    </div>
  );
}
