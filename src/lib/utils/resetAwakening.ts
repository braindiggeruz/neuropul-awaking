import { logError } from './errorLogger';

/**
 * Resets the awakening process completely
 * Clears all localStorage data and reloads the page
 */
export const resetAwakening = (): void => {
  try {
    console.log('🔄 [DEBUG] Resetting awakening process');
    
    // Clear all awakening-related localStorage items
    localStorage.removeItem('neuropul_user_progress');
    localStorage.removeItem('neuropul_user_progress_backup');
    localStorage.removeItem('neuropul_awakening_completed');
    localStorage.removeItem('neuropul_pdf_generated');
    localStorage.removeItem('neuropul_completed_challenges');
    
    // Clear any daily/weekly challenges
    const today = new Date().toDateString();
    localStorage.removeItem(`daily_challenge_${today}`);
    
    const weekStart = getWeekStart();
    localStorage.removeItem(`weekly_challenge_${weekStart}`);
    
    console.log('✅ [DEBUG] Awakening reset successful');
    
    // Reload the page to restart the app
    window.location.reload();
  } catch (error) {
    console.error('❌ [DEBUG] Awakening reset failed:', error);
    logError(error, {
      component: 'resetAwakening',
      action: 'resetAll'
    });
  }
};

/**
 * Helper function to get the current week start date string
 */
const getWeekStart = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  const weekStart = new Date(now.setDate(diff));
  return weekStart.toDateString();
};

/**
 * Resets only the PDF generation part of the awakening
 * Allows the user to retry PDF generation without restarting the whole process
 */
export const resetPdfGeneration = (): void => {
  try {
    console.log('🔄 [DEBUG] Resetting PDF generation');
    
    // Clear PDF generation flag
    localStorage.removeItem('neuropul_pdf_generated');
    
    // Update user progress to mark PDF as not generated
    const userProgress = localStorage.getItem('neuropul_user_progress');
    if (userProgress) {
      const progress = JSON.parse(userProgress);
      progress.pdfGenerated = false;
      localStorage.setItem('neuropul_user_progress', JSON.stringify(progress));
    }
    
    console.log('✅ [DEBUG] PDF generation reset successful');
  } catch (error) {
    console.error('❌ [DEBUG] PDF generation reset failed:', error);
    logError(error, {
      component: 'resetAwakening',
      action: 'resetPdf'
    });
  }
};

/**
 * Server-side reset via API
 * This is useful for admin operations or when localStorage is not accessible
 */
export const serverResetAwakening = async (userId: string, resetType: 'full' | 'pdf' = 'full'): Promise<boolean> => {
  try {
    console.log(`🔄 [DEBUG] Server-side reset (${resetType}) for user ${userId}`);
    
    const response = await fetch('/api/reset-awakening', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        reset_type: resetType
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server reset failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ [DEBUG] Server-side reset successful:', result);
    
    // If it's a full reset, also clear localStorage
    if (resetType === 'full') {
      resetAwakening();
    } else if (resetType === 'pdf') {
      resetPdfGeneration();
    }
    
    return true;
  } catch (error) {
    console.error('❌ [DEBUG] Server-side reset failed:', error);
    logError(error, {
      component: 'resetAwakening',
      action: 'serverReset',
      additionalData: { userId, resetType }
    });
    return false;
  }
};