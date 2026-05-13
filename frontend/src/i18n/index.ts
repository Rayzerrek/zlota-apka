import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import pl from "./locales/pl.json";

const savedLang = localStorage.getItem("i18n.language") ?? "pl";

i18n.use(initReactI18next).init({
  resources: {
    pl: { translation: pl },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: "pl",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("i18n.language", lng);
  document.documentElement.lang = lng;
});

export default i18n;
