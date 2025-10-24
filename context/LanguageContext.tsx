import React, { createContext, useState, useContext, ReactNode } from 'react';

import en from '../locales/en';
import hi from '../locales/hi';
import bn from '../locales/bn';

type Language = 'en' | 'hi' | 'bn';

const translations = { en, hi, bn };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    let translation = translations[language][key as keyof typeof translations[Language]] || key;
    
    if (options) {
      Object.keys(options).forEach(optionKey => {
        const regex = new RegExp(`{{${optionKey}}}`, 'g');
        translation = translation.replace(regex, String(options[optionKey]));
      });
    }

    if (options && typeof options.count === 'number' && options.count !== 1) {
        const pluralKey = `${key}_plural`;
        const pluralTranslation = translations[language][pluralKey as keyof typeof translations[Language]];
        if (pluralTranslation) {
            translation = pluralTranslation.replace(/{{count}}/g, String(options.count));
        }
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
