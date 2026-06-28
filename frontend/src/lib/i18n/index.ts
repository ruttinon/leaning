import { useAppStore } from "@/store/theme-store";
import { translationsTh } from "./translations/th";
import { translationsEn } from "./translations/en";

export const useTranslation = () => {
  const { language } = useAppStore();
  const t = language === "th" ? translationsTh : translationsEn;

  const translate = (key: string, params?: Record<string, string>) => {
    const keys = key.split(".");
    let value: any = t;
    for (const k of keys) {
      value = value[k];
      if (!value) return key;
    }
    if (params && typeof value === "string") {
      return value.replace(/\{\{(\w+)\}\}/g, (_, match) => params[match] || "");
    }
    return value;
  };

  return { t: translate, language };
};
