import { translations } from '../../constants/translations';

export type Language = 'ru' | 'uz';

// Get the user's preferred language from localStorage or default to 'ru'
export const getUserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'ru';
  
  try {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    
    if (urlLang === 'uz' || urlLang === 'ru') {
      localStorage.setItem('neuropul_language', urlLang);
      return urlLang;
    }
    
    // Then check localStorage
    const savedLanguage = localStorage.getItem('neuropul_language');
    if (savedLanguage === 'uz' || savedLanguage === 'ru') {
      return savedLanguage;
    }
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('uz')) {
      localStorage.setItem('neuropul_language', 'uz');
      return 'uz';
    }
    
    // Default to Russian
    return 'ru';
  } catch (error) {
    console.error('Error getting user language:', error);
    return 'ru';
  }
};

// Set the user's preferred language in localStorage
export const setUserLanguage = (language: Language): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('neuropul_language', language);
    console.log(`Language set to: ${language}`);
  } catch (error) {
    console.error('Error setting user language:', error);
  }
};

// Get a translated string based on the current language
export const translate = (key: string, language?: Language): string => {
  try {
    const lang = language || getUserLanguage();
    const keys = key.split('.');
    let value: any = translations[lang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // Fallback to Russian if translation is missing
    if (typeof value !== 'string' && lang === 'uz') {
      let fallbackValue: any = translations['ru'];
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k];
      }
      return typeof fallbackValue === 'string' ? fallbackValue : key;
    }
    
    return typeof value === 'string' ? value : key;
  } catch (error) {
    console.error('Translation error:', error);
    return key;
  }
};

// Format a string with variables
export const formatString = (str: string, variables: Record<string, string | number>): string => {
  try {
    return str.replace(/\{(\w+)\}/g, (_, key) => 
      variables[key] !== undefined ? String(variables[key]) : `{${key}}`
    );
  } catch (error) {
    console.error('String formatting error:', error);
    return str;
  }
};

// Check if a translation exists
export const hasTranslation = (key: string, language: Language): boolean => {
  try {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return false;
    }
    
    return typeof value === 'string';
  } catch (error) {
    console.error('Translation check error:', error);
    return false;
  }
};