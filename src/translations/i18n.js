import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { replaceInJson } from "utils/helpers";
import storage from "utils/storage";

import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import pl from "./locales/pl.json";
import zh from "./locales/zh.json";
import uk from "./locales/uk.json";
import ko from "./locales/ko.json";

const replacements = {
  "%APP_NAME%": process.env.REACT_APP_NAME,
};

const resources = {
  de: {
    translation: replaceInJson(de, replacements),
  },
  en: {
    translation: replaceInJson(en, replacements),
  },
  es: {
    translation: replaceInJson(es, replacements),
  },
  fr: {
    translation: replaceInJson(fr, replacements),
  },
  it: {
    translation: replaceInJson(it, replacements),
  },
  ja: {
    translation: replaceInJson(ja, replacements),
  },
  pl: {
    translation: replaceInJson(pl, replacements),
  },
  zh: {
    translation: replaceInJson(zh, replacements),
  },
  uk: {
    translation: replaceInJson(uk, replacements),
  },
  ko: {
    translation: replaceInJson(ko, replacements),
  },
};
let defaultLng = "";
/**
 * First Time if language is not set than it check the broswer default language and
 * set the langauge in case it is available in the resource
 */
if (!storage.getItem("language") || storage.getItem("language") === "") {
  let langCodes = Object.keys(resources);

  navigator.languages.forEach(function (lang) {
    let language = lang.split("-")[0];
    if (
      langCodes.includes(language) &&
      (!storage.getItem("language") || storage.getItem("language") === "") &&
      defaultLng === ""
    ) {
      defaultLng = lang.split("-")[0];
    }
  });
}
if (!defaultLng) defaultLng = "en";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: resources,
    lng: storage.getItem("language") || defaultLng,
    fallbackLng: defaultLng,

    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", function (lng) {
  storage.addItem("language", lng);
});

if (process.env.NODE_ENV !== "production") {
  console.warn("window.i18n is available");
  window.i18n = i18n;
}

export default i18n;
