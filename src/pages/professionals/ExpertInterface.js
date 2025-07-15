import React, { useState, useEffect } from 'react';
import styles from '../../styles/ExpertInterface.module.css';
import { useNavigate } from 'react-router-dom';
import LanguageSelectionPopup from '../../components/LanguageSelectionPopup';
import { useLanguage } from '../../contexts/LanguageContext';
import { IconButton, Badge, Box, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import useAuthCheck from '../../hooks/useAuthCheck';
import NotificationComponent from '../../components/NotificationComponent';
import { NotificationProvider } from "../../contexts/NotificationContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { useProfessionalAuth } from '../../ProfessionalProtectedRoute';
import ProfessionalHeader from '../../components/professionals/ProfessionalHeader';

function ExpertInterface() {
    const navigate = useNavigate();
    const { translation } = useLanguage();
    const [isLanguagePopupOpen, setIsLanguagePopupOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { unreadCount } = useNotifications(); // ✅ Access unread notifications directly
    const { user, isAuthenticated } = useProfessionalAuth();

 

    

   

    const handleNavigateToRequests = (path) => {
        navigate(`/pro/requests/${path}`);
    };



    if (!translation) {
        return (
            <div className={styles['spinner-overlay']}>
                <div className={styles['spinner']}></div>
            </div>
        );
    }

    return (
            <Box className={styles.expertInterface_container}>
                            <ProfessionalHeader />

                {/* Header Container */}
                <div className={styles.headerContainer}>
                 
                    <div className={styles.titleContainer}>
                        <h1 className={styles.expertInterface_mainTitle}>I Need</h1>
                        <h2 className={styles.expertInterface_subTitle}>{translation.expertInterfaceTitle}</h2>
                    </div>
                </div>

            


                {/* Image Section */}


                <div className={styles.spacer}></div>

                {/* Request Buttons */}
                <div className={styles.footerContainer}>

                <div className={styles.expertInterface_imageContainer}>
                    <img
                        src="/images/Prof/worker2.png"
                        alt={translation.workerImageAlt}
                        className={styles.expertInterface_workerImage}
                    />

                </div>
                    <button className={styles.expertInterface_businessCardButton} onClick={() => handleNavigateToRequests('new')}>
                        קריאות חדשות
                    </button>
                    <button className={styles.expertInterface_businessCardButton} onClick={() => handleNavigateToRequests('in-process')}>
                        קריאות בתהליך
                    </button>
                    <button className={styles.expertInterface_businessCardButton} onClick={() => handleNavigateToRequests('mine')}>
                        הקריאות שלי
                    </button>
                     <button   
                    className={`${styles.expertInterface_businessCardButton} ${styles.closedRequestsButton}`}
                     onClick={() => handleNavigateToRequests('closed')}>
                        קריאות סגורות
                    </button>
                </div>
            </Box>
    );
}

export default ExpertInterface;
