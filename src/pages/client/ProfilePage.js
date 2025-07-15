import React from "react";
import { Box, Typography, Card, CardMedia, Button, Rating } from "@mui/material";
import styles from "../../styles/client/ProfilePage.module.css";

const ProfilePage = () => {
  const dummyData = {
    name: "אלי יחיאל",
    expertise: "חשמלאי, צבעי, אינסטלטור",
    rating: 3.5, // Rating out of 5
    numberOfCompletedJobs: 316, // Number of completed jobs
    profileImage: "/images/Prof/35.png",
    mapImage: "/images/Prof/l.png",
  };

  return (
    <Box className={styles.profilePageContainer}>
      {/* Header */}
      <Box className={styles.header}>
        <Typography variant="h5" className={styles.nameText}>
          {dummyData.name}
        </Typography>
      </Box>

      {/* Profile Image */}
      <Card className={styles.profileImageCard}>
        <CardMedia
          component="img"
          image={dummyData.profileImage}
          alt="Worker Profile"
          className={styles.profileImage}
        />
      </Card>

      {/* Fields of Expertise */}
      <Card className={styles.infoCard}>
        <Typography className={styles.infoTitle}>תחומי עיסוק</Typography>
        <Typography className={styles.infoText}>{dummyData.expertise}</Typography>
      </Card>

      {/* Rating and Jobs */}
      <Card className={styles.infoCard}>
        <Box className={styles.ratingSection}>
          <Typography className={styles.infoTitle}>הדירוג שלי</Typography>
          <Rating
            value={dummyData.rating}
            precision={0.5}
            readOnly
            sx={{
              color: "#fdbe00", // Star color
              fontSize: "24px", // Adjust star size
              marginLeft: "10px", // Space between label and stars
            }}
          />
        </Box>
        <Typography className={styles.infoText}>
          מספר העבודות: {dummyData.numberOfCompletedJobs}
        </Typography>
      </Card>

      {/* Location */}
      <Box className={styles.locationBox}>
        <CardMedia
          component="img"
          image={dummyData.mapImage}
          alt="Location Map"
          className={styles.mapImage}
        />
        <Typography className={styles.locationLabel}>אזור הזמינות</Typography>
      </Box>

      {/* Back Button */}
      <Box className={styles.footer}>
        <Button variant="contained" className={styles.backButton}>
          חזור
        </Button>
      </Box>
    </Box>
  );
};

export default ProfilePage;
