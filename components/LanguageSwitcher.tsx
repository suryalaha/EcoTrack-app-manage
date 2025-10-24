import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { language, setLanguage } = useLanguage();

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिंदी' },
        { code: 'bn', name: 'বাংলা' },
    ];

    return (
        <div className={`relative ${className}`}>
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'bn')}
                className="w-full appearance-none rounded-lg border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 py-2 pl-10 pr-4 text-sm font-semibold text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Select language"
            >
                {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSwitcher;
