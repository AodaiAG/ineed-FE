import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Badge,
  IconButton,
  Collapse,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../utils/clientApi";
import styles from "../../styles/client/RequestList.module.css";
import fetchUnreadMessages from "../../utils/fetchUnreadMessages"; // ✅ Import function
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import useClientAuthCheck from "../../hooks/useClientAuthCheck";
import { NotificationProvider } from "../../contexts/NotificationContext";
import { useClientAuth } from '../../ClientProtectedRoute';
import ClientHeader from "./ClientHeader"; // Adjust the path as necessary



const RequestList = ({ title, requestType}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingRequests, setFetchingRequests] = useState(true);
  const [fetchingUnread, setFetchingUnread] = useState(false);
  const [expandedId, setExpandedId] = useState(null); // ✅ Track which item is expanded

  const { user, isAuthenticated } = useClientAuth();

  const navigate = useNavigate();
  const language = "he"; // Define language preference for fetching professions

  useEffect(() => {
  
    // ✅ Only fetch requests after auth is confirmed
    const fetchRequests = async () => {
      setFetchingRequests(true);
      try {
        const response = await api.get(`/api/my_requests?type=${requestType}`);
        if (response.data.success) {
          const fetchedRequests = response.data.data;

          // Fetch professions for each request
          const updatedRequests = await Promise.all(
            fetchedRequests.map(async (request, index) => {
              try {
                const professionResponse = await api.get(
                  `/api/professionals/profession/${request.jobRequiredId}/${language}`
                );
                if (professionResponse.data.success) {
                  return {
                    ...request,
                    mainProfession: professionResponse.data.data.main,
                    subProfession: professionResponse.data.data.sub,
                    index: index + 1, // ✅ Left section number as an index (starts from 1)
                  };
                }
              } catch (error) {
                console.error("Error fetching profession:", error);
              }
              return {
                ...request,
                mainProfession: "לא ידוע",
                subProfession: "לא ידוע",
                index: index + 1, // ✅ Keep the index even if there's an error
              };
            })
          );

          setRequests(updatedRequests); // ✅ Set state before fetching unread counts
          setFetchingRequests(false);

          // ✅ Fetch unread message counts after requests are loaded
          fetchUnreadCounts(updatedRequests);
        } else {
          console.error("Failed to fetch requests:", response.data.message);
          setFetchingRequests(false);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        setFetchingRequests(false);
      }
    };

    fetchRequests();
  }, [isAuthenticated, requestType, navigate]);

  // ✅ Fetch unread message counts **only after requests are loaded**
  const fetchUnreadCounts = async (updatedRequests) => {
    if (!user) {
      console.log("❌ No user found. Skipping unread count fetch.");
      return;
    }
  
    setFetchingUnread(true);
    console.log("🔄 Starting to fetch unread message counts...");
  
    const userId = user.id;
    const userToken = sessionStorage.getItem("clientChatToken");
  
    if (!userId || !userToken) {
      console.log("❌ Missing userId or userToken. Skipping fetch.");
      setFetchingUnread(false);
      return;
    }
  
    try {
      const requestIds = updatedRequests.map((req) => req.id);
      console.log("📩 Requesting unread counts for request IDs:", requestIds);
  
      const unreadCounts = await fetchUnreadMessages(userId, userToken, requestIds);
  
      console.log("✅ Unread counts received:", unreadCounts);
  
      setRequests((prevRequests) =>
        prevRequests.map((request) => ({
          ...request,
          unreadMessages: unreadCounts[request.id] || 0, // ✅ Default to 0 if not found
        }))
      );
    } catch (error) {
      console.error("❌ Error fetching unread messages:", error);
    } finally {
      setFetchingUnread(false);
      console.log("✅ Finished fetching unread counts.");
    }
  };
  

  // ✅ **Show loading only if authentication OR fetching requests is in progress**
  if ( fetchingRequests)  {
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

  const toggleExpand = (e, id) => {
    e.stopPropagation(); // ✅ Prevent triggering navigation
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  return (
    <Box>
      <ClientHeader /> {/* ✅ Header Integration */}

      <Box className={styles.requestListContainer}>
        <Box className={styles.header}>
          <Typography variant="h4" className={styles.title}>{title}</Typography>
        </Box>

        {requests.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              margin: "20px 0",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" color="white">
              אין בקשות
            </Typography>
          </Box>
        ) : (
          <Box className={styles.requestsList}>
            {requests.map((request, index) => (
              <React.Fragment key={request.id}>
                <Box className={styles.requestCard} onClick={() => navigate(`/request?id=${request.id}`)}>
                  <Box className={styles.topSection}>
                    <Typography className={styles.leftSection}>{request.index}</Typography>

                    <Box className={styles.professionDateContainer}>
                      <Typography className={styles.professionValue}>
                        {request.mainProfession}, {request.subProfession}
                      </Typography>
                      <Typography className={styles.dateText}>
                        {new Date(request.date).toLocaleString()}
                      </Typography>
                    </Box>

                    <Box className={styles.rightSection}>
                      <Box className={styles.badgeWrapper}>
                        <Badge
                          badgeContent={fetchingUnread ? '...' : request.unreadMessages || 0}
                          color="error"
                          showZero
                        />
                      </Box>

                      <IconButton
                        onClick={(e) => toggleExpand(e, request.id)}
                        size="small"
                        sx={{ height: '100%' }}
                      >
                        {expandedId === request.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  <Collapse in={expandedId === request.id}>
                    <Box className={styles.detailsSection}>
                      <Box className={styles.infoBlock}>
                        <Typography className={styles.infoLabel}>קריאה</Typography>
                        <Typography className={styles.infoValue}>{request.id}</Typography>
                      </Box>

                      <Box className={styles.infoBlock}>
                        <Typography className={styles.infoLabel}>מומחים</Typography>
                        <Typography className={styles.infoValue}>{request.numOfProfs || "0"}</Typography>
                      </Box>
                    </Box>
                  </Collapse>
                </Box>

                {index < requests.length - 1 && <Box className={styles.separator}></Box>}
              </React.Fragment>
            ))}
          </Box>
        )}

        <Box className={styles.footer} sx={{ textAlign: "center", marginTop: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(-1)}
            sx={{
              fontSize: "18px",
              padding: "10px 40px",
              borderRadius: "10px",
              backgroundColor: "#1A4B75",
            }}
          >
            חזור
          </Button>
        </Box>
      </Box>
    </Box>
  );
};


export default RequestList;
