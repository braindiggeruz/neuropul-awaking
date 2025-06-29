import { createClient } from '@supabase/supabase-js';
import { logError } from './utils/errorLogger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 Missing Supabase credentials. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Helper function to set user context for RLS policies
export const setUserContext = async (tgId: string) => {
  try {
    await supabase.rpc('set_config', {
      setting_name: 'request.tg_id',
      setting_value: tgId
    });
    return true;
  } catch (error) {
    console.error('Failed to set user context:', error);
    logError(error, {
      component: 'supabaseClient',
      action: 'setUserContext',
      additionalData: { tgId }
    });
    return false;
  }
};

// Helper function to check if user exists
export const checkUserExists = async (tgId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('tg_id', tgId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user:', error);
      logError(error, {
        component: 'supabaseClient',
        action: 'checkUserExists',
        additionalData: { tgId }
      });
    }
    
    return !!data;
  } catch (error) {
    logError(error, {
      component: 'supabaseClient',
      action: 'checkUserExists',
      additionalData: { tgId }
    });
    return false;
  }
};

// Helper function to get user profile
export const getUserProfile = async (tgId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('tg_id', tgId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      logError(error, {
        component: 'supabaseClient',
        action: 'getUserProfile',
        additionalData: { tgId }
      });
      return null;
    }
    
    return data;
  } catch (error) {
    logError(error, {
      component: 'supabaseClient',
      action: 'getUserProfile',
      additionalData: { tgId }
    });
    return null;
  }
};

// Helper function to update user profile
export const updateUserProfile = async (tgId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('tg_id', tgId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      logError(error, {
        component: 'supabaseClient',
        action: 'updateUserProfile',
        additionalData: { tgId, updates }
      });
      return null;
    }
    
    return data;
  } catch (error) {
    logError(error, {
      component: 'supabaseClient',
      action: 'updateUserProfile',
      additionalData: { tgId, updates }
    });
    return null;
  }
};

// Helper function to update awakening status
export const updateAwakeningStatus = async (userId: string, status: 'pending' | 'completed' | 'failed') => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ awakening_status: status })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating awakening status:', error);
      logError(error, {
        component: 'supabaseClient',
        action: 'updateAwakeningStatus',
        additionalData: { userId, status }
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logError(error, {
      component: 'supabaseClient',
      action: 'updateAwakeningStatus',
      additionalData: { userId, status }
    });
    return false;
  }
};

// Helper function to update PDF generation status
export const updatePdfGenerationStatus = async (userId: string, generated: boolean, errorMessage?: string) => {
  try {
    const updates: any = { 
      pdf_generated: generated
    };
    
    if (errorMessage) {
      updates.error_message = errorMessage;
    }
    
    if (!generated) {
      updates.retry_count = supabase.rpc('increment', { row_id: userId, table: 'awakenings', column: 'retry_count' });
      updates.last_retry_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('awakenings')
      .update(updates)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating PDF generation status:', error);
      logError(error, {
        component: 'supabaseClient',
        action: 'updatePdfGenerationStatus',
        additionalData: { userId, generated, errorMessage }
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logError(error, {
      component: 'supabaseClient',
      action: 'updatePdfGenerationStatus',
      additionalData: { userId, generated, errorMessage }
    });
    return false;
  }
};

// Function to retry PDF generation
export const retryPdfGeneration = async (userId: string) => {
  try {
    const { error } = await supabase
      .rpc('retry_pdf_generation', { p_user_id: userId });
    
    if (error) {
      console.error('Error retrying PDF generation:', error);
      logError(error, {
        component: 'supabaseClient',
        action: 'retryPdfGeneration',
        additionalData: { userId }
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logError(error, {
      component: 'supabaseClient',
      action: 'retryPdfGeneration',
      additionalData: { userId }
    });
    return false;
  }
};

// Function to reset awakening
export const resetAwakening = async (userId: string) => {
  try {
    const { error } = await supabase
      .rpc('reset_awakening', { p_user_id: userId });
    
    if (error) {
      console.error('Error resetting awakening:', error);
      logError(error, {
        component: 'supabaseClient',
        action: 'resetAwakening',
        additionalData: { userId }
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logError(error, {
      component: 'supabaseClient',
      action: 'resetAwakening',
      additionalData: { userId }
    });
    return false;
  }
};