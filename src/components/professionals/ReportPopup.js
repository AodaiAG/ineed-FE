import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constans';
import styles from '../../styles/ReportPopupForm.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

const ReportPopupForm = ({ onClose, onSubmit, domains, language }) => {
    const [selectedDomain, setSelectedDomain] = useState('');
    const [isMissingChecked, setIsMissingChecked] = useState(false);
    const [mainProfessionOptions, setMainProfessionOptions] = useState([]);
    const [selectedMainProfession, setSelectedMainProfession] = useState('');
    const [missingProfession, setMissingProfession] = useState('');
    const [additionalSubProfession, setAdditionalSubProfession] = useState('');
    const { translation } = useLanguage();

    const fetchMainProfessionsPopup = async (domain) => {
        try {
            const response = await axios.get(`${API_URL}/${language}/main-professions?domain=${domain}`);
            const data = response.data;
            if (Array.isArray(data)) {
                return data.map(profession => profession.main);
            } else {
                console.error('Expected array response for main professions, received:', data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching main professions:', error);
            return [];
        }
    };

    useEffect(() => {
        if (selectedDomain) {
            const fetchProfessions = async () => {
                const professions = await fetchMainProfessionsPopup(selectedDomain);
                setMainProfessionOptions(professions || []);
            };
            fetchProfessions();
        } else {
            setMainProfessionOptions([]);
        }
    }, [selectedDomain]);

    const handleSend = async () => {
        const missingFields = [];
    
        // Check for required fields
        if (!selectedDomain) {
            missingFields.push(translation.domainError || 'Please select a domain.');
        }
        if (isMissingChecked && !missingProfession) {
            missingFields.push(translation.missingProfessionError || 'Please enter the missing profession.');
        } else if (!isMissingChecked && !selectedMainProfession) {
            missingFields.push(translation.mainProfessionError || 'Please select a main profession.');
        }
    
        // Check for additional sub-profession if a main profession is selected
        if (!isMissingChecked && selectedMainProfession && !additionalSubProfession) {
            missingFields.push(translation.subProfessionError || 'Please enter a sub-profession.');
        }
    
        // Show alert if any required fields are missing
        if (missingFields.length > 0) {
            alert(missingFields.join('\n'));
            return;
        }
    
        const reportData = {
            domain: selectedDomain,
            isMissing: isMissingChecked,
            mainProfession: isMissingChecked ? missingProfession : selectedMainProfession,
            additionalSubProfession,
        };
    
        try {
            const response = await axios.post(`${API_URL}/professionals/report-missing-profession`, reportData);
            
            if (response.data.success) {
                onClose();
            } else {
                console.error("Failed to submit report:", response.data.message);
            }
        } catch (error) {
            console.error("Error submitting report:", error);
        }
    };
    

    if (!translation) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className={styles.overlay}>
            <div className={styles.reportPopupContainer}>
                <button className={styles.closeButton} onClick={onClose}>×</button>
                <h1 className={styles.reportPopupTitle}>{translation.popupTitle}</h1>
                <h2 className={styles.reportPopupSubtitle}>{translation.popupSubtitle}</h2>

                {/* Domain Select with Placeholder */}
                <div className={styles.reportFormGroup}>
                    <select
                        id="category-select"
                        className={styles.reportSelectField}
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                    >
                        <option value="" disabled>{translation.selectDomain}</option>
                        {domains.map((domain) => (
                            <option key={domain} value={domain}>{domain}</option>
                        ))}
                    </select>
                </div>

                {/* Missing Checkbox with Sub-Category (Main Profession) Select */}
                <div className={styles.reportFormGroup}>
                    <label className={styles.reportCheckboxContainer}>
                        <input
                            type="checkbox"
                            checked={isMissingChecked}
                            onChange={(e) => setIsMissingChecked(e.target.checked)}
                        />
                        {translation.missingCheckbox}
                    </label>
                    <div className={styles.reportSelectWrapper}>
                        {isMissingChecked ? (
                            <input
                                type="text"
                                className={styles.reportInputField}
                                placeholder={translation.enterMissingProfession}
                                value={missingProfession}
                                onChange={(e) => setMissingProfession(e.target.value)}
                            />
                        ) : (
                            <select
                                id="sub-category-select"
                                className={`${styles.reportSelectField} ${!selectedDomain ? styles.reportPlaceholder : ''}`}
                                value={selectedMainProfession}
                                onChange={(e) => setSelectedMainProfession(e.target.value)}
                                disabled={!selectedDomain || isMissingChecked}
                            >
                                <option value="" disabled>
                                    {selectedDomain ? translation.selectProfession : translation.selectDomainFirst}
                                </option>
                                {mainProfessionOptions.map((profession) => (
                                    <option key={profession} value={profession}>{profession}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Additional Missing Sub-Profession Input */}
                <div className={styles.reportFormGroup}>
                    <input
                        type="text"
                        id="additional-sub-profession"
                        className={styles.reportInputField}
                        placeholder={translation.enterAdditionalSubProfession}
                        value={additionalSubProfession}
                        onChange={(e) => setAdditionalSubProfession(e.target.value)}
                    />
                </div>

                {/* Buttons */}
                <div className={styles.reportButtonsContainer}>
                    <button className={styles.reportBtnSend} onClick={handleSend}>
                        {translation.send}
                    </button>
                    <button className={styles.reportBtnBack} onClick={onClose}>
                        {translation.back}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportPopupForm;
