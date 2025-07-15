import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  TextField,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import StreamChatComponent from "../../components/client/StreamChatComponent";
import FinishRequestComponent from "../../components/professionals/FinishRequestComponent";
import CancelRequestComponent from "../../components/professionals/CancelRequestComponent";
import ProfessionalHeader from '../../components/professionals/ProfessionalHeader';

import api from "../../utils/api";
import useAuthCheck from "../../hooks/useAuthCheck";
import styles from "../../styles/RequestDetailsPage.module.css";
import { useProfessionalAuth } from '../../ProfessionalProtectedRoute';
import { useMessage } from "../../contexts/MessageContext";

const ProfessionalRequestDetailsPage = () => {
  const navigate = useNavigate();
  const { id: requestId } = useParams();
  const [requestDetails, setRequestDetails] = useState(null);
  const [profession, setProfession] = useState(null);
  const [quotation, setQuotation] = useState("");
  const [userToken, setUserToken] = useState(sessionStorage.getItem("profChatToken"));
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSelectedProfessional, setIsSelectedProfessional] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Expandable Sections
  const [showDetails, setShowDetails] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);
  const { user, isAuthenticated } = useProfessionalAuth();


  const [expandedSection, setExpandedSection] = useState(null);

  const language = "he";
  const { showMessage } = useMessage();

  useEffect(() => {
    

    const fetchRequestDetails = async () => {
      try {
        const response = await api.get(`/api/professionals/request/${requestId}`);
        if (response.data.success) {
          const requestData = response.data.data;
          setRequestDetails(requestData);
          setQuotation(requestData.quotation || "");

          if (requestData.professionalId === user.profId) {
            setIsSelectedProfessional(true);
          }

        
          const professionResponse = await api.get(`/api/professionals/profession/${requestData.jobRequiredId}/${language}`);
          if (professionResponse.data.success) {
            setProfession(professionResponse.data.data);
          } else {
            setProfession({ main: "לא ידוע", sub: "לא ידוע" });
          }
        } else {
          setError(response.data.message || "Failed to fetch request details");
        }
      } catch (error) {
        setError("An error occurred while fetching the request details");
      } finally {
        setLoading(false);
      }
    };
    const fetchUserToken = async () => {
      if (!userToken) {
          try {
              console.log("Fetching user token...");
              const response = await api.post("/api/generate-user-token", {
                  id: String(user.profId),
                  type: "prof",
                  
              });
              const token = response.data.token;
              sessionStorage.setItem("profChatToken", token);
              setUserToken(token);
              console.log("User token fetched successfully:", token);
          } catch (error) {
              console.error("Failed to fetch user token:", error);
              setError("Failed to initialize chat.");
          }
      }
  };


    Promise.all([fetchRequestDetails(),fetchUserToken()]).finally(() => setLoading(false));
  }, [loading, isAuthenticated, navigate, requestId,userToken]);

  // ✅ Restored function
  const handleQuotationSubmit = async () => {
    try {
      console.log("🔄 Full API Response:"); // ✅ Log full response to check its structure

      const response = await api.post(`/api/professionals/quotation`, {
        requestId,
        quotation: parseFloat(quotation),
      });
  
  
      if (response?.data?.success) {
        setIsEditing(false);
        showMessage("הצעת המחיר הוגשה בהצלחה!", "success");
        navigate(0);
      } else {
        setError("Failed to process quotation");
        showMessage(response.data?.message || "התרחשה שגיאה בעת שליחת הצעת המחיר.", "error");
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "שגיאה בלתי צפויה בעת שליחת הצעת המחיר.", "error");
    }
  };
  

  

  if (loading)   {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} thickness={5} sx={{ color: '#FDBE00' }} />
      </Box>
    );
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  

  return (
    <Box className={styles.pageContainer}>

<ProfessionalHeader />

      {/* ✅ Header Title Update */}
      <Box className={styles.header}>
        <Typography className={styles.requestNumber}>{requestDetails.id}</Typography>
        <Typography className={styles.title}>
          {requestDetails?.status === "closed" ? "הקריאה סגורה" : "קריאה"}
        </Typography>
      </Box>
  
      {/* ✅ Hide the Cancel Button if the request is closed */}
      {isSelectedProfessional && requestDetails?.status !== "closed" && (
        <>
          <Button
            variant="contained"
            className={styles.cancelButton}
            onClick={() => setShowCancelDialog(true)}
          >
            ביטול
          </Button>
  
          <CancelRequestComponent
            open={showCancelDialog}
            onClose={() => setShowCancelDialog(false)}
            requestId={requestId}
            onSuccess={() => navigate(0)} // ✅ React Router refresh
          />
        </>
      )}
  
      {/* Request Details */}
      <Box className={styles.details}>
      {isSelectedProfessional && (
          <>
            <Typography><strong>שם הלקוח:</strong> {requestDetails.client?.fullName || "לא ידוע"}</Typography>
            <Typography><strong>טלפון:</strong> {requestDetails.client?.phoneNumber || "לא ידוע"}</Typography>
          </>
        )}
        <Typography><strong>בתחום:</strong> {profession?.main || "טוען..."}</Typography>
        <Typography><strong>בנושא:</strong> {profession?.sub || "טוען..."}</Typography>
        <Typography><strong>מיקום:</strong> {requestDetails.city || "לא ידוע"}</Typography>
        <Typography><strong>מועד:</strong> {new Date(requestDetails.date).toLocaleString() || "לא ידוע"}</Typography>
        <Typography><strong>הערת לקוח:</strong> {requestDetails.comment || "אין הערות"}</Typography>
      </Box>
  
      {/* ✅ Chat Section - Title Change */}
      <Box className={styles.expandableHeader} onClick={() => toggleSection("chat")}>
        <Typography>
          {requestDetails?.status === "closed" ? "היסטוריית צ׳אט עם המומחים שלנו" : "צ׳אט עם המומחים שלנו"}
        </Typography>
        {expandedSection === "chat" ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>
  
      <Collapse in={expandedSection === "chat"} className={styles.chatCollapseContainer}>
        <Box className={styles.chatContainer}>
          {userToken ? (
            <StreamChatComponent
              apiKey="nr6puhgsrawn"
              userToken={userToken}
              channelId={`request_${requestId}`}
              userID={String(user.profId)}
              userRole="prof"
              readOnly={requestDetails?.status === "closed"} // ✅ Chat is Read-Only when closed
            />
          ) : (
            <Typography>Loading chat...</Typography>
          )}
        </Box>
      </Collapse>
  
      {/* ✅ Quotation Section - Title Change & Remove Update Button if Closed */}
      <Box className={styles.expandableHeader} onClick={() => toggleSection("quotation")}>
        <Typography>
          {requestDetails?.status === "closed"  ? "המחיר שהצעת" : "הצעת מחיר"}
        </Typography>
        {expandedSection === "quotation" ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>
  
      <Collapse in={expandedSection === "quotation"} className={styles.quotationCollapseContainer}>
        <Box className={styles.quotationSection}>
          <Box className={styles.quotationInputContainer}>
          <TextField
  label="הצעת מחיר"
  value={quotation}
  onChange={(e) => {
    const inputValue = e.target.value;
    // Allow only numbers (no letters, +, -, or special chars)
    if (/^\d*$/.test(inputValue)) {
      setQuotation(inputValue);
    }
  }}
  variant="outlined"
  type="text" // Change to "text" to avoid browser auto-formatting
  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }} // Helps mobile users
  disabled={requestDetails?.status === "closed" || !!requestDetails?.quotation}
 // Disable if status is closed
/>

            {/* ✅ Remove Update Button when the request is closed */}
            {requestDetails?.status !== "closed" && !requestDetails?.quotation && (
  <Button variant="contained" 
  onClick={handleQuotationSubmit} 
  className={styles.quotationButton}
  onSuccess={() => navigate(0)} // ✅ React Router refresh
  >
    עדכן
  </Button>
)}

          </Box>
        </Box>
      </Collapse>
  
      {/* ✅ Remove Action Buttons (buttonsRow) when the request is closed */}
      {requestDetails?.status !== "closed" && (
        <Box className={styles.buttonsRow}>
          <Button variant="contained" className={styles.backButton} onClick={() => navigate(-1)}>
            חזור
          </Button>
          {isSelectedProfessional && (
            <Button variant="contained" className={styles.finalizeButton} onClick={() => setShowFinishDialog(true)}>
              סיום העבודה
            </Button>
          )}
        </Box>
      )}
  
      <FinishRequestComponent open={showFinishDialog} onClose={() => setShowFinishDialog(false)} requestId={requestId} clientId={requestDetails.clientId} />
    </Box>
  );
  
};

export default ProfessionalRequestDetailsPage;
