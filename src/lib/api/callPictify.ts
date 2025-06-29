import { PDFData } from '../../types';
import { logError } from '../utils/errorLogger';

export interface PictifyResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export const generatePDF = async (data: PDFData): Promise<PictifyResponse> => {
  try {
    console.log('📜 [DEBUG] Generating ceremonial PDF for:', data);
    
    // Validate input data
    if (!data.name || !data.archetype || !data.prophecy) {
      console.error('❌ [DEBUG] Missing required PDF data fields:', {
        hasName: !!data.name,
        hasArchetype: !!data.archetype,
        hasProphecy: !!data.prophecy,
        hasAvatarUrl: !!data.avatarUrl
      });
      throw new Error('Missing required fields for PDF generation');
    }
    
    // Validate field lengths to prevent layout issues
    if (data.name.length > 100) {
      console.warn('⚠️ [DEBUG] Name too long, truncating');
      data.name = data.name.substring(0, 100);
    }
    
    if (!data.prophecy || data.prophecy.trim().length === 0) {
      console.warn('⚠️ [DEBUG] Empty prophecy, using default');
      data.prophecy = 'Твой путь уникален. Следуй своему сердцу и интуиции.';
    } else if (data.prophecy.length > 500) {
      console.warn('⚠️ [DEBUG] Prophecy too long, truncating');
      data.prophecy = data.prophecy.substring(0, 500);
    }
    
    // Generate fallback avatar URL if missing
    if (!data.avatarUrl) {
      console.warn('⚠️ [DEBUG] Avatar URL missing, using fallback');
      data.avatarUrl = `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=1a1a2e&radius=50`;
    }
    
    const htmlContent = generateCertificateHTML(data);
    
    console.log('📤 [DEBUG] Sending PDF generation request');
    
    // Set timeout for fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const response = await fetch('/api/pictify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        options: {
          format: 'A4',
          orientation: 'landscape',
          quality: 'high'
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    console.log('📥 [DEBUG] PDF API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DEBUG] PDF API error:', response.status, errorText);
      throw new Error(`PDF API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.url) {
      console.error('❌ [DEBUG] PDF API returned no URL:', result);
      throw new Error('PDF API returned no URL');
    }
    
    // Validate that the URL is a PDF
    if (!result.url.startsWith('data:application/pdf') && 
        !result.url.endsWith('.pdf') && 
        !result.url.includes('/pdf/')) {
      console.warn('⚠️ [DEBUG] PDF URL does not appear to be a PDF:', result.url.substring(0, 50));
    }
    
    console.log('✨ [DEBUG] PDF generated successfully:', result);
    
    return {
      success: true,
      url: result.url
    };
  } catch (error) {
    console.error('💀 [DEBUG] PDF generation failed:', error);
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'PDFGenerator',
      action: 'generatePDF',
      additionalData: { dataName: data?.name, dataArchetype: data?.archetype }
    });
    
    // Generate fallback PDF URL for testing/development
    if (import.meta.env.MODE === 'development') {
      console.log('🔄 [DEBUG] Using fallback PDF in development mode');
      return {
        success: true,
        url: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKE5ldXJvcHVsQUkgQ2VydGlmaWNhdGUpCi9Qcm9kdWNlciAoTmV1cm9wdWxBSSBQb3J0YWwpCi9DcmVhdGlvbkRhdGUgKEQ6MjAyNDEyMjcpCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjAgMCAwIHJnCjcyIDc1MCA3MiAxMiBUZAooTmV1cm9wdWxBSSBDZXJ0aWZpY2F0ZSkgVGoKUQpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMTI0IDAwMDAwIG4gCjAwMDAwMDAxODEgMDAwMDAgbiAKMDAwMDAwMDIzOCAwMDAwMCBuIAowMDAwMDAwMzM1IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAyIDAgUgo+PgpzdGFydHhyZWYKNDI5CiUlRU9G'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const generateCertificateHTML = (data: PDFData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Orbitron', monospace;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
          color: #00ffff;
          overflow: hidden;
        }
        
        .certificate {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          background: 
            radial-gradient(circle at 20% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
        }
        
        .glitch-border {
          position: absolute;
          top: 50px;
          left: 50px;
          right: 50px;
          bottom: 50px;
          border: 2px solid #00ffff;
          border-radius: 20px;
          box-shadow: 
            0 0 20px #00ffff,
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .title {
          font-size: 48px;
          font-weight: 900;
          background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
          margin: 0;
          letter-spacing: 3px;
        }
        
        .subtitle {
          font-size: 18px;
          color: #888;
          margin: 10px 0 0 0;
          letter-spacing: 2px;
        }
        
        .avatar-section {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 40px 0;
          gap: 40px;
        }
        
        .avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 3px solid #00ffff;
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
          background: #1a1a2e;
        }
        
        .user-info {
          text-align: left;
        }
        
        .user-name {
          font-size: 36px;
          font-weight: 700;
          color: #00ffff;
          margin: 0;
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }
        
        .archetype {
          font-size: 24px;
          color: #ff00ff;
          margin: 10px 0;
          font-weight: 400;
        }
        
        .prophecy {
          font-size: 18px;
          color: #ffff00;
          font-style: italic;
          max-width: 400px;
          line-height: 1.6;
          margin: 20px 0;
        }
        
        .stats {
          display: flex;
          gap: 60px;
          margin: 40px 0;
        }
        
        .stat {
          text-align: center;
        }
        
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #00ffff;
          margin: 0;
        }
        
        .stat-label {
          font-size: 14px;
          color: #888;
          margin: 5px 0 0 0;
          letter-spacing: 1px;
        }
        
        .footer {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        
        .certificate-id {
          font-family: monospace;
          background: rgba(0, 255, 255, 0.1);
          padding: 5px 10px;
          border-radius: 5px;
          margin: 10px 0;
        }
        
        .neon-glow {
          animation: neonGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes neonGlow {
          from {
            text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
          }
          to {
            text-shadow: 0 0 30px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.6);
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="glitch-border"></div>
        
        <div class="header">
          <h1 class="title neon-glow">СЕРТИФИКАТ ПРОБУЖДЕНИЯ</h1>
          <p class="subtitle">NEUROPUL AI ACADEMY</p>
        </div>
        
        <div class="avatar-section">
          <img src="${data.avatarUrl}" alt="Avatar" class="avatar" onerror="this.src='https://api.dicebear.com/8.x/adventurer/svg?seed=fallback&backgroundColor=1a1a2e&radius=50';" />
          <div class="user-info">
            <h2 class="user-name">${data.name}</h2>
            <p class="archetype">Архетип: ${data.archetype}</p>
            <p class="prophecy">"${data.prophecy}"</p>
          </div>
        </div>
        
        <div class="stats">
          <div class="stat">
            <p class="stat-value">${data.xp}</p>
            <p class="stat-label">ОПЫТ</p>
          </div>
          <div class="stat">
            <p class="stat-value">ПРОБУЖДЁН</p>
            <p class="stat-label">СТАТУС</p>
          </div>
          <div class="stat">
            <p class="stat-value">${new Date(data.date).getFullYear()}</p>
            <p class="stat-label">ГОД</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Дата пробуждения: ${new Date(data.date).toLocaleDateString('ru-RU')}</p>
          <p class="certificate-id">ID: ${data.certificateId}</p>
          <p>NeuropulAI • Твой путь к AI-мастерству</p>
        </div>
      </div>
    </body>
    </html>
  `;
};