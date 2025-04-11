
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import MockAIService from '@/services/MockAIService';
import { useLearning } from '@/context/LearningContext';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
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
  
  const { earnXp } = useLearning();
  
  // Load quiz questions
  useState(() => {
    const loadQuiz = async () => {
      try {
        const quizQuestions = await MockAIService.generateQuiz(topic, nodeId);
        setQuestions(quizQuestions);
      } catch (error) {
        console.error('Error loading quiz:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuiz();
  });
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleOptionSelect = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    
    const isAnswerCorrect = selectedOption === currentQuestion.correctAnswer;
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
      const xpEarned = Math.round(percentScore * 0.5);
      earnXp(xpEarned);
      
      setQuizCompleted(true);
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
          <div className="animate-spin h-8 w-8 border-4 border-edu-purple border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Generating quiz questions...</p>
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
              ${isAnswerSubmitted && option === currentQuestion.correctAnswer
                ? 'bg-green-500/20 border-green-500'
                : ''}
              ${isAnswerSubmitted && selectedOption === option && option !== currentQuestion.correctAnswer
                ? 'bg-red-500/20 border-red-500'
                : ''}
            `}
            disabled={isAnswerSubmitted}
          >
            <div className="flex items-center">
              <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
              <span className="flex-1">{option}</span>
              
              {isAnswerSubmitted && option === currentQuestion.correctAnswer && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
              )}
              
              {isAnswerSubmitted && selectedOption === option && option !== currentQuestion.correctAnswer && (
                <XCircle className="h-5 w-5 text-red-500 ml-2" />
              )}
            </div>
          </button>
        ))}
      </div>
      
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
