import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations, TranslationSchema, translateClinical } from '../utils/translations';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSchema;
  translateClinical: (term: string, targetLang?: Language) => string | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('medora_lang');
    if (saved === 'bn' || saved === 'hi' || saved === 'en') {
      return saved;
    }
    return 'en';
  });

  // Sync with authenticated user's preferred language when they log in
  useEffect(() => {
    if (user?.preferred_language && (user.preferred_language === 'en' || user.preferred_language === 'bn' || user.preferred_language === 'hi')) {
      setLanguageState(user.preferred_language);
      localStorage.setItem('medora_lang', user.preferred_language);
    }
  }, [user?.preferred_language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('medora_lang', lang);
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateClinical }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
