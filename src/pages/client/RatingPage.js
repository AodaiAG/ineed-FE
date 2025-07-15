import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import Rating from "@mui/material/Rating";
import api from "../../utils/clientApi";
import useAuthCheck from "../../hooks/useAuthCheck";
import styles from "../../styles/client/RatingPage.module.css";
import { useMessage } from "../../contexts/MessageContext";

const RatingPage = () => {
  const navigate = useNavigate();
  const { id: requestId } = useParams();
  const [ratingAllowed, setRatingAllowed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, loading: authLoading } = useAuthCheck();
  const { showMessage } = useMessage();

  const [ratingData, setRatingData] = useState({
    qualityRating: 1,
    professionalismRating: 1,
    priceRating: 1,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const validateRating = async () => {
      try {
        const response = await api.get(`/api/validate-rating/${requestId}`);
        if (response.data.success) {
          setRatingAllowed(true);
        } else {
          setErrorMessage(response.data.message);
        }
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Error validating rating.");
      } finally {
        setLoading(false);
      }
    };

    validateRating();
  }, [authLoading, isAuthenticated, navigate, requestId]);

  const handleSubmitRating = async () => {
    try {
      const response = await api.post(`/api/rate-professional`, {
        requestId,
        ...ratingData,
      });

      if (response.data.success) {
        showMessage("הדירוג שלך נשלח בהצלחה!", "success"); // ✅ Success message for rating submission
        navigate("/dashboard");
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "נכשל לשלוח את הדירוג.", "error"); // ❌ Error message for rating submission
    }
  };

  if (loading) {
    return (
<Box className={styles.loadingContainer} 
  sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
  <CircularProgress />
</Box>

    );
  }

  if (!ratingAllowed) {
    return (
      <Box className={styles.errorContainer}>
        <Typography variant="h6">{errorMessage}</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} className={styles.backButton}>
          חזור
        </Button>
      </Box>
    );
  }

  return (
    <Box className={styles.pageContainer}>
      {/* Header */}
      <Box className={styles.headerContainer}>
        <Typography className={styles.headerTitle}>הקריאה הסתיימה</Typography>
        <Box className={styles.requestIdContainer}>
          <Typography className={styles.requestIdLabel}>קריאה</Typography>
          <Typography className={styles.requestId}>{requestId}</Typography>
        </Box>
      </Box>

      {/* Ratings */}
      <Box className={styles.ratingSection}>
        <Typography className={styles.ratingLabel}>איכות</Typography>
        <Box className={styles.ratingContainer}>
          <Rating
            value={ratingData.qualityRating}
            onChange={(e, newValue) => setRatingData({ ...ratingData, qualityRating: newValue })}
          />
        </Box>

        <Typography className={styles.ratingLabel}>מקצועיות</Typography>
        <Box className={styles.ratingContainer}>
          <Rating
            value={ratingData.professionalismRating}
            onChange={(e, newValue) => setRatingData({ ...ratingData, professionalismRating: newValue })}
          />
        </Box>

        <Typography className={styles.ratingLabel}>מחיר</Typography>
        <Box className={styles.ratingContainer}>
          <Rating
            value={ratingData.priceRating}
            onChange={(e, newValue) => setRatingData({ ...ratingData, priceRating: newValue })}
          />
        </Box>
      </Box>

      {/* Submit Button */}
      <Button variant="contained" onClick={handleSubmitRating} className={styles.submitButton}>
        שליחה
      </Button>
    </Box>
  );
};

export default RatingPage;