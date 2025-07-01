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
      // Use local API endpoint instead of direct OpenAI call
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          systemPrompt: systemPrompt
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
      console.log('📥 [DEBUG] GPT raw response received');
      
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

// Get archetype analysis from GPT
export const getArchetypeAnalysis = async (answers: any[]): Promise<GPTResponse> => {
  try {
    if (!answers || answers.length === 0) {
      return {
        success: false,
        error: 'No answers provided'
      };
    }
    
    const answersText = Array.isArray(answers) 
      ? answers.map(a => typeof a === 'string' ? a : a.answer).join('\n')
      : String(answers);
    
    const prompt = `Проанализируй ответы пользователя и определи его архетип:
    
    Ответы:
    ${answersText}
    
    Определи, какой из четырёх архетипов лучше всего подходит пользователю:
    1. Воин - решительный, действующий, преодолевающий препятствия
    2. Маг - аналитический, изучающий, стратегический
    3. Искатель - творческий, любознательный, экспериментирующий
    4. Тень - скептичный, критичный, видящий скрытые мотивы
    
    Верни результат в формате JSON:
    {
      "type": "Название архетипа (Воин, Маг, Искатель или Тень)",
      "description": "Краткое описание архетипа и как он проявляется у пользователя (2-3 предложения)",
      "CTA": "Призыв к действию для этого архетипа (1 предложение)"
    }`;
    
    const systemPrompt = "You are an expert psychologist specializing in archetypes. Analyze the user's answers and determine their archetype. Return only valid JSON.";
    
    const response = await callGPT(prompt, systemPrompt);
    
    if (response.success && response.data) {
      try {
        // Try direct JSON parse first
        const parsedData = JSON.parse(response.data);
        return {
          success: true,
          data: parsedData,
          strategy: 'direct_json_parse'
        };
      } catch (jsonError) {
        // Try to extract JSON using regex
        try {
          const jsonRegex = /\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g;
          const jsonMatches = response.data.match(jsonRegex);
          
          if (jsonMatches && jsonMatches.length > 0) {
            const parsedData = JSON.parse(jsonMatches[0]);
            return {
              success: true,
              data: parsedData,
              strategy: 'regex_json_extraction'
            };
          }
        } catch (regexError) {
          // Try field extraction
          try {
            const typeRegex = /"type"\s*:\s*"([^"]*)"/;
            const descRegex = /"description"\s*:\s*"([^"]*)"/;
            const ctaRegex = /"CTA"\s*:\s*"([^"]*)"/;
            
            const typeMatch = response.data.match(typeRegex);
            const descMatch = response.data.match(descRegex);
            const ctaMatch = response.data.match(ctaRegex);
            
            if (typeMatch) {
              return {
                success: true,
                data: {
                  type: typeMatch[1],
                  description: descMatch ? descMatch[1] : "Описание архетипа",
                  CTA: ctaMatch ? ctaMatch[1] : "Действуй согласно своему архетипу!"
                },
                strategy: 'field_extraction'
              };
            }
          } catch (fieldError) {
            // Try keyword analysis
            const archetypes = ['Воин', 'Маг', 'Искатель', 'Тень'];
            for (const archetype of archetypes) {
              if (response.data.includes(archetype)) {
                return {
                  success: true,
                  data: {
                    type: archetype,
                    description: `Ты - ${archetype}. Твой путь уникален и полон возможностей.`,
                    CTA: "Действуй согласно своему архетипу!"
                  },
                  strategy: 'keyword_analysis'
                };
              }
            }
          }
        }
      }
    }
    
    // If all parsing strategies fail, use fallback
    return {
      success: true,
      data: analyzeFallbackArchetype(answers),
      strategy: 'fallback_local_analysis'
    };
  } catch (error) {
    console.error('Error in getArchetypeAnalysis:', error);
    
    // Return fallback analysis
    return {
      success: true,
      data: analyzeFallbackArchetype(answers),
      strategy: 'fallback_local_analysis_after_error'
    };
  }
};

// Fallback archetype analysis when API fails
export const analyzeFallbackArchetype = (answers: any[]): any => {
  try {
    // Default fallback
    const defaultArchetype = {
      type: 'Искатель',
      description: 'Ты - Искатель. Тебя отличает любознательность и стремление к новым горизонтам. Ты всегда ищешь новые возможности и готов экспериментировать.',
      CTA: 'Исследуй новые возможности AI и не бойся экспериментировать!'
    };
    
    // If no answers, return default
    if (!answers || answers.length === 0) {
      return defaultArchetype;
    }
    
    // Calculate scores for each archetype
    let scores = {
      warrior: 0,
      mage: 0,
      seeker: 0,
      shadow: 0
    };
    
    // Process answers
    answers.forEach(answer => {
      // If answer has weight property
      if (answer && typeof answer === 'object' && answer.weight) {
        scores.warrior += answer.weight.warrior || 0;
        scores.mage += answer.weight.mage || 0;
        scores.seeker += answer.weight.seeker || 0;
        scores.shadow += answer.weight.shadow || 0;
      } else if (typeof answer === 'string') {
        // Simple keyword analysis for string answers
        const lowerAnswer = answer.toLowerCase();
        
        if (lowerAnswer.includes('действ') || lowerAnswer.includes('решит') || lowerAnswer.includes('быстр')) {
          scores.warrior += 2;
        }
        
        if (lowerAnswer.includes('анализ') || lowerAnswer.includes('изуч') || lowerAnswer.includes('понима')) {
          scores.mage += 2;
        }
        
        if (lowerAnswer.includes('исследова') || lowerAnswer.includes('нов') || lowerAnswer.includes('интерес')) {
          scores.seeker += 2;
        }
        
        if (lowerAnswer.includes('скрыт') || lowerAnswer.includes('глубин') || lowerAnswer.includes('истин')) {
          scores.shadow += 2;
        }
      }
    });
    
    // Determine highest score
    const maxScore = Math.max(scores.warrior, scores.mage, scores.seeker, scores.shadow);
    
    // Return corresponding archetype
    if (maxScore === scores.warrior) {
      return {
        type: 'Воин',
        description: 'Ты - Воин. Тебя отличает решительность и стремление к действию. Ты не боишься препятствий и всегда готов преодолевать трудности.',
        CTA: 'Действуй смело и решительно в мире AI!'
      };
    } else if (maxScore === scores.mage) {
      return {
        type: 'Маг',
        description: 'Ты - Маг. Тебя отличает аналитический склад ума и стремление к глубокому пониманию. Ты ценишь знания и системный подход.',
        CTA: 'Изучай глубинные принципы AI и создавай мощные стратегии!'
      };
    } else if (maxScore === scores.shadow) {
      return {
        type: 'Тень',
        description: 'Ты - Тень. Тебя отличает способность видеть скрытые мотивы и глубинные процессы. Ты не принимаешь всё на веру и ищешь истинное значение.',
        CTA: 'Раскрывай скрытый потенциал AI и находи неочевидные решения!'
      };
    } else {
      return defaultArchetype;
    }
  } catch (error) {
    console.error('Error in fallback archetype analysis:', error);
    
    // Return safe default
    return {
      type: 'Искатель',
      description: 'Ты - Искатель. Тебя отличает любознательность и стремление к новым горизонтам.',
      CTA: 'Исследуй новые возможности AI и не бойся экспериментировать!'
    };
  }
};

// Get prophecy from GPT
export const getProphecy = async (archetype: string): Promise<GPTResponse> => {
  try {
    const prompt = `Создай персональное пророчество для пользователя с архетипом "${archetype}".
    
    Пророчество должно:
    - Быть вдохновляющим и мотивирующим
    - Содержать метафоры и образы, связанные с архетипом
    - Упоминать путь развития в мире AI и технологий
    - Быть кратким (3-4 предложения)
    - Иметь киберпанк/футуристический оттенок
    
    Верни только текст пророчества без кавычек и дополнительных пояснений.`;
    
    const systemPrompt = "You are a mystical AI oracle. Create a personalized prophecy for the user based on their archetype. Be inspiring and metaphorical.";
    
    const response = await callGPT(prompt, systemPrompt);
    
    if (response.success && response.data) {
      // Clean up response
      let prophecy = response.data;
      
      // Remove quotes if present
      prophecy = prophecy.replace(/^["']|["']$/g, '');
      
      return {
        success: true,
        data: prophecy
      };
    }
    
    // Fallback prophecies
    const fallbackProphecies: Record<string, string> = {
      'Воин': 'Твоя сила растёт с каждым вызовом. Иди вперёд, сокрушая препятствия на пути к AI-мастерству. В цифровом мире ты станешь легендой, чьи решения меняют реальность.',
      'Маг': 'Знания текут через тебя, как река мудрости. Используй магию AI для создания невозможного. Твой разум - ключ к алгоритмам, которые изменят будущее.',
      'Искатель': 'Твой путь полон открытий и чудес. Каждый шаг ведёт к новым горизонтам познания. В бескрайнем океане данных ты найдёшь сокровища, о которых другие даже не подозревают.',
      'Тень': 'В глубинах сознания скрыты великие тайны. Раскрой силу скрытого знания. Там, где другие видят лишь поверхность, ты различаешь истинные паттерны реальности.'
    };
    
    return {
      success: true,
      data: fallbackProphecies[archetype] || 'Твой путь уникален и полон возможностей. Следуй своему сердцу и интуиции в мире AI.'
    };
  } catch (error) {
    console.error('Error in getProphecy:', error);
    
    // Fallback prophecies
    const fallbackProphecies: Record<string, string> = {
      'Воин': 'Твоя сила растёт с каждым вызовом. Иди вперёд, сокрушая препятствия на пути к AI-мастерству. В цифровом мире ты станешь легендой, чьи решения меняют реальность.',
      'Маг': 'Знания текут через тебя, как река мудрости. Используй магию AI для создания невозможного. Твой разум - ключ к алгоритмам, которые изменят будущее.',
      'Искатель': 'Твой путь полон открытий и чудес. Каждый шаг ведёт к новым горизонтам познания. В бескрайнем океане данных ты найдёшь сокровища, о которых другие даже не подозревают.',
      'Тень': 'В глубинах сознания скрыты великие тайны. Раскрой силу скрытого знания. Там, где другие видят лишь поверхность, ты различаешь истинные паттерны реальности.'
    };
    
    return {
      success: true,
      data: fallbackProphecies[archetype] || 'Твой путь уникален и полон возможностей. Следуй своему сердцу и интуиции в мире AI.'
    };
  }
};