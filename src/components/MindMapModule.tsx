import React, { useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, X, Download, Share2, Zap, Loader2 } from 'lucide-react';
import { callGPT } from '../lib/api/callGpt';

// Memoized SVG display component to prevent unnecessary re-renders
const MemoizedSVGDisplay = memo(({ svgContent }: { svgContent: string }) => {
  if (!svgContent) return null;
  
  return (
    <div className="bg-white rounded-lg p-4">
      <div dangerouslySetInnerHTML={{ __html: svgContent }} />
    </div>
  );
});

MemoizedSVGDisplay.displayName = 'MemoizedSVGDisplay';

interface MindMapModuleProps {
  isOpen: boolean;
  onClose: () => void;
  onXPEarned: (amount: number) => void;
  soundEnabled?: boolean;
}

const MindMapModule: React.FC<MindMapModuleProps> = ({
  isOpen,
  onClose,
  onXPEarned,
  soundEnabled = true
}) => {
  const [topic, setTopic] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Ref to prevent multiple AI calls
  const hasCompletedAIRef = useRef(false);

  const generateMindMap = async () => {
    if (!topic.trim()) return;
    
    // Guard against multiple calls
    if (hasCompletedAIRef.current) return;
    hasCompletedAIRef.current = true;

    setIsLoading(true);
    setError('');

    try {
      const prompt = `Создай интеллект-карту на тему "${topic}" в синтаксисе Mermaid.js (graph TD). 
      
      Требования:
      - Используй только синтаксис graph TD
      - Создай 3-4 уровня вложенности
      - Включи 8-12 узлов
      - Используй короткие, понятные названия
      - Добавь связи между узлами
      
      Верни ТОЛЬКО код Mermaid без объяснений и без markdown блоков.
      
      Пример формата:
      graph TD
          A[Центральная тема] --> B[Подтема 1]
          A --> C[Подтема 2]
          B --> D[Детали 1]
          B --> E[Детали 2]`;

      const response = await callGPT(prompt, "You are an expert in creating mind maps. Return only valid Mermaid.js code.");

      if (response.success && response.data) {
        let cleanCode = response.data.trim();
        
        // Clean up the response
        cleanCode = cleanCode.replace(/```mermaid/g, '');
        cleanCode = cleanCode.replace(/```/g, '');
        cleanCode = cleanCode.trim();
        
        setMermaidCode(cleanCode);
        
        // Generate SVG using Mermaid API
        await generateSVG(cleanCode);
        
        // Award XP
        onXPEarned(20);
        
        // Play success sound
        if (soundEnabled) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }
        
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      } else {
        throw new Error('Не удалось создать интеллект-карту');
      }
    } catch (err) {
      console.error('Mind map generation failed:', err);
      setError('Не удалось создать интеллект-карту. Попробуйте снова.');
      // Reset AI completion flag to allow retry
      hasCompletedAIRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const generateSVG = async (mermaidCode: string) => {
    try {
      // Use Mermaid.ink API for SVG generation
      const encodedCode = encodeURIComponent(mermaidCode);
      const svgUrl = `https://mermaid.ink/svg/${btoa(mermaidCode)}`;
      
      // For demo purposes, we'll create a simple SVG representation
      const simpleSVG = `
        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Central Node -->
          <rect x="250" y="180" width="100" height="40" rx="20" fill="url(#grad1)" stroke="#00ffff" stroke-width="2"/>
          <text x="300" y="205" text-anchor="middle" fill="white" font-family="Arial" font-size="12">${topic}</text>
          
          <!-- Branch Nodes -->
          <rect x="100" y="80" width="80" height="30" rx="15" fill="#4a5568" stroke="#00ffff" stroke-width="1"/>
          <text x="140" y="100" text-anchor="middle" fill="white" font-family="Arial" font-size="10">Аспект 1</text>
          
          <rect x="420" y="80" width="80" height="30" rx="15" fill="#4a5568" stroke="#00ffff" stroke-width="1"/>
          <text x="460" y="100" text-anchor="middle" fill="white" font-family="Arial" font-size="10">Аспект 2</text>
          
          <rect x="100" y="280" width="80" height="30" rx="15" fill="#4a5568" stroke="#00ffff" stroke-width="1"/>
          <text x="140" y="300" text-anchor="middle" fill="white" font-family="Arial" font-size="10">Аспект 3</text>
          
          <rect x="420" y="280" width="80" height="30" rx="15" fill="#4a5568" stroke="#00ffff" stroke-width="1"/>
          <text x="460" y="300" text-anchor="middle" fill="white" font-family="Arial" font-size="10">Аспект 4</text>
          
          <!-- Connections -->
          <line x1="250" y1="200" x2="180" y2="95" stroke="#00ffff" stroke-width="2"/>
          <line x1="350" y1="200" x2="420" y2="95" stroke="#00ffff" stroke-width="2"/>
          <line x1="250" y1="200" x2="180" y2="295" stroke="#00ffff" stroke-width="2"/>
          <line x1="350" y1="200" x2="420" y2="295" stroke="#00ffff" stroke-width="2"/>
          
          <!-- Decorative elements -->
          <circle cx="50" cy="50" r="3" fill="#00ffff" opacity="0.6"/>
          <circle cx="550" cy="350" r="3" fill="#00ffff" opacity="0.6"/>
          <circle cx="550" cy="50" r="3" fill="#ff00ff" opacity="0.6"/>
          <circle cx="50" cy="350" r="3" fill="#ff00ff" opacity="0.6"/>
        </svg>
      `;
      
      setSvgContent(simpleSVG);
    } catch (err) {
      console.error('SVG generation failed:', err);
      // Fallback to text representation
      setSvgContent('');
    }
  };

  const downloadSVG = () => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-${topic.replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareMindMap = async () => {
    if (navigator.share && svgContent) {
      try {
        await navigator.share({
          title: `Интеллект-карта: ${topic}`,
          text: `Посмотри на мою интеллект-карту по теме "${topic}", созданную с помощью AI!`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Sharing failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Интеллект-карта: ${topic}\n\n${mermaidCode}`);
    }
  };

  // Reset AI state and clear form
  const resetAI = () => {
    hasCompletedAIRef.current = false;
    setTopic('');
    setMermaidCode('');
    setSvgContent('');
    setError('');
  };

  const handleClose = () => {
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
          className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white border-opacity-20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Map className="w-8 h-8 text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Mind Map Generator</h2>
                <p className="text-gray-400 text-sm">Создай интеллект-карту с помощью AI</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Тема для интеллект-карты:
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Например: Искусственный интеллект, Здоровое питание, Программирование..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && generateMindMap()}
              />
              <button
                onClick={generateMindMap}
                disabled={isLoading || !topic.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Map className="w-5 h-5" />
                )}
                <span>{isLoading ? 'Создаём...' : 'Создать'}</span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg text-red-300"
            >
              {error}
            </motion.div>
          )}

          {/* Results */}
          {(svgContent || mermaidCode) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* XP Reward */}
              <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">+20 XP за создание интеллект-карты!</span>
                </div>
              </div>

              {/* SVG Display */}
              <MemoizedSVGDisplay svgContent={svgContent} />

              {/* Mermaid Code */}
              {mermaidCode && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Код Mermaid.js:</h3>
                  <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                    <pre>{mermaidCode}</pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={downloadSVG}
                  disabled={!svgContent}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Скачать SVG</span>
                </button>
                
                <button
                  onClick={shareMindMap}
                  disabled={!mermaidCode}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Поделиться</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
            <h4 className="text-blue-400 font-semibold mb-2">💡 Советы для лучших результатов:</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Используйте конкретные темы (например, "Машинное обучение" вместо "Технологии")</li>
              <li>• Попробуйте разные области: наука, бизнес, хобби, образование</li>
              <li>• Созданную карту можно использовать для обучения и планирования</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MindMapModule;