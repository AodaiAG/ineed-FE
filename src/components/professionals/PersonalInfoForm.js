import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from '../../styles/ProfessionalRegistration.module.css';
import LocationComponentPopup from './LocationComponentPopup';
import UploadImage from './UploadImage'; // Import the UploadImage component
import { API_URL } from '../../utils/constans';
import axios from 'axios';

function PersonalInfoForm({
    fullName, setFullName,
    phoneNumber,
    email, setEmail,
    website, setWebsite,
    businessName, setBusinessName,
    location, setLocation,
    image, setImage,
    errors,
    refs
}) {
    const { translation } = useLanguage();
    const { fullNameRef, emailRef, websiteRef, locationRef,jobFieldsRef } = refs;
    const [showLocationPopup, setShowLocationPopup] = useState(false);

    

    const handleWhatsAppClick = () => {
        const phoneNumber = '0504564232';
        const internationalPhoneNumber = `+972${phoneNumber}`;
        const message = encodeURIComponent(translation.customerSupportMessage);
        window.location.href = `https://wa.me/${internationalPhoneNumber}?text=${message}`;
    };

    const handleLocationInputClick = () => {
        setShowLocationPopup(true);
    };

    const handleFullNameChange = (e) => {
        const value = e.target.value;
        if (/^[\p{L}\s]*$/u.test(value)) {
            setFullName(value);
        }
    };

    const handleLocationSelect = (selectedLocation) => {
        setLocation({
            address: selectedLocation.address,
            lat: selectedLocation.lat,
            lon: selectedLocation.lon,
        });
        setShowLocationPopup(false);
    };

    if (!translation) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles['pro-form-group']}>
            {/* Full Name Input */}
            <label htmlFor="fullName" className={`${styles['pro-label']} ${styles['pro-label-required']}`}>
                {translation.fullNameLabel}
            </label>
            {errors.fullName && <p className={styles['pro-error']}>{errors.fullName}</p>}
            <input
                type="text"
                id="fullName"
                ref={fullNameRef}
                value={fullName}
                inputMode="text"
                onChange={handleFullNameChange}
                className={`${styles['pro-input']} ${styles['pro-input-white']} ${errors.fullName ? styles['pro-input-error'] : ''}`}
                placeholder={translation.fullNamePlaceholder}
            />

            <label htmlFor="phone" className={styles['pro-label']}>{translation.phoneLabel}</label>
            <input
                type="text"
                id="phone"
                value={phoneNumber}
                readOnly
                disabled
                className={`${styles['pro-input']} ${styles['pro-input-disabled']}`}
            />
            <p className={styles['pro-note']}>
                {translation.phoneNote} <a href="#" onClick={(e) => {
                    e.preventDefault();
                    handleWhatsAppClick();
                }}>{translation.contactLink}</a>
            </p>

            {/* Upload Image Component */}
            <UploadImage
                    initialImage={image}
                    onImageUpload={(uploadedImageUrl) => setImage(uploadedImageUrl)}
            />

            <label htmlFor="email" className={`${styles['pro-label']} ${styles['pro-label-required']}`}>
                {translation.emailLabel}
            </label>
            {errors.email && <p className={styles['pro-error']}>{errors.email}</p>}
            <input
                type="email"
                id="email"
                ref={emailRef}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${styles['pro-input']} ${styles['pro-input-white']} ${errors.email ? styles['pro-input-error'] : ''}`}
                placeholder={translation.emailPlaceholder}
            />

            <label htmlFor="website" className={styles['pro-label']}>{translation.websiteLabel}</label>
            {errors.website && <p className={styles['pro-error']}>{errors.website}</p>}
            <input
                type="text"
                id="website"
                ref={websiteRef}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={`${styles['pro-input']} ${styles['pro-input-white']} ${errors.website ? styles['pro-input-error'] : ''}`}
                placeholder={translation.websitePlaceholder}
            />

            <label htmlFor="businessName" className={styles['pro-label']}>{translation.businessNameLabel}</label>
            <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={`${styles['pro-input']} ${styles['pro-input-white']}`}
                placeholder={translation.businessNamePlaceholder}
            />

            <div id="location-section" ref={locationRef}>
                <label htmlFor="location" className={`${styles['pro-label']} ${styles['pro-label-required']}`}>
                    {translation.location.selectLocation}
                </label>
                {errors.location && <p className={styles['pro-error']}>{errors.location}</p>}
                <input
                    type="text"
                    id="location"
                    value={location?.address || ''}
                    readOnly
                    onClick={handleLocationInputClick}
                    className={`${styles['pro-input']} ${styles['pro-input-white']} ${errors.location ? styles['pro-input-error'] : ''}`}
                    placeholder={translation.location.locationPlaceholder}
                />
                {showLocationPopup && (
                    <LocationComponentPopup
                        onClose={() => setShowLocationPopup(false)}
                        onSelect={handleLocationSelect}
                        initialLocation={location}
                    />
                )}
            </div>

        </div>
    );
}

export default PersonalInfoForm;
