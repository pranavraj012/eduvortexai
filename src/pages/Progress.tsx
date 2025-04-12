
import React, { useEffect, useState } from 'react';
import { BarChart, LineChart, TrendingUp, Calendar, BookOpen, Award, PieChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLearning } from '@/context/LearningContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

interface Activity {
  type: 'xp' | 'node' | 'quiz' | 'roadmap';
  text: string;
  timestamp: string;
  icon: React.ReactNode;
}

const Progress = () => {
  const { stats, userRoadmaps } = useLearning();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dailyProgressData, setDailyProgressData] = useState<any[]>([]);
  const [topicProgressData, setTopicProgressData] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedNodes, setCompletedNodes] = useState(0);
  const [inProgressNodes, setInProgressNodes] = useState(0);
  
  useEffect(() => {
    const generateDailyProgressData = () => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const data = [];
      
      // Generate the last 7 days of data
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dayName = days[date.getDay()];
        
        // Simulate XP earned for each day, with higher values for recent days
        // In a real app, this would come from the database
        const xpValue = Math.max(0, Math.floor((stats.totalXp / 7) * (1 - (i * 0.1)) + Math.random() * 20));
        
        data.push({
          day: dayName,
          xp: xpValue
        });
      }
      
      return data;
    };
    
    const generateTopicProgressData = () => {
      // Extract topics from roadmaps and calculate completion
      if (userRoadmaps.length === 0) {
        return [];
      }
      
      return userRoadmaps.map(roadmap => {
        const topic = roadmap.title.replace('Learning Path:', '').trim();
        const completed = roadmap.nodes.filter(n => n.completed).length;
        const total = roadmap.nodes.length;
        
        return {
          topic: topic.length > 10 ? topic.substring(0, 10) + '...' : topic,
          completed: completed,
          total: total
        };
      }).slice(0, 4); // Take top 4 topics
    };
    
    const generateRecentActivities = async () => {
      if (!user) return [];
      
      try {
        // For now, we'll generate synthetic activities based on stats
        // In a real app, you'd fetch this from a dedicated activities table
        const activities: Activity[] = [];
        
        // Add one activity for XP
        activities.push({
          type: 'xp',
          text: `Earned ${Math.floor(stats.totalXp * 0.1)} XP`,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          icon: <Award className="h-5 w-5 text-edu-purple" />
        });
        
        // Add activity for completed node if any
        if (stats.nodesCompleted > 0) {
          const randomRoadmap = userRoadmaps[Math.floor(Math.random() * userRoadmaps.length)];
          if (randomRoadmap) {
            const completedNodes = randomRoadmap.nodes.filter(n => n.completed);
            if (completedNodes.length > 0) {
              const randomNode = completedNodes[Math.floor(Math.random() * completedNodes.length)];
              activities.push({
                type: 'node',
                text: `Completed learning node: ${randomNode.title}`,
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
                icon: <BookOpen className="h-5 w-5 text-edu-purple" />
              });
            }
          }
        }
        
        // Add quiz activity
        if (stats.quizzesTaken > 0) {
          activities.push({
            type: 'quiz',
            text: `Achieved ${stats.averageScore}% on a quiz`,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            icon: <PieChart className="h-5 w-5 text-edu-purple" />
          });
        }
        
        // Add roadmap activity
        if (userRoadmaps.length > 0) {
          const latestRoadmap = userRoadmaps.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          
          activities.push({
            type: 'roadmap',
            text: `Started new learning path: ${latestRoadmap.title.replace('Learning Path:', '').trim()}`,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            icon: <TrendingUp className="h-5 w-5 text-edu-purple" />
          });
        }
        
        return activities.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      } catch (error) {
        console.error('Error generating activities:', error);
        return [];
      }
    };
    
    const calculateNodeStats = () => {
      let completed = 0;
      let inProgress = 0;
      
      userRoadmaps.forEach(roadmap => {
        roadmap.nodes.forEach(node => {
          if (node.completed) {
            completed++;
          } else {
            inProgress++;
          }
        });
      });
      
      setCompletedNodes(completed);
      setInProgressNodes(inProgress);
    };
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        const dailyData = generateDailyProgressData();
        setDailyProgressData(dailyData);
        
        const topicData = generateTopicProgressData();
        setTopicProgressData(topicData);
        
        const recentActivities = await generateRecentActivities();
        setActivities(recentActivities);
        
        calculateNodeStats();
      } catch (error) {
        console.error('Error loading progress data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Subscribe to real-time changes in user_stats
    const statsChannel = supabase
      .channel('user-stats-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_stats',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        // Reload data when user stats change
        loadData();
      })
      .subscribe();
      
    // Subscribe to real-time changes in roadmap nodes
    const nodesChannel = supabase
      .channel('roadmap-nodes-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'roadmap_nodes'
      }, () => {
        // Reload data when nodes are updated
        loadData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(nodesChannel);
    };
  }, [stats, userRoadmaps, user]);

  const pieData = [
    { name: 'Completed', value: completedNodes },
    { name: 'In Progress', value: inProgressNodes },
  ];
  
  const COLORS = ['#9b87f5', '#6E59A5'];
  
  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-edu-purple" />
          <p>Loading progress data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Learning Progress</span>
        </h1>
        <p className="text-muted-foreground">
          Track your achievements and learning statistics.
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total XP */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalXp}</div>
            <p className="text-xs text-muted-foreground">
              {dailyProgressData.reduce((sum, day) => sum + day.xp, 0)} XP this week
            </p>
          </CardContent>
        </Card>
        
        {/* Current Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} days</div>
            <p className="text-xs text-muted-foreground">Keep learning to increase your streak</p>
          </CardContent>
        </Card>
        
        {/* Completed Nodes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Nodes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nodesCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {completedNodes > 0 ? `${Math.round((completedNodes / (completedNodes + inProgressNodes)) * 100)}% completion rate` : 'No nodes completed yet'}
            </p>
          </CardContent>
        </Card>
        
        {/* Quizzes Taken */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quizzesTaken}</div>
            <p className="text-xs text-muted-foreground">Avg. Score: {stats.averageScore}%</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily XP Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="mr-2 h-4 w-4 text-edu-purple" />
              Daily XP
            </CardTitle>
            <CardDescription>Your learning activity for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={dailyProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1F2C', border: '1px solid #444' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#9b87f5" 
                    activeDot={{ r: 8 }} 
                    name="XP Earned"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Topic Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-4 w-4 text-edu-purple" />
              Topic Progress
            </CardTitle>
            <CardDescription>Node completion by topic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {topicProgressData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={topicProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="topic" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1F2C', border: '1px solid #444' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="completed" fill="#9b87f5" name="Completed" />
                    <Bar dataKey="total" fill="#6E59A5" name="Total Nodes" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No roadmaps created yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-edu-purple" />
              Overall Completion
            </CardTitle>
            <CardDescription>Your learning node progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {completedNodes + inProgressNodes > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1F2C', border: '1px solid #444' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No nodes available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-edu-purple/20 flex items-center justify-center mr-3">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-1">No Recent Activities</h3>
                <p className="text-muted-foreground">
                  Complete some learning activities to see your progress here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
