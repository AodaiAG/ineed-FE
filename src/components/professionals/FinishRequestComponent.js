import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import styles from "../../styles/FinishRequestComponent.module.css";
import api from "../../utils/api";
import { useMessage } from "../../contexts/MessageContext";

const FinishRequestComponent = ({ open, onClose, requestId, clientId }) => {
  const [images, setImages] = useState([]);
  const [completionDate, setCompletionDate] = useState("");
  const [workCost, setWorkCost] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { showMessage } = useMessage();

  const handleImageUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...uploadedFiles]);
  };

  const handleFinishRequest = async () => {
    setLoading(true); // Start loading
    try {
      // Assume images are already uploaded and you have their URLs
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const formData = new FormData();
          formData.append("image", image);

          try {
            // Call your image upload API and get the URL
            const response = await api.post("/api/professionals/upload-image", formData);
            return response.data.imageUrl;
          } catch (uploadError) {
            console.error("❌ Error uploading image:", uploadError);
            showMessage("שגיאה בהעלאת תמונות, נסה שנית.", "error"); // Show image upload error
            throw uploadError; // Stop execution if upload fails
          }
        })
      );

      const payload = {
        requestId,
        completionDate: new Date(completionDate).toISOString(),
        workCost,
        comment,
        imageUrls,
      };

      // Send the payload as JSON
      const response = await api.post("/api/professionals/finish-request", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        showMessage("הבקשה הושלמה בהצלחה!", "success"); // ✅ Success message
        onClose();
      } else {
        showMessage(response.data.message || "התרחשה שגיאה בעת סיום הבקשה.", "error"); // ❌ Handle API response errors
      }
    } catch (error) {
      console.error("❌ Error finishing request:", error);
      showMessage(error.response?.data?.message || "שגיאה בלתי צפויה בעת סיום הבקשה.", "error"); // ❌ Catch unexpected errors
    } finally {
      setLoading(false); // End loading
    }
  };

  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Backdrop open={loading} className={styles.backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <DialogTitle className={styles.title}>סיום הקריאה</DialogTitle>
      <DialogContent>
        {/* Completion Date Field */}
        <Box className={styles.fieldContainer}>
          <Typography className={styles.label}>מועד העבודה</Typography>
          <TextField
            type="datetime-local"
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Image Upload */}
        <Box className={styles.fieldContainer}>
          <Typography className={styles.label}>העלה תמונה</Typography>
          <input
            accept="image/*"
            multiple
            type="file"
            id="upload-images"
            onChange={handleImageUpload}
            hidden
          />
          <label htmlFor="upload-images">
            <IconButton component="span" className={styles.uploadButton}>
              <ImageIcon />
              <Typography>בחר</Typography>
            </IconButton>
          </label>
          {/* Display Selected Images */}
          <Box className={styles.imagePreviewContainer}>
            {images.map((image, index) => (
              <img
                key={index}
                src={URL.createObjectURL(image)}
                alt={`uploaded-${index}`}
                className={styles.imagePreview}
              />
            ))}
          </Box>
        </Box>

        {/* Work Cost Field */}
        <Box className={styles.fieldContainer}>
          <Typography className={styles.label}>עלות העבודה</Typography>
          <TextField
            type="number"
            value={workCost}
            onChange={(e) => setWorkCost(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">₪</InputAdornment>,
            }}
          />
        </Box>

        {/* General Comment Field */}
        <Box className={styles.fieldContainer}>
          <Typography className={styles.label}>הערה כללית</Typography>
          <TextField
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained" className={styles.backButton}>
          חזור
        </Button>
        <Button onClick={handleFinishRequest} color="primary" variant="contained" className={styles.finishButton}>
          סיום
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinishRequestComponent;
