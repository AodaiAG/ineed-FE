import React, { useState, useEffect,useRef } from 'react';
import { Button, Box, TextField } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext'; // Import language context
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router
import api from '../../utils/clientApi'; // Assuming you've set up an API utility for axios
import styles from '../../styles/client/ClientSMSVerification.module.css'; // Import the scoped CSS module
import { API_URL } from '../../utils/constans';


const SMSVerification = () => {
  const { translation } = useLanguage(); // Using the translation from the context
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isError, setIsError] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Fetch phone number from sessionStorage on component mount
  useEffect(() => {

    const storedPhoneNumber =  `${sessionStorage.getItem('phonePrefix')}${sessionStorage.getItem('phoneNumber')}`;

    if (storedPhoneNumber) {
      setPhoneNumber(storedPhoneNumber);
    }
  }, []);

  const handleInputChange = (index, value) => {
    // **Allow only single-digit numbers**
    if (/^\d$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // ✅ Move focus to the next input if available
      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    } 
    // **Handle backspace: Move to previous input when empty**
    else if (value === '') {
      const newCode = [...verificationCode];
      newCode[index] = '';
      setVerificationCode(newCode);

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };
  
  

  const triggerErrorAnimation = () => {
    setIsError(true);
    setShake(true);
    setVerificationCode(['', '', '', '']); // Clear all inputs

    // Reset the shaking animation after it completes
    setTimeout(() => {
      setShake(false);
    }, 500);
  };

  const handleVerification = async () => {
    const code = verificationCode.join('');
    if (code.length === 4) {
      try {
        const response = await api.post(`${API_URL}/verify-code`, {
          phoneNumber,
          code,
        });
  
        if (response.data.success) {
          const shouldSaveRequest = sessionStorage.getItem("saveRequest") === "true";
          const clientId = response.data.data.clientId;
          const fullName = sessionStorage.getItem("fullName") || "Unknown";
  
          // If client is already registered, just navigate to dashboard
          if (response.data.data.registered) {
            if (shouldSaveRequest && clientId) {
              const requestDetails = {
                jobRequiredId: JSON.parse(sessionStorage.getItem("subProfession"))?.id,
                city: sessionStorage.getItem("city"),
                date: sessionStorage.getItem("date"),
                comment: sessionStorage.getItem("comment") || "",
              };
              
              requestDetails.clientId = clientId;
  
              try {
                const submitRequestResponse = await api.post(`${API_URL}/submit_client_request`, requestDetails);
  
                if (submitRequestResponse.data.success) {
                  console.log("Request submitted successfully for registered user!");
                  console.log("Notified professionals:", submitRequestResponse.data.data.notifiedProfessionals);
                  navigate('/dashboard');
                } else {
                  console.error("Failed to submit client request:", submitRequestResponse.data);
                  alert(translation.failedToSubmitRequestMessage || "Failed to submit request.");
                }
              } catch (error) {
                console.error("Error submitting request for registered user:", error);
                alert(translation.generalErrorMessage || "An error occurred. Please try again.");
              }
            } else {
              // If no request to save, just navigate to dashboard
              navigate('/dashboard');
            }
            return;
          }
  
          // If client is not registered, save the client first
          try {
            const saveClientResponse = await api.post(`${API_URL}/save_client`, {
              phoneNumber,
              fullName,
            });
  
            if (saveClientResponse.data.success) {
              const newClientId = saveClientResponse.data.clientId;
  
              if (!newClientId) {
                console.error("No clientId returned after client registration.");
                alert(translation.failedToSaveClientMessage || "Failed to save client.");
                return;
              }
  
              if (shouldSaveRequest) {
                const requestDetails = {
                  clientId: newClientId,
                  jobRequiredId: JSON.parse(sessionStorage.getItem("subProfession"))?.id,
                  city: sessionStorage.getItem("city"),
                  date: sessionStorage.getItem("date"),
                  comment: sessionStorage.getItem("comment") || "",
                };
  
                const submitRequestResponse = await api.post(`${API_URL}/submit_client_request`, requestDetails);
  
                if (submitRequestResponse.data.success) {
                  console.log("Request submitted successfully after client registration!");
                  console.log("Notified professionals:", submitRequestResponse.data.data.notifiedProfessionals);
                  navigate('/dashboard');
                } else {
                  console.error("Failed to submit client request after registration:", submitRequestResponse.data);
                  alert(translation.failedToSubmitRequestMessage || "Failed to submit request.");
                }
              } else {
                // If no request to save, just navigate to dashboard
                navigate('/dashboard');
              }
            } else {
              console.error("Failed to save client:", saveClientResponse.data);
              alert(translation.failedToSaveClientMessage || "Failed to save client.");
            }
          } catch (error) {
            console.error("Error saving client or submitting request:", error);
            alert(translation.generalErrorMessage || "An error occurred. Please try again.");
          }
        } else {
          triggerErrorAnimation();
        }
      } catch (error) {
        console.error('Verification failed:', error);
        triggerErrorAnimation();
      }
    } else {
      triggerErrorAnimation();
    }
  };
  
  
  

  return (
    <Box className={styles.smsClientVerification_container}>
      <Box className={styles.smsClientVerification_content}>
        <h1 className={styles.smsClientVerification_validationTitle}>
          {translation?.phoneValidationTitle || 'רק נוודא שזה אתה'}
        </h1>

        <Box className={styles.smsClientVerification_phoneField}>
          <label className={styles.smsClientVerification_phoneLabel}>
            {translation?.phoneLabel || 'טלפון:'}
          </label>
          <TextField
            value={phoneNumber}
            variant="outlined"
            fullWidth
            className={styles.smsClientVerification_phone}
            InputProps={{
              readOnly: true,
              style: {
                textAlign: 'center',
                backgroundColor: '#979797',
                borderRadius: '8px',
                color: '#fff',
              },
            }}
          />
        </Box>

        <p className={styles.smsClientVerification_smsCodeLabel}>
          {isError
            ? translation?.wrongCodeMessage || 'הקוד שהכנסת שגוי, נסה שוב'
            :  'הכנס את הקוד שקיבלת '}
        </p>

        <Box
          className={`${styles.smsClientVerification_smsCodeInput} ${
            shake ? styles.smsClientVerification_shake : ''
          }`}
        >
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              type="tel"
              ref={(el) => (inputRefs.current[index] = el)} // ✅ Set ref for each input
              id={`code-${index}`} // ✅ Unique ID
              maxLength="1"
              className={`${styles.smsClientVerification_smsBox} ${
                isError ? styles.smsClientVerification_error : ''
              }`}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              inputMode="numeric"
              pattern="\d*"
              onFocus={(e) => e.target.select()} // ✅ Auto-select on focus
            />
          ))}
        </Box>



        

        <Box className={styles.smsClientVerification_actionButtons}>
          <Button
            variant="contained"
            onClick={handleVerification}
            className={styles.smsClientVerification_button}
            sx={{
              borderRadius: '14px', // Apply border-radius
              fontSize: '1.6rem', // Medium font size
            }}
          >
            {isError
              ? translation?.tryAgainButton || 'נסה שוב'
              : translation?.okButton || 'אישור'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SMSVerification;
