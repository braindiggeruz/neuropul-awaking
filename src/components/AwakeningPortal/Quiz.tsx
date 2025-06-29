import React from 'react';
import { motion } from 'framer-motion';
import { QuizAnswer } from '../../types';

interface QuizProps {
  currentQuestion: number;
  onAnswer: (answer: QuizAnswer) => void;
  isCompleted: boolean;
}

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Когда ты сталкиваешься с новой AI-технологией, что ты делаешь в первую очередь?",
    answers: [
      {
        text: "Сразу начинаю экспериментировать и тестировать",
        weight: { warrior: 3, mage: 1, seeker: 2, shadow: 0 }
      },
      {
        text: "Изучаю документацию и теорию",
        weight: { warrior: 0, mage: 3, seeker: 1, shadow: 2 }
      },
      {
        text: "Ищу практические применения и возможности",
        weight: { warrior: 1, mage: 0, seeker: 3, shadow: 2 }
      },
      {
        text: "Анализирую риски и скрытые аспекты",
        weight: { warrior: 0, mage: 2, seeker: 1, shadow: 3 }
      }
    ]
  },
  {
    id: 2,
    question: "Какая цель мотивирует тебя больше всего в изучении AI?",
    answers: [
      {
        text: "Стать лидером в AI-индустрии",
        weight: { warrior: 3, mage: 1, seeker: 2, shadow: 0 }
      },
      {
        text: "Понять глубинные принципы работы AI",
        weight: { warrior: 0, mage: 3, seeker: 1, shadow: 2 }
      },
      {
        text: "Найти новые способы решения проблем",
        weight: { warrior: 1, mage: 1, seeker: 3, shadow: 1 }
      },
      {
        text: "Раскрыть скрытый потенциал технологий",
        weight: { warrior: 0, mage: 2, seeker: 1, shadow: 3 }
      }
    ]
  },
  {
    id: 3,
    question: "Как ты предпочитаешь работать с AI-инструментами?",
    answers: [
      {
        text: "Быстро и решительно, добиваясь результата",
        weight: { warrior: 3, mage: 0, seeker: 1, shadow: 2 }
      },
      {
        text: "Методично и систематически",
        weight: { warrior: 1, mage: 3, seeker: 0, shadow: 2 }
      },
      {
        text: "Творчески и экспериментально",
        weight: { warrior: 2, mage: 1, seeker: 3, shadow: 0 }
      },
      {
        text: "Осторожно, изучая все нюансы",
        weight: { warrior: 0, mage: 2, seeker: 1, shadow: 3 }
      }
    ]
  }
];

const Quiz: React.FC<QuizProps> = ({ currentQuestion, onAnswer, isCompleted }) => {
  if (isCompleted || currentQuestion >= QUIZ_QUESTIONS.length) {
    return null;
  }

  const question = QUIZ_QUESTIONS[currentQuestion];

  const handleAnswer = (answerIndex: number) => {
    const answer = question.answers[answerIndex];
    onAnswer({
      questionId: question.id,
      answer: answer.text,
      weight: answer.weight
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-cyan-400 text-sm mb-2">
          <span>Вопрос {currentQuestion + 1} из {QUIZ_QUESTIONS.length}</span>
          <span>{Math.round(((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
          {question.question}
        </h2>
      </motion.div>

      {/* Answers */}
      <div className="space-y-4">
        {question.answers.map((answer, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleAnswer(index)}
            className="w-full p-4 text-left bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-cyan-500 rounded-lg transition-all duration-300 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-gray-500 group-hover:border-cyan-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">
                {answer.text}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default Quiz;