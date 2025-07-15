// src/pages/professionals/ProfessionalRegistration.jsx
import React, { useState, useEffect,useRef  } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/ProfessionalRegistration.module.css';
import { API_URL } from '../../utils/constans';
import PersonalInfoForm from '../../components/professionals/PersonalInfoForm';
import JobFieldsSelection from '../../components/professionals/JobFieldsSelection';
import { sendSms ,shortenUrl} from '../../utils/generalUtils';
import WorkAreas from '../../components/professionals/WorkAreaSelection';
import AvailabilityTimes from '../../components/professionals/AvailabilityForm';
import LanguagePreferences from '../../components/professionals/LanguagePreferences';
import { useLanguage } from '../../contexts/LanguageContext';
import Cookies from 'js-cookie'; // Import js-cookie
import api from '../../utils/api'
import { getDirection } from "../../utils/generalUtils"; // Import getDirection
import { useMessage } from "../../contexts/MessageContext";

import CryptoJS from 'crypto-js';
function ProfessionalRegistration() {

    
    const navigate = useNavigate();
    const [availability24_7, setAvailability24_7] = useState(false);
    const { translation } = useLanguage(); // Use translation from context
    const [location, setLocation] = useState({
        address: '',
        lat: null,
        lon: null,
      });
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showMessage } = useMessage();
    const [domains, setDomains] = useState([]); // Add this line to define the domains state
    const [selectedProfessionIds, setSelectedProfessionIds] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        return localStorage.getItem('userLanguage') || 'he';
    });
    const [image, setImage] = useState('/images/Prof/w.png');
    const [groupedLocations, setGroupedLocations] = useState([]);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [businessName, setBusinessName] = useState('');
 
    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        website: '',
        jobFields: '',
        workArea: '',
        dayAvailability: '',
        language: '',
        location:''
    });
    

    // Refs for each field to scroll to them when needed
    const fullNameRef = useRef(null);
    const emailRef = useRef(null);
    const websiteRef = useRef(null);
    const jobFieldsRef = useRef(null);
    const workAreaRef = useRef(null);
    const dayAvailabilityRef = useRef(null);
    const languageRef = useRef(null);
    const locationRef = useRef(null); // New ref for the location input


    
    // Updated state to store selected language IDs
    const [languages, setLanguages] = useState([]);
    const [dayAvailability, setDayAvailability] = useState({
        0: { isWorking: false, start: '', end: '' },  // Sunday
        1: { isWorking: false, start: '', end: '' },  // Monday
        2: { isWorking: false, start: '', end: '' },  // Tuesday
        3: { isWorking: false, start: '', end: '' },  // Wednesday
        4: { isWorking: false, start: '', end: '' },  // Thursday
        5: { isWorking: false, start: '', end: '' },  // Friday
        6: { isWorking: false, start: '', end: '' }   // Saturday
    });
    const [workAreaSelections, setWorkAreaSelections] = useState([]);
    const [isLoadingg, setIsLoadingg] = useState(true);

    const fetchDomains = async () => {
        try {
            const response = await axios.get(`${API_URL}/${selectedLanguage}/domains`);
            setDomains(response.data);
        } catch (error) {
            console.error('Error fetching domains:', error);
        }
    };
    const fetchLocations = async () => {
        try {
            const response = await axios.get(`${API_URL}/professionals/locations?lang=${selectedLanguage}`);
            let locationsData = response.data;
            setGroupedLocations(locationsData);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            setIsLoadingg(true);
            
            // Check session storage for phone number
            const storedPhoneNumber = sessionStorage.getItem('professionalPhoneNumber');
            if (storedPhoneNumber) {
                setPhoneNumber(storedPhoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'));
            }

            // Fetch domains and locations
            await Promise.all([fetchDomains(), fetchLocations()]);

            setIsLoadingg(false); // Loading complete
        };

        initializeData();
    }, []);



    useEffect(() => {
        
        fetchDomains();
 
        fetchLocations();
       
    }, [selectedLanguage]); // Dependency array to re-run effect when selectedLanguage changes

    
    const validateForm = () => {
        const newErrors = {};
        const errorRefs = []; // Collect refs of fields with errors
        let isValid = true;
    
        if (!fullName) {
            newErrors.fullName = translation.fullNameError || 'Please enter your full name.';
            if (fullNameRef && fullNameRef.current) errorRefs.push(fullNameRef);
            isValid = false;
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            newErrors.email = translation.emailError || 'Please enter a valid email address.';
            if (emailRef && emailRef.current) errorRefs.push(emailRef);
            isValid = false;
        }

    
        const websiteRegex = /^$|^[^\s]+\.[^\s]+$/;
        if (website && !websiteRegex.test(website)) {
            newErrors.website = translation.websiteError || 'Please enter a valid website (e.g., example.com) or leave it empty.';
            if (websiteRef && websiteRef.current) errorRefs.push(websiteRef);
            isValid = false;
        }
        if (!location.address) {
            newErrors.location = translation.location.locationError || 'Please enter your location.';
            if (locationRef && locationRef.current) errorRefs.push(locationRef);
            isValid = false;
        }
    
        if (selectedProfessionIds.length === 0) {
            newErrors.jobFields = translation.jobFieldsError || 'Please select at least one job field.';
            if (jobFieldsRef && jobFieldsRef.current) errorRefs.push(jobFieldsRef);
            isValid = false;
        }
    
        if (workAreaSelections.length === 0) {
            newErrors.workArea = translation.workAreaError || 'Please select at least one work area.';
            if (workAreaRef && workAreaRef.current) errorRefs.push(workAreaRef);
            isValid = false;
        }
    
        const isAnyDayAvailable = availability24_7 || Object.values(dayAvailability).some(day => day.isWorking);
        if (!isAnyDayAvailable) {
            newErrors.dayAvailability = translation.dayAvailabilityError || 'Please select at least one day you are available or choose Available 24/7.';
            if (dayAvailabilityRef && dayAvailabilityRef.current) errorRefs.push(dayAvailabilityRef);
            isValid = false;
        }
    
        const isAnyLanguageSelected = Object.values(languages).some(lang => lang);
        if (!isAnyLanguageSelected) {
            newErrors.language = translation.languageError || 'Please select at least one language.';
            if (languageRef && languageRef.current) errorRefs.push(languageRef);
            isValid = false;
        }
    

    
       
    
        setErrors(newErrors);
    
        // Scroll to the first field with an error
        if (errorRefs.length > 0 && errorRefs[0].current) {
            errorRefs[0].current.scrollIntoView({ behavior: 'smooth' });
        } else {
        }
    
        return isValid;
    };
    
    

    
    // New useEffect to fetch main professions whenever selectedDomain changes
    if (isLoadingg) {
        return (
            <div className={styles['spinner-overlay']}>
                <div className={styles['spinner']}></div>
            </div>
        );
    }
    
    const transformDayAvailabilityForBackend = (dayAvailability) => {
        return Object.entries(dayAvailability).map(([dayInt, data]) => ({
            day: parseInt(dayInt), // Numeric day value (0-6)
            isWorking: data.isWorking,
            start: data.start,
            end: data.end
        }));
    };
    

    // Handle form submission to save data
    const handleSubmit = async () => {
        if (!validateForm()) return;
    
        // Show the spinner when submission starts
        setIsSubmitting(true);
    
        const formattedPhoneNumber = phoneNumber.replace(/-/g, '');
        const professionalData = {
            phoneNumber: formattedPhoneNumber, // Use formatted phone number without dashes
            fullName,
            email,
            website,
            businessName,
            image,
            availability24_7,
            dayAvailability: transformDayAvailabilityForBackend(dayAvailability),
            professions: selectedProfessionIds, // Store only the IDs of selected professions
            workAreas: workAreaSelections, // Store only the IDs of selected work areas (cities)
            languages, // Use numeric language IDs
            location, // Add the location JSON object
        };
    
        try {
            console.log('Calling the register api')
            await api.post('/api/professionals/register', professionalData);
            console.log('got back from calling the register api')
            showMessage("ההרשמה בוצעה בהצלחה!", "success"); // ✅ Success Message

            navigate('/pro/expert-interface');
        } catch (error) {
            alert('how did you get here bro ?');
        } finally {
            // Hide the spinner when the submission is done
            setIsSubmitting(false);
        }
    };
    

    return (
        <div className={styles['pro-body']}>
            <div className={styles['pro-container']}
             style={{ direction: getDirection(selectedLanguage) }}
            >
                <div className={styles['pro-content']}>
                    {/* Form Title */}
                    <h1 className={styles['pro-form-title']}>{translation?.aboutYouLabel}</h1>

                    {/* Personal Information */}
                    <PersonalInfoForm
                        fullName={fullName}
                        setFullName={setFullName}
                        phoneNumber={phoneNumber}
                        setPhoneNumber={setPhoneNumber}
                        email={email}
                        setEmail={setEmail}
                        website={website}
                        setWebsite={setWebsite}
                        businessName={businessName}
                        setBusinessName={setBusinessName}
                        image={image}
                        setImage={setImage}
                        location={location} // Pass location to PersonalInfoForm
                        setLocation={setLocation} // Pass setLocation to PersonalInfoForm

                        errors={errors} // Pass error messages to PersonalInfoForm
                        refs={{
                            fullNameRef,
                            emailRef,
                            websiteRef,
                            jobFieldsRef,
                            workAreaRef,
                            dayAvailabilityRef,
                            languageRef,
                            locationRef // Pass this ref
                        }}                    />
                        <div className={styles["pro-separator"]}></div>

                    {/* Job Fields Section */}
                    <JobFieldsSelection
                      domains={domains}
                      selectedProfessionIds={selectedProfessionIds}
                      setSelectedProfessionIds={setSelectedProfessionIds}
                      error={errors.jobFields}
                      language={selectedLanguage} // Pass the selected language as a prop
                      ref={ jobFieldsRef }
                    />
                                            <div className={styles["pro-separator"]}></div>

                    {/* Work Areas Section */}
                    <WorkAreas
                        groupedLocations={groupedLocations}
                        setWorkAreaSelections={setWorkAreaSelections}
                        workAreaSelections={workAreaSelections}
                        error={errors.workArea} // Pass the work area error message
                        ref={workAreaRef} // Attach the ref to this component

                    />
                        <div className={styles["pro-separator"]}></div>

                    {/* Availability Times Section */}
                    <AvailabilityTimes
                        availability24_7={availability24_7}
                        setAvailability24_7={setAvailability24_7}  // Pass setAvailability24_7 here
                        dayAvailability={dayAvailability}
                        setDayAvailability={setDayAvailability}
                        language={selectedLanguage || 'he'} // Default to 'he' if no language selected
                        error={errors.dayAvailability}
                        ref={dayAvailabilityRef}
                    />
                        <div className={styles["pro-separator"]}></div>

                    {/* Language Preferences Section */}
                    <LanguagePreferences
                      languages={languages}
                      setLanguages={setLanguages}
                      error={errors.language}
                      ref={languageRef} // Attach the ref here
                       />

                    {/* Continue Button */}
                    <button className={styles['pro-continue-button']} onClick={handleSubmit}>{translation?.continueLabel || 'המשך'}</button>
                    {isSubmitting && (
                    <div className={styles['spinner-overlay']}>
                        <div className={styles['spinner']}></div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}

export default ProfessionalRegistration;
