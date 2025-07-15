import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from '../styles/OrientationHandler.module.css';

const OrientationHandler = ({ children }) => {
    const [isPortrait, setIsPortrait] = useState(true);
    const isMobileDevice = /iPhone|Android|Tablet/i.test(navigator.userAgent);
    const { translation } = useLanguage();

    const checkOrientation = () => {
        const portrait = window.matchMedia("(orientation: portrait)").matches || window.innerHeight > window.innerWidth;
        setIsPortrait(portrait);
    };

    useEffect(() => {
        if (isMobileDevice) {
            checkOrientation();
            window.addEventListener("resize", checkOrientation);
            window.addEventListener("orientationchange", checkOrientation);

            return () => {
                window.removeEventListener("resize", checkOrientation);
                window.removeEventListener("orientationchange", checkOrientation);
            };
        }
    }, [isMobileDevice]);

    if (!translation) {
        return <div>Loading...</div>; // Wait for translations to load
    }

    if (!isPortrait && isMobileDevice) {
        return (
            <div className={styles.orientationWarning}>
                {/* Top Arrow */}
                <img
                    src="/images/Prof/3.png"
                    alt="Rotate Up Arrow"
                    className={`${styles.rotateArrow} ${styles.topArrow}`}
                />

                {/* Title and Subtitle */}
                <h1 className={styles.orientationTitle}>I Need</h1>
                <h2 className={styles.orientationSubtitle}>{translation.orientationSubtitle}</h2>

                {/* Message */}
                <p className={styles.orientationMessage}>
                    {translation.rotateToUseMessage}
                </p>

                {/* Worker Image */}
                <img
                    src="/images/Prof/worker04.png"
                    alt="Worker Icon"
                    className={styles.orientationImage}
                />

                {/* Bottom Arrow */}
                <img
                    src="/images/Prof/2.png"
                    alt="Rotate Down Arrow"
                    className={`${styles.rotateArrow} ${styles.bottomArrow}`}
                />

                {/* Left Arrow */}
                <img
                    src="/images/Prof/1.png"
                    alt="Rotate Left Arrow"
                    className={`${styles.rotateArrow} ${styles.leftArrow}`}
                />

                {/* Right Arrow */}
                <img
                    src="/images/Prof/0.png"
                    alt="Rotate Right Arrow"
                    className={`${styles.rotateArrow} ${styles.rightArrow}`}
                />
            </div>
        );
    }

    return children;
};

export default OrientationHandler;
