import React, { useState, useEffect } from "react";
import { Box, Button, Typography, TextField, CircularProgress } from "@mui/material"; // Added CircularProgress
import "../../styles/client/SummaryForm.css"; // Custom CSS for styling
import { useNavigate } from "react-router-dom"; // Assuming navigation is used
import axios from "axios";
import { API_URL } from '../../utils/constans';
import api from '../../utils/clientApi';
import { useLanguage } from "../../contexts/LanguageContext"; // Import useLanguage for translations
import useClientAuthCheck from '../../hooks/useClientAuthCheck';
import { format } from "date-fns";
import { he } from "date-fns/locale"; // Import Hebrew locale if needed
import { useMessage } from "../../contexts/MessageContext"; // Add this import

const SummaryForm = () => {
  const navigate = useNavigate(); // For navigation
  const { translation } = useLanguage(); // Access translations
  const { showMessage } = useMessage(); // Add this line

  // State for form data
  const [summaryData, setSummaryData] = useState({
    profession: "",
    subject: "",
    location: "",
    date: "",
    comment: "",
  });

  const [phonePrefix, setPhonePrefix] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { isAuthenticated, loading: authLoading, user } = useClientAuthCheck();
  const [loading, setLoading] = useState(false); // Added loading state

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      console.log("yes");
    } else {
      console.log("NO");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch data from sessionStorage when the component mounts
  useEffect(() => {
    const parseSessionStorageItem = (key) => {
      try {
        const item = sessionStorage.getItem(key);
        if (!item) return null;
        return JSON.parse(item);
      } catch (error) {
        console.error(`Error parsing ${key}:`, error);
        return null;
      }
    };

    const storedProfession = parseSessionStorageItem("domain");
    const storedSubject = parseSessionStorageItem("mainProfession");
    const storedLocation = sessionStorage.getItem("city") || "";
    const storedDate = sessionStorage.getItem("date") || "";
    const storedComment = sessionStorage.getItem("comment") || "";

    const storedPhonePrefix = sessionStorage.getItem("phonePrefix") || "";
    const storedPhoneNumber = sessionStorage.getItem("phoneNumber") || "";

    // Set the summary data and phone details in state
    setSummaryData({
      profession: storedProfession,
      subject: storedSubject,
      location: storedLocation,
      date: storedDate,
      comment: storedComment,
    });
    setPhonePrefix(storedPhonePrefix);
    setPhoneNumber(storedPhoneNumber);
  }, []);

  const handleReturn = () => {
    if (isAuthenticated) {
      navigate("/main");
    } else {
      navigate("/about");
    }
  };

  const handleSubmit = async () => {
    setLoading(true); // Start loading
    try {
      console.log('at handle submit');
  
      const subProfession = sessionStorage.getItem("subProfession");
      const city = sessionStorage.getItem("city");
      const date = sessionStorage.getItem("date");
      const comment = summaryData.comment || "";
  
      // Validate session storage data
      if (!subProfession || !city || !date) {
        console.error("Missing required fields from sessionStorage:", { subProfession, city, date });
        showMessage(translation.missingFieldsMessage || "חסרים שדות חובה. אנא נסה שוב.", "error");
        return;
      }
  
      const jobRequiredId = JSON.parse(subProfession)?.id;
      if (!jobRequiredId) {
        console.error("Invalid or missing jobRequiredId.");
        showMessage(translation.invalidJobTypeMessage || "סוג העבודה שנבחר אינו תקין. אנא נסה שוב.", "error");
        return;
      }
  
      if (isAuthenticated && user?.id) {
        console.log("Authenticated user ID:", user.id);
  
        const requestDetails = {
          clientId: user.id,
          jobRequiredId,
          city,
          date,
          comment,
        };
  
        try {
          const submitRequestResponse = await api.post(`${API_URL}/submit_client_request`, requestDetails);
  
          if (submitRequestResponse.data.success) {
            showMessage(translation.requestSubmittedSuccessfully || "הבקשה שלך נשלחה בהצלחה!", "success");
            console.log("Request submitted successfully!");
            console.log("Notified professionals:", submitRequestResponse.data.data.notifiedProfessionals);
            navigate("/dashboard");
          } else {
            console.error("Failed to submit client request:", submitRequestResponse.data);
            showMessage(translation.failedToSubmitRequestMessage || "השליחה נכשלה. אנא נסה שוב.", "error");
          }
        } catch (apiError) {
          console.error("API Error during request submission:", apiError);
          showMessage(translation.failedToSubmitRequestMessage || "אירעה שגיאה בשליחת הבקשה. אנא נסה שוב.", "error");
        }
      } else {
        console.warn("User is not authenticated, sending SMS instead.");
  
        if (!phonePrefix || !phoneNumber) {
          console.error("Phone number or prefix is missing.");
          showMessage(translation.missingPhoneNumberMessage || "מספר הטלפון חסר. אנא הזן אותו ונסה שוב.", "error");
          return;
        }
  
        const fullPhoneNumber = `${phonePrefix}${phoneNumber}`;
        console.log("Full Phone Number:", fullPhoneNumber);
  
        try {
          const smsResponse = await axios.post(`${API_URL}/professionals/send-sms`, {
            phoneNumber: fullPhoneNumber,
            message: translation.verificationCodeMessage + " {code}",
          });
  
          if (smsResponse.data.success) {
            // Show the Hebrew message based on delivery type
            showMessage(smsResponse.data.hebrewMessage, "success");
            console.log("Message sent successfully!");
            sessionStorage.setItem("saveRequest", "true");
            navigate("/sms");
          } else {
            console.error("Failed to send message:", smsResponse.data);
            showMessage("שליחת ההודעה נכשלה. נסה שוב.", "error");
          }
        } catch (smsError) {
          console.error("Error during message sending:", smsError);
          showMessage("שליחת ההודעה נכשלה. נסה שוב.", "error");
        }
      }
    } catch (error) {
      console.error("General error during submission:", error);
      showMessage(translation.failedToSubmitRequestMessage || "אירעה שגיאה בלתי צפויה. אנא נסה שוב.", "error");
    } finally {
      setLoading(false);
    }
  };
  

  const handleCommentChange = (event) => {
    setSummaryData((prevState) => ({
      ...prevState,
      comment: event.target.value,
    }));
  };

  return (
    <Box className="summary-form-container" sx={{ position: "relative" }}>
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Title */}
      <Typography variant="h4" className="summary-form-title">
        סכם לפני שליחה
      </Typography>

      {/* Fields */}
      <Box className="summary-form-field">
        <Typography variant="subtitle1" className="summary-form-label">
          בתחום
        </Typography>
        <Typography variant="body1" className="summary-form-value">
          {summaryData.profession?.domain || "לא הוזן"}
        </Typography>
      </Box>

      <Box className="summary-form-field">
        <Typography variant="subtitle1" className="summary-form-label">
          בנושא
        </Typography>
        <Typography variant="body1" className="summary-form-value">
          {summaryData.subject?.main || "לא הוזן"}
        </Typography>
      </Box>

      <Box className="summary-form-field">
        <Typography variant="subtitle1" className="summary-form-label">
          מיקום העבודה
        </Typography>
        <Typography variant="body1" className="summary-form-value">
          {summaryData.location || "לא הוזן"}
        </Typography>
      </Box>

      <Box className="summary-form-field">
        <Typography variant="subtitle1" className="summary-form-label">
          מועד העבודה
        </Typography>
        <Typography variant="body1" className="summary-form-value">
  {(() => {
    try {
      if (!summaryData.date) return "לא הוזן";

      const formattedDate = format(new Date(summaryData.date), "dd/MM/yyyy HH:mm", {
        locale: he, // Use Hebrew locale if needed
      });

      return formattedDate;
    } catch (error) {
      console.error("Failed to format date:", error);
      return "לא הוזן";
    }
  })()}
</Typography>
      </Box>

      <Box className="summary-form-field">
        <Typography variant="subtitle1" className="summary-form-label">
          הערת לקוח
        </Typography>
        <TextField
          multiline
          rows={6}
          value={summaryData.comment}
          onChange={handleCommentChange} // Added handler for changes
          className="summary-form-textarea"
        />
      </Box>

      {/* Buttons */}
      <Box className="appstart-footer">
        <Button
          variant="contained"
          className="submit-button"
          onClick={handleSubmit}
          sx={{
            color: "#FFFFFF",
            borderRadius: "14px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            width: "45%",
          }}
        >
          המשך
        </Button>
        <Button
          variant="contained"
          className="back-button"
          onClick={handleReturn}
          sx={{
            color: "#FFFFFF",
            borderRadius: "14px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            width: "45%",
          }}
        >
          חזור
        </Button>
      </Box>
    </Box>
  );
};

export default SummaryForm;
