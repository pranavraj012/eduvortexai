import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Removed the unused React import
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

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
  content: string | null;
  quizAttempted?: boolean; // Add this field to track quiz attempts
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
  recentRoadmaps: Roadmap[];
  achievements: UserAchievement[];
  stats: UserStats;
  isLoading: boolean;
  setActiveRoadmap: (roadmap: Roadmap | null) => void;
  completeNode: (roadmapId: string, nodeId: string) => Promise<void>;
  addRoadmap: (roadmap: Roadmap) => Promise<void>;
  earnXp: (amount: number) => Promise<void>;
  updateNodeContent: (roadmapId: string, nodeId: string, content: string) => Promise<void>;
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

const convertDbRoadmapToRoadmap = (dbRoadmap: any): Roadmap => {
  return {
    id: dbRoadmap.id,
    title: dbRoadmap.title,
    description: dbRoadmap.description || '',
    nodes: Array.isArray(dbRoadmap.nodes) ? dbRoadmap.nodes.map((node: any) => ({
      id: node.id,
      title: node.title,
      description: node.description || '',
      completed: node.completed || false,
      xp: node.xp || 100,
      position: typeof node.position === 'object' ? node.position : { x: 0, y: 0 },
      connections: Array.isArray(node.connections) ? node.connections : [],
      content: node.content
    })) : [],
    createdAt: dbRoadmap.created_at || new Date().toISOString()
  };
};

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [userRoadmaps, setUserRoadmaps] = useState<Roadmap[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([
    {
      id: "1",
      title: "First Steps",
      description: "Started your learning journey",
      icon: "🚀",
      unlockedAt: null,
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
      unlockAchievement("1"); // First Steps achievement
    } else {
      setUserRoadmaps([]);
      setStats(defaultStats);
      setIsLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      if (user?.id) {
        const { data: roadmapsData, error: roadmapsError } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('user_id', user.id);

        if (roadmapsError) throw roadmapsError;

        const roadmapsWithNodes = await Promise.all(roadmapsData.map(async (roadmap) => {
          const { data: nodesData, error: nodesError } = await supabase
            .from('roadmap_nodes')
            .select('*')
            .eq('roadmap_id', roadmap.id);

          if (nodesError) throw nodesError;

          return convertDbRoadmapToRoadmap({
            ...roadmap,
            nodes: nodesData
          });
        }));

        setUserRoadmaps(roadmapsWithNodes);

        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statsError && statsError.code !== 'PGRST116') throw statsError;

        if (statsData) {
          setStats({
            totalXp: statsData.total_xp || 0,
            streak: statsData.streak || 0,
            roadmapsCompleted: statsData.roadmaps_completed || 0,
            nodesCompleted: statsData.nodes_completed || 0,
            quizzesTaken: statsData.quizzes_taken || 0,
            averageScore: statsData.average_score || 0,
          });
        }

        const { data: achievementsData, error: achievementsError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id);

        if (achievementsError) throw achievementsError;

        const updatedAchievements = achievements.map(achievement => {
          const found = achievementsData.find(a => a.achievement_id === achievement.id);
          return {
            ...achievement,
            unlockedAt: found ? found.unlocked_at : null
          };
        });

        setAchievements(updatedAchievements);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Error loading data',
        description: 'Failed to load your learning data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeNode = async (roadmapId: string, nodeId: string) => {
    if (!user) return;

    try {
      const { error: updateNodeError } = await supabase
        .from('roadmap_nodes')
        .update({ completed: true })
        .eq('id', nodeId);

      if (updateNodeError) throw updateNodeError;
      
      // Find the node to get its XP value
      const roadmap = userRoadmaps.find(r => r.id === roadmapId);
      const node = roadmap?.nodes.find(n => n.id === nodeId);
      const xpAmount = node?.xp || 0;

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

      // Update total XP in stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .update({
          nodes_completed: stats.nodesCompleted + 1,
          total_xp: stats.totalXp + xpAmount, // Add XP from node completion
        })
        .eq('user_id', user.id)
        .select();

      if (statsError) throw statsError;

      if (statsData && statsData[0]) {
        setStats(prev => ({
          ...prev,
          nodesCompleted: prev.nodesCompleted + 1,
          totalXp: prev.totalXp + xpAmount, // Update XP in local state
        }));
      }

      const updatedRoadmap = userRoadmaps.find(r => r.id === roadmapId);
      if (updatedRoadmap) {
        const allNodesCompleted = updatedRoadmap.nodes.every(node => 
          node.id === nodeId ? true : node.completed
        );

        if (allNodesCompleted) {
          const { error: updateStatsError } = await supabase
            .from('user_stats')
            .update({
              roadmaps_completed: stats.roadmapsCompleted + 1,
            })
            .eq('user_id', user.id);

          if (updateStatsError) throw updateStatsError;

          setStats(prev => ({
            ...prev,
            roadmapsCompleted: prev.roadmapsCompleted + 1,
          }));

          if (stats.roadmapsCompleted === 0) {
            unlockAchievement("3"); // Path Finder
          }
        }
      }

    } catch (error) {
      console.error('Error completing node:', error);
      toast({
        title: 'Error',
        description: 'Failed to update node completion status.',
        variant: 'destructive'
      });
    }
  };

  const addRoadmap = async (roadmap: Roadmap) => {
    if (!user) return;

    try {
      const { data: newRoadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .insert({
          title: roadmap.title,
          description: roadmap.description,
          user_id: user.id,
        })
        .select()
        .single();

      if (roadmapError) throw roadmapError;

      const nodesWithRoadmapId = roadmap.nodes.map(node => ({
        roadmap_id: newRoadmap.id,
        title: node.title,
        description: node.description,
        completed: node.completed,
        xp: node.xp,
        position: node.position,
        connections: node.connections,
        content: node.content
      }));

      const { data: newNodes, error: nodesError } = await supabase
        .from('roadmap_nodes')
        .insert(nodesWithRoadmapId)
        .select();

      if (nodesError) throw nodesError;

      const completeRoadmap = convertDbRoadmapToRoadmap({
        ...newRoadmap,
        nodes: newNodes
      });

      setUserRoadmaps(prev => [...prev, completeRoadmap]);
      
      setActiveRoadmap(completeRoadmap);

      toast({
        title: 'Roadmap Created',
        description: `Your roadmap "${roadmap.title}" has been created successfully.`
      });

    } catch (error) {
      console.error('Error adding roadmap:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new roadmap.',
        variant: 'destructive'
      });
    }
  };

  const earnXp = async (amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_stats')
        .update({
          total_xp: stats.totalXp + amount,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setStats(prev => ({
        ...prev,
        totalXp: prev.totalXp + amount,
      }));

    } catch (error) {
      console.error('Error earning XP:', error);
    }
  };

  const updateNodeContent = async (roadmapId: string, nodeId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('roadmap_nodes')
        .update({ content })
        .eq('id', nodeId);

      if (error) throw error;

      setUserRoadmaps(prevRoadmaps => 
        prevRoadmaps.map(roadmap => 
          roadmap.id === roadmapId
            ? {
                ...roadmap,
                nodes: roadmap.nodes.map(node => 
                  node.id === nodeId
                    ? { ...node, content }
                    : node
                )
              }
            : roadmap
        )
      );

      if (activeRoadmap?.id === roadmapId) {
        setActiveRoadmap({
          ...activeRoadmap,
          nodes: activeRoadmap.nodes.map(node => 
            node.id === nodeId
              ? { ...node, content }
              : node
          )
        });
      }

    } catch (error) {
      console.error('Error updating node content:', error);
      toast({
        title: 'Error',
        description: 'Failed to save node content.',
        variant: 'destructive'
      });
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!user) return;

    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement?.unlockedAt) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
        });

      if (error) throw error;

      setAchievements(prev => 
        prev.map(achievement => 
          achievement.id === achievementId
            ? { ...achievement, unlockedAt: new Date().toISOString() }
            : achievement
        )
      );

      const unlockedAchievement = achievements.find(a => a.id === achievementId);
      if (unlockedAchievement) {
        toast({
          title: `Achievement Unlocked: ${unlockedAchievement.title}`,
          description: unlockedAchievement.description,
        });
      }

    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const recentRoadmaps = [...userRoadmaps]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <LearningContext.Provider
      value={{
        activeRoadmap,
        userRoadmaps,
        recentRoadmaps,
        achievements,
        stats,
        isLoading,
        setActiveRoadmap,
        completeNode,
        addRoadmap,
        earnXp,
        updateNodeContent,
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
