import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, CheckCircle, XCircle, Zap } from 'lucide-react';

interface QuizQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
  difficulty: string;
}

interface QuizModuleProps {
  isOpen: boolean;
  onClose: () => void;
  onXPEarned: (amount: number) => void;
  soundEnabled?: boolean;
}

const QuizModule: React.FC<QuizModuleProps> = ({
  isOpen,
  onClose,
  onXPEarned,
  soundEnabled = true
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Load questions when modal opens
  useEffect(() => {
    if (isOpen && questions.length === 0) {
      loadQuestions();
    }
  }, [isOpen]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      // Try to load from OpenTriviaDB
      const response = await fetch('https://opentdb.com/api.php?amount=5&type=multiple&category=18');
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setQuestions(data.results);
        } else {
          throw new Error('No questions received');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Failed to load questions from API, using fallback:', error);
      // Fallback questions
      setQuestions([
        {
          question: "Что означает аббревиатура 'AI'?",
          correct_answer: "Artificial Intelligence",
          incorrect_answers: ["Advanced Internet", "Automated Interface", "Applied Innovation"],
          category: "Technology",
          difficulty: "easy"
        },
        {
          question: "Какая компания создала ChatGPT?",
          correct_answer: "OpenAI",
          incorrect_answers: ["Google", "Microsoft", "Meta"],
          category: "Technology", 
          difficulty: "medium"
        },
        {
          question: "Что такое 'промпт' в контексте AI?",
          correct_answer: "Текстовая инструкция для AI",
          incorrect_answers: ["Тип нейронной сети", "Алгоритм обучения", "База данных"],
          category: "Technology",
          difficulty: "medium"
        },
        {
          question: "Какой тип AI используется для генерации изображений?",
          correct_answer: "Генеративный AI",
          incorrect_answers: ["Классификационный AI", "Регрессионный AI", "Кластерный AI"],
          category: "Technology",
          difficulty: "hard"
        },
        {
          question: "Что означает 'машинное обучение'?",
          correct_answer: "Способность AI учиться на данных",
          incorrect_answers: ["Программирование роботов", "Создание веб-сайтов", "Дизайн интерфейсов"],
          category: "Technology",
          difficulty: "easy"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const playSound = (type: 'correct' | 'incorrect' | 'complete') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'correct':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        break;
      case 'incorrect':
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(196, audioContext.currentTime + 0.2);
        break;
      case 'complete':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3);
        break;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === questions[currentQuestion].correct_answer;
    
    if (isCorrect) {
      setScore(score + 1);
      playSound('correct');
      onXPEarned(10); // 10 XP per correct answer
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    } else {
      playSound('incorrect');
      if (navigator.vibrate) navigator.vibrate([200]);
    }
    
    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Quiz complete
        setGameComplete(true);
        playSound('complete');
        
        // Bonus XP for perfect score
        if (score + (isCorrect ? 1 : 0) === questions.length) {
          onXPEarned(50); // Bonus for perfect score
        }
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameComplete(false);
    setQuestions([]);
    loadQuestions();
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  if (!isOpen) return null;

  const currentQ = questions[currentQuestion];
  const allAnswers = currentQ ? [
    currentQ.correct_answer,
    ...currentQ.incorrect_answers
  ].sort(() => Math.random() - 0.5) : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-6 w-full max-w-2xl border border-white border-opacity-20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-8 h-8 text-green-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">AI Trivia Quiz</h2>
                <p className="text-gray-400 text-sm">Проверь свои знания об AI</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-white">Загружаем вопросы...</p>
            </div>
          ) : gameComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="text-6xl mb-4">
                {score === questions.length ? '🏆' : score >= questions.length * 0.6 ? '🎉' : '📚'}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Квиз завершён!
              </h3>
              <p className="text-gray-300 mb-6">
                Твой результат: <span className="text-green-400 font-bold">{score}/{questions.length}</span>
              </p>
              
              <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">
                    +{score * 10 + (score === questions.length ? 50 : 0)} XP заработано!
                  </span>
                </div>
                {score === questions.length && (
                  <p className="text-green-400 text-sm mt-2">
                    🎯 Бонус за идеальный результат: +50 XP!
                  </p>
                )}
              </div>

              <div className="space-x-4">
                <button
                  onClick={resetQuiz}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Играть снова
                </button>
                <button
                  onClick={handleClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          ) : currentQ ? (
            <div>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-green-400 text-sm mb-2">
                  <span>Вопрос {currentQuestion + 1} из {questions.length}</span>
                  <span>Счёт: {score}/{questions.length}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Question */}
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6"
              >
                <h3 className="text-xl font-semibold text-white mb-6 leading-relaxed">
                  {currentQ.question}
                </h3>

                {/* Answers */}
                <div className="space-y-3">
                  {allAnswers.map((answer, index) => {
                    const isSelected = selectedAnswer === answer;
                    const isCorrect = answer === currentQ.correct_answer;
                    const showCorrect = showResult && isCorrect;
                    const showIncorrect = showResult && isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleAnswerSelect(answer)}
                        disabled={showResult}
                        className={`w-full p-4 text-left rounded-lg border transition-all duration-300 ${
                          showCorrect
                            ? 'bg-green-600 border-green-500 text-white'
                            : showIncorrect
                            ? 'bg-red-600 border-red-500 text-white'
                            : isSelected
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{answer}</span>
                          {showResult && (
                            <div>
                              {showCorrect && <CheckCircle className="w-5 h-5 text-green-300" />}
                              {showIncorrect && <XCircle className="w-5 h-5 text-red-300" />}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Category and Difficulty */}
              <div className="flex justify-between text-sm text-gray-400">
                <span>Категория: {currentQ.category}</span>
                <span>Сложность: {currentQ.difficulty}</span>
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizModule;