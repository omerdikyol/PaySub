import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, translations } from '@/constants/Translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        loadLanguageSettings();
    }, []);

    const loadLanguageSettings = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('language');
            if (savedLanguage === 'tr' || savedLanguage === 'en') {
                setLanguageState(savedLanguage);
            }
        } catch (error) {
            console.error('Error loading language settings:', error);
        }
    };

    const setLanguage = async (lang: Language) => {
        try {
            await AsyncStorage.setItem('language', lang);
            setLanguageState(lang);
        } catch (error) {
            console.error('Error saving language settings:', error);
        }
    };

    const t = (key: keyof typeof translations.en): string => {
        return translations[language][key] || translations.en[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
} 