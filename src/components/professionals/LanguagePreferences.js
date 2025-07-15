import React, { forwardRef } from 'react';
import styles from '../../styles/ProfessionalRegistration.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguagePreferences = forwardRef(({ languages, setLanguages, error }, ref) => {
    const { translation } = useLanguage();

    if (!translation) {
        return <div>Loading...</div>; // Wait for translations to load
    }

    const toggleLanguage = (languageId) => {
        setLanguages((prevLanguages) => {
            if (prevLanguages.includes(languageId)) {
                return prevLanguages.filter((id) => id !== languageId);
            } else {
                return [...prevLanguages, languageId];
            }
        });
    };

    return (
        <div ref={ref} className={styles['pro-form-group']}>
<label className={`${styles['pro-label']} ${styles['pro-label-required']}`}>
    {translation.languagePreferencesLabel}
</label>            {error && <p className={styles['pro-error']}>{error}</p>} {/* Display error message above language selection */}
            <div className={styles['language-options']}>
                {Object.keys(translation.languages).map((languageKey) => (
                    <label key={languageKey} className={styles['language-label']}>
                        <input
                            type="checkbox"
                            checked={languages.includes(languageKey)}
                            onChange={() => toggleLanguage(languageKey)}
                        />
                        <span>{translation.languages[languageKey]}</span>
                    </label>
                ))}
            </div>
        </div>
    );
});

export default LanguagePreferences;
