import React, { useState, useEffect, useMemo } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Badge,
  Avatar,
  Popover,
  Typography,
  Button,
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from "../../utils/clientApi";
import styles from "../../styles/client/Header.module.css";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../../components/LanguageSelectionPopup";
import NotificationComponent from "../../components/NotificationComponent";
import { useNotifications } from "../../contexts/NotificationContext";
import { useClientAuth } from '../../ClientProtectedRoute';
import fetchUnreadMessages from '../../utils/fetchUnreadMessages';

const ClientHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [chatAnchorEl, setChatAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [profileImage, setProfileImage] = useState("/images/dummy-profile.jpg");
  const [userName, setUserName] = useState("לקוח בדוי");
  const [unreadChats, setUnreadChats] = useState([]);

  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { user } = useClientAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNotificationClick = (event) => setNotificationAnchorEl(event.currentTarget);
  const handleNotificationClose = () => setNotificationAnchorEl(null);

  const handleChatClick = (event) => setChatAnchorEl(event.currentTarget);
  const handleChatClose = () => setChatAnchorEl(null);

  const handleProfileClick = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  const toggleLanguagePopup = () => setShowLanguagePopup((prev) => !prev);

  const handleNavigate = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const fetchClientInfo = async () => {
    try {
      const response = await api.get(`/api/client-info/${user.id}`);
      const data = response.data;
      setUserName(data.fullName || "לקוח ");
    } catch (error) {
      console.error("Error fetching client data:", error);
    }
  };

  const fetchUnreadChats = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }

    try {
      const response = await api.get(`/api/my_requests?type=open`);
      const fetchedRequests = response.data?.data || [];

      if (!fetchedRequests.length) {
        setUnreadChats([]);
        return;
      }

      const requestIds = fetchedRequests.map(req => req.id);
      const token = sessionStorage.getItem("clientChatToken");

      const unreadCounts = await fetchUnreadMessages(
        user.id,
        token,
        requestIds,
        'client'
      );

      const unread = Object.entries(unreadCounts)
        .filter(([_, count]) => count > 0)
        .map(([id, count]) => ({ id, count }));

      setUnreadChats(unread);
    } catch (error) {
      console.error("Error fetching unread chats:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchClientInfo();
      fetchUnreadChats();

      const interval = setInterval(fetchUnreadChats, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const memoizedUnreadChats = useMemo(() => unreadChats, [unreadChats]);

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem("clientChatToken");
    sessionStorage.removeItem("clientToken");
    
    // Navigate to login page
    navigate("/login");
  };

  return (
    <Box className={styles.stickyHeader}>
      <Box className={styles.iconContainer}>
        <IconButton onClick={toggleSidebar} className={styles.menuIcon} sx={{ fontSize: '2.5rem' }}>
          <MenuIcon sx={{ fontSize: '2.0rem' }} />
        </IconButton>

        <IconButton className={styles.notificationIcon} onClick={handleNotificationClick} sx={{ fontSize: '2.5rem' }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsActiveIcon sx={{ fontSize: '1.7rem' }} />
          </Badge>
        </IconButton>

        <IconButton className={styles.chatIcon} onClick={handleChatClick} sx={{ fontSize: '2.5rem' }}>
          <Badge badgeContent={memoizedUnreadChats.length} color="error">
            <ChatIcon sx={{ fontSize: '1.7rem' }} />
          </Badge>
        </IconButton>
      </Box>

      <Popover
        open={Boolean(chatAnchorEl)}
        anchorEl={chatAnchorEl}
        onClose={handleChatClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box className={styles.chatDropdown}>
        <Typography className={styles.chatDropdownHeader}>
            הודעות בצ'אט שלא נקראו 
          </Typography>

          {memoizedUnreadChats.length === 0 ? (
            <Typography className={styles.emptyChatMessage}>אין הודעות חדשות</Typography>
          ) : (
            memoizedUnreadChats.map(chat => (
              <Box key={chat.id} onClick={() => navigate(`/request?id=${chat.id}`)} className={styles.chatItem}>
                <Typography className={styles.chatText}>בקשה #{chat.id}</Typography>
                <span className={styles.chatCountBadge}>{chat.count}</span>
              </Box>
            ))
          )}
        </Box>
      </Popover>

      <Popover
        open={Boolean(notificationAnchorEl)}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          className: styles.customNotificationPopover,
        }}
      >
        <Box className={styles.notificationDropdown}>
          <NotificationComponent userId={user?.id} userType="client" />
        </Box>
      </Popover>

      <Popover
        open={Boolean(profileAnchorEl)}
        anchorEl={profileAnchorEl}
        onClose={handleProfileClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box className={styles.profilePopover}>
          <Avatar
            src={profileImage}
            alt={userName}
            // onClick={handleProfileClick}
            className={styles.avatar}
          />
          <Typography className={styles.profileName}>{userName}</Typography>

          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            className={styles.editButton}
          >
            ערוך תמונה
          </Button>

          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate("/edit-settings")}
            className={styles.editButton}
          >
            ערוך הגדרות
          </Button>
        </Box>
      </Popover>

      <IconButton className={styles.profileIcon}>
        <Avatar
          src={profileImage}
          alt={userName}
          // onClick={handleProfileClick}
          className={styles.avatar}
        />
      </IconButton>

      <Drawer
        anchor="left"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        PaperProps={{
          sx: {
            width: 240,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e9ecef',
            boxShadow: '0 0 10px rgba(0,0,0,0.05)',
          }
        }}
      >
        <Box 
          className={styles.sidebarContainer} 
          role="presentation"
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Profile Section */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderBottom: '1px solid #e9ecef',
              backgroundColor: '#f8f9fa',
            }}
          >
            <Avatar
              src={profileImage}
              alt={userName}
              // onClick={handleProfileClick}
              className={styles.avatar}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#1a237e',
                textAlign: 'center',
                fontSize: '1.2rem',
                mt: 1,
              }}
            >
              {userName}
            </Typography>
          </Box>

          {/* Navigation Menu */}
          <List
            sx={{
              flex: 1,
              p: 1.5,
              '& .MuiListItem-root': {
                borderRadius: '8px',
                mb: 0.5,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              },
              '& .MuiListItemIcon-root': {
                minWidth: '40px',
                color: '#1a237e',
              },
              '& .MuiListItemText-primary': {
                fontWeight: 500,
                color: '#1a237e',
                fontSize: '0.9rem',
              },
            }}
          >
            <ListItem 
              button 
              onClick={() => handleNavigate("/dashboard")}
              sx={{
                backgroundColor: location.pathname === "/dashboard" ? '#f5f5f5' : 'transparent',
              }}
            >
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="בית" />
            </ListItem>

            {/* Nested Requests Menu */}
            <ListItem 
              button 
              onClick={() => handleNavigate("/main")}
              sx={{
                backgroundColor: location.pathname === "/main" ? '#f5f5f5' : 'transparent',
                pl: 4,
              }}
            >
              <ListItemIcon><AddCircleOutlineIcon /></ListItemIcon>
              <ListItemText primary="פתח קריאה חדשה" />
            </ListItem>

            <ListItem 
              button 
              onClick={() => handleNavigate("/dashboard/my-requests")}
              sx={{
                backgroundColor: location.pathname === "/my-requests" ? '#f5f5f5' : 'transparent',
                pl: 4,
              }}
            >
              <ListItemIcon><ListAltIcon sx={{ color: '#1a237e' }} /></ListItemIcon>
              <ListItemText primary="הקריאות שלי" />
            </ListItem>

            <ListItem 
              button 
              onClick={() => handleNavigate("/dashboard/closed-requests")}
              sx={{
                backgroundColor: location.pathname === "/dashboard/closed-requests" ? '#f5f5f5' : 'transparent',
                pl: 4,
              }}
            >
              <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
              <ListItemText primary="קריאות סגורות" />
            </ListItem>
          </List>

          {/* Settings and Language at the bottom */}
          <List
            sx={{
              p: 1.5,
              borderTop: '1px solid #e9ecef',
              '& .MuiListItem-root': {
                borderRadius: '8px',
                mb: 0.5,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              },
              '& .MuiListItemIcon-root': {
                minWidth: '40px',
                color: '#1a237e',
              },
              '& .MuiListItemText-primary': {
                fontWeight: 500,
                color: '#1a237e',
                fontSize: '0.9rem',
              },
            }}
          >
            <ListItem 
              button 
              onClick={toggleLanguagePopup}
              sx={{
                backgroundColor: showLanguagePopup ? '#f5f5f5' : 'transparent',
              }}
            >
              <ListItemIcon><LanguageIcon /></ListItemIcon>
              <ListItemText primary="שפה" />
            </ListItem>

            <ListItem 
              button 
              onClick={() => handleNavigate("/edit-settings")}
              sx={{
                backgroundColor: location.pathname === "/edit-settings" ? '#f5f5f5' : 'transparent',
              }}
            >
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="הגדרות" />
            </ListItem>
          </List>

          {/* Footer Section */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid #e9ecef',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#546e7a',
                fontSize: '0.75rem',
                textAlign: 'center',
              }}
            >
              © 2024 I-Need. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ClientHeader;
