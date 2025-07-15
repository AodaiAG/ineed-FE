import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext'; // Import language context
import styles from '../../styles/SMSVerification.module.css'; // Import the scoped CSS module
import axios from 'axios';
import Cookies from 'js-cookie'; // Import js-cookie library
const CryptoJS = require('crypto-js');


import { API_URL } from '../../utils/constans'; // Assuming the URL is in constants
import api from '../../utils/api';
function SMSVerification() {
    const navigate = useNavigate();
    const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isError, setIsError] = useState(false);
    const [shake, setShake] = useState(false);
    const { translation } = useLanguage(); // Using the translation from the context

    const inputRefs = useRef([]);

    useEffect(() => {
        // Add a unique class to the body element for SMSVerification
        document.body.classList.add(styles.smsVerification_body);

        // Clean up by removing the unique class when the component is unmounted
        return () => {
            document.body.classList.remove(styles.smsVerification_body);
        };
    }, []);

    useEffect(() => {
        // Get the phone number from session storage
        const storedPhoneNumber = sessionStorage.getItem('professionalPhoneNumber');
        if (!storedPhoneNumber) {
            // Redirect back if no phone number found
            navigate('/pro/enter');
        } else {
            setPhoneNumber(storedPhoneNumber);
        }
    }, [navigate]);

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

    const handleVerification = async () => {
        const code = verificationCode.join('');
        if (code.length === 4) {
            try {
                const response = await api.post(`${API_URL}/professionals/verify-code`, {
                    phoneNumber,
                    code
                });
                if (response.data.success) {
                    if (response.data.data.registered) {
                        const accessToken = localStorage.getItem('accessToken');
                        const refreshToken = localStorage.getItem('refreshToken');
                        
                        console.log(' Access Token:', accessToken);
                        console.log(' Refresh Token:', refreshToken);
                        
                        // Get the return URL from sessionStorage
                        const returnUrl = sessionStorage.getItem('returnUrl');
                        // Clear the return URL from sessionStorage
                        sessionStorage.removeItem('returnUrl');
                        
                        // Navigate to the return URL if it exists, otherwise go to expert interface
                        navigate(returnUrl || '/pro/expert-interface');
                    } else {
                        navigate('/pro/register');
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
    const triggerErrorAnimation = () => {
        setIsError(true);
        setShake(true);
        setVerificationCode(['', '', '', '']);

        // Reset the shake animation after it's done
        setTimeout(() => {
            setShake(false);
        }, 500);
    };

    const handleBack = () => {
        navigate('/pro/enter'); // Redirect back to phone entry screen
    };

    if (!translation) {
        return <div>Loading...</div>; // Wait for translations to load
    }

    return (
        <div className={styles.smsVerification_container}>
            <div className={styles.smsVerification_content}>
                <h1 className={styles.smsVerification_validationTitle}>{translation.phoneValidationTitle}</h1>

                <div className={styles.smsVerification_phoneField}>
                    <label htmlFor="phone" className={styles.smsVerification_phoneLabel}>
                        {translation.phoneLabel}
                    </label>
                    <input
                        type="text"
                        id="smsVerification_phone"
                        value={phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                        readOnly
                        className={styles.smsVerification_phone}
                    />
                </div>

                <p className={styles.smsVerification_smsCodeLabel}>
                    {isError ? translation.wrongCodeMessage : translation.enterCodeMessage}
                </p>
                <div className={`${styles.smsVerification_smsCodeInput} ${shake ? styles.smsVerification_shake : ''}`}>
                    {verificationCode.map((digit, index) => (
                        <input
                            key={index}
                            type="tel"
                            ref={(el) => (inputRefs.current[index] = el)} // ✅ Store ref
                            maxLength="1"
                            className={`${styles.smsVerification_smsBox} ${isError ? styles.smsVerification_error : ''}`}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            inputMode="numeric"
                            pattern="\d*"
                            onFocus={(e) => e.target.select()} // ✅ Auto-select on focus
                        />
                    ))}
                </div>

                <div className={styles.smsVerification_actionButtons}>
                    <button className={styles.smsVerification_button} onClick={handleVerification}>
                        {isError ? translation.tryAgainButton : translation.okButton}
                    </button>
                    {isError && (
                        <button className={styles.smsVerification_button} onClick={handleBack}>
                            {translation.backButton}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SMSVerification;
