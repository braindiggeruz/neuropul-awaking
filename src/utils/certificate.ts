import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export const generateCertificateId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `CERT-${year}-${month}-${day}-${random}`;
};

export const formatDate = (date: Date, lang: 'ru' | 'uz'): string => {
  if (lang === 'uz') {
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateCertificatePDF = async (
  userName: string,
  archetype: string,
  level: number,
  xp: number,
  lang: 'ru' | 'uz'
): Promise<void> => {
  const certificateId = generateCertificateId();
  const date = formatDate(new Date(), lang);
  const qrCodeUrl = await QRCode.toDataURL('https://t.me/neuropul_ai_bot');
  
  // Создаем временный элемент для сертификата
  const certificateElement = document.createElement('div');
  certificateElement.style.width = '800px';
  certificateElement.style.height = '600px';
  certificateElement.style.padding = '40px';
  certificateElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  certificateElement.style.fontFamily = 'Arial, sans-serif';
  certificateElement.style.position = 'absolute';
  certificateElement.style.left = '-9999px';
  certificateElement.style.color = 'white';
  
  const title = lang === 'ru' ? 'СЕРТИФИКАТ' : 'SERTIFIKAT';
  const subtitle = lang === 'ru' ? 'NeuropulAI Mastery' : 'NeuropulAI Mahorati';
  const confirms = lang === 'ru' ? 'Настоящим подтверждается, что' : 'Shu bilan tasdiqlanadi';
  const completed = lang === 'ru' ? 'успешно освоил AI-инструменты и достиг:' : 'AI asboblarini muvaffaqiyatli o\'zlashtirdi va erishdi:';
  const levelText = lang === 'ru' ? 'Уровень' : 'Daraja';
  const issueDate = lang === 'ru' ? 'Дата выдачи:' : 'Berilgan sana:';
  
  certificateElement.innerHTML = `
    <div style="text-align: center; background: white; border-radius: 20px; padding: 60px; color: #333; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
      <div style="margin-bottom: 40px;">
        <h1 style="font-size: 48px; font-weight: bold; margin: 0 0 10px 0; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${title}</h1>
        <h2 style="font-size: 24px; color: #666; margin: 0;">${subtitle}</h2>
      </div>
      
      <div style="margin: 40px 0;">
        <p style="font-size: 20px; margin-bottom: 20px;">${confirms}</p>
        <h3 style="font-size: 36px; font-weight: bold; color: #4F46E5; margin: 20px 0;">${userName}</h3>
        <p style="font-size: 18px; color: #7C3AED; margin: 10px 0;">Архетип: ${archetype}</p>
        
        <div style="margin: 40px 0; font-size: 18px; color: #555;">
          <p>${completed}</p>
          <p><strong>${levelText} ${level}</strong> • <strong>${xp} XP</strong></p>
          <p>${issueDate} <strong>${date}</strong></p>
        </div>
      </div>
      
      <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="font-size: 14px; color: #888; margin: 0;">ID: <span style="font-family: monospace; background: #f3f4f6; padding: 5px 10px; border-radius: 5px;">${certificateId}</span></p>
          <p style="font-size: 14px; color: #888; margin: 5px 0 0 0;">NeuropulAI • ${lang === 'ru' ? 'Твой путь к AI-мастерству' : 'AI ustaxonligiga yo\'lingiz'}</p>
        </div>
        <img src="${qrCodeUrl}" style="width: 80px; height: 80px;" alt="QR Code" />
      </div>
    </div>
  `;
  
  document.body.appendChild(certificateElement);
  
  try {
    const canvas = await html2canvas(certificateElement, {
      scale: 2,
      backgroundColor: null,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    const imgWidth = 297; // A4 landscape width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`NeuropulAI_Certificate_${userName.replace(/\s+/g, '_')}.pdf`);
    
  } finally {
    document.body.removeChild(certificateElement);
  }
};