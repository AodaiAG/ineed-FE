import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "../../styles/ExplainScreen.module.css";
import { getDirection } from "../../utils/generalUtils";

function ExplainScreen() {
  const navigate = useNavigate();
  const { translation, language } = useLanguage();
  

  useEffect(() => {
    // Add a unique class to the body element for ExplainScreen
    document.body.classList.add(styles.explainScreen_body);

    // Clean up by removing the unique class when the component is unmounted
    return () => {
      document.body.classList.remove(styles.explainScreen_body);
    };
  }, []);

  // Handle the "Continue" button click
  const handleContinueClick = () => {
    navigate("/pro/enter");
  };

  if (!translation) {
    return <div>Loading...</div>; // Wait for translations to load
  }

  return (
    <div
      className={styles.explainScreen_container}
      style={{ direction: getDirection(language) }}
    >
      <div className={styles.contentWrapper}>
        {/* Greeting Text */}
        <div className={styles.explainScreen_greetingSection}>
          {Array.isArray(translation.greetingLine2) ? (
            translation.greetingLine2.map((line, index) => (
              <p key={index}>{line}</p>
            ))
          ) : (
            <p>{translation.greetingLine2}</p>
          )}
        </div>

        {/* Why Choose Us Section */}
        <div className={styles.explainScreen_whyUsSection}>
          <p>{translation.whyChooseUs}</p>
          <ul className={styles.explainScreen_whyUsList}>
            <li>{translation.whyPoint1}</li>
            <li>{translation.whyPoint2}</li>
          </ul>
        </div>

        {/* Footer Note */}
      </div>
      <div className={styles.spacer}></div>
      <div className={styles.explainScreen_characterSection}>
        <div className={styles.explainScreen_characterImageContainer}>
          <img
            src="/images/Prof/s2.png"
            alt={translation.professionalImageAlt}
            className={styles.explainScreen_characterImage}
          />
        </div>

        {/* Continue Button */}
        <button
          className={styles.explainScreen_continueButton}
          onClick={handleContinueClick}
        >
          {translation.continueButton}
        </button>
      </div>
    </div>
  );
}
//
export default ExplainScreen;
