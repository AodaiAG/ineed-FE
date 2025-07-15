import React, { useState, useEffect,useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // ✅ Import Check Icon


import {
    Button,
    Box,
    CircularProgress,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    Collapse,

    ImageList,
    ImageListItem
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StreamChatComponent from "../../components/client/StreamChatComponent";
import styles from "../../styles/client/RequestDetailsPage.module.css";
import ImageGallery from "react-image-gallery"; // ✅ Import image gallery component
import "react-image-gallery/styles/css/image-gallery.css"; // ✅ Import default styles
import ModalImage from "react-modal-image"; // ✅ Import modal for fullscreen zoom
import CloseIcon from "@mui/icons-material/Close"; // ✅ Exit button for fullscreen

import useClientAuthCheck from "../../hooks/useClientAuthCheck";
import api from "../../utils/clientApi";
import { NotificationProvider } from "../../contexts/NotificationContext";
import dayjs from "dayjs";
import CancelRequestPage from "../../components/client/CancelRequestPage"; // ✅ Import CancelRequestPage
import { useClientAuth } from '../../ClientProtectedRoute';
import { useMessage } from "../../contexts/MessageContext";
import ClientHeader from "../../components/client/ClientHeader"; // ✅ Import the custom header


const RequestDetailsPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const requestId = searchParams.get("id");
    const [requestDetails, setRequestDetails] = useState(null);
    const [quotations, setQuotations] = useState([]);
    const [selectedProfessionalId, setSelectedProfessionalId] = useState(null);
    const [confirmedProfessionalId, setConfirmedProfessionalId] = useState(null);
    const [userToken, setUserToken] = useState(sessionStorage.getItem("clientChatToken"));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profession, setProfession] = useState("לא ידוע");
    const [subProfession, setSubProfession] = useState("לא ידוע");
    const language = "he"; // Default language
    const galleryRef = useRef(null); // ✅ Create a ref for ImageGallery
    const [isFullscreen, setIsFullscreen] = useState(false); // ✅ Fullscreen state


    // Expandable Sections
    const [showProfessionals, setShowProfessionals] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showGallery, setShowGallery] = useState(false); // ✅ Gallery section state
    const { user, isAuthenticated } = useClientAuth();

    const { showMessage } = useMessage();


    const [showCancelPopup, setShowCancelPopup] = useState(false);


    useEffect(() => {
        
        const fetchRequestDetails = async () => {
            try {
                const response = await api.get(`/api/request/${requestId}`);
                if (response.data.success) {
                    const request = response.data.data.request;
                    setRequestDetails(request);
                    setQuotations(response.data.data.quotations);

                    if (request.professionalId) {
                        setConfirmedProfessionalId(request.professionalId.toString()); // ✅ Ensure it's a string
                        setSelectedProfessionalId(request.professionalId.toString()); // ✅ Sync selection
                    }

                    // Fetch profession details
                    if (request.jobRequiredId) {
                        const professionResponse = await api.get(
                            `/api/professionals/profession/${request.jobRequiredId}/${language}`
                        );
                        if (professionResponse.data.success) {
                            setProfession(professionResponse.data.data.main);
                            setSubProfession(professionResponse.data.data.sub);
                        }
                    }
                } else {
                    setError(response.data.message || "Failed to fetch request details");
                }
            } catch (error) {
                setError("An error occurred while fetching the request details");
            }
        };


        const fetchUserToken = async () => {
            if (!userToken) {
                try {
                    const response = await api.post("/api/generate-user-token", {
                        id: user.id,
                        type: "client",
                    });
                    const token = response.data.token;
                    sessionStorage.setItem("clientChatToken", token);
                    setUserToken(token);
                } catch (error) {
                    setError("Failed to initialize chat.");
                }
            }
        };

        Promise.all([fetchRequestDetails(), fetchUserToken()]).finally(() => setLoading(false));
    }, [ isAuthenticated, navigate, requestId, user, userToken]);

    const handleSelectProfessional = async () => {
        try {
            const response = await api.put("/api/request/select-professional", {
                requestId,
                professionalId: selectedProfessionalId,
            });
    
            if (response.data.success) {
                setConfirmedProfessionalId(selectedProfessionalId); // ✅ Move checkmark only when confirmed
                showMessage("המומחה נבחר בהצלחה!", "success"); // ✅ Success message
            }
        } catch (error) {
            showMessage("נכשל לבחור במומחה.", "error"); // ❌ Error message
        }
    };
    

    const handleImageClick = () => {
        if (galleryRef.current) {
            galleryRef.current.toggleFullScreen();
        }
    };

    

    if (loading) {
        return (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh', // Full height for centering
            }}
          >
            <CircularProgress size={60} thickness={5} sx={{ color: '#FDBE00' }} />
          </Box>
        );
      }

    if (error) {
        return (
            <Box className={styles.errorContainer}>
                <Typography variant="h6">{error}</Typography>
                <Button variant="contained" onClick={() => navigate(-1)} className={styles.backButton}>
                    חזור
                </Button>
            </Box>
        );
    }

        // ✅ Format date & time
        const formattedDate = requestDetails?.date
        ? dayjs(requestDetails.date).format("DD/MM/YYYY - hh:mm:ss A")
        : "תאריך לא ידוע";

            // ✅ Toggle the cancel popup
    const handleOpenCancelPopup = () => {
        setShowCancelPopup(true);
    };

    const handleCloseCancelPopup = () => {
        setShowCancelPopup(false);
    };
    const handleExitFullscreen = () => {
        if (galleryRef.current) {
            galleryRef.current.toggleFullScreen();
            setIsFullscreen(false); // ✅ Reset fullscreen state
        }
    };

    const images = requestDetails?.imageUrls?.map((url) => ({
        original: url,
        thumbnail: url, // ✅ Thumbnails for navigation
        originalClass: "gallery-image", // ✅ Custom styling (optional)
    })) || [];

    return (
            <Box className={styles.pageContainer}>
                {/* Header */}
                <ClientHeader />

                <Box className={styles.headerContainer}>
                    <Typography className={styles.headerTitle}>
                        {requestDetails?.status === "closed" ? "הקריאה סגורה" : "פרטי הקריאה"}
                    </Typography>
                </Box>
    
                {/* Request Details */}
                <Box className={styles.requestDetailsContainer}>
                    {/* Left Section (Trash Icon) - Hide if closed */}
                    {requestDetails?.status !== "closed" && (
                        <Box className={styles.y1} onClick={handleOpenCancelPopup}>
                            <Box className={styles.deleteIcon}>🗑️</Box>
                        </Box>
                    )}
    
                    {/* Right Section (Details) */}
                    <Box className={styles.y2}
                        style={{ width: requestDetails?.status === "closed" ? "100%" : "84%" }} // ✅ Adjust width dynamically

                    >
                        <Box className={styles.x2}>
                            <Typography className={styles.requestLabel}>קריאה</Typography>
                            <Typography className={styles.requestNumber}>{requestId}</Typography>
                        </Box>
                        <Box className={styles.x1}>
                            <Typography className={styles.profession}>{profession}</Typography>
                            <Typography className={styles.dateTime}>{formattedDate}</Typography>
                            <Typography className={styles.address}>{requestDetails?.city}</Typography>
                        </Box>
                    </Box>
                </Box>
    
                {/* ✅ Professionals Section (Expandable) - Can Expand, But No Actions */}
                <Box className={styles.expandableHeader} onClick={() => setShowProfessionals(!showProfessionals)}>
                    <Typography>
                        {requestDetails?.status === "closed" ? "הצעות שקיבלת" : "בעלי מקצוע שמוכנים לתת שירות"}
                    </Typography>
                    {showProfessionals ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
    
                <Collapse in={showProfessionals} className={styles.collapseContainer}>
                    <Box className={styles.collapseWrapper}>
                        <Box className={styles.professionalList}>
                            <RadioGroup 
                                className={styles.radioGroupCustom}
                                value={selectedProfessionalId}
                                onChange={(e) => requestDetails?.status !== "closed" && setSelectedProfessionalId(e.target.value)} 
                            >
                                {quotations.length > 0 ? (
                                    quotations.map((q) => {
                                        const isConfirmed = confirmedProfessionalId === q.professionalId.toString();
    
                                        return (
                                            <ListItem key={q.professionalId} className={styles.professionalCard}>
                                                <FormControlLabel
                                                    value={q.professionalId.toString()}
                                                    control={<Radio disabled={requestDetails?.status === "closed"} />} // ✅ Disable selection if closed
                                                    label={
                                                        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                                            <Box display="flex" alignItems="center">
                                                                <ListItemAvatar>
                                                                    <Avatar src={q.image} alt={q.name} />
                                                                </ListItemAvatar>
                                                                <ListItemText 
                                                                    primary={q.name} 
                                                                    secondary={`₪${q.price}`} 
                                                                    className={styles.professionalText} 
                                                                />
                                                            </Box>
                                                            {isConfirmed && <CheckCircleIcon className={styles.checkmarkIcon} />}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        );
                                    })
                                ) : (
                                    <Typography className={styles.noExpertsMessage}>אין כרגע מומחים זמינים</Typography>
                                )}
                            </RadioGroup>

                                        {/* ✅ Show Select Button ONLY if the request is OPEN */}
            {quotations.length > 0 && requestDetails?.status === "open" && (
                <Button 
                    className={styles.selectButton} 
                    onClick={handleSelectProfessional} 
                    disabled={!selectedProfessionalId || selectedProfessionalId === confirmedProfessionalId}
                >
                    בחר מומחה
                </Button>
            )}
                        </Box>
                    </Box>
                </Collapse>

    
                {/* ✅ Chat Section (Expandable) - Can Expand, But Read-Only */}
                <Box className={styles.expandableHeader} onClick={() => setShowChat(!showChat)}>
                    <Typography>
                        {requestDetails?.status === "closed" ? "היסטוריית צ׳אט עם המומחים שלנו" : "צ׳אט עם המומחים שלנו"}
                    </Typography>
                    {showChat ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
    
                <Collapse in={showChat} className={styles.chatCollapseContainer}>
                    <Box className={styles.chatCollapseWrapper}>
                        <Box className={styles.chatContainer}>
                            <StreamChatComponent
                                apiKey="nr6puhgsrawn"
                                userToken={userToken}
                                channelId={`request_${requestId}`}
                                userID={user.id}
                                userRole="client"
                                readOnly={true} // ✅ Always read-only, since it's history
                            />
                        </Box>
                    </Box>
                </Collapse>
    
                 {/* ✅ Expandable Gallery Section */}
                 {requestDetails?.status === "closed" && (
                    <>
                        <Box
                            onClick={() => setShowGallery(!showGallery)}
                            className={styles.expandableHeader}
                        >
                            <Typography> תמונות שצורפו</Typography>
                            {showGallery ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </Box>

                       

                        <Collapse in={showGallery} className={styles.collapseContainer}>
                            <Box>
                                {images.length > 0 ? (
                                    <>
                                        <ImageGallery
                                            ref={galleryRef} // ✅ Attach ref to ImageGallery
                                            items={images}
                                            showPlayButton={false} // ❌ Hide autoplay button
                                            showFullscreenButton={false} // ❌ Hide default fullscreen button
                                            showThumbnails={true} // ✅ Enable thumbnails
                                            showNav={true} // ✅ Enable left/right navigation arrows
                                            slideDuration={500} // ✅ Smooth transitions
                                            onClick={handleImageClick} // ✅ Click to open fullscreen
                                        />

                                        {/* ✅ Exit Fullscreen Button */}
                                        {isFullscreen && (
                                            <Box
                                                sx={{
                                                    position: "fixed",
                                                    top: "10px",
                                                    right: "10px",
                                                    zIndex: 1000,
                                                    backgroundColor: "rgba(0,0,0,0.7)",
                                                    borderRadius: "50%",
                                                    padding: "5px"
                                                }}
                                            >
                                                <IconButton onClick={handleExitFullscreen} sx={{ color: "white" }}>
                                                    <CloseIcon />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    <Typography sx={{ textAlign: "center", marginTop: 2 }}>
                                        לא נוספו תמונות לקריאה זו
                                    </Typography>
                                )}
                            </Box>
                        </Collapse>
                    </>
                )}
    
                {/* ✅ Back Button */}
                <Button className={styles.backButton} onClick={() => navigate(-1)}>
                    חזור
                </Button>

                {/* ✅ Cancel Request Popup */}
                {showCancelPopup && (
                    <CancelRequestPage
                        open={showCancelPopup}
                        onClose={handleCloseCancelPopup}
                        requestId={requestId}
                    />
                 )}

            </Box>
    );
    
    
};

export default RequestDetailsPage;
