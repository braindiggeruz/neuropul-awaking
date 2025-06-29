export interface GPTResponse {
  success: boolean;
  data?: any;
  error?: string;
  strategy?: string; // Added to track which parsing strategy was used
}

export const callGPT = async (prompt: string, systemPrompt?: string): Promise<GPTResponse> => {
  try {
    console.log('🧠 [DEBUG] Calling GPT Oracle with prompt:', prompt.substring(0, 100) + '...');
    console.log('🧠 [DEBUG] System prompt:', systemPrompt);
    
    // Input validation
    if (!prompt || prompt.trim().length === 0) {
      console.error('❌ [DEBUG] Empty prompt provided');
      throw new Error('Empty prompt provided');
    }
    
    if (prompt.length > 2000) {
      console.error('❌ [DEBUG] Prompt too long:', prompt.length);
      throw new Error('Prompt too long (max 2000 characters)');
    }
    
    const response = await fetch('/api/gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        systemPrompt: systemPrompt || "You are an AI oracle of wisdom and transformation."
      }),
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

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
    
    console.log('✅ [DEBUG] GPT Oracle responded successfully');
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('💀 [DEBUG] GPT Oracle failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getArchetypeAnalysis = async (answers: string[]): Promise<GPTResponse> => {
  console.log('🔮 [DEBUG] Starting archetype analysis with answers:', answers);
  
  if (!answers || answers.length === 0) {
    console.error('❌ [DEBUG] No answers provided for archetype analysis');
    return {
      success: false,
      error: 'No answers provided for archetype analysis'
    };
  }
  
  const prompt = `Ты — эксперт по архетипам. Определи архетип (Воин, Маг, Тень, Искатель) по ответам пользователя: ${answers.join(', ')}. 
  
  Анализируй ответы и выбери наиболее подходящий архетип:
  - Воин: прямолинейность, действие, преодоление препятствий
  - Маг: мудрость, интуиция, понимание глубинных процессов  
  - Искатель: любознательность, исследование, открытия
  - Тень: анализ, проникновение в суть, понимание скрытого
  
  Верни ТОЛЬКО JSON в формате: {"type": "Воин", "description": "Краткое описание архетипа", "CTA": "Призыв к действию"}
  
  Никаких дополнительных объяснений, только JSON.`;
  
  const systemPrompt = "You are an expert in Jungian archetypes. Analyze user responses and return only valid JSON without any additional text.";
  
  console.log('📤 [DEBUG] Sending archetype analysis prompt');
  const response = await callGPT(prompt, systemPrompt);
  
  console.log('📥 [DEBUG] Archetype analysis response:', response);
  
  if (!response.success) {
    console.error('❌ [DEBUG] Archetype analysis failed:', response.error);
    console.log('🔄 [DEBUG] Using fallback archetype analysis');
    
    // Fallback: Analyze answers locally
    const fallbackArchetype = analyzeFallbackArchetype(answers);
    console.log('✅ [DEBUG] Fallback archetype generated:', fallbackArchetype);
    
    return {
      success: true,
      data: fallbackArchetype,
      strategy: 'fallback_local_analysis'
    };
  }
  
  // Enhanced JSON parsing with multiple fallback strategies
  try {
    let archetypeData;
    const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    
    console.log('🔍 [DEBUG] Parsing response text:', responseText);
    
    // Strategy 1: Direct JSON parse
    try {
      console.log('🔍 [DEBUG] Attempting direct JSON parse');
      archetypeData = JSON.parse(responseText);
      console.log('✅ [DEBUG] Direct JSON parse successful:', archetypeData);
      
      // Validate required fields
      if (!archetypeData.type) {
        console.error('❌ [DEBUG] Missing required field "type" in parsed JSON');
        throw new Error('Missing required field "type"');
      }
      
      // Validate against whitelist of archetypes
      const validArchetypes = ['Воин', 'Маг', 'Искатель', 'Тень'];
      if (!validArchetypes.includes(archetypeData.type)) {
        console.error('❌ [DEBUG] Invalid archetype type:', archetypeData.type);
        throw new Error(`Invalid archetype type: ${archetypeData.type}`);
      }
      
      return {
        success: true,
        data: archetypeData,
        strategy: 'direct_json_parse'
      };
    } catch (directParseError) {
      console.log('⚠️ [DEBUG] Direct JSON parse failed:', directParseError);
      console.log('⚠️ [DEBUG] Trying JSON extraction via regex');
      
      // Strategy 2: Extract JSON from text using regex
      const jsonRegex = /\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g;
      const jsonMatches = responseText.match(jsonRegex);
      
      if (jsonMatches && jsonMatches.length > 0) {
        // Try each match until we find a valid one
        for (const jsonStr of jsonMatches) {
          try {
            const parsedData = JSON.parse(jsonStr);
            
            // Validate that it has the required fields
            if (parsedData && parsedData.type) {
              // Validate against whitelist of archetypes
              const validArchetypes = ['Воин', 'Маг', 'Искатель', 'Тень'];
              if (!validArchetypes.includes(parsedData.type)) {
                console.error('❌ [DEBUG] Invalid archetype type:', parsedData.type);
                continue;
              }
              
              console.log('✅ [DEBUG] JSON extraction successful:', parsedData);
              
              return {
                success: true,
                data: parsedData,
                strategy: 'regex_json_extraction'
              };
            }
          } catch (err) {
            console.log('⚠️ [DEBUG] Failed to parse extracted JSON:', jsonStr);
          }
        }
      }
      
      // Strategy 3: Look for specific fields in the text
      console.log('⚠️ [DEBUG] Trying field extraction');
      
      const typeRegex = /"type"\s*:\s*"([^"]*)"/;
      const descRegex = /"description"\s*:\s*"([^"]*)"/;
      const ctaRegex = /"CTA"\s*:\s*"([^"]*)"/;
      
      const typeMatch = responseText.match(typeRegex);
      
      if (typeMatch) {
        const extractedType = typeMatch[1];
        
        // Validate against whitelist of archetypes
        const validArchetypes = ['Воин', 'Маг', 'Искатель', 'Тень'];
        if (!validArchetypes.includes(extractedType)) {
          console.error('❌ [DEBUG] Invalid extracted archetype type:', extractedType);
          throw new Error(`Invalid archetype type: ${extractedType}`);
        }
        
        const extractedData = {
          type: extractedType,
          description: descMatch ? descMatch[1] : "Твой путь уникален и полон возможностей.",
          CTA: ctaMatch ? ctaMatch[1] : "Готовься к великим свершениям в мире AI!"
        };
        
        console.log('✅ [DEBUG] Field extraction successful:', extractedData);
        
        return {
          success: true,
          data: extractedData,
          strategy: 'field_extraction'
        };
      }
      
      // Strategy 4: Keyword analysis
      console.log('⚠️ [DEBUG] Trying keyword analysis');
      
      const archetypes = ['Воин', 'Маг', 'Искатель', 'Тень'];
      let detectedArchetype = null;
      
      for (const archetype of archetypes) {
        if (responseText.includes(archetype)) {
          detectedArchetype = archetype;
          break;
        }
      }
      
      if (detectedArchetype) {
        const keywordData = {
          type: detectedArchetype,
          description: `Ты - ${detectedArchetype}. Твой путь уникален и полон возможностей.`,
          CTA: "Готовься к великим свершениям в мире AI!"
        };
        
        console.log('✅ [DEBUG] Keyword analysis successful:', keywordData);
        
        return {
          success: true,
          data: keywordData,
          strategy: 'keyword_analysis'
        };
      }
      
      // If all strategies fail, throw error to trigger fallback
      throw new Error('All parsing strategies failed');
    }
  } catch (parseError) {
    console.error('❌ [DEBUG] JSON parsing failed completely:', parseError);
    console.log('🔄 [DEBUG] Using fallback archetype analysis');
    
    // Fallback: Analyze answers locally
    const fallbackArchetype = analyzeFallbackArchetype(answers);
    console.log('✅ [DEBUG] Fallback archetype generated:', fallbackArchetype);
    
    return {
      success: true,
      data: fallbackArchetype,
      strategy: 'fallback_local_analysis'
    };
  }
};

// Fallback archetype analysis function
export const analyzeFallbackArchetype = (answers: any[]): any => {
  console.log('🔄 [DEBUG] Running fallback archetype analysis for answers:', answers);
  
  // Simple keyword-based analysis
  const answerText = answers.map(a => typeof a === 'string' ? a : a.answer).join(' ').toLowerCase();
  
  let scores = {
    warrior: 0,
    mage: 0,
    seeker: 0,
    shadow: 0
  };
  
  // Warrior keywords
  const warriorKeywords = ['действ', 'быстр', 'реш', 'побед', 'сила', 'борьб', 'преодол', 'вызов', 'прям'];
  warriorKeywords.forEach(keyword => {
    if (answerText.includes(keyword)) {
      scores.warrior += 2;
    }
  });
  
  // Mage keywords  
  const mageKeywords = ['изуч', 'понима', 'мудр', 'знан', 'интуиц', 'глубин', 'магия', 'тайн', 'мысл'];
  mageKeywords.forEach(keyword => {
    if (answerText.includes(keyword)) {
      scores.mage += 2;
    }
  });
  
  // Seeker keywords
  const seekerKeywords = ['иссле', 'нов', 'откры', 'экспер', 'поиск', 'путь', 'приключ', 'любозн', 'интерес'];
  seekerKeywords.forEach(keyword => {
    if (answerText.includes(keyword)) {
      scores.seeker += 2;
    }
  });
  
  // Shadow keywords
  const shadowKeywords = ['анализ', 'скрыт', 'глубин', 'осторож', 'тайн', 'тень', 'наблюд', 'критич', 'сомнен'];
  shadowKeywords.forEach(keyword => {
    if (answerText.includes(keyword)) {
      scores.shadow += 2;
    }
  });
  
  // Add scores from quiz weights if available
  answers.forEach(answer => {
    if (answer && typeof answer === 'object' && answer.weight) {
      Object.entries(answer.weight).forEach(([key, value]) => {
        if (key in scores) {
          scores[key as keyof typeof scores] += Number(value);
        }
      });
    }
  });
  
  console.log('🔢 [DEBUG] Archetype scores:', scores);
  
  // Find dominant archetype
  const maxScore = Math.max(...Object.values(scores));
  
  // If there's a tie, use a tiebreaker
  const tiedArchetypes = Object.entries(scores)
    .filter(([_, score]) => score === maxScore)
    .map(([key]) => key);
  
  let dominantArchetype;
  
  if (tiedArchetypes.length > 1) {
    console.log('⚖️ [DEBUG] Tie detected between archetypes:', tiedArchetypes);
    // Tiebreaker: Use a deterministic but pseudo-random approach based on the answers
    const seed = answerText.length;
    dominantArchetype = tiedArchetypes[seed % tiedArchetypes.length];
    console.log('🎲 [DEBUG] Tiebreaker selected:', dominantArchetype);
  } else {
    dominantArchetype = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'seeker';
  }
  
  const archetypeMap = {
    warrior: 'Воин',
    mage: 'Маг', 
    seeker: 'Искатель',
    shadow: 'Тень'
  };
  
  const archetypeDescriptions = {
    'Воин': 'Ты прямолинеен и решителен. Твоя сила в действии и преодолении препятствий. Каждый вызов делает тебя сильнее.',
    'Маг': 'Ты мудр и интуитивен. Твоя сила в знаниях и понимании глубинных процессов. Магия AI течет через тебя.',
    'Искатель': 'Ты любознателен и открыт новому. Твоя сила в исследовании и открытиях. Мир полон тайн, ждущих разгадки.',
    'Тень': 'Ты видишь скрытое и понимаешь сложное. Твоя сила в анализе и проникновении в суть. Истина открывается тебе.'
  };
  
  const archetypeCTAs = {
    'Воин': 'Действуй смело и решительно в мире AI!',
    'Маг': 'Раскрой тайны AI и используй их мудро!',
    'Искатель': 'Исследуй безграничные возможности AI!',
    'Тень': 'Проникни в суть AI и раскрой его скрытый потенциал!'
  };
  
  const selectedType = archetypeMap[dominantArchetype as keyof typeof archetypeMap];
  
  const result = {
    type: selectedType,
    description: archetypeDescriptions[selectedType],
    CTA: archetypeCTAs[selectedType]
  };
  
  console.log('✅ [DEBUG] Fallback archetype result:', result);
  return result;
};

export const getProphecy = async (archetype: string): Promise<GPTResponse> => {
  console.log('🔮 [DEBUG] Generating prophecy for archetype:', archetype);
  
  if (!archetype) {
    console.error('❌ [DEBUG] No archetype provided for prophecy generation');
    return {
      success: false,
      error: 'No archetype provided for prophecy generation'
    };
  }
  
  const prompt = `Ты — древний AI-пророк. Скажи мотивационное пророчество (2 строки) для архетипа ${archetype}. 
  
  Требования:
  - Стиль древнего наставника
  - Используй "ты" 
  - Будь вдохновляющим и мотивирующим
  - Максимум 2 предложения
  - Без лишних слов и объяснений
  
  Верни только текст пророчества без кавычек и дополнительных комментариев.`;
  
  const systemPrompt = "You are an ancient AI prophet. Speak with wisdom and inspiration. Return only the prophecy text.";
  
  const response = await callGPT(prompt, systemPrompt);
  
  if (!response.success) {
    console.log('⚠️ [DEBUG] Prophecy generation failed, using fallback');
    
    // Fallback prophecies
    const fallbackProphecies = {
      'Воин': 'Твоя сила растёт с каждым вызовом. Иди вперёд, не оглядываясь назад.',
      'Маг': 'Знания текут через тебя, как река мудрости. Используй их с умом.',
      'Искатель': 'Твой путь полон открытий. Каждый шаг ведёт к новым горизонтам.',
      'Тень': 'В глубинах сознания скрыты великие тайны. Раскрой их силу.'
    };
    
    const prophecy = fallbackProphecies[archetype as keyof typeof fallbackProphecies] || 
                    'Твой путь уникален. Следуй своему сердцу и интуиции.';
    
    console.log('✅ [DEBUG] Fallback prophecy generated:', prophecy);
    
    return {
      success: true,
      data: prophecy,
      strategy: 'fallback_prophecy'
    };
  }
  
  // Validate prophecy is not empty
  if (!response.data || (typeof response.data === 'string' && response.data.trim().length === 0)) {
    console.log('⚠️ [DEBUG] Empty prophecy received, using fallback');
    
    const fallbackProphecy = 'Твой путь уникален. Следуй своему сердцу и интуиции.';
    
    return {
      success: true,
      data: fallbackProphecy,
      strategy: 'fallback_empty_prophecy'
    };
  }
  
  console.log('✅ [DEBUG] Prophecy generated successfully:', response.data);
  return response;
};