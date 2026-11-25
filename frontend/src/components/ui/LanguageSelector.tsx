import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'pills' | 'dropdown';
  className?: string;
  onChangeExtra?: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'pills',
  className = '',
  onChangeExtra
}) => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' }
  ];

  const handleSelect = (code: Language) => {
    setLanguage(code);
    if (onChangeExtra) {
      onChangeExtra(code);
    }
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <Globe className="w-4 h-4 text-text-muted absolute left-3 pointer-events-none" />
        <select
          value={language}
          onChange={(e) => handleSelect(e.target.value as Language)}
          className="appearance-none bg-cream-warm border border-beige-pale rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-text-dark hover:border-burgundy/40 focus:outline-none focus:ring-2 focus:ring-burgundy/20 cursor-pointer transition-all"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.native} ({l.label})
            </option>
          ))}
        </select>
        <div className="absolute right-3 pointer-events-none text-text-muted text-[10px]">▼</div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 bg-cream-warm/80 p-1 rounded-xl border border-beige-pale/80 ${className}`}>
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => handleSelect(l.code)}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            language === l.code
              ? 'bg-burgundy text-white shadow-soft'
              : 'text-text-muted hover:text-text-dark hover:bg-beige-pale/40'
          }`}
          title={l.label}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
};
