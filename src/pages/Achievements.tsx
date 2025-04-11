
import { Trophy } from 'lucide-react';
import AchievementCard from '@/components/achievements/AchievementCard';
import { useLearning } from '@/context/LearningContext';
import { Progress } from '@/components/ui/progress';

const Achievements = () => {
  const { achievements, stats } = useLearning();
  
  // Calculate the percentage of achievements unlocked
  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;
  const totalAchievements = achievements.length;
  const completionPercentage = Math.round((unlockedAchievements / totalAchievements) * 100);
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Your Achievements</span>
        </h1>
        <p className="text-muted-foreground">
          Track your progress and unlock rewards as you learn.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {/* Progress Card */}
        <div className="col-span-full md:col-span-1">
          <div className="glass-card p-6 rounded-lg h-full">
            <div className="flex items-center mb-4">
              <Trophy className="h-6 w-6 text-edu-purple mr-2" />
              <h2 className="text-xl font-medium">Progress</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Completion</span>
                  <span className="text-sm font-medium">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total XP</span>
                  <span className="text-sm font-medium">{stats.totalXp}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Streak</span>
                  <span className="text-sm font-medium">{stats.streak} days</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unlocked</span>
                  <span className="text-sm font-medium">{unlockedAchievements} / {totalAchievements}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Achievement Cards */}
        <div className="col-span-full md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <h2 className="text-xl font-medium mb-4">Coming Soon</h2>
        <p className="text-muted-foreground">
          More achievements and rewards are being developed. Keep learning to unlock everything!
        </p>
      </div>
    </div>
  );
};

export default Achievements;
