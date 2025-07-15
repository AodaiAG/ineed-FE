import React, { useEffect, useState } from 'react';
import styles from '../../styles/NewUserPopup.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

function NewUserPopup({ onClose }) {
    const [countdown, setCountdown] = useState(30);
    const { translation } = useLanguage();  // Import translation here

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const autoClose = setTimeout(() => {
            onClose();
        }, 30000);

        return () => {
            clearInterval(timer);
            clearTimeout(autoClose);
        };
    }, [onClose]);

    const handleCloseClick = () => {
        onClose();
    };

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popupContainer}>
                <p className={styles.message}>
                    {translation.thankYouMessage || "תודה שנרשמת!"}
                </p>
                <p className={styles.subMessage}>
                    {translation.businessCardSent || "ממש עכשיו נשלך לך כרטיס ביקור"} <br />
                    {translation.startReceivingWork || "בקרוב תתחיל לקבל עבודה"}
                </p>
                <button className={styles.closeButton} onClick={handleCloseClick}>
                    {translation.close || "סגור"} ({countdown})
                </button>
            </div>
        </div>
    );
}

export default NewUserPopup;
