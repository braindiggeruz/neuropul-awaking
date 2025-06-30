import { translations } from '../../constants/translations';

export type Language = 'ru' | 'uz';

// Get the user's preferred language from localStorage or default to 'ru'
export const getUserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'ru';
  
  const savedLanguage = localStorage.getItem('neuropul_language');
  return (savedLanguage === 'uz' ? 'uz' : 'ru') as Language;
};

// Set the user's preferred language in localStorage
export const setUserLanguage = (language: Language): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('neuropul_language', language);
};

// Get a translated string based on the current language
export const translate = (key: string, language?: Language): string => {
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
};

// Format a string with variables
export const formatString = (str: string, variables: Record<string, string | number>): string => {
  return str.replace(/\{(\w+)\}/g, (_, key) => 
    variables[key] !== undefined ? String(variables[key]) : `{${key}}`
  );
};