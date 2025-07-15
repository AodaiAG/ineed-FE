import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from '../styles/LanguageSelectionPopup.module.css';

function LanguageSelectionPopup({ onClose, backgroundColor = "#000" }) {
    const { language, setLanguage, translation } = useLanguage();

    // Handle language change
    const handleLanguageChange = (event) => {
        const selectedLanguage = event.target.value;
        setLanguage(selectedLanguage); // Update context with selected language
        localStorage.setItem('userLanguage', selectedLanguage); // Save to localStorage for persistence
        console.log(`Language changed to: ${selectedLanguage}`);
        onClose(); // Close the popup after language selection
    };

    return (
        <div className={styles.overlay}>
            <div
                className={styles.popupContainer}
                style={{ backgroundColor }} // Dynamically set the background color
            >
                {/* Close Button */}
                <button onClick={onClose} className={styles.closeButton}>
                    &times;
                </button>

                {/* Title */}
                <h2>{translation.interface_language_selection}</h2>

                {/* Icon under the title (decorative only) */}
                <div className={styles.popupLanguageIconContainer}>
                    <img
                        src="/images/Prof/languag01.png"
                        alt="Language Icon in Popup"
                        className={styles.popupLanguageIcon}
                    />
                </div>

                {/* Language Selection List */}
                <ul className={styles.languageList}>
                    {[
                        { id: 'he', label: 'עברית' },
                        //{ id: 'en', label: 'English' },
                        //{ id: 'ar', label: 'عربي' },
                    ].map((lang) => (
                        <li key={lang.id}>
                            <label>
                                {lang.label}
                                <input
                                    type="radio"
                                    name="language"
                                    value={lang.id}
                                    checked={language === lang.id}
                                    onChange={handleLanguageChange}
                                    className={styles.radioButton}
                                />
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default LanguageSelectionPopup;
