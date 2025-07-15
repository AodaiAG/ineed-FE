import React, { useState } from 'react';
import { 
  List, ListItem, ListItemText, ListItemIcon, IconButton, Badge, Typography, 
  Paper, Box, Checkbox, Button, ButtonGroup, Slide 
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // Edit mode icon
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import styles from '../styles/NotificationListComponent.module.css'; // ✅ Import CSS file
import axios from 'axios'; // ✅ Import Axios
import { API_URL } from '../utils/constans';



const getTranslation = (translation, key) => key.split('.').reduce((obj, k) => (obj || {})[k], translation);

const NotificationListComponent = () => {
  const { notifications, setNotifications, markAsRead, deleteNotification, deleteSelectedNotifications } = useNotifications();
  const { translation } = useLanguage();
  const navigate = useNavigate();
  
  const [editMode, setEditMode] = useState(false);
  const [selectedNotifs, setSelectedNotifs] = useState([]);

  const toggleEditMode = () => setEditMode(!editMode);

  const handleSelect = (id) => {
    setSelectedNotifs((prev) =>
      prev.includes(id) ? prev.filter((notifId) => notifId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifs.length === notifications.length) {
      setSelectedNotifs([]); // Deselect all
    } else {
      setSelectedNotifs(notifications.map((notif) => notif.id)); // Select all
    }
  };

  const handleNotificationClick = async (notif) => {
     markAsRead(notif.id); // ✅ Mark as read on click
     if (notif.action) {
      navigate(notif.action);
  }
  };

  const handleMarkSelectedAsRead = async () => {
    await Promise.all(selectedNotifs.map((id) => markAsRead(id)));
    setSelectedNotifs([]); // Clear selection after marking as read
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifs.length === 0) return;

    try {
      const response = await axios.post(`${API_URL}/notifications/delete`, {
        notificationIds: selectedNotifs
      });

      console.log('🔹 Response from server:', response.data); // ✅ Log full response

      if (response.data.success == true) {

        // ✅ Remove deleted notifications from state
        setNotifications((prev) => prev.filter((notif) => !selectedNotifs.includes(notif.id)));
        setSelectedNotifs([]);
      } else {
        console.error('❌ Unexpected response:', response.data);
        alert(response.data.message || 'Unexpected error occurred.');
      }
    } catch (error) {
        console.error('❌ Failed to delete notifications:', error);
        alert('Failed to delete notifications. Please try again.');
    }
};



  return (
    <Paper elevation={3} sx={{ maxWidth: 400, padding: 2, position: 'relative' }}>
      {/* 🔹 Header with Title & Edit Button */}
              <Box className={styles.notificationHeader}>
          {/* ✅ Title (Header) */}
          <Typography variant="h6" className={styles.notificationTitle}>
            {translation.notifications.title || 'התראות'}
          </Typography>
          
          {/* ✅ 3-Dots Menu (MoreVertIcon) */}
          <IconButton
           onClick={toggleEditMode} 
           className={styles.moreOptionsButton}
           sx={{ color: '#1A76D2' }} // ✅ Sets it to blue

           >
            <MoreVertIcon />
          </IconButton>
        </Box>


{/* 🔹 Action Buttons (Only in Edit Mode) */}
<Slide direction="down" in={Boolean(editMode)} mountOnEnter unmountOnExit>
  <Box className={styles.actionButtonsContainer}> {/* ✅ Added a class for the container */}
    
    {/* ✅ "Select All" Button */}
    <Button size="small" onClick={handleSelectAll} variant="outlined" className={styles.selectAllButton}>
      {selectedNotifs.length === notifications.length ? 'בטל הכל' : 'בחר הכל'}
    </Button>

    {/* ✅ Action Buttons Group */}
    <ButtonGroup variant="contained" className={styles.actionButtonGroup}>
      <Button 
        onClick={handleMarkSelectedAsRead} 
        disabled={selectedNotifs.length === 0}
        className={styles.markReadButton}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5}} // ✅ Adds spacing

      >
        <DoneAllIcon /> סמן כנקרא
      </Button>
      <Button 
        onClick={handleDeleteSelected} 
        color="error" 
        disabled={selectedNotifs.length === 0}
        className={styles.deleteButton}
        sx={{ display: 'flex', alignItems: 'center' }} // ✅ Adds spacing

      >
        <DeleteIcon /> מחק
      </Button>
    </ButtonGroup>

  </Box>
</Slide>


      {/* 🔹 Notification List */}
      <List>
        {notifications.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            {translation.notifications.noNotifications || 'אין התראות זמינות.'}
          </Typography>
        ) : (
          notifications.map((notif) => (
            <ListItem
              key={notif.id}
              divider
              onClick={() => handleNotificationClick(notif)} // ✅ Handle click to mark as read and navigate
              style={{ cursor: editMode ? 'default' : 'pointer' }}
            >
              {editMode && (
                <Checkbox
                  checked={selectedNotifs.includes(notif.id)}
                  onChange={() => handleSelect(notif.id)}
                />
              )}
              <ListItemIcon>
                <Badge color="error" variant="dot" invisible={notif.isRead}>
                  <NotificationsActiveIcon color={notif.isRead ? 'action' : 'primary'} />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={getTranslation(translation, notif.messageKey) || notif.message}
                secondary={new Date(notif.createdAt).toLocaleString()}
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
};

export default NotificationListComponent;
