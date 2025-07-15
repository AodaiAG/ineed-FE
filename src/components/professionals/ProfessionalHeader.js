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
  TextField,
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ChatIcon from '@mui/icons-material/Chat';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from "axios";
import styles from "../../styles/Header.module.css";
import { useNavigate } from "react-router-dom";
import LanguageSelectionPopup from "../../components/LanguageSelectionPopup";
import NotificationComponent from "../../components/NotificationComponent";
import { useNotifications } from "../../contexts/NotificationContext";
import { useProfessionalAuth } from '../../ProfessionalProtectedRoute';
import { API_URL } from '../../utils/constans';
import fetchUnreadMessages from '../../utils/fetchUnreadMessages';
import api from "../../utils/api";


const ProfessionalHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [chatAnchorEl, setChatAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [profileImage, setProfileImage] = useState("/images/dummy-profile.jpg");
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState("מומחה בדוי");
  const [newName, setNewName] = useState("");
  const [unreadChats, setUnreadChats] = useState([]);

  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { user } = useProfessionalAuth();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);

  };  const handleNotificationClose = () => setNotificationAnchorEl(null);

  const handleChatClick = (event) => setChatAnchorEl(event.currentTarget);
  const handleChatClose = () => setChatAnchorEl(null);

  const handleProfileClick = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => {
    setProfileAnchorEl(null);
    setIsEditing(false);
  };

  const toggleLanguagePopup = () => setShowLanguagePopup(prev => !prev);

  const fetchProfessional = async () => {
    try {
      const response = await axios.get(`${API_URL}/professionals/prof-info/${user.profId}`);
      const data = response.data;
      setUserName(`${data.fname} ${data.lname}`);
      setProfileImage(data.image || "/images/dummy-profile.jpg");
    } catch (error) {
      console.error("Error fetching professional data:", error);
    }
  };
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const response = await axios.post(`${API_URL}/professionals/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const serverImageUrl = response.data.imageUrl;
        setProfileImage(serverImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleNameEdit = () => {
    if (newName.trim()) {
      setUserName(newName);
      setIsEditing(false);
    }
  };

  const handleLogout = () => {
    console.log("User logged out!");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const fetchUnreadChats = async () => {
    if (!user?.profId) {
      console.log('No professional ID available');
      return;
    }

    try {
      const response = await api.get(`/api/professionals/get-prof-requests?mode=chat`);
      const fetchedRequests = response.data?.data || [];

      if (!fetchedRequests.length) {
        setUnreadChats([]);
        return;
      }

      const requestIds = fetchedRequests.map(req => req.id);
      const userId = String(user.profId);
      const token = sessionStorage.getItem("profChatToken");

      const unreadCounts = await fetchUnreadMessages(
        userId,
        token,
        requestIds,
        'prof'  // Pass the type explicitly
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
    if (user?.profId) {
      fetchProfessional();
      fetchUnreadChats();

      const interval = setInterval(fetchUnreadChats, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.profId]);

  const memoizedUnreadChats = useMemo(() => unreadChats, [unreadChats]);

  return (
    <Box className={styles.stickyHeader}>
      <Box className={styles.iconContainer}>
        <IconButton onClick={toggleSidebar} className={styles.menuIcon}>
          <MenuIcon sx={{ fontSize: '2rem' }} />
        </IconButton>

        <IconButton className={styles.notificationIcon} onClick={handleNotificationClick}>
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
              onClick={() => handleNavigate("/pro/expert-interface")}
              sx={{
                backgroundColor: location.pathname === "/pro/expert-interface" ? '#f5f5f5' : 'transparent',
              }}
            >
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="בית" />
            </ListItem>

            <ListItem 
              button 
              onClick={() => handleNavigate("/pro/requests/new")}
              sx={{
                backgroundColor: location.pathname === "/pro/requests/new" ? '#f5f5f5' : 'transparent',
                pl: 4,
              }}
            >
              <ListItemIcon><AddCircleOutlineIcon /></ListItemIcon>
              <ListItemText primary="קריאות חדשות" />
            </ListItem>

            <ListItem 
              button 
              onClick={() => handleNavigate("/pro/requests/in-process")}
              sx={{
                backgroundColor: location.pathname === "/pro/requests/in-process" ? '#f5f5f5' : 'transparent',
                pl: 4,
              }}
            >
              <ListItemIcon><AutorenewIcon /></ListItemIcon>
              <ListItemText primary="קריאות בתהליך" />
            </ListItem>

            <ListItem 
              button 
              onClick={() => handleNavigate("/pro/requests/mine")}
              sx={{
                backgroundColor: location.pathname === "/pro/requests/mine" ? '#f5f5f5' : 'transparent',
                pl: 4,
              }}
            >
              <ListItemIcon><ListAltIcon /></ListItemIcon>
              <ListItemText primary="הקריאות שלי" />
            </ListItem>

            <ListItem 
              button 
              onClick={() => handleNavigate("/pro/requests/closed")}
              sx={{
                backgroundColor: location.pathname === "/pro/requests/closed" ? '#f5f5f5' : 'transparent',
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
              onClick={() => handleNavigate("/pro/edit-settings")}
              sx={{
                backgroundColor: location.pathname === "/pro/edit-settings" ? '#f5f5f5' : 'transparent',
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
          <NotificationComponent userId={user?.profId} userType="professional" />
        </Box>
      </Popover>


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
              <Box key={chat.id} onClick={() => navigate(`/pro/requests/${chat.id}`)} className={styles.chatItem}>
                <Typography className={styles.chatText}>בקשה #{chat.id}</Typography>
                <span className={styles.chatCountBadge}>{chat.count}</span>
              </Box>
            ))
          )}
        </Box>
      </Popover>

      <IconButton className={styles.profileIcon} >
        <Avatar src={profileImage} sx={{ width: 40, height: 40, border: '4px solid #1A4B75 !important' }} />
      </IconButton>

      <Popover
        open={Boolean(profileAnchorEl)}
        anchorEl={profileAnchorEl}
        onClose={handleProfileClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box className={styles.profilePopover}>
          <Avatar src={profileImage} className={styles.profileAvatarLarge} />
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
            onClick={() => navigate("/pro/edit-settings")}
            className={styles.editButton}
          >
            ערוך הגדרות
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export default ProfessionalHeader;
