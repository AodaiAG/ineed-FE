import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import api from "../../utils/clientApi";
import styles from "../../styles/client/CancelRequestPage.module.css";
import { useMessage } from "../../contexts/MessageContext";

const CancelRequestPage = ({ open, onClose,requestId }) => {
  const navigate = useNavigate();
  
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const { showMessage } = useMessage();

  const reasons = [
    "הבעיה נפתרה",
    "הזמן / המקום לא מתאים",
    "בעיה עם המומחה",
  ];

  const handleCancelRequest = async () => {
    if (!selectedReason) {
      showMessage("אנא בחר סיבה לביטול", "error"); // ✅ Error message if reason is not selected
      return;
    }
  
    try {
      const response = await api.post(`/api/cancel-request/${requestId}`, {
        reason: selectedReason,
        details: additionalDetails,
      });
  
      if (response.data.success) {
        showMessage("הקריאה בוטלה בהצלחה", "success"); // ✅ Success message
        navigate("/dashboard");
      } else {
        showMessage(response.data.message || "שגיאה בעת ביטול הקריאה", "error"); // ✅ Error message from server
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "שגיאה בעת ביטול הקריאה", "error"); // ✅ Catch unexpected errors
    }
  };
  
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className={styles.dialogTitle}>ביטול הקריאה</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        {/* Cancellation Reasons */}
        <RadioGroup
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value)}
          className={styles.radioGroup}
        >
          {reasons.map((reason, index) => (
            <FormControlLabel
              key={index}
              value={reason}
              control={<Radio className={styles.radioButton} />}
              label={reason}
              className={styles.radioLabel}
            />
          ))}
        </RadioGroup>

        {/* Additional Details */}
        <TextField
          placeholder="נא לפרט כאן בבקשה...."
          multiline
          rows={4}
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          className={styles.textField}
          fullWidth
        />
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.backButton}>חזור</Button>
        <Button onClick={handleCancelRequest} className={styles.submitButton}>דווח</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelRequestPage;
