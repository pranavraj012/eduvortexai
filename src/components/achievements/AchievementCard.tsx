
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAchievement } from '@/context/LearningContext';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface AchievementCardProps {
  achievement: UserAchievement;
}

const AchievementCard = ({ achievement }: AchievementCardProps) => {
  const isUnlocked = !!achievement.unlockedAt;
  
  return (
    <Card className={cn(
      "transition-all duration-300 overflow-hidden",
      isUnlocked ? "border-edu-purple/50" : "opacity-70 grayscale"
    )}>
      <CardHeader className="relative pb-2">
        {!isUnlocked && (
          <div className="absolute top-2 right-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <CardTitle className="flex items-center text-lg">
          <div className="mr-2 text-2xl">{achievement.icon}</div>
          {achievement.title}
        </CardTitle>
        <CardDescription>
          {isUnlocked ? (
            <>
              Unlocked on {new Date(achievement.unlockedAt!).toLocaleDateString()}
            </>
          ) : (
            "Not yet unlocked"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{achievement.description}</p>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
