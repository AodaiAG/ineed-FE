import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import api from "../../utils/api";
import { useLanguage } from "../../contexts/LanguageContext";
import useAuthCheck from "../../hooks/useAuthCheck";
import styles from "../../styles/RequestPage.module.css";
import fetchUnreadMessages from "../../utils/fetchUnreadMessages"; // ✅ Import function
import { Box,
    Typography,
    Badge,
    IconButton,
    Collapse, } from "@mui/material";
import { NotificationProvider } from "../../contexts/NotificationContext";
import { useProfessionalAuth } from '../../ProfessionalProtectedRoute';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ProfessionalHeader from '../../components/professionals/ProfessionalHeader';

function RequestsPage({ mode, title}) {
    const [requests, setRequests] = useState([]);
    const [professions, setProfessions] = useState({});
    const [loading, setLoading] = useState(true);
    const [fetchingUnread, setFetchingUnread] = useState(false);
    const { translation } = useLanguage();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
const [modalText, setModalText] = useState("");
//before
const { user, isAuthenticated } = useProfessionalAuth();
const [expanded, setExpanded] = useState(false);
const [expandedId, setExpandedId] = useState(null); // ✅ Track which item is expanded


    const language = "he"; // Default to Hebrew

    useEffect(() => {
     
        // ✅ Fetch Requests
        const fetchRequests = async () => {
            try {
                const response = await api.get(`/api/professionals/get-prof-requests?mode=${mode}`);
                if (response.data.success) {
                    setRequests(response.data.data);
                    fetchUnreadCounts(response.data.data); // ✅ Fetch unread messages after setting requests
                } else {
                    console.error("Failed to fetch requests");
                }
            } catch (error) {
                console.error("Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [ loading,isAuthenticated, mode, navigate]);

    // ✅ Fetch profession details for each request
    useEffect(() => {
        const fetchProfessions = async () => {
            for (const request of requests) {
                if (!professions[request.jobRequiredId]) {
                    try {
                        const response = await api.get(`/api/professionals/profession/${request.jobRequiredId}/${language}`);
                        if (response.data.success) {
                            setProfessions((prev) => ({
                                ...prev,
                                [request.jobRequiredId]: response.data.data,
                            }));
                        }
                    } catch (error) {
                        console.error("Error fetching profession details:", error);
                    }
                }
            }
        };

        if (requests.length > 0) {
            fetchProfessions();
        }
    }, [requests]);

    // ✅ Fetch Unread Message Counts
    const fetchUnreadCounts = async (updatedRequests) => {
        if (!user) return;
        setFetchingUnread(true);

        const userId = String(user.profId);

        const userToken = sessionStorage.getItem("profChatToken");

        console.log('here profid : '+ userId +'usertoken' + userToken
            
        )

        if (!userId || !userToken) {
            setFetchingUnread(false);
            return;
        }
        console.log('maybe here')

        try {
            const requestIds = updatedRequests.map((req) => req.id);
            const unreadCounts = await fetchUnreadMessages(userId, userToken, requestIds);

            console.table(unreadCounts);

            setRequests((prevRequests) =>
                prevRequests.map((request) => ({
                    ...request,
                    unreadMessages: unreadCounts[request.id] || 0, // ✅ Default to 0 if not found
                }))
            );
        } catch (error) {
            console.error("Error fetching unread messages:", error);
        } finally {
            setFetchingUnread(false);
        }
    };

    const handleRequestClick = (requestId) => {
        navigate(`/pro/requests/${requestId}`);
    };

    const formatDateTime = (dateTimeString) => {
        const dateObj = new Date(dateTimeString);
        const hours = dateObj.getHours().toString().padStart(2, "0");
        const minutes = dateObj.getMinutes().toString().padStart(2, "0");
        const day = dateObj.getDate().toString().padStart(2, "0");
        const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const year = dateObj.getFullYear();

        return `${hours}:${minutes} - ${day}/${month}/${year}`;
    };

    if ( loading ||!translation) 
        {
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

          const toggleExpand = (e, requestId) => {
            e.stopPropagation(); // ✅ Prevent triggering navigation
            setExpandedId((prevId) => (prevId === requestId ? null : requestId)); // ✅ Toggle specific request
          };
          

    return (

        <Box className={styles.requestPageContainer}>
                                        <ProfessionalHeader />

            <Box className={styles.header}>
          <Typography variant="h4" className={styles.title}>{title}</Typography>
        </Box>

            <Box className={styles.requestList}>
  {requests.length > 0 ? (
    requests.map((request, index) => (
      <React.Fragment key={request.id}>
        <Box
          className={styles.requestCard}
          onClick={() => navigate(`/pro/requests/${request.id}`)}
        >
          <Box className={styles.topSection}>
            <Typography className={styles.leftSection}>
              {index + 1}
            </Typography>

            <Box className={styles.professionDateContainer}>
              <Typography className={styles.professionValue}>
                {`${professions[request.jobRequiredId]?.main || "טוען..."}, ${request.city}`}
              </Typography>
              <Typography className={styles.dateText}>
                {new Date(request.date).toLocaleString()}
              </Typography>
            </Box>

            <Box className={styles.rightSection}>
              <Box className={styles.badgeWrapper}>
                <Badge
                  badgeContent={fetchingUnread ? "..." : request.unreadMessages || 0}
                  color="error"
                  showZero
                />
              </Box>

              <IconButton
  onClick={(e) => toggleExpand(e, request.id)}
  className={styles.expandButton}
>
  {expandedId === request.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
</IconButton>

            </Box>
          </Box>

          <Collapse in={expandedId === request.id}>
            <Box className={styles.detailsSection}>
              <Box className={styles.infoBlock}>
                <Typography className={styles.infoLabel}>מיקום</Typography>
                <Typography className={styles.infoValue}>{request.city}</Typography>
              </Box>

              <Box className={styles.infoBlock}>
                <Typography className={styles.infoLabel}>קריאה</Typography>
                <Typography className={styles.infoValue}>{request.id}</Typography>
              </Box>

              {mode === "closed" && (
                <Box className={styles.infoBlock}>
                  <Typography className={styles.infoLabel}>הצעה</Typography>
                  <Typography className={styles.infoValue}>
                    {request.myQuotation ? `₪${request.myQuotation}` : "—"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </Box>

{/* Only show separator if it's NOT the last item */}
{index < requests.length - 1 && (
        <Box className={styles.requestSeparator}></Box>
      )}      </React.Fragment>
    ))
  ) : (
    <Box className={styles.noRequestsMessage}>
      <Typography variant="h6" color="white">
        אין בקשות
      </Typography>
    </Box>
  )}
</Box>


            <p className={styles.supportMessage}>
                *ביטול או תקלה צור קשר עם השירות <a href="#">כאן</a>
            </p>

            <button onClick={() => navigate(-1)} className={styles.backButton}>
                חזור
            </button>
        </Box>

    );
}

export default RequestsPage;
