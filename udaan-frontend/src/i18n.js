import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en/translation.json';
import hiTranslations from './locales/hi/translation.json';

const savedLanguage = localStorage.getItem('udaan-lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
