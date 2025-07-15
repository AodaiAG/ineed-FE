import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./OnboardingLandingPage.module.css";

function OnboardingLandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [decodedData, setDecodedData] = useState(null);
  const [isValidId, setIsValidId] = useState(true);

  useEffect(() => {
    document.body.classList.add(styles.explainScreen_body);

    if (!id) {
      console.error("No ID parameter found in URL.");
      setIsValidId(false);
      return;
    }

    try {
      const decoded = atob(id);
      const parsed = JSON.parse(decoded);
      setDecodedData(parsed);
      console.log("Decoded Onboarding Data:", parsed);
    } catch (error) {
      console.error("Failed to decode or parse onboarding ID:", error);
      setIsValidId(false);
    }

    return () => {
      document.body.classList.remove(styles.explainScreen_body);
    };
  }, [id, navigate]);

  const handleContinueClick = () => {
    if (decodedData) {
      const encodedData = btoa(JSON.stringify(decodedData));
      navigate(`/pro/edit-settings?onboarding=${encodedData}`);
    } else {
      console.error("Decoded data is not available for navigation.");
    }
  };

  if (!isValidId) {
    return (
      <div className={`${styles.explainScreen_container} ${styles.errorContainer}`} style={{ direction: "rtl" }}>
        <p className={`${styles.explainScreen_greetingSection} ${styles.errorTitle}`}>404 - Not Found</p>
        <p className={styles.explainScreen_subtitle}>The onboarding link is invalid or missing information.</p>
      </div>
    );
  }

  if (!decodedData) {
    return (
      <div className={`${styles.explainScreen_container} ${styles.loadingContainer}`} style={{ direction: "rtl" }}>
        <p className={styles.explainScreen_greetingSection}>Loading onboarding information...</p>
      </div>
    );
  }

  return (
    <div className={styles.explainScreen_container} style={{ direction: "rtl" }}>
      <div className={styles.contentWrapper}>
        <div className={styles.explainScreen_greetingSection}>
          <p>ברוך הבא ל־I-NEED</p>
          <p>
            זיהינו שאתה בעל מקצוע איכותי ויש לקוח שמחפש עכשיו בדיוק את מה שאתה מציע.
          </p>
        </div>

        <div className={styles.explainScreen_whyUsSection}>
          <p>למה שווה לך להצטרף?</p>
          <ul className={styles.explainScreen_whyUsList}>
            <li>אין לידים – רק ללקוחות שמבקשים אותך</li>
            <li>מכרז שקוף בצ'אט – אתה מתמודד ומחליט</li>
            <li>הרשמה חינמית, בלי התחייבות</li>
            <li>כרטיס ביקור דיגיטלי – מתנה מאיתנו</li>
            <li>כדי לגשת לפנייה שמחכה לך:</li>
            <li>אשר את פרטיך</li>
            <li>בחר אזור עבודה ושעות פעילות</li>
            <li className={styles.explainScreen_noCheckmark}>בסיום – אתה באוויר, עם לקוח חדש ואפשרויות נוספות בהמשך.</li>
            <li className={styles.explainScreen_noCheckmark}>בוא נתחיל – זה לוקח פחות מדקה!</li>
          </ul>
        </div>
      </div>

      <div className={styles.spacer}></div>

      <div className={styles.explainScreen_characterSection}>
        <div className={styles.explainScreen_characterImageContainer}>
          <img
            src="/images/Prof/s2.png"
            alt="תמונה של בעל מקצוע"
            className={styles.explainScreen_characterImage}
          />
        </div>
        <button
          className={styles.explainScreen_continueButton}
          onClick={handleContinueClick}
        >
          המשך
        </button>
      </div>
    </div>
  );
}

export default OnboardingLandingPage;
