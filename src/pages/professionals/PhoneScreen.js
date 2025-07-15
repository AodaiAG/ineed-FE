import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "../../styles/PhoneScreen.module.css";
import "remixicon/fonts/remixicon.css";
import { sendSms } from "../../utils/generalUtils";
import {API_URL} from  "../../utils/constans";
import axios from "axios";
import { useMessage } from "../../contexts/MessageContext";

function PhoneScreen() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("052");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { translation } = useLanguage();
  const { showMessage } = useMessage();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add(styles.phoneScreen_body);

    return () => {
        document.body.classList.remove(styles.phoneScreen_body);
    };
}, []);
  

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) setPhoneNumber(value);
  };

  const handleCountryCodeChange = (code) => {
    setCountryCode(code);
    setIsDropdownOpen(false);
  };

  const handleEnterClick = async () => {
    if (phoneNumber.trim() !== "" && phoneNumber.length === 7) {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      sessionStorage.setItem("professionalPhoneNumber", fullPhoneNumber);
  
      try {
        const response = await axios.post(`${API_URL}/professionals/send-sms`, {
          phoneNumber: fullPhoneNumber,
          message: translation.verificationCodeMessage + " {code}",
        });

        if (response.data.success) {
          // Show the Hebrew message based on delivery type
          showMessage(response.data.hebrewMessage, "success");
          navigate("/pro/sms-verification");
        } else {
          showMessage("שליחת ההודעה נכשלה. נסה שוב.", "error");
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        showMessage("שליחת ההודעה נכשלה. נסה שוב.", "error");
      }
    } else if (phoneNumber.length !== 7 && phoneNumber.length !== 0) {
      showMessage(translation.phoneNumberLengthMessage || "מספר הטלפון חייב להכיל בדיוק 7 ספרות.", "error");
    } else {
      showMessage(translation.enterPhoneNumberMessage || "אנא הזן את מספר הטלפון שלך.", "error");
    }
  };
  
  

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const countryCodes = [
    "050",
    "051",
    "052",
    "053",
    "054",
    "055",
    "056",
    "057",
    "058",
    "059",
  ];

  if (!translation) return <div>Loading...</div>;

  return (
    <div className={styles.phoneScreen_container}>
      
        <section className={styles.phoneScreen_mainSection}>
          <h1 className={styles.phoneScreen_mainTitle}>
            {translation.mainTitle}
          </h1>
          <p className={styles.phoneScreen_subtitle}>{translation.subtitle}</p>
          <h2 className={styles.phoneScreen_enterTitle}>
            {translation.enterTitle}
          </h2>

          <div className={styles.phoneScreen_phoneInputSection}>
            <label
              htmlFor="country-code"
              className={styles.phoneScreen_hiddenLabel}
            >
              {translation.countryCodeLabel}
            </label>
            <div className={styles.phoneScreen_customDropdown}>
              <div
                className={styles.phoneScreen_countryCode}
                onClick={toggleDropdown}
              >
                <span>{countryCode}</span>
                <i
                  className={`ri-arrow-down-s-fill ${styles.phoneScreen_dropdownIcon}`}
                />
              </div>

              {isDropdownOpen && (
                <ul className={styles.phoneScreen_dropdownMenu}>
                  {countryCodes.map((code) => (
                    <li
                      key={code}
                      onClick={() => handleCountryCodeChange(code)}
                      className={styles.phoneScreen_dropdownItem}
                    >
                      {code}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label
              htmlFor="phone-number"
              className={styles.phoneScreen_hiddenLabel}
            >
              {translation.phoneNumberLabel}
            </label>
            <input
              type="tel"
              id="phone-number"
              className={styles.phoneScreen_phoneNumber}
              placeholder={translation.phoneNumberPlaceholder}
              value={phoneNumber}
              maxLength="7"
              minLength="7"   // Enforce at least 7 characters

              pattern="[0-9]*"
              required   
              onChange={handlePhoneNumberChange}
            />
          </div>

          <p className={styles.phoneScreen_termsText}>
            {translation.termsText}{" "}
            <a href="https://i-need.co.il/lic/eula.pdf" target="_blank" rel="noopener noreferrer" className={styles.phoneScreen_termsLink}>
            {translation.termsLink}
            </a>
          </p>
        </section>
        <div className={styles.spacer}></div>
        <section className={styles.phoneScreen_illustrationSection}>
          <div className={styles.phoneScreen_illustration}>
            <img
              src="/images/Prof/worker.png"
              alt={translation.workerImageAlt}
            />
          </div>

          <button
            className={styles.phoneScreen_enterButton}
            onClick={handleEnterClick}
          >
            {translation.enterButton}
          </button>
        </section>
    </div>
  );
}

export default PhoneScreen;
