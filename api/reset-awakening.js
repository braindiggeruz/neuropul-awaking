export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if debug mode is enabled
    const isDebugEnabled = process.env.ENABLE_DEBUG === 'true';
    if (!isDebugEnabled) {
      return res.status(403).json({ error: 'Debug mode is disabled' });
    }

    const { user_id, reset_type = 'full' } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`🔄 [API DEBUG] Resetting awakening for user ${user_id}, type: ${reset_type}`);

    // In a real implementation, this would call Supabase functions
    // For now, we'll just return success
    if (reset_type === 'full') {
      // Reset everything
      console.log('🔄 [API DEBUG] Full reset requested');
      
      // Mock Supabase call
      console.log('✅ [API DEBUG] Reset successful');
      
      res.status(200).json({ 
        success: true, 
        message: 'Awakening fully reset',
        reset_type: 'full'
      });
    } else if (reset_type === 'pdf') {
      // Reset only PDF generation
      console.log('🔄 [API DEBUG] PDF reset requested');
      
      // Mock Supabase call
      console.log('✅ [API DEBUG] PDF reset successful');
      
      res.status(200).json({ 
        success: true, 
        message: 'PDF generation reset',
        reset_type: 'pdf'
      });
    } else {
      return res.status(400).json({ error: 'Invalid reset type' });
    }
  } catch (error) {
    console.error('💀 [API DEBUG] Reset awakening error:', error);
    res.status(500).json({ 
      error: 'Failed to reset awakening',
      details: error.message 
    });
  }
}