import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import "../../styles/client/AboutForm.css"; // Add your custom CSS here
import { useNavigate } from "react-router-dom"; // For navigation
import { useLanguage } from "../../contexts/LanguageContext"; // Import useLanguage for translations
import { getDirection } from "../../utils/generalUtils"; // Import getDirection
import axios from "axios";
import { API_URL } from '../../utils/constans';

import { useMessage } from "../../contexts/MessageContext";


const AboutForm = () => {
  const { translation } = useLanguage(); // Access translations
  const navigate = useNavigate(); // Initialize navigation hook
  const { showMessage } = useMessage();

  const [selectedLanguage] = useState(
    localStorage.getItem("userLanguage") || "he"
  );

  // Initialize state with sessionStorage values or defaults
  const [fullName, setFullName] = useState(
    sessionStorage.getItem("fullName") || ""
  );
  const [phonePrefix, setPhonePrefix] = useState(
    sessionStorage.getItem("phonePrefix") || "054"
  );
  const [phoneNumber, setPhoneNumber] = useState(
    sessionStorage.getItem("phoneNumber") || ""
  );
  const [comment, setComment] = useState(
    sessionStorage.getItem("comment") || ""
  );

  useEffect(() => {
    const direction = getDirection(selectedLanguage); // Get the direction using the utility function
    document.documentElement.style.setProperty("--container-direction", direction);
  }, [selectedLanguage]);

  // Handle phone number input change
  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) setPhoneNumber(value); // Allow only numeric values
  };

  const handleSubmit = () => {
    // Validation: Ensure all fields are filled
    if (!fullName.trim() || !phoneNumber.trim() || !comment.trim()) {
      showMessage(translation.aboutForm.requiredFieldsError, "error"); // Display error message
      return;
    }
    const fullPhoneNumber = `${phonePrefix}${phoneNumber}`;
    // Validate Phone Number: Ensure exactly 7 digits
  if (phoneNumber.length !== 7) {
    showMessage("מספר הטלפון חייב להכיל בדיוק 7 ספרות.", "error"); // ✅ Error Message
    return;
  }
    // Save data to sessionStorage
    sessionStorage.setItem("fullName", fullName);
    sessionStorage.setItem("phonePrefix", phonePrefix);
    sessionStorage.setItem("phoneNumber", phoneNumber);
    sessionStorage.setItem("comment", comment);

    navigate("/summary");
  
    
  };

  if (!translation) {
    return (
      <div className={'spinner-overlay'}>
        <div className={'spinner'}></div>
      </div>
    );
  }

  return (
    <Box className="about-form-container">
      {/* Header */}
      <h2 className="about-form-title">{translation.aboutForm.title}</h2>

      {/* Full Name Field */}
      <Box className="about-form-field">
        <label>{translation.aboutForm.fullNameLabel}</label>
        <TextField
          value={fullName}
          onChange={(e) => {
            const value = e.target.value;
            // Allow only letters and spaces (any language) while typing
            const filteredValue = value.replace(/[\d!@#$%^&*()_+={}\[\]:;"'<>?,./\\|`~]/g, "");
            setFullName(filteredValue);
          }}
          placeholder={translation.aboutForm.fullNamePlaceholder}
          fullWidth
          className="about-form-input"
          required // Mark as required
        />
      </Box>

      {/* Phone Number Field */}
      <Box className="about-form-field phone-field">
        <label>{translation.aboutForm.phoneLabel}</label>
        <Box className="phone-number-container">
        <TextField
  value={phoneNumber}
  onChange={(e) => {
    const value = e.target.value;

    // Allow only numeric input
    if (/^\d*$/.test(value)) {
      setPhoneNumber(value);
    }
  }}
  placeholder={translation.aboutForm.phonePlaceholder}
  className="phone-number-input"
  fullWidth
  required
  inputProps={{
    maxLength: 7, // Enforce at most 7 characters
    pattern: "[0-9]*", // Allow only numeric input
  }}
/>

          <Select
            value={phonePrefix}
            onChange={(e) => setPhonePrefix(e.target.value)}
            className="phone-prefix-select"
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

            {/* Add more prefixes as needed */}
          </Select>
        </Box>
      </Box>

      {/* Comment Field */}
      <Box className="about-form-field">
        <label>{translation.aboutForm.commentLabel}</label>
        <TextField
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={translation.aboutForm.commentPlaceholder}
          fullWidth
          multiline
          rows={8}
          className="about-form-textarea"
          required // Mark as required
        />
      </Box>

      {/* Submit Button */}
      <Button
        variant="contained"
        className="about-form-submit"
        onClick={handleSubmit}
        sx={{
          borderRadius: "14px", // Apply border-radius
          fontSize: "1.6rem", // Medium font size
        }}
      >
        {translation.aboutForm.submitButton}
      </Button>
    </Box>
  );
};

export default AboutForm;
