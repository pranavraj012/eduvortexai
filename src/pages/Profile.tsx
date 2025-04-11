
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLearning } from '@/context/LearningContext';
import { User, Book, GraduationCap, Award, Settings } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Profile = () => {
  const { stats, achievements, userRoadmaps } = useLearning();
  
  // Calculate levels based on XP
  const level = Math.floor(stats.totalXp / 100) + 1;
  const currentLevelXp = stats.totalXp % 100;
  const xpToNextLevel = 100 - currentLevelXp;
  
  // Calculate unread achievements
  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;
  
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback className="text-3xl bg-edu-purple/20">
                    <User className="h-10 w-10 text-edu-purple" />
                  </AvatarFallback>
                </Avatar>
                
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <h2 className="text-2xl font-bold mb-1">User Name</h2>
              <p className="text-muted-foreground mb-4">user@example.com</p>
              
              <div className="flex items-center space-x-2 mb-2">
                <div className="purple-glow rounded-full p-1">
                  <span className="text-xs font-bold">Lv.{level}</span>
                </div>
                <span className="text-sm text-muted-foreground">Knowledge Seeker</span>
              </div>
              
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Level Progress</span>
                  <span>{currentLevelXp}/100 XP</span>
                </div>
                <Progress value={currentLevelXp} className="h-2" />
                <p className="text-xs text-muted-foreground">{xpToNextLevel} XP to next level</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">Edit Profile</Button>
                <Button className="w-full bg-edu-purple hover:bg-edu-deepPurple">Share Progress</Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Learning Statistics</CardTitle>
              <CardDescription>Your journey in numbers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-md bg-edu-purple/20 flex items-center justify-center mr-3">
                      <GraduationCap className="h-4 w-4 text-edu-purple" />
                    </div>
                    <span className="text-sm">Total XP</span>
                  </div>
                  <span className="font-medium">{stats.totalXp}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-md bg-edu-purple/20 flex items-center justify-center mr-3">
                      <Book className="h-4 w-4 text-edu-purple" />
                    </div>
                    <span className="text-sm">Completed Nodes</span>
                  </div>
                  <span className="font-medium">{stats.nodesCompleted}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-md bg-edu-purple/20 flex items-center justify-center mr-3">
                      <Award className="h-4 w-4 text-edu-purple" />
                    </div>
                    <span className="text-sm">Achievements</span>
                  </div>
                  <span className="font-medium">{unlockedAchievements} / {achievements.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Roadmaps Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Learning Paths</CardTitle>
              <CardDescription>Recently active roadmaps</CardDescription>
            </CardHeader>
            <CardContent>
              {userRoadmaps.length > 0 ? (
                <div className="space-y-4">
                  {userRoadmaps.map(roadmap => {
                    const completedNodes = roadmap.nodes.filter(n => n.completed).length;
                    const totalNodes = roadmap.nodes.length;
                    const percentComplete = Math.round((completedNodes / totalNodes) * 100);
                    
                    return (
                      <div key={roadmap.id} className="glass-card p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium">{roadmap.title}</h3>
                          <span className="text-sm">{percentComplete}%</span>
                        </div>
                        <Progress value={percentComplete} className="h-2 mb-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Started on {new Date(roadmap.createdAt).toLocaleDateString()}</span>
                          <span>{completedNodes}/{totalNodes} nodes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <GraduationCap className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="font-medium mb-1">No Learning Paths Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first personalized learning path</p>
                  <Button asChild className="bg-edu-purple hover:bg-edu-deepPurple">
                    <a href="/learn">Start Learning</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Achievements */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Latest milestones reached</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements
                  .filter(a => a.unlockedAt)
                  .slice(0, 3)
                  .map(achievement => (
                    <div key={achievement.id} className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-edu-purple/20 flex items-center justify-center mr-3">
                        <span className="text-xl">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                
                {achievements.filter(a => a.unlockedAt).length === 0 && (
                  <div className="text-center py-6">
                    <Award className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="font-medium mb-1">No Achievements Yet</h3>
                    <p className="text-muted-foreground">Complete learning activities to earn achievements</p>
                  </div>
                )}
                
                {achievements.filter(a => a.unlockedAt).length > 0 && (
                  <Button asChild variant="outline" className="w-full">
                    <a href="/achievements">View All Achievements</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
