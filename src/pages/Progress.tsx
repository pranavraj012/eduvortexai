
import { BarChart, LineChart, TrendingUp, Calendar, BookOpen, Award, PieChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLearning } from '@/context/LearningContext';
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

const Progress = () => {
  const { stats, userRoadmaps } = useLearning();
  
  // Sample data for charts
  const dailyProgressData = [
    { day: 'Mon', xp: 120 },
    { day: 'Tue', xp: 150 },
    { day: 'Wed', xp: 80 },
    { day: 'Thu', xp: 200 },
    { day: 'Fri', xp: 180 },
    { day: 'Sat', xp: 90 },
    { day: 'Sun', xp: 110 },
  ];
  
  const topicProgressData = [
    { topic: 'React', completed: 8, total: 12 },
    { topic: 'JavaScript', completed: 15, total: 20 },
    { topic: 'CSS', completed: 10, total: 15 },
    { topic: 'Node.js', completed: 5, total: 10 },
  ];
  
  const pieData = [
    { name: 'Completed', value: stats.nodesCompleted },
    { name: 'In Progress', value: 20 - stats.nodesCompleted },
  ];
  
  const COLORS = ['#9b87f5', '#6E59A5'];
  
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
            <p className="text-xs text-muted-foreground">+120 XP this week</p>
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
            <p className="text-xs text-muted-foreground">+5 this week</p>
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
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-edu-purple/20 flex items-center justify-center mr-3">
                  <Award className="h-5 w-5 text-edu-purple" />
                </div>
                <div>
                  <p className="text-sm font-medium">Earned 50 XP</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-edu-purple/20 flex items-center justify-center mr-3">
                  <BookOpen className="h-5 w-5 text-edu-purple" />
                </div>
                <div>
                  <p className="text-sm font-medium">Completed learning node: React Fundamentals</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-edu-purple/20 flex items-center justify-center mr-3">
                  <PieChart className="h-5 w-5 text-edu-purple" />
                </div>
                <div>
                  <p className="text-sm font-medium">Achieved 100% on CSS quiz</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-edu-purple/20 flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-edu-purple" />
                </div>
                <div>
                  <p className="text-sm font-medium">Started new learning path: Advanced JavaScript</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
