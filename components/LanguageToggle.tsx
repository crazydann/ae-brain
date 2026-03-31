'use client';
import { useLang } from '@/lib/i18n';

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 text-xs font-medium">
      <button
        onClick={() => setLang('ko')}
        className={`px-2 py-1 rounded-md transition-colors ${lang === 'ko' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
      >
        한
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-1 rounded-md transition-colors ${lang === 'en' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
      >
        EN
      </button>
    </div>
  );
}
