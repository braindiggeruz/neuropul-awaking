import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, X, Download, Share2, RefreshCw, Zap } from 'lucide-react';
import { playSound, vibrate } from '../utils/sounds';

interface MemeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onXPEarned: (amount: number) => void;
  userXP: number;
  soundEnabled?: boolean;
}

const MemeGenerator: React.FC<MemeGeneratorProps> = ({
  isOpen,
  onClose,
  onXPEarned,
  userXP,
  soundEnabled = true
}) => {
  const [memeUrl, setMemeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customText, setCustomText] = useState('');
  
  // Ref to prevent multiple AI calls
  const hasCompletedAIRef = useRef(false);

  // Auto-generate meme based on XP milestones
  useEffect(() => {
    if (isOpen && !memeUrl) {
      generateXPMeme();
    }
  }, [isOpen, userXP]);

  const generateXPMeme = () => {
    // Guard against multiple calls
    if (hasCompletedAIRef.current) return;
    hasCompletedAIRef.current = true;
    
    setIsLoading(true);
    
    // Determine meme type based on XP
    let template = 'success';
    let topText = '';
    let bottomText = '';
    
    if (userXP >= 500) {
      template = 'success';
      topText = 'Ты получил';
      bottomText = `${userXP} XP! Мощно!`;
    } else if (userXP >= 200) {
      template = 'success';
      topText = 'Уже';
      bottomText = `${userXP} XP! Продолжай!`;
    } else if (userXP >= 100) {
      template = 'success';
      topText = 'Первые';
      bottomText = `${userXP} XP! Начало положено!`;
    } else {
      template = 'success';
      topText = 'Добро пожаловать';
      bottomText = 'в мир AI!';
    }
    
    // Generate meme URL using memegen.link
    const encodedTop = encodeURIComponent(topText);
    const encodedBottom = encodeURIComponent(bottomText);
    const url = `https://api.memegen.link/images/${template}/${encodedTop}/${encodedBottom}.webp`;
    
    // Simulate loading time
    setTimeout(() => {
      setMemeUrl(url);
      setIsLoading(false);
      
      // Award XP for generating meme
      onXPEarned(15);
      
      // Play success sound
      if (soundEnabled) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
      
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }, 1500);
  };

  const generateCustomMeme = () => {
    if (!customText.trim()) return;
    
    // Guard against multiple calls
    if (hasCompletedAIRef.current) return;
    hasCompletedAIRef.current = true;
    
    setIsLoading(true);
    
    // Split custom text into top and bottom
    const words = customText.trim().split(' ');
    const midPoint = Math.ceil(words.length / 2);
    const topText = words.slice(0, midPoint).join(' ');
    const bottomText = words.slice(midPoint).join(' ') || 'AI мощь!';
    
    const encodedTop = encodeURIComponent(topText);
    const encodedBottom = encodeURIComponent(bottomText);
    const url = `https://api.memegen.link/images/success/${encodedTop}/${encodedBottom}.webp`;
    
    setTimeout(() => {
      setMemeUrl(url);
      setIsLoading(false);
      onXPEarned(15);
      
      if (soundEnabled) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    }, 1000);
  };

  const downloadMeme = () => {
    if (!memeUrl) return;
    
    const a = document.createElement('a');
    a.href = memeUrl;
    a.download = `neuropul-meme-${Date.now()}.webp`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareMeme = async () => {
    if (navigator.share && memeUrl) {
      try {
        await navigator.share({
          title: 'Мой AI мем из NeuropulAI',
          text: `Посмотри на мой мем! У меня уже ${userXP} XP в NeuropulAI!`,
          url: memeUrl
        });
      } catch (err) {
        console.log('Sharing failed:', err);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(memeUrl);
    }
  };

  // Reset AI state and clear form
  const resetAI = () => {
    hasCompletedAIRef.current = false;
  };

  const handleClose = () => {
    setMemeUrl('');
    setCustomText('');
    resetAI();
    onClose();
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
          className="bg-gradient-to-br from-gray-900 to-yellow-900 rounded-2xl p-6 w-full max-w-2xl border border-white border-opacity-20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Smile className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Мем-Генератор</h2>
                <p className="text-gray-400 text-sm">Создай вирусный мем о своих достижениях</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Custom Meme Input */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Создать свой мем:
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Например: Когда освоил AI и чувствуешь себя киборгом"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && generateCustomMeme()}
              />
              <button
                onClick={generateCustomMeme}
                disabled={isLoading || !customText.trim()}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Создать
              </button>
            </div>
          </div>

          {/* Meme Display */}
          <div className="text-center">
            {isLoading ? (
              <div className="py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-white">Создаём эпичный мем...</p>
              </div>
            ) : memeUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* XP Reward */}
                <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-yellow-400">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold">+15 XP за создание мема!</span>
                  </div>
                </div>

                {/* Meme Image */}
                <div className="bg-white rounded-lg p-4">
                  <img
                    src={memeUrl}
                    alt="Generated Meme"
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                    onError={() => setMemeUrl('')}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={downloadMeme}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Скачать</span>
                  </button>
                  
                  <button
                    onClick={shareMeme}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Поделиться</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      resetAI();
                      generateXPMeme();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors"
                    title="Создать новый мем"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="py-12">
                <div className="text-6xl mb-4">😂</div>
                <p className="text-gray-300">Нажми "Создать" чтобы сгенерировать мем!</p>
              </div>
            )}
          </div>

          {/* Meme Templates Info */}
          <div className="mt-6 p-4 bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg">
            <h4 className="text-yellow-400 font-semibold mb-2">😂 Идеи для мемов:</h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• "Когда понял как работает ChatGPT"</li>
              <li>• "Мой уровень AI-мастерства сейчас"</li>
              <li>• "Я до и после изучения промптов"</li>
              <li>• "Когда AI делает работу за меня"</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MemeGenerator;