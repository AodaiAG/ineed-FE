import React, { useState, useEffect } from "react";
import { Button, ButtonBase, Box, IconButton, Badge, Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import LanguageIcon from "@mui/icons-material/Language";
import styles from "../../styles/client/Dashboard.module.css";
import useClientAuthCheck from "../../hooks/useClientAuthCheck";
import { useLanguage } from "../../contexts/LanguageContext";
import NotificationComponent from "../../components/NotificationComponent";
import { useNotifications } from "../../contexts/NotificationContext";
import { useClientAuth } from '../../ClientProtectedRoute';
import ClientHeader from "../../components/client/ClientHeader"; // ✅ Import the custom header


const Dashboard = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false); // State to handle popup visibility
  const [showNotifications, setShowNotifications] = useState(false); // State to toggle notifications
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to toggle sidebar
  const { translation } = useLanguage();
  //const { isAuthenticated, loading, user } = useClientAuthCheck();
  const { unreadCount } = useNotifications(); // ✅ Access unread notifications directly
  const { user, isAuthenticated } = useClientAuth();


  

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleNavigateToMyRequests = () => {
    navigate("/dashboard/my-requests");
  };
  const handleNavigateToClosedRequests = () => {
    navigate("/dashboard/closed-requests");
  };

  const handleNavigateToMain = () => {
    navigate("/main");
  };

  const handleSettingsClick = () => {
    navigate("/client/edit-settings");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  if (!translation) {
    return (
      <div className={styles["  inner-overlay"]}>
        <div className={styles["spinner"]}></div>
      </div>
    );
  }

  return (
    
      <Box className={styles.clientDContainer}>
        {/* Header */}
        
        <ClientHeader />

        {/* Title and Description */}
        <Box className={styles.clientDContent}>
          <h1 className={styles.clientDTitle}>I Need</h1>
          <p className={styles.clientDDescription}>כל המומחים במקום אחד</p>
        </Box>

        <div className={styles.spacer}></div>


        {/* Buttons */}
        <Box className={styles.clientDButtonsContainer}>

        <Box className={styles.clientDImageContainer}>
          <img
            src="/images/Prof/worker2.png"
            alt="Worker"
            className={styles.clientDWorkerImage}
          />
        </Box>
          <Button
            variant="contained"
            className={`${styles.clientDButton} ${styles.clientDNewRequestButton}`}
            onClick={handleNavigateToMain}
            sx={{ borderRadius: "14px", fontSize: "1.6rem" }}
          >
            פתח קריאה חדשה
          </Button>
          <Button
            variant="contained"
            className={`${styles.clientDButton} ${styles.clientDMyRequestsButton}`}
            onClick={handleNavigateToMyRequests}
            sx={{ borderRadius: "14px", fontSize: "1.6rem" }}
          >
            הקריאות שלי
          </Button>
          <Button
            variant="contained"
            className={`${styles.clientDButton} ${styles.clientDClosedRequestsButton}`}
            onClick={handleNavigateToClosedRequests}
            sx={{ borderRadius: "14px", fontSize: "1.6rem" }}
          >
            קריאות סגורות
          </Button>
        </Box>
      </Box>
  );
};

export default Dashboard;
