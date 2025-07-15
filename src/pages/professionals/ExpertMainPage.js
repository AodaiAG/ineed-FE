import React, { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "../../styles/ExpertMainPage.module.css";
import LanguageSelectionPopup from "../../components/LanguageSelectionPopup";
import Cookies from "js-cookie"; // Import js-cookie library
import { useLanguage } from "../../contexts/LanguageContext";
import api from '../../utils/api'
import useAuthCheck from '../../hooks/useAuthCheck';



function ExpertMainPage() {
  const navigate = useNavigate();
  const [isLanguagePopupOpen, setIsLanguagePopupOpen] = React.useState(false);
  const { translation } = useLanguage();
  const { isAuthenticated, loading ,user} = useAuthCheck();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
        navigate('/pro/expert-interface');
    } else {
        
    }
}, [loading, isAuthenticated, navigate]);

useEffect(() => {
  window.scrollTo(0, 0);
  document.body.classList.add(styles.expertPage_body);

  return () => {
      document.body.classList.remove(styles.expertPage_body);
  };
}, []);

// Show loading spinner while authentication is being verified
if (loading || !translation) {
  return (
      <div className={styles['spinner-overlay']}>
          <div className={styles['spinner']}></div>
      </div>
  );
}

 

  // Toggle the language selection popup
  const handleLanguageIconClick = () => {
    setIsLanguagePopupOpen((prev) => !prev);
  };

  // Handle navigation for "Let's Go" button
  const handleCTAClick = () => {
    navigate("/pro/explain");
  };

  

  return (
    <div className={styles.expertPage_mainContainer}>
      {/* Header container for Language Icon, Titles, and Expert Interface */}
      <div className={styles.expertPage_headerContainer}>
        {/* Trigger Language Selection Popup */}
        <div
          className={styles.expertPage_languageIcon}
          onClick={handleLanguageIconClick}
        >
          <img
            src="/images/Prof/languag01.png"
            alt={translation.languageIconAlt}
          />
        </div>

        {/* Main and Sub Titles */}
        <h1 className={styles.expertPage_mainTitle}>I Need</h1>
        <h2 className={styles.expertPage_subTitle}>{translation.subTitle}</h2>
        
        {/* Expert Interface Text */}
        <h3 className={styles.expertPage_expertInterface}>
          {translation.expertInterface}
        </h3>
      </div>

                  {/* Spacer to push footer to the bottom */}
                  <div className={styles.spacer}></div>

      {/* Worker Image */}
      <div className={styles.expertPage_imageContainer}>
        <img src="/images/Prof/w4.png" alt={translation.workerImageAlt} />
      </div>

                  {/* Spacer to push footer to the bottom */}
                  <div className={styles.spacer}></div>
      {/* "Let's Go" Button */}
      <button
        className={styles.expertPage_ctaButton}
        onClick={handleCTAClick}
      >
        {translation.letsGoButton}
      </button>

      {/* Language Selection Popup - only show when isLanguagePopupOpen is true */}
      {isLanguagePopupOpen && (
        <LanguageSelectionPopup onClose={() => setIsLanguagePopupOpen(false)} />
      )}
    </div>
  );
}

export default ExpertMainPage;
