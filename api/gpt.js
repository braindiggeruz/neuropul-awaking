export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, systemPrompt } = req.body;

    console.log('🧠 [API DEBUG] Received request:', {
      promptLength: prompt?.length,
      systemPromptLength: systemPrompt?.length,
      hasApiKey: !!process.env.OPENAI_API_KEY
    });

    if (!prompt) {
      console.error('❌ [API DEBUG] No prompt provided');
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [API DEBUG] OpenAI API key not configured');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log('📤 [API DEBUG] Sending request to OpenAI...');

    // Set a timeout for the OpenAI request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt || 'You are a helpful AI assistant.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📥 [API DEBUG] OpenAI response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [API DEBUG] OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 [API DEBUG] OpenAI response data:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        hasContent: !!data.choices?.[0]?.message?.content
      });

      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.error('❌ [API DEBUG] No content received from OpenAI');
        throw new Error('No content received from OpenAI');
      }

      console.log('✅ [API DEBUG] Successfully returning content');
      res.status(200).json(content);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('⏱️ [API DEBUG] Request timed out after 20 seconds');
        return res.status(504).json({ 
          error: 'Request timed out',
          details: 'OpenAI API request took too long to respond' 
        });
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('💀 [API DEBUG] GPT API Error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}