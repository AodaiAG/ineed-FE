import React, { useState } from "react";
import { Box, Button, TextField, Typography, Select, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../styles/client/SignInPage.module.css";
import { useLanguage } from "../../contexts/LanguageContext"; // Import useLanguage for translations
import { useMessage } from "../../contexts/MessageContext";


import { API_URL } from '../../utils/constans';

const SignInPage = () => {
  const { translation } = useLanguage(); // Access translations

  const [countryCode, setCountryCode] = useState("052");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSending, setIsSending] = useState(false); // State to handle loading state
  const navigate = useNavigate();
  const {  showMessage } = useMessage();

  const handleCountryCodeChange = (event) => {
    setCountryCode(event.target.value);
  };

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleSignIn = async () => {
    if (phoneNumber.length !== 7) {
      showMessage("מספר הטלפון חייב להכיל בדיוק 7 ספרות", "error");
      return;
    }
  
    try {
      setIsSending(true);
      
      // Save phone number and country code to sessionStorage
      sessionStorage.setItem("phonePrefix", countryCode);
      sessionStorage.setItem("phoneNumber", phoneNumber);
  
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      console.log("Full Phone Number:", fullPhoneNumber);
  
      // Send SMS via API
      const response = await axios.post(`${API_URL}/professionals/send-sms`, {
        phoneNumber: fullPhoneNumber,
        message: translation.verificationCodeMessage + " {code}",
      });
  
      if (response.data.success) {
        // Show the Hebrew message based on delivery type
        showMessage(response.data.hebrewMessage, "success");
        // Navigate to the SMS verification page
        navigate("/sms");
      } else {
        showMessage("שליחת ההודעה נכשלה. נסה שוב.", "error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showMessage("שליחת ההודעה נכשלה. נסה שוב.", "error");
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Box className={styles.container}>
      <section className={styles.mainSection}>
        {/* Main Title */}
        <Typography variant="h3" className={styles.mainTitle}>
          I Need
        </Typography>
  
        {/* Subtitle */}
        <Typography variant="h6" className={styles.subtitle}>
          כל המומחים במקום אחד
        </Typography>
  
        {/* Enter Title */}
        <Typography variant="h5" className={styles.enterTitle}>
          כניסה למערכת
        </Typography>
  
        {/* Phone Input Section */}
        <Box className={styles.phoneInputSection}>
          {/* Country Code Select */}
          <Select
            value={countryCode}
            onChange={handleCountryCodeChange}
            className={styles.countryCodeSelect}
          >
            <MenuItem value="050">050</MenuItem>
            <MenuItem value="051">051</MenuItem>
            <MenuItem value="052">052</MenuItem>
            <MenuItem value="053">053</MenuItem>
            <MenuItem value="054">054</MenuItem>
            <MenuItem value="055">055</MenuItem>
            <MenuItem value="056">056</MenuItem>
            <MenuItem value="057">057</MenuItem>
            <MenuItem value="058">058</MenuItem>
            <MenuItem value="059">059</MenuItem>
          </Select>
  
          {/* Phone Number Input */}
          <TextField
            type="tel" 
 
  value={phoneNumber}
  onChange={handlePhoneNumberChange}
  onInput={(e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }}
  placeholder="123 4567"
  className={styles.phoneNumberInput}
  inputProps={{
    maxLength: 7,
    minLength: 7,
    pattern: "[0-9]{7}",
  }}
/>

        </Box>
  
        {/* Terms Agreement */}
        <Typography variant="body2" className={styles.termsText}>
          בלחיצה על המשך אני מסכים{" "}
          <a
            href="https://i-need.co.il/lic/eula.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.termsLink}
          >
            לתנאים
          </a>
        </Typography>
      </section>
  
      <div className={styles.spacer}></div>
  
      <section className={styles.illustrationSection}>
        {/* Worker Image */}
        <Box className={styles.workerImageContainer}>
          <img
            src="/images/home.png"
            alt="Worker"
            className={styles.workerImage}
          />
        </Box>
  
        {/* Sign-In Button */}
        <Button
          variant="contained"
          className={styles.enterButton}
          onClick={handleSignIn}
          disabled={isSending}
          sx={{
            borderRadius: "14px", // Apply border-radius
            fontSize: "1.6rem", // Medium font size
          }}
        >
          {isSending ? "שולח..." : "כניסה"}
        </Button>
      </section>
    </Box>
  );
}  

export default SignInPage;
