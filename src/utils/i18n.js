import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import sr from "../languages/sr.json";
import eng from "../languages/eng.json";
import es from "../languages/es.json";

const resources = {
  sr: sr,
  en: eng,
  es: es,
};

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: async (callback) => {
    const savedLanguage = await AsyncStorage.getItem("selectedLanguage");
    callback(savedLanguage || "sr");
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "sr",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
