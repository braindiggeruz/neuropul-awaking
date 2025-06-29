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
    const { html, options = {} } = req.body;

    console.log('🖨️ [API DEBUG] Received PDF generation request:', {
      htmlLength: html?.length,
      options: JSON.stringify(options)
    });

    if (!html) {
      console.error('❌ [API DEBUG] No HTML content provided');
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Set a timeout for the PDF generation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // For production, you would integrate with a real PDF service
      // This is a mock implementation for demonstration
      console.log('📤 [API DEBUG] Processing PDF generation...');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock PDF URL (base64 encoded minimal PDF)
      // In production, this would be a real PDF generation service
      const mockPdfUrl = `data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKE5ldXJvcHVsQUkgQ2VydGlmaWNhdGUpCi9Qcm9kdWNlciAoTmV1cm9wdWxBSSBQb3J0YWwpCi9DcmVhdGlvbkRhdGUgKEQ6MjAyNDEyMjcpCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjAgMCAwIHJnCjcyIDc1MCA3MiAxMiBUZAooTmV1cm9wdWxBSSBDZXJ0aWZpY2F0ZSkgVGoKUQpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMTI0IDAwMDAwIG4gCjAwMDAwMDAxODEgMDAwMDAgbiAKMDAwMDAwMDIzOCAwMDAwMCBuIAowMDAwMDAwMzM1IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAyIDAgUgo+PgpzdGFydHhyZWYKNDI5CiUlRU9G`;

      clearTimeout(timeoutId);
      console.log('✅ [API DEBUG] PDF generation successful');

      res.status(200).json({
        url: mockPdfUrl,
        success: true
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('⏱️ [API DEBUG] PDF generation timed out after 30 seconds');
        return res.status(504).json({ 
          error: 'PDF generation timed out',
          details: 'The request took too long to process' 
        });
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('💀 [API DEBUG] Pictify API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error.message 
    });
  }
}