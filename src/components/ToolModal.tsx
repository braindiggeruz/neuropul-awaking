import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Copy, Download, RefreshCw, Lightbulb, Wand2, Star, Zap, Eye, BookOpen } from 'lucide-react';
import { AITool } from '../types';
import { askOpenAI, generateMemeImage, getToolPrompt, getToolResultTitle, improvePrompt, getPromptSuggestions } from '../utils/openaiService';
import { playSound, vibrate } from '../utils/sounds';

interface ToolModalProps {
  tool: AITool;
  isOpen: boolean;
  onClose: () => void;
  onToolUsed: (toolId: string, xpReward: number) => void;
  language: 'ru' | 'uz';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const ToolModal: React.FC<ToolModalProps> = ({
  tool,
  isOpen,
  onClose,
  onToolUsed,
  language,
  soundEnabled,
  vibrationEnabled
}) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasUsedTool, setHasUsedTool] = useState(false);
  const [showPromptHelper, setShowPromptHelper] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [promptQuality, setPromptQuality] = useState<'basic' | 'good' | 'excellent'>('basic');
  const [mentorTip, setMentorTip] = useState('');
  const [generationHistory, setGenerationHistory] = useState<Array<{prompt: string, result: string, imageUrl?: string, rating?: number}>>([]);
  const [currentRating, setCurrentRating] = useState(0);
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  
  // Ref to prevent multiple AI calls
  const hasCompletedAIRef = useRef(false);

  // Сброс состояния при открытии модалки
  useEffect(() => {
    if (isOpen) {
      console.log(`[ToolModal] Opening enhanced tool: ${tool.id}`);
      setInput('');
      setResult('');
      setImageUrl('');
      setError('');
      setIsLoading(false);
      setHasUsedTool(false);
      setShowPromptHelper(false);
      setMentorTip('');
      setCurrentRating(0);
      hasCompletedAIRef.current = false;
      
      // Загружаем подсказки для визуальных инструментов
      if (tool.id === 'meme-generator' || tool.id === 'image-analyzer') {
        loadPromptSuggestions();
      }
    }
  }, [isOpen, tool.id]);

  // Анализ качества промпта в реальном времени
  useEffect(() => {
    if (input.length > 0) {
      analyzePromptQuality(input);
    }
  }, [input]);

  // Загрузка подсказок для промптов
  const loadPromptSuggestions = () => {
    const suggestions = getPromptSuggestions(tool.id);
    setPromptSuggestions(suggestions);
  };

  // Анализ качества промпта
  const analyzePromptQuality = (prompt: string) => {
    const words = prompt.split(' ').length;
    const hasStyle = /стиль|style|киберпанк|винтаж|минимализм|реализм/i.test(prompt);
    const hasEmotion = /грустный|веселый|злой|радостный|меланхоличный|энергичный/i.test(prompt);
    const hasDetails = /детальный|высокое качество|4k|hd|профессиональный/i.test(prompt);
    
    if (words >= 8 && hasStyle && hasEmotion) {
      setPromptQuality('excellent');
      setMentorTip('🎨 Отличный промпт! Вы используете стиль, эмоции и детали - это даст потрясающий результат!');
    } else if (words >= 5 && (hasStyle || hasEmotion)) {
      setPromptQuality('good');
      setMentorTip('👍 Хороший промпт! Попробуйте добавить больше деталей или эмоций для еще лучшего результата.');
    } else {
      setPromptQuality('basic');
      setMentorTip('💡 Совет: добавьте стиль (например, "в стиле киберпанк"), эмоции и детали для лучшего результата!');
    }
  };

  // Улучшение промпта с помощью ИИ
  const handleImprovePrompt = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    try {
      const improvedPrompt = await improvePrompt(input, tool.id);
      if (improvedPrompt.success) {
        setInput(improvedPrompt.content);
        setMentorTip('✨ Промпт улучшен! Теперь результат будет намного лучше.');
        playSound('success', soundEnabled);
      }
    } catch (err) {
      console.error('Error improving prompt:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик закрытия
  const handleClose = () => {
    console.log(`[ToolModal] Closing enhanced tool: ${tool.id}`);
    playSound('click', soundEnabled);
    // Reset AI state
    hasCompletedAIRef.current = false;
    onClose();
  };

  // Обработчик использования инструмента
  const handleUseTools = async () => {
    if (!input.trim()) {
      setError('Введите текст для обработки');
      playSound('error', soundEnabled);
      return;
    }
    
    // Guard against multiple calls
    if (hasCompletedAIRef.current) return;
    hasCompletedAIRef.current = true;

    console.log(`[ToolModal] Using enhanced tool ${tool.id} with input: "${input}"`);
    
    setIsLoading(true);
    setError('');
    setResult('');
    setImageUrl('');

    try {
      if (tool.id === 'meme-generator') {
        // Генерация мема с улучшенным промптом
        const enhancedPrompt = `${input}, meme style, funny, high quality, clear text areas, vibrant colors, professional meme format`;
        const response = await generateMemeImage(enhancedPrompt);
        
        if (response.success && response.imageUrl) {
          setImageUrl(response.imageUrl);
          setResult(`🎨 Мем создан! Тема: "${input}"`);
          
          // Добавляем в историю
          setGenerationHistory(prev => [...prev, {
            prompt: input,
            result: `Мем на тему "${input}"`,
            imageUrl: response.imageUrl
          }]);
          
          // Обучающий совет после генерации
          setTimeout(() => {
            setMentorTip('🎯 Совет: Для еще лучших мемов попробуйте описать эмоцию, ситуацию и стиль. Например: "Программист утром без кофе, грустный, в стиле ретро"');
          }, 2000);
          
          if (!hasUsedTool) {
            const bonusXP = promptQuality === 'excellent' ? tool.xpReward + 10 : 
                           promptQuality === 'good' ? tool.xpReward + 5 : tool.xpReward;
            onToolUsed(tool.id, bonusXP);
            setHasUsedTool(true);
          }
          
          playSound('success', soundEnabled);
          vibrate([100, 50, 100], vibrationEnabled);
        } else {
          throw new Error(response.error || 'Ошибка генерации изображения');
        }
      } else {
        // Обычные текстовые инструменты с улучшенными промптами
        const prompt = getToolPrompt(tool.id, input);
        const response = await askOpenAI(prompt);
        
        if (response.success) {
          setResult(response.content);
          
          // Добавляем в историю
          setGenerationHistory(prev => [...prev, {
            prompt: input,
            result: response.content
          }]);
          
          if (!hasUsedTool) {
            const bonusXP = promptQuality === 'excellent' ? tool.xpReward + 10 : 
                           promptQuality === 'good' ? tool.xpReward + 5 : tool.xpReward;
            onToolUsed(tool.id, bonusXP);
            setHasUsedTool(true);
          }
          
          playSound('success', soundEnabled);
          vibrate([100, 50, 100], vibrationEnabled);
        } else {
          throw new Error(response.error || 'Ошибка AI-обработки');
        }
      }
    } catch (err) {
      console.error(`[ToolModal] Error using enhanced tool ${tool.id}:`, err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setMentorTip('🔧 Не переживайте! Попробуйте переформулировать запрос или использовать наши подсказки.');
      playSound('error', soundEnabled);
      vibrate([200], vibrationEnabled);
      // Reset AI completion flag to allow retry
      hasCompletedAIRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  // Копирование результата
  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(result);
      playSound('success', soundEnabled);
      setMentorTip('📋 Результат скопирован! Теперь можете использовать его где угодно.');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Скачивание изображения
  const handleDownloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `neuropul_${tool.id}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      playSound('success', soundEnabled);
      setMentorTip('💾 Изображение сохранено! Делитесь своими творениями с друзьями.');
    }
  };

  // Повторная генерация
  const handleRegenerate = () => {
    if (input.trim()) {
      setMentorTip('🔄 Генерируем заново! Каждый раз результат может быть разным.');
      // Reset AI completion flag to allow regeneration
      hasCompletedAIRef.current = false;
      handleUseTools();
    }
  };

  // Оценка результата
  const handleRateResult = (rating: number) => {
    setCurrentRating(rating);
    if (rating >= 4) {
      setMentorTip('⭐ Отлично! Вы создаете качественный контент. Попробуйте поделиться результатом!');
    } else if (rating >= 2) {
      setMentorTip('👍 Неплохо! Попробуйте улучшить промпт для еще лучшего результата.');
    } else {
      setMentorTip('💪 Не сдавайтесь! Попробуйте наши подсказки или улучшите промпт.');
    }
    playSound('click', soundEnabled);
  };

  // Применение подсказки
  const applySuggestion = (suggestion: string) => {
    setInput(suggestion);
    setMentorTip('✨ Отличный выбор! Этот промпт даст хороший результат.');
    playSound('click', soundEnabled);
  };

  // Reset AI state
  const resetAI = () => {
    hasCompletedAIRef.current = false;
  };

  if (!isOpen) return null;

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
          className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white border-opacity-20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{tool.icon}</div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {tool.name[language]}
                </h2>
                <p className="text-purple-200 text-sm">
                  {tool.description[language]}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvancedMode(!showAdvancedMode)}
                className="text-purple-300 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                title="Расширенный режим"
              >
                <BookOpen className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Input Section */}
            <div className="lg:col-span-2 space-y-4">
              {/* Input Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-white font-semibold">
                    {tool.id === 'image-analyzer' ? 'Опишите изображение или ситуацию:' :
                     tool.id === 'code-assistant' ? 'Введите код или техническую задачу:' :
                     tool.id === 'meme-generator' ? 'Тема для мема:' :
                     tool.id === 'mvp-generator' ? 'Опишите вашу идею продукта:' :
                     'Введите ваш запрос:'}
                  </label>
                  <div className="flex items-center space-x-2">
                    {/* Индикатор качества промпта */}
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      promptQuality === 'excellent' ? 'bg-green-500 text-white' :
                      promptQuality === 'good' ? 'bg-yellow-500 text-black' :
                      'bg-gray-500 text-white'
                    }`}>
                      {promptQuality === 'excellent' ? '🌟 Отлично' :
                       promptQuality === 'good' ? '👍 Хорошо' : '💡 Базовый'}
                    </div>
                    <button
                      onClick={handleImprovePrompt}
                      disabled={!input.trim() || isLoading}
                      className="text-purple-300 hover:text-white transition-colors p-1 hover:bg-white hover:bg-opacity-10 rounded"
                      title="Улучшить промпт с помощью ИИ"
                    >
                      <Wand2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    tool.id === 'idea-generator' ? 'Например: хочу заработать на AI-инструментах' :
                    tool.id === 'image-analyzer' ? 'Например: на фото видно красивый закат над морем...' :
                    tool.id === 'code-assistant' ? 'Например: function calculateSum(a, b) { return a + b; }' :
                    tool.id === 'meme-generator' ? 'Например: программисты и кофе утром, грустно-смешно' :
                    tool.id === 'mvp-generator' ? 'Например: приложение для изучения языков с AI' :
                    'Опишите что вам нужно...'
                  }
                  className="w-full h-32 px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center text-xs text-purple-300 mt-1">
                  <span>{input.length}/1000</span>
                  <button
                    onClick={() => setShowPromptHelper(!showPromptHelper)}
                    className="flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    <Lightbulb className="w-3 h-3" />
                    <span>Подсказки</span>
                  </button>
                </div>
              </div>

              {/* Mentor Tip */}
              {mentorTip && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-blue-500 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-lg text-blue-300 text-sm"
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">🧙‍♂️</span>
                    <div>
                      <div className="font-semibold mb-1">AI-Наставник:</div>
                      <div>{mentorTip}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg text-red-400 text-sm"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleUseTools}
                  disabled={isLoading || !input.trim()}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isLoading || !input.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>🤖 AI создает...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>{tool.icon}</span>
                      <span>Создать</span>
                      <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                        +{promptQuality === 'excellent' ? tool.xpReward + 10 : 
                          promptQuality === 'good' ? tool.xpReward + 5 : tool.xpReward} XP
                      </span>
                    </div>
                  )}
                </button>

                {(result || imageUrl) && (
                  <button
                    onClick={handleRegenerate}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    title="Создать заново"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Prompt Suggestions */}
              {showPromptHelper && promptSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10"
                >
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Примеры промптов
                  </h4>
                  <div className="space-y-2">
                    {promptSuggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => applySuggestion(suggestion)}
                        className="w-full text-left p-2 text-sm text-purple-200 hover:text-white hover:bg-white hover:bg-opacity-10 rounded transition-colors"
                      >
                        💡 {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Advanced Mode */}
              {showAdvancedMode && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10"
                >
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Обучение
                  </h4>
                  <div className="space-y-3 text-sm text-purple-200">
                    <div>
                      <div className="font-semibold text-white mb-1">🎯 Секреты хороших промптов:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• Добавляйте эмоции и настроение</li>
                        <li>• Указывайте стиль (винтаж, киберпанк, минимализм)</li>
                        <li>• Описывайте детали и композицию</li>
                        <li>• Используйте качественные термины (HD, 4K)</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">⚡ Бонусы за качество:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• Базовый промпт: {tool.xpReward} XP</li>
                        <li>• Хороший промпт: +5 XP</li>
                        <li>• Отличный промпт: +10 XP</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Generation History */}
              {generationHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10"
                >
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    История ({generationHistory.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {generationHistory.slice(-3).reverse().map((item, index) => (
                      <div key={index} className="text-xs text-purple-200 p-2 bg-white bg-opacity-5 rounded">
                        <div className="font-semibold truncate">"{item.prompt}"</div>
                        <div className="text-gray-400 mt-1">
                          {item.imageUrl ? '🖼️ Изображение' : '📝 Текст'}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {(result || imageUrl) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                  {getToolResultTitle(tool.id)}
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRateResult(star)}
                        className={`transition-colors ${
                          star <= currentRating ? 'text-yellow-400' : 'text-gray-500'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                  
                  {result && (
                    <button
                      onClick={handleCopyResult}
                      className="text-purple-300 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded"
                      title="Копировать результат"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  {imageUrl && (
                    <button
                      onClick={handleDownloadImage}
                      className="text-purple-300 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded"
                      title="Скачать изображение"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Text Result */}
              {result && (
                <div className="text-purple-100 whitespace-pre-wrap text-sm leading-relaxed mb-4">
                  {result}
                </div>
              )}

              {/* Image Result */}
              {imageUrl && (
                <div className="text-center">
                  <img
                    src={imageUrl}
                    alt="Generated content"
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                    onError={() => {
                      setError('Ошибка загрузки изображения');
                      setImageUrl('');
                    }}
                  />
                </div>
              )}

              {/* Success indicator */}
              {hasUsedTool && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 bg-green-500 bg-opacity-20 px-4 py-2 rounded-full">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">
                      +{promptQuality === 'excellent' ? tool.xpReward + 10 : 
                        promptQuality === 'good' ? tool.xpReward + 5 : tool.xpReward} XP получено!
                    </span>
                    {promptQuality === 'excellent' && (
                      <span className="text-yellow-400 text-sm">🌟 Бонус за качество!</span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Footer Tips */}
          <div className="mt-6 text-center text-xs text-purple-300">
            💡 Совет: Экспериментируйте с разными стилями и подходами. Каждый промпт - это возможность научиться чему-то новому!
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ToolModal;