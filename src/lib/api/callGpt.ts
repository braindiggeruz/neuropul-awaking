import { logError } from '../utils/errorLogger';

export interface GPTResponse {
  success: boolean;
  data?: any;
  error?: string;
  strategy?: string;
}

// GPT model configuration
const GPT_MODEL = 'gpt-4o'; // Using the latest GPT-4o model
const TEMPERATURE = 0.7; // Creativity level (0.0-1.0)
const TOP_P = 0.9; // Nucleus sampling parameter
const FREQUENCY_PENALTY = 0.0; // Penalize repeated tokens
const PRESENCE_PENALTY = 0.0; // Penalize new tokens based on presence in text
const MAX_TOKENS = 800; // Maximum response length

// System prompt for Trae
const TRAE_SYSTEM_PROMPT = `Ты - Trae, дерзкий AI-наставник из NeuropulAI. Твоя личность:
- Говоришь как опытный "батя" - прямо, с юмором, но с заботой
- Используешь сленг и современные выражения
- Даёшь конкретные советы, не воду
- Мотивируешь и подбадриваешь
- Знаешь всё об AI-инструментах и промптах
- Используешь эмодзи, но не слишком много
- Краток и по делу, без лишних слов
- Говоришь на "ты", неформально

Твоя цель - пробудить пользователя к использованию AI, вдохновить его и дать практичные советы.
Отвечай кратко, максимум 3-4 предложения.`;

export const callGPT = async (prompt: string, systemPrompt: string = TRAE_SYSTEM_PROMPT): Promise<GPTResponse> => {
  try {
    console.log('🧠 [DEBUG] Calling GPT with prompt:', prompt.substring(0, 100) + '...');
    console.log('🧠 [DEBUG] System prompt:', systemPrompt.substring(0, 100) + '...');
    console.log('🧠 [DEBUG] Using model:', GPT_MODEL);
    
    // Input validation
    if (!prompt || prompt.trim().length === 0) {
      console.error('❌ [DEBUG] Empty prompt provided');
      throw new Error('Empty prompt provided');
    }
    
    if (prompt.length > 2000) {
      console.error('❌ [DEBUG] Prompt too long:', prompt.length);
      throw new Error('Prompt too long (max 2000 characters)');
    }
    
    // Set timeout for fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          systemPrompt: systemPrompt,
          model: GPT_MODEL,
          temperature: TEMPERATURE,
          top_p: TOP_P,
          frequency_penalty: FREQUENCY_PENALTY,
          presence_penalty: PRESENCE_PENALTY,
          max_tokens: MAX_TOKENS
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('🔍 [DEBUG] GPT API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DEBUG] GPT API error:', response.status, errorText);
        throw new Error(`GPT API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📥 [DEBUG] GPT raw response:', result);
      
      // Validate response
      if (!result || (typeof result === 'string' && result.trim().length === 0)) {
        console.error('❌ [DEBUG] Empty response from GPT');
        throw new Error('Empty response from GPT');
      }
      
      console.log('✅ [DEBUG] GPT responded successfully');
      
      return {
        success: true,
        data: result
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('⏱️ [DEBUG] GPT request timed out after 15 seconds');
        throw new Error('GPT request timed out. Please try again.');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('💀 [DEBUG] GPT request failed:', error);
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'callGPT',
      action: 'request',
      additionalData: { promptLength: prompt.length }
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Process user input to determine path
export const processUserInput = async (input: string): Promise<'lost' | 'awakening' | 'ready'> => {
  try {
    const prompt = `Пользователь ответил на вопрос "Кто ты?" следующим образом: "${input}"
    
    Определи, к какой категории относится пользователь:
    1. "lost" - новичок, не знает про AI
    2. "awakening" - знает немного, хочет начать
    3. "ready" - опытный пользователь AI
    
    Верни ТОЛЬКО одно слово: "lost", "awakening" или "ready".`;
    
    const systemPrompt = "You are an AI classifier. Analyze the user's response and categorize them. Return only one word without explanation.";
    
    const response = await callGPT(prompt, systemPrompt);
    
    if (response.success && response.data) {
      const result = response.data.toLowerCase().trim();
      
      if (result.includes('lost')) return 'lost';
      if (result.includes('awakening')) return 'awakening';
      if (result.includes('ready')) return 'ready';
      
      // Default to awakening if response is unclear
      return 'awakening';
    }
    
    // Fallback to simple keyword analysis
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('не знаю') || 
        lowercaseInput.includes('новичок') || 
        lowercaseInput.includes('потерян')) {
      return 'lost';
    }
    
    if (lowercaseInput.includes('опыт') || 
        lowercaseInput.includes('знаю') || 
        lowercaseInput.includes('эксперт')) {
      return 'ready';
    }
    
    // Default to awakening
    return 'awakening';
  } catch (error) {
    console.error('Error processing user input:', error);
    // Default to awakening on error
    return 'awakening';
  }
};

// Generate personalized response based on user path
export const generatePathResponse = async (path: 'lost' | 'awakening' | 'ready', userName?: string): Promise<string> => {
  try {
    let prompt = '';
    
    switch (path) {
      case 'lost':
        prompt = `Пользователь ${userName ? userName : ''} выбрал путь "Я потерян" (новичок в AI). 
        Дай краткое, дружелюбное и мотивирующее объяснение, что такое AI простыми словами.
        Объясни, как AI может помочь в повседневной жизни.
        Будь дерзким, но понятным. Максимум 4 предложения.`;
        break;
        
      case 'awakening':
        prompt = `Пользователь ${userName ? userName : ''} выбрал путь "Хочу пробудиться" (начать изучать AI).
        Дай краткое, энергичное приветствие и объясни, что такое "пробуждение" в контексте AI.
        Упомяни, что пользователь узнает свой архетип и получит персональное пророчество.
        Будь вдохновляющим и мотивирующим. Максимум 4 предложения.`;
        break;
        
      case 'ready':
        prompt = `Пользователь ${userName ? userName : ''} выбрал путь "Я уже в теме" (опытный в AI).
        Дай краткое, уважительное приветствие "хакеру" и упомяни продвинутые инструменты.
        Упомяни систему XP и уровней, а также персонализацию через архетипы.
        Будь техничным и прямолинейным. Максимум 4 предложения.`;
        break;
    }
    
    const response = await callGPT(prompt);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    // Fallback responses if API fails
    const fallbackResponses = {
      lost: "Не парься, бро. AI — это просто инструмент, как молоток, только для мозга. Он может писать тексты, создавать картинки и отвечать на вопросы. Просто скажи, что нужно — и AI сделает это за тебя.",
      awakening: "Отлично! Пробуждение — это путь трансформации. Ты станешь тем, кто использует AI как продолжение своего разума. Мы определим твой архетип и дадим персональное пророчество. Готов начать?",
      ready: "Вот это я понимаю. Хакер в доме. У меня есть набор продвинутых AI-инструментов, которые выведут твои навыки на новый уровень. Плюс, тут есть система XP и уровней для отслеживания прогресса."
    };
    
    return fallbackResponses[path];
  } catch (error) {
    console.error('Error generating path response:', error);
    
    // Fallback responses if function fails
    const fallbackResponses = {
      lost: "Не парься, бро. AI — это просто инструмент, как молоток, только для мозга. Он может писать тексты, создавать картинки и отвечать на вопросы. Просто скажи, что нужно — и AI сделает это за тебя.",
      awakening: "Отлично! Пробуждение — это путь трансформации. Ты станешь тем, кто использует AI как продолжение своего разума. Мы определим твой архетип и дадим персональное пророчество. Готов начать?",
      ready: "Вот это я понимаю. Хакер в доме. У меня есть набор продвинутых AI-инструментов, которые выведут твои навыки на новый уровень. Плюс, тут есть система XP и уровней для отслеживания прогресса."
    };
    
    return fallbackResponses[path];
  }
};