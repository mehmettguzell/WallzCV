import en from './en.json';
import tr from './tr.json';

export const languages = ['en', 'tr'] as const;
export type Language = (typeof languages)[number];
export const default_language: Language = 'en';

type TranslationKey = keyof typeof en;

const dictionaries: Record<Language, Partial<Record<TranslationKey, string>>> = { en, tr };

export function is_language(value: string | undefined): value is Language {
	return languages.includes(value as Language);
}

export function t(language: Language, key: TranslationKey): string {
	return dictionaries[language][key] ?? en[key];
}
