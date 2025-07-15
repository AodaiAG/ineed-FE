// src/contexts/LanguageContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation to determine current path

// Create a context for managing language state globally
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const location = useLocation(); // Get the current route path

    // Function to detect the browser language
    const detectBrowserLanguage = () => {
        const userLanguage = navigator.language || navigator.languages[0]; // Get browser language
        const languageCode = userLanguage.split('-')[0]; // Extract language part (e.g., 'en' from 'en-US')
        return languageCode; // Return detected language code
    };

    // Check if there is a saved language in localStorage
    const savedLanguage = localStorage.getItem('userLanguage');

    // Initial state for the language
    const [language, setLanguage] = useState(savedLanguage ||  'he');
    const [translation, setTranslation] = useState(null);

    // Load translations when the language or location changes
    useEffect(() => {
        const loadTranslation = async () => {
            try {
                let translationData;

                // Determine which translation to load based on the current route
                if (location.pathname.includes('/pro')) {
                    // Load professional side translations
                    translationData = await import(`../utils/translations/pro/${language}.json`);
                } else {
                    // Load client side translations
                    translationData = await import(`../utils/translations/client/${language}.json`);
                }

                setTranslation(translationData.default); // Set the loaded translation
            } catch (error) {
                console.error(`Error loading translation for language "${language}":`, error);
            }
        };

        loadTranslation();
    }, [language, location]); // Reload if language or route path changes

    // Save selected language to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('userLanguage', language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, translation }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook to use the LanguageContext values in other components
export const useLanguage = () => useContext(LanguageContext);
