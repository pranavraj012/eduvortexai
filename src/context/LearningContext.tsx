
import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
  createdAt: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xp: number;
  position: { x: number; y: number };
  connections: string[];
}

export interface UserAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface UserStats {
  totalXp: number;
  streak: number;
  roadmapsCompleted: number;
  nodesCompleted: number;
  quizzesTaken: number;
  averageScore: number;
}

interface LearningContextType {
  activeRoadmap: Roadmap | null;
  userRoadmaps: Roadmap[];
  achievements: UserAchievement[];
  stats: UserStats;
  setActiveRoadmap: (roadmap: Roadmap | null) => void;
  completeNode: (roadmapId: string, nodeId: string) => void;
  addRoadmap: (roadmap: Roadmap) => void;
  earnXp: (amount: number) => void;
}

const defaultStats: UserStats = {
  totalXp: 0,
  streak: 0,
  roadmapsCompleted: 0,
  nodesCompleted: 0,
  quizzesTaken: 0,
  averageScore: 0,
};

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [userRoadmaps, setUserRoadmaps] = useState<Roadmap[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([
    {
      id: "1",
      title: "First Steps",
      description: "Started your learning journey",
      icon: "🚀",
      unlockedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Knowledge Seeker",
      description: "Completed your first learning node",
      icon: "🧠",
      unlockedAt: null,
    },
    {
      id: "3",
      title: "Path Finder",
      description: "Completed your first roadmap",
      icon: "🗺️",
      unlockedAt: null,
    },
    {
      id: "4",
      title: "Quiz Master",
      description: "Achieve 100% on a quiz",
      icon: "📝",
      unlockedAt: null,
    },
    {
      id: "5",
      title: "Streak Warrior",
      description: "Maintain a 7-day learning streak",
      icon: "🔥",
      unlockedAt: null,
    },
  ]);
  const [stats, setStats] = useState<UserStats>(defaultStats);

  const completeNode = (roadmapId: string, nodeId: string) => {
    setUserRoadmaps(prevRoadmaps => 
      prevRoadmaps.map(roadmap => 
        roadmap.id === roadmapId
          ? {
              ...roadmap,
              nodes: roadmap.nodes.map(node => 
                node.id === nodeId
                  ? { ...node, completed: true }
                  : node
              )
            }
          : roadmap
      )
    );

    setStats(prev => ({
      ...prev,
      nodesCompleted: prev.nodesCompleted + 1,
    }));

    // Check if this unlocks any achievements
    if (stats.nodesCompleted === 0) {
      unlockAchievement("2"); // Knowledge Seeker
    }
  };

  const addRoadmap = (roadmap: Roadmap) => {
    setUserRoadmaps(prev => [...prev, roadmap]);
  };

  const earnXp = (amount: number) => {
    setStats(prev => ({
      ...prev,
      totalXp: prev.totalXp + amount,
    }));
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === achievementId
          ? { ...achievement, unlockedAt: new Date().toISOString() }
          : achievement
      )
    );
  };

  return (
    <LearningContext.Provider
      value={{
        activeRoadmap,
        userRoadmaps,
        achievements,
        stats,
        setActiveRoadmap,
        completeNode,
        addRoadmap,
        earnXp,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = (): LearningContextType => {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
