import React, { useEffect, useState ,useRef} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/constans';
import { useLanguage } from '../../contexts/LanguageContext';
import { QRCodeCanvas } from 'qrcode.react';


import styles from '../../styles/BusinessCard.module.css';

function BusinessCard() {
    const [professional, setProfessional] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const id = searchParams.get('id');
    const { translation } = useLanguage();
    const [showQrModal, setShowQrModal] = useState(false);
    const qrRef = useRef(); // Reference for QRCodeCanvas




    useEffect(() => {
        // Add a unique class to the body element for BusinessCard
        document.body.classList.add(styles.businessCard_body);

        const fetchProfessional = async () => {
            try {
                const response = await axios.get(`${API_URL}/professionals/prof-info/${id}`);
                const data = response.data;
                setProfessional(data);
            } catch (error) {
                console.error('Error fetching professional data:', error);
            }
        };

        if (id) {
            fetchProfessional();
        }

       

        // Clean up by removing the unique class when the component is unmounted
        return () => {
            document.body.classList.remove(styles.businessCard_body);
        };
    }, [id]);

    if (!professional) {
        return <div>Loading...</div>;
    }
    if (!translation) {
        return <div>Loading...</div>;
    }
    const handleQrClick = () => {
        setShowQrModal(true); // Show QR code modal
    };

    const handleCloseQrModal = () => {
        setShowQrModal(false); // Hide QR code modal
    };

    const handleExplainClick = () => {
        navigate('/pro/explain');
    };

    const handleWebsiteClick = () => {
        let websiteUrl = professional.website;
    
        // Ensure the URL starts with "http://" or "https://"
        if (!/^https?:\/\//i.test(websiteUrl)) {
            websiteUrl = `http://${websiteUrl}`;
        }
    
        window.open(websiteUrl, '_blank');
    };

    const handlePhoneClick = () => {
        // Use window.location.href to directly prompt the dialer without opening a new tab
        window.location.href = `tel:${professional.phoneNumber}`;
    };
    const handleShareClick = () => {
        const shareData = {
            title: `${professional.fname} ${professional.lname}'s Business Card`,
            text: `Check out ${professional.fname} ${professional.lname}'s business card on I Need.`,
            url: window.location.href // Get the current page URL
        };
    
        if (navigator.share) {
            navigator.share(shareData)
                .then(() => console.log('Successfully shared'))
                .catch((error) => console.error('Error sharing:', error));
        } else {
            // Fallback: copy link to clipboard if Web Share API isn't supported
            navigator.clipboard.writeText(shareData.url)
                .then(() => alert('Link copied to clipboard!'))
                .catch((error) => console.error('Error copying link:', error));
        }
    };
    
    const handleWhatsAppClick = () => {
        // Remove non-digit characters and add the country code if needed
        const cleanedPhoneNumber = professional.phoneNumber.replace(/\D/g, '');
    
        // Assuming the numbers are from Israel, prepend the country code (+972)
        const internationalPhoneNumber = cleanedPhoneNumber.startsWith('0')
            ? `+972${cleanedPhoneNumber.substring(1)}`
            : `+972${cleanedPhoneNumber}`;
    
        // Define the message you want to send
        const message = encodeURIComponent('hi ya prof , ma neshmaaaaaaaaa');
    
        // Redirect to WhatsApp without opening a new tab
        window.location.href = `https://wa.me/${internationalPhoneNumber}?text=${''}`;
    };
    const handleEmailClick = () => {
        window.open(`mailto:${professional.email}`);
    };

    const handleAddToHomeClick = () => {
        const vCardUrl = `${API_URL}/professionals/vcard/${professional.id}`;
        window.open(vCardUrl, '_blank');
    };
    
    
    const handleDownloadQrCode = () => {
        const canvas = qrRef.current.querySelector('canvas');
        const qrImageUrl = canvas.toDataURL('image/png');
        
        // Create a link to download the image
        const link = document.createElement('a');
        link.href = qrImageUrl;
        link.download = `business_card_qr.png`;
        link.click();
    };

    const handleNavigateClick = () => {
        const { lat, lon } = professional.location;
        if (lat && lon) {
            // Generate Waze link
            const wazeUrl = `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
            window.open(wazeUrl, '_blank');
        } else {
            alert('Location information is not available for this professional.');
        }
    };
    return (
        <div className={styles.proContainer}>
    
            {/* Share Icon at the Top Left */}
            <img
                src="/images/Prof/share.png"
                alt="Share Icon"
                onClick={handleShareClick}
                className={styles.shareIcon}
            />
    
           {/* QR Icon at the Top Right */}
           <img
                src="/images/Prof/qr.png"
                alt="QR Icon"
                onClick={handleQrClick}
                className={styles.qrIcon}
            />

            {/* QR Code Modal */}
            {showQrModal && (
                <div className={styles.qrModalOverlay} onClick={handleCloseQrModal}>
                    <div className={styles.qrModalContent} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setShowQrModal(false)} className={styles.closeButton}>
                        &times;
                        </button>
                        <div ref={qrRef}>
                            <QRCodeCanvas value={window.location.href} size={220} />
                        </div>                    
                        <button onClick={handleDownloadQrCode} className={styles.downloadButton}>{translation.downloadButtonbs}</button>
                        </div>
                </div>
            )}
    
            {/* Title Section */}
            <h1 className={styles.proBusinessName}>{professional.fname} {professional.lname}</h1>
            <h2 className={styles.proCompanyType}>{professional.businessName || 'פרילנסר'}</h2>
            
            {/* Spacer to push footer to the bottom */}
            <div className={styles.spacer}></div>
        
            {/* Image Section */}
            <div className={styles.proImageContainer}>
                <img
                    src={professional.image || '/images/Prof/worker2.png'}
                    alt="Professional"
                    className={styles.proProfileImage}
                />
            </div>
            <div className={styles.spacer}></div>
            
            {/* Contact Icons Section */}
            <div className={styles.proIconsContainer}>
                <div className={styles.proIcon} onClick={handlePhoneClick}>
                    <img src="/images/Prof/phone-icon.png" alt="Phone Icon" />
                </div>
                <div className={styles.proIcon} onClick={handleWhatsAppClick}>
                    <img src="/images/Prof/whatsapp-icon.png" alt="WhatsApp Icon" />
                </div>
                <div className={styles.proIcon} onClick={handleEmailClick}>
                    <img src="/images/Prof/email-icon.png" alt="Email Icon" />
                </div>
                <div className={styles.proIcon} onClick={handleAddToHomeClick}>
                    <img src="/images/Prof/person-icon.png" alt="Person Icon" />
                </div>
                <div className={styles.proIcon} onClick={handleWebsiteClick}>
                    <img src="/images/Prof/website-icon.png" alt="Website Icon" />
                </div>
                <div className={styles.proIcon} onClick={handleNavigateClick}>
                    <img src="/images/Prof/waze.png" alt="Navigate Icon" />
                </div>
            </div>
            
            <div className={styles.spacer}></div>
        
            {/* New Clickable Text Section */}
            <p className={styles.proClickableText} onClick={handleExplainClick}>
                {translation.wantCardText} <span className={styles.clickHereText}>{translation.clickHereText}</span>
            </p>
            <div className={styles.spacer}></div>
    
            {/* Footer Section */}
            <div className={styles.proFooter}>
                <div className={styles.proFooterContent}>
                    <img
                        src="/images/Prof/footer-worker.png"
                        alt="Worker Icon"
                        className={styles.proFooterWorkerIcon}
                    />
                    <div className={styles.proFooterText}>
                        <p className={styles.proFooterTextHeader}>I Need</p>
                        <p>{translation.subTitle}</p>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault(); // Prevent default link behavior
                               
                            }}
                            className={styles.proExplainLink}
                        >
                           
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
    
    
}

export default BusinessCard;
