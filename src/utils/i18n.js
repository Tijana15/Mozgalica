import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Importujte vaše prevode
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
    callback(savedLanguage || "sr"); // Vrati sačuvan jezik, ili srpski kao podrazumevani
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector) // Koristi naš detektor jezika
  .use(initReactI18next) // Povezuje i18n sa React-om
  .init({
    resources,
    fallbackLng: "sr", // Jezik koji se koristi ako prevod za trenutni ne postoji
    interpolation: {
      escapeValue: false, // Nije potrebno za React jer on već štiti od XSS
    },
    react: {
      useSuspense: false, // Važno za React Native
    },
  });

export default i18n;
