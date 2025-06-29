export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if debug mode is enabled
    const isDebugEnabled = process.env.ENABLE_DEBUG === 'true';
    if (!isDebugEnabled) {
      return res.status(403).json({ error: 'Debug mode is disabled' });
    }

    // Get user ID from query params
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check localStorage status if available
    let localStorageStatus = {};
    if (typeof window !== 'undefined') {
      localStorageStatus = {
        awakening_completed: localStorage.getItem('neuropul_awakening_completed') === 'true',
        pdf_generated: localStorage.getItem('neuropul_pdf_generated') === 'true',
        user_progress: !!localStorage.getItem('neuropul_user_progress'),
        user_progress_backup: !!localStorage.getItem('neuropul_user_progress_backup')
      };
    }

    // Mock response for demo purposes
    // In a real implementation, this would fetch data from Supabase
    const mockStatus = {
      user: {
        id: userId,
        name: 'Test User',
        archetype: 'Воин',
        xp: 150,
        level: 2,
        awakening_status: 'completed'
      },
      awakening: {
        pdf_generated: true,
        retry_count: 0,
        last_retry_at: null,
        error_message: null
      },
      system: {
        app_version: '1.0.0',
        environment: process.env.APP_ENV || 'production',
        debug_enabled: isDebugEnabled,
        pdf_generation_disabled: process.env.DISABLE_PDF_GEN === 'true',
        timestamp: new Date().toISOString(),
        openai_key_configured: !!process.env.OPENAI_API_KEY,
        supabase_configured: !!process.env.VITE_SUPABASE_URL && !!process.env.VITE_SUPABASE_ANON_KEY
      },
      localStorage: localStorageStatus,
      fallbacks: {
        archetype_engine: 'operational',
        pdf_generation: 'operational',
        gpt_api: 'operational'
      },
      api_health: {
        gpt: 'operational',
        pictify: 'operational',
        supabase: 'operational'
      }
    };

    res.status(200).json(mockStatus);
  } catch (error) {
    console.error('💀 [API DEBUG] Debug status error:', error);
    res.status(500).json({ 
      error: 'Failed to get debug status',
      details: error.message 
    });
  }
}