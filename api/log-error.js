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
    const { context, error_message, stack_trace, source, user_id, level = 'ERROR', additional_data } = req.body;

    console.log('📝 [API DEBUG] Logging error:', {
      context,
      error_message,
      source,
      level,
      user_id: user_id ? 'present' : 'not provided'
    });

    // In a real implementation, this would be stored in Supabase
    // For now, we'll just log it to the console
    console.error('🚨 [ERROR LOG]', {
      timestamp: new Date().toISOString(),
      context,
      error_message,
      stack_trace,
      source,
      user_id,
      level,
      additional_data
    });

    // Return success
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('💀 [API DEBUG] Error logging error:', error);
    res.status(500).json({ 
      error: 'Failed to log error',
      details: error.message 
    });
  }
}