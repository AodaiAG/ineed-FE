import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import api from "../../utils/api";

const CancelRequestComponent = ({ open, onClose, requestId, onSuccess }) => {
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      setError("יש להזין סיבה לביטול.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/professionals/cancel-request", {
        requestId,
        reason: cancelReason,
      });

      if (response.data.success) {
        onClose();
        onSuccess(); // Callback function to refresh data
      } else {
        setError(response.data.message || "שגיאה בביטול הבקשה.");
      }
    } catch (err) {
      console.error("Error canceling request:", err);
      setError("אירעה שגיאה. אנא נסה שנית.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>ביטול קריאה</DialogTitle>
      <DialogContent>
        <Typography>אנא ציין את הסיבה לביטול:</Typography>
        <TextField
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="סיבת הביטול..."
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">סגור</Button>
        <Button onClick={handleCancelRequest} color="primary" variant="contained" disabled={loading}>
          {loading ? "מבטל..." : "אשר ביטול"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelRequestComponent;
