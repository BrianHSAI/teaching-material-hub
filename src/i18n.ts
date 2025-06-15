
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationDA from './locales/da/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  da: {
    translation: translationDA,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'da', // Fallback til dansk
    interpolation: {
      escapeValue: false, // React klarer selv escaping
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
