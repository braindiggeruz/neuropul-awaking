import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { UserProgress } from '../types';
import { ARCHETYPES } from '../constants/gameData';

export interface CertificateData {
  userName: string;
  archetype: string;
  level: number;
  xp: number;
  toolsUsed: string[];
  completionDate: string;
  certificateId: string;
}

export const generateCertificateId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `NEUROPUL-${year}${month}${day}-${random}`;
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

export const generateEnhancedCertificatePDF = async (
  userProgress: UserProgress,
  lang: 'ru' | 'uz' = 'ru'
): Promise<void> => {
  const certificateId = generateCertificateId();
  const date = formatDate(new Date(), lang);
  const qrCodeUrl = await QRCode.toDataURL(`https://neuropul.ai/verify/${certificateId}`);
  
  // Получаем данные архетипа
  const archetype = ARCHETYPES.find(a => a.id === userProgress.archetype);
  const archetypeName = archetype ? archetype.name[lang] : 'AI-Мастер';
  const archetypeIcon = archetype ? archetype.icon : '🤖';
  
  // Создаем временный элемент для сертификата
  const certificateElement = document.createElement('div');
  certificateElement.style.width = '1200px';
  certificateElement.style.height = '850px';
  certificateElement.style.padding = '0';
  certificateElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
  certificateElement.style.fontFamily = 'Arial, sans-serif';
  certificateElement.style.position = 'absolute';
  certificateElement.style.left = '-9999px';
  certificateElement.style.color = 'white';
  certificateElement.style.overflow = 'hidden';
  
  const title = lang === 'ru' ? 'СЕРТИФИКАТ AI-МАСТЕРСТВА' : 'AI MAHORAT SERTIFIKATI';
  const subtitle = lang === 'ru' ? 'NeuropulAI Academy' : 'NeuropulAI Akademiyasi';
  const confirms = lang === 'ru' ? 'Настоящим подтверждается, что' : 'Shu bilan tasdiqlanadi';
  const completed = lang === 'ru' ? 'успешно освоил AI-инструменты и достиг уровня мастерства:' : 'AI asboblarini muvaffaqiyatli o\'zlashtirdi va mahorat darajasiga erishdi:';
  const levelText = lang === 'ru' ? 'Уровень' : 'Daraja';
  const toolsText = lang === 'ru' ? 'Освоенные инструменты' : 'O\'zlashtirilgan asboblar';
  const issueDate = lang === 'ru' ? 'Дата выдачи:' : 'Berilgan sana:';
  const skills = lang === 'ru' ? 'Навыки' : 'Ko\'nikmalar';
  
  certificateElement.innerHTML = `
    <div style="position: relative; width: 100%; height: 100%; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); border-radius: 20px; overflow: hidden;">
      <!-- Background Pattern -->
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 25% 25%, #ffffff 2px, transparent 2px), radial-gradient(circle at 75% 75%, #ffffff 2px, transparent 2px); background-size: 50px 50px;"></div>
      
      <!-- Main Content -->
      <div style="position: relative; z-index: 2; padding: 60px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; font-size: 40px;">🧠</div>
            <div>
              <h1 style="font-size: 42px; font-weight: bold; margin: 0; background: linear-gradient(45deg, #667eea, #764ba2, #f093fb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${title}</h1>
              <h2 style="font-size: 20px; color: #a0a0ff; margin: 5px 0 0 0; font-weight: normal;">${subtitle}</h2>
            </div>
          </div>
        </div>
        
        <!-- Certificate Body -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div style="text-align: center; margin-bottom: 40px;">
            <p style="font-size: 18px; margin-bottom: 30px; color: #e0e0ff;">${confirms}</p>
            
            <!-- User Info with Avatar -->
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 30px;">
              <div style="width: 100px; height: 100px; background: linear-gradient(45deg, ${archetype?.gradient || 'from-purple-500 to-blue-500'}); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 30px; font-size: 50px; border: 4px solid rgba(255,255,255,0.3);">${archetypeIcon}</div>
              <div style="text-align: left;">
                <h3 style="font-size: 48px; font-weight: bold; color: #ffffff; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${userProgress.userName}</h3>
                <p style="font-size: 24px; color: #a0a0ff; margin: 5px 0; font-weight: 600;">${archetypeName}</p>
              </div>
            </div>
            
            <p style="font-size: 16px; color: #e0e0ff; margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto;">${completed}</p>
          </div>
          
          <!-- Stats Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; margin-bottom: 40px;">
            <div style="text-align: center; background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; border: 1px solid rgba(255,255,255,0.2);">
              <div style="font-size: 36px; font-weight: bold; color: #4ade80; margin-bottom: 5px;">${userProgress.level}</div>
              <div style="font-size: 14px; color: #a0a0ff;">${levelText}</div>
            </div>
            <div style="text-align: center; background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; border: 1px solid rgba(255,255,255,0.2);">
              <div style="font-size: 36px; font-weight: bold; color: #60a5fa; margin-bottom: 5px;">${userProgress.xp}</div>
              <div style="font-size: 14px; color: #a0a0ff;">XP</div>
            </div>
            <div style="text-align: center; background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; border: 1px solid rgba(255,255,255,0.2);">
              <div style="font-size: 36px; font-weight: bold; color: #f59e0b; margin-bottom: 5px;">${userProgress.toolsUsed.length}</div>
              <div style="font-size: 14px; color: #a0a0ff;">${toolsText}</div>
            </div>
          </div>
          
          <!-- Skills -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h4 style="font-size: 18px; color: #ffffff; margin-bottom: 15px; font-weight: 600;">${skills}:</h4>
            <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 10px;">
              <span style="background: rgba(102, 126, 234, 0.3); color: #667eea; padding: 8px 16px; border-radius: 20px; font-size: 12px; border: 1px solid rgba(102, 126, 234, 0.5);">AI Prompt Engineering</span>
              <span style="background: rgba(118, 75, 162, 0.3); color: #764ba2; padding: 8px 16px; border-radius: 20px; font-size: 12px; border: 1px solid rgba(118, 75, 162, 0.5);">Creative AI Tools</span>
              <span style="background: rgba(240, 147, 251, 0.3); color: #f093fb; padding: 8px 16px; border-radius: 20px; font-size: 12px; border: 1px solid rgba(240, 147, 251, 0.5);">AI-Powered Development</span>
              <span style="background: rgba(34, 197, 94, 0.3); color: #22c55e; padding: 8px 16px; border-radius: 20px; font-size: 12px; border: 1px solid rgba(34, 197, 94, 0.5);">Business AI Strategy</span>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="display: flex; justify-content: space-between; align-items: end; margin-top: 40px;">
          <div style="text-align: left;">
            <p style="font-size: 14px; color: #a0a0ff; margin: 0;">${issueDate}</p>
            <p style="font-size: 16px; font-weight: bold; color: #ffffff; margin: 5px 0 0 0;">${date}</p>
            <p style="font-size: 12px; color: #8080ff; margin: 10px 0 0 0;">ID: <span style="font-family: monospace; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px;">${certificateId}</span></p>
          </div>
          
          <div style="text-align: center;">
            <img src="${qrCodeUrl}" style="width: 80px; height: 80px; border-radius: 8px; background: white; padding: 8px;" alt="QR Code" />
            <p style="font-size: 10px; color: #8080ff; margin: 5px 0 0 0;">Verify Certificate</p>
          </div>
          
          <div style="text-align: right;">
            <div style="width: 120px; height: 2px; background: linear-gradient(45deg, #667eea, #764ba2); margin-bottom: 5px;"></div>
            <p style="font-size: 12px; color: #a0a0ff; margin: 0;">NeuropulAI</p>
            <p style="font-size: 10px; color: #8080ff; margin: 2px 0 0 0;">${lang === 'ru' ? 'Твой путь к AI-мастерству' : 'AI ustaxonligiga yo\'lingiz'}</p>
          </div>
        </div>
      </div>
      
      <!-- Decorative Elements -->
      <div style="position: absolute; top: 20px; right: 20px; width: 100px; height: 100px; background: linear-gradient(45deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2)); border-radius: 50%; opacity: 0.5;"></div>
      <div style="position: absolute; bottom: 20px; left: 20px; width: 80px; height: 80px; background: linear-gradient(45deg, rgba(240, 147, 251, 0.2), rgba(102, 126, 234, 0.2)); border-radius: 50%; opacity: 0.5;"></div>
    </div>
  `;
  
  document.body.appendChild(certificateElement);
  
  try {
    const canvas = await html2canvas(certificateElement, {
      scale: 2,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    const imgWidth = 297; // A4 landscape width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Добавляем метаданные
    pdf.setProperties({
      title: `NeuropulAI Certificate - ${userProgress.userName}`,
      subject: 'AI Mastery Certificate',
      author: 'NeuropulAI Academy',
      keywords: 'AI, Certificate, NeuropulAI, Machine Learning',
      creator: 'NeuropulAI Platform'
    });
    
    pdf.save(`NeuropulAI_Certificate_${userProgress.userName.replace(/\s+/g, '_')}_${certificateId}.pdf`);
    
    return certificateId;
    
  } finally {
    document.body.removeChild(certificateElement);
  }
};

// Функция для генерации отчета о прогрессе
export const generateProgressReport = async (
  userProgress: UserProgress,
  lang: 'ru' | 'uz' = 'ru'
): Promise<void> => {
  const reportId = `REPORT-${Date.now()}`;
  const date = formatDate(new Date(), lang);
  
  const reportElement = document.createElement('div');
  reportElement.style.width = '800px';
  reportElement.style.minHeight = '1000px';
  reportElement.style.padding = '40px';
  reportElement.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
  reportElement.style.fontFamily = 'Arial, sans-serif';
  reportElement.style.position = 'absolute';
  reportElement.style.left = '-9999px';
  reportElement.style.color = '#1a202c';
  
  const archetype = ARCHETYPES.find(a => a.id === userProgress.archetype);
  
  reportElement.innerHTML = `
    <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 30px;">
        <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0; color: #1a202c;">Отчет о прогрессе</h1>
        <h2 style="font-size: 18px; color: #64748b; margin: 0;">NeuropulAI Academy</h2>
        <p style="font-size: 14px; color: #94a3b8; margin: 10px 0 0 0;">${date}</p>
      </div>
      
      <!-- User Info -->
      <div style="margin-bottom: 40px;">
        <h3 style="font-size: 20px; font-weight: bold; color: #1a202c; margin-bottom: 20px;">Информация об ученике</h3>
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p style="margin: 0 0 5px 0; color: #64748b; font-size: 14px;">Имя:</p>
              <p style="margin: 0; font-weight: bold; font-size: 16px; color: #1a202c;">${userProgress.userName}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px 0; color: #64748b; font-size: 14px;">Архетип:</p>
              <p style="margin: 0; font-weight: bold; font-size: 16px; color: #1a202c;">${archetype?.icon} ${archetype?.name[lang] || 'AI-Мастер'}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px 0; color: #64748b; font-size: 14px;">Уровень:</p>
              <p style="margin: 0; font-weight: bold; font-size: 16px; color: #1a202c;">${userProgress.level}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px 0; color: #64748b; font-size: 14px;">Опыт:</p>
              <p style="margin: 0; font-weight: bold; font-size: 16px; color: #1a202c;">${userProgress.xp} XP</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Progress Stats -->
      <div style="margin-bottom: 40px;">
        <h3 style="font-size: 20px; font-weight: bold; color: #1a202c; margin-bottom: 20px;">Статистика прогресса</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 12px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${userProgress.toolsUsed.length}</div>
            <div style="font-size: 14px; opacity: 0.9;">Инструментов освоено</div>
          </div>
          <div style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; border-radius: 12px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${userProgress.dailyStreak}</div>
            <div style="font-size: 14px; opacity: 0.9;">Дней подряд</div>
          </div>
          <div style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; border-radius: 12px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${userProgress.isPremium ? 'PRO' : 'FREE'}</div>
            <div style="font-size: 14px; opacity: 0.9;">Статус аккаунта</div>
          </div>
        </div>
      </div>
      
      <!-- Tools Used -->
      <div style="margin-bottom: 40px;">
        <h3 style="font-size: 20px; font-weight: bold; color: #1a202c; margin-bottom: 20px;">Освоенные инструменты</h3>
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px;">
          ${userProgress.toolsUsed.length > 0 ? 
            userProgress.toolsUsed.map(toolId => `
              <div style="display: inline-block; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 15px; margin: 5px; font-size: 14px;">
                ${toolId}
              </div>
            `).join('') :
            '<p style="color: #64748b; font-style: italic;">Пока не использовано ни одного инструмента</p>'
          }
        </div>
      </div>
      
      <!-- Recommendations -->
      <div style="margin-bottom: 40px;">
        <h3 style="font-size: 20px; font-weight: bold; color: #1a202c; margin-bottom: 20px;">Рекомендации для развития</h3>
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 20px;">
          <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
            <li style="margin-bottom: 10px;">Продолжайте ежедневно использовать AI-инструменты для поддержания streak</li>
            <li style="margin-bottom: 10px;">Экспериментируйте с разными типами промптов для лучших результатов</li>
            <li style="margin-bottom: 10px;">Изучайте новые техники работы с искусственным интеллектом</li>
            <li style="margin-bottom: 10px;">Делитесь своими результатами с сообществом</li>
          </ul>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; border-top: 2px solid #e2e8f0; padding-top: 20px; color: #64748b; font-size: 12px;">
        <p style="margin: 0;">Сгенерировано NeuropulAI Academy • ${date}</p>
        <p style="margin: 5px 0 0 0;">ID отчета: ${reportId}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(reportElement);
  
  try {
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      backgroundColor: null,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 portrait width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`NeuropulAI_Progress_Report_${userProgress.userName.replace(/\s+/g, '_')}.pdf`);
    
  } finally {
    document.body.removeChild(reportElement);
  }
};