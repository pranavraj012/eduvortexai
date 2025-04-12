
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useLearning } from '@/context/LearningContext';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: string;
  explanation: string;
}

interface QuizComponentProps {
  topic: string;
  nodeId: string;
  onComplete: () => void;
}

const QuizComponent = ({ topic, nodeId, onComplete }: QuizComponentProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  
  const { earnXp, stats } = useLearning();
  
  // Load quiz questions
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.functions.invoke('gemini-api', {
          body: {
            type: 'generateQuiz',
            topic,
            nodeId
          }
        });
        
        if (error) {
          throw new Error(`Error from edge function: ${error.message}`);
        }
        
        if (data.candidates && data.candidates.length > 0 && 
            data.candidates[0].content && 
            data.candidates[0].content.parts && 
            data.candidates[0].content.parts.length > 0) {
          
          const content = data.candidates[0].content.parts[0].text;
          
          // Extract JSON from the response
          let jsonStart = content.indexOf('{');
          let jsonEnd = content.lastIndexOf('}') + 1;
          
          if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error("JSON data not found in response");
          }
          
          const jsonString = content.substring(jsonStart, jsonEnd);
          const quizData = JSON.parse(jsonString);
          
          if (quizData && quizData.questions && Array.isArray(quizData.questions)) {
            setQuestions(quizData.questions);
          } else {
            throw new Error("Invalid quiz format");
          }
        } else {
          throw new Error("Invalid response from Gemini API");
        }
      } catch (error) {
        console.error('Error loading quiz:', error);
        toast({
          title: "Failed to load quiz",
          description: "There was a problem generating quiz questions. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuiz();
  }, [topic, nodeId]);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleOptionSelect = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuestion) return;
    
    const isAnswerCorrect = selectedOption === currentQuestion.correctOption;
    setIsCorrect(isAnswerCorrect);
    setIsAnswerSubmitted(true);
    
    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz completed
      const finalScore = score + (isCorrect ? 1 : 0);
      const totalQuestions = questions.length;
      const percentScore = Math.round((finalScore / totalQuestions) * 100);
      
      // Award XP based on score
      const earnedXp = Math.round(percentScore * 0.5);
      setXpEarned(earnedXp);
      
      // Update user stats in database
      updateUserStats(earnedXp, percentScore);
      setQuizCompleted(true);
    }
  };
  
  const updateUserStats = async (earnedXp: number, percentScore: number) => {
    try {
      // Update quizzes taken count and XP
      const { error: statsError } = await supabase
        .from('user_stats')
        .update({
          quizzes_taken: stats.quizzesTaken + 1,
          total_xp: stats.totalXp + earnedXp,
          average_score: stats.quizzesTaken === 0 
            ? percentScore 
            : Math.round((stats.averageScore * stats.quizzesTaken + percentScore) / (stats.quizzesTaken + 1))
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (statsError) throw statsError;
      
      // Call the learning context method to update local state
      earnXp(earnedXp);
      
      // If perfect score, unlock the Quiz Master achievement
      if (percentScore === 100) {
        unlockAchievement("4"); // Quiz Master achievement
      }
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  };
  
  const unlockAchievement = async (achievementId: string) => {
    try {
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('achievement_id', achievementId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (!existingAchievement) {
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            achievement_id: achievementId,
          });
        
        if (error) throw error;
        
        toast({
          title: 'Achievement Unlocked!',
          description: 'Quiz Master: Achieve 100% on a quiz',
        });
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };
  
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setQuizCompleted(false);
  };
  
  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-edu-purple" />
          <p>Generating quiz questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0 && !isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <XCircle className="h-8 w-8 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Failed to Generate Quiz</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't generate quiz questions for this topic. Please try again later.
          </p>
          <Button onClick={onComplete}>Return to Learning</Button>
        </div>
      </div>
    );
  }
  
  if (quizCompleted) {
    const finalScore = score + (isCorrect ? 1 : 0);
    const totalQuestions = questions.length;
    const percentScore = Math.round((finalScore / totalQuestions) * 100);
    
    return (
      <div className="glass-card p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">Quiz Completed!</h2>
        
        <div className="text-center mb-6">
          <div className="text-4xl font-bold mb-2">{percentScore}%</div>
          <p className="text-muted-foreground">
            You scored {finalScore} out of {totalQuestions} questions
          </p>
          <div className="my-4 p-3 glass-card purple-glow inline-block">
            <span className="text-lg font-bold">+{xpEarned} XP</span> earned!
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Button 
            onClick={handleRestartQuiz}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restart Quiz
          </Button>
          
          <Button 
            onClick={onComplete}
            className="gap-2 bg-edu-purple hover:bg-edu-deepPurple"
          >
            Continue Learning
          </Button>
        </div>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return (
      <div className="glass-card p-6 rounded-lg h-full flex items-center justify-center">
        <div className="text-center">
          <p>No questions available.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="glass-card p-6 rounded-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Question {currentQuestionIndex + 1}/{questions.length}</span>
          <span className="text-sm font-medium">Score: {score}</span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full">
          <div 
            className="bg-edu-purple h-2 rounded-full"
            style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
      
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(option)}
            className={`
              w-full text-left p-3 rounded-lg border transition-all
              ${selectedOption === option 
                ? 'border-edu-purple' 
                : 'border-border hover:border-edu-purple/50'}
              ${isAnswerSubmitted && option === currentQuestion.correctOption
                ? 'bg-green-500/20 border-green-500'
                : ''}
              ${isAnswerSubmitted && selectedOption === option && option !== currentQuestion.correctOption
                ? 'bg-red-500/20 border-red-500'
                : ''}
            `}
            disabled={isAnswerSubmitted}
          >
            <div className="flex items-center">
              <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
              <span className="flex-1">{option}</span>
              
              {isAnswerSubmitted && option === currentQuestion.correctOption && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
              )}
              
              {isAnswerSubmitted && selectedOption === option && option !== currentQuestion.correctOption && (
                <XCircle className="h-5 w-5 text-red-500 ml-2" />
              )}
            </div>
          </button>
        ))}
      </div>
      
      {isAnswerSubmitted && currentQuestion.explanation && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="font-medium mb-1">Explanation:</p>
          <p className="text-sm">{currentQuestion.explanation}</p>
        </div>
      )}
      
      <div className="flex justify-end">
        {!isAnswerSubmitted ? (
          <Button 
            onClick={handleSubmitAnswer} 
            disabled={!selectedOption}
            className="bg-edu-purple hover:bg-edu-deepPurple"
          >
            Submit Answer
          </Button>
        ) : (
          <Button 
            onClick={handleNextQuestion}
            className="bg-edu-purple hover:bg-edu-deepPurple"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
