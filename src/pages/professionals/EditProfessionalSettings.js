// src/pages/professionals/EditProfessionalSettings.jsx
import React, { useEffect, useState ,useRef} from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constans';
import api from '../../utils/api'
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../../styles/ProfessionalRegistration.module.css';
import PersonalInfoForm from '../../components/professionals/PersonalInfoForm';
import JobFieldsSelection from '../../components/professionals/JobFieldsSelection';
import AvailabilityForm from '../../components/professionals/AvailabilityForm';
import LanguagePreferences from '../../components/professionals/LanguagePreferences';
import WorkAreas from '../../components/professionals/WorkAreaSelection';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDirection } from "../../utils/generalUtils"; // Import getDirection
import useAuthCheck from '../../hooks/useAuthCheck';


function EditProfessionalSettings() 
{
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { translation } = useLanguage();
    const [location, setLocation] = useState({ address: '', lat: null, lon: null });
    const [domains, setDomains] = useState([]);
    const [availability24_7, setAvailability24_7] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('userLanguage') || 'he');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
   
    const [dayAvailability, setDayAvailability] = useState({
        0: { isWorking: false, start: '', end: '' },  // Sunday
        1: { isWorking: false, start: '', end: '' },  // Monday
        2: { isWorking: false, start: '', end: '' },  // Tuesday
        3: { isWorking: false, start: '', end: '' },  // Wednesday
        4: { isWorking: false, start: '', end: '' },  // Thursday
        5: { isWorking: false, start: '', end: '' },  // Friday
        6: { isWorking: false, start: '', end: '' }   // Saturday
    });
    const [image, setImage] = useState('/images/Prof/w.png');
    const [groupedLocations, setGroupedLocations] = useState([]);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [languages, setLanguages] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [selectedProfessionIds, setSelectedProfessionIds] = useState([]);
    const [workAreaSelections, setWorkAreaSelections] = useState([]);
    const [errors, setErrors] = useState({
        fullName: '', email: '', website: '', jobFields: '', workArea: '', dayAvailability: '', language: '', location: ''
    });

    // Refs for each field to scroll to them when needed
    const fullNameRef = useRef(null);
    const emailRef = useRef(null);
    const websiteRef = useRef(null);
    const jobFieldsRef = useRef(null);
    const workAreaRef = useRef(null);
    const dayAvailabilityRef = useRef(null);
    const languageRef = useRef(null);
    const locationRef = useRef(null);

    const { isAuthenticated, loading ,user} = useAuthCheck();

    const [isOnboarding, setIsOnboarding] = useState(false);
    const [onboardingData, setOnboardingData] = useState(null);

  




    const fetchLocations = async () => {
        try {
            const response = await axios.get(`${API_URL}/professionals/locations?lang=${selectedLanguage}`);
            let locationsData = response.data;
            
            setGroupedLocations(locationsData);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const fetchDomains = async () => {
        try {
            const response = await axios.get(`${API_URL}/${selectedLanguage}/domains`);
            setDomains(response.data);
        } catch (error) {
            console.error('Error fetching domains:', error);
        }
    };

    const fetchProfessionalData = async (profId) => {
        try {
            const response = await axios.get(`${API_URL}/professionals/prof-info/${profId}`, {
            });
            
            const data = response.data;

            setFullName(data.fname + ' ' + (data.lname || ''));
            setPhoneNumber(data.phoneNumber);
            setEmail(data.email);
            setWebsite(data.website);
            setBusinessName(data.businessName);
            setImage(data.image);
            setDayAvailability(data.dayAvailability || dayAvailability);
            setWorkAreaSelections(data.workAreas || []);
            setLocation(data.location || { address: 'not found', lat: null, lon: null });
            setAvailability24_7(data.availability24_7);
            setLanguages(data.languages || []);
            setSelectedProfessionIds(data.professions || []);
        } catch (error) {
            console.error('Error fetching professional data:', error);
        }
    };

   

    useEffect(() => {
        // Check for onboarding parameters
        const onboardingParam = searchParams.get('onboarding');
        if (onboardingParam) {
            try {
                const decodedData = JSON.parse(atob(onboardingParam));
                setOnboardingData(decodedData);
                setIsOnboarding(true);
              
            } catch (error) {
                console.error('Error decoding onboarding data:', error);
                navigate('/pro/enter');
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (loading) return;
        
        // Modified authentication check
        if (isAuthenticated || isOnboarding) {
            const fetchData = async () => {
                if (isOnboarding) {
                    await fetchProfessionalData(onboardingData.professionalId);
                } else {
                    await fetchProfessionalData(user.profId);
                }
                await fetchDomains();
                await fetchLocations();
            };
            fetchData();
        } else {
            navigate('/pro/enter');
        }
    }, [loading, isAuthenticated, isOnboarding, onboardingData]);
    
   
    if (loading || !translation) 
        {
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
            console.error("No valid ref found for scrolling");
        }
    
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const professionalId = isOnboarding ? onboardingData.professionalId : user.profId;
        if (!professionalId) {
            console.error("No professional ID found");
            return;
        }

        const professionalData = {
            professionalId,
            phoneNumber,
            fullName,
            email,
            website,
            businessName,
            image,
            availability24_7,
            dayAvailability: transformDayAvailabilityForBackend(dayAvailability),
            subProfessions: selectedProfessionIds,
            workAreas: workAreaSelections,
            languages,
            location,
            hasCompletedOnboarding: true // Set to true when form is submitted
        };

        setIsSubmitting(true);

        try {
            await api.put(`${API_URL}/professionals/update`, professionalData);
            
            if (isOnboarding) {
                // Handle onboarding completion
                // You might want to automatically sign in the user here
                // and then redirect to the request
                navigate(`/pro/requests/${onboardingData.requestId}`);
            } else {
                navigate('/pro/expert-interface');
            }
        } catch (error) {
            console.error('Error updating professional settings:', error);
        } finally {
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
                    <h1 className={styles['pro-form-title']}>{translation.editTitle}</h1>

                    {/* Render Reusable Components */}
                    <PersonalInfoForm
                        fullName={fullName}
                        setFullName={setFullName}
                        phoneNumber={phoneNumber}
                        email={email}
                        setEmail={setEmail}
                        website={website}
                        setWebsite={setWebsite}
                        businessName={businessName}
                        setBusinessName={setBusinessName}
                        image={image}
                        setImage={setImage}
                        setLocation={setLocation}  // Pass setLocation to enable editing
                        location={location}  // Log this to ensure it holds the expected value

                        errors={errors} // Pass error messages to PersonalInfoForm
                        refs={{ fullNameRef, emailRef, websiteRef, jobFieldsRef, workAreaRef, dayAvailabilityRef, languageRef,locationRef }} // Pass refs to PersonalInfoForm
                    />
                        <div className={styles["pro-separator"]}></div>

                    <JobFieldsSelection
                      domains={domains}
                      selectedProfessionIds={selectedProfessionIds}
                      setSelectedProfessionIds={setSelectedProfessionIds}
                      error={errors.jobFields}
                      ref={ jobFieldsRef }
                      language={selectedLanguage} // Pass the selected language as a prop

                    />

                        <div className={styles["pro-separator"]}></div>

                    <WorkAreas
                        groupedLocations={groupedLocations}


                        setWorkAreaSelections={setWorkAreaSelections}
                        workAreaSelections={workAreaSelections}
                        error={errors.workArea} // Pass the work area error message
                        ref={workAreaRef} // Attach the ref to this component
                    />
                        <div className={styles["pro-separator"]}></div>

                    <AvailabilityForm
                            availability24_7={availability24_7}
                            setAvailability24_7={setAvailability24_7}  // Pass setAvailability24_7 here to update state properly
                            dayAvailability={dayAvailability}
                            setDayAvailability={setDayAvailability}
                            language={selectedLanguage || 'he'} // Default to 'he' if no language selected
                            error={errors.dayAvailability}
                            ref={dayAvailabilityRef}
                    />

<div className={styles["pro-separator"]}></div>

                <LanguagePreferences
                 languages={languages} 
                 setLanguages={setLanguages}
                selectedLanguage={selectedLanguage || 'he'} 
                error={errors.language}
                ref={languageRef} // Attach the ref here

                  />

                    {/* Submit Button */}
                    <button className={styles['pro-continue-button']} onClick={handleSubmit}>
                        {translation.saveChangesButton}
                    </button>
                    {/* Show the spinner while submitting */}
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

export default EditProfessionalSettings;
