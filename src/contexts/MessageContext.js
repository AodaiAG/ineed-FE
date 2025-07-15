import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Create Context
const MessageContext = createContext();

// Custom Hook for easy access
export const useMessage = () => useContext(MessageContext);

// Context Provider
export const MessageProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}

      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: "30px" }} // ✅ Slightly move it up
      >
        <Alert
          severity={severity}
          sx={{
            width: "100%",
            fontSize: "16px",
            direction: "rtl",
            alignItems: "center",
            padding: "10px 16px",
            gap: "10px", // ✅ Adds spacing between elements
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
              sx={{ padding: "4px" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </MessageContext.Provider>
  );
};
