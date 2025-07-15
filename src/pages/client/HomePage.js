import React, { useState,useEffect } from "react";
import { Box, Button, ButtonBase,Typography } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "../../styles/client/HomePage.css"; // Import your custom CSS file
import LanguageSelectionPopup from "../../components/LanguageSelectionPopup"; // Import the popup component
import { useLanguage } from "../../contexts/LanguageContext"; // Import useLanguage for translations
import useClientAuthCheck from "../../hooks/useClientAuthCheck";



const HomePage = () => {
  const [showPopup, setShowPopup] = useState(false); // State to toggle the popup
  const { translation } = useLanguage(); // Access translations
  const navigate = useNavigate(); // Initialize the navigation hook
  const { isAuthenticated, loading, user } = useClientAuthCheck();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [loading, isAuthenticated, navigate]);

  // Handler for the "קדימה" button click
  const handleButtonClick = () => {
    navigate("/main"); // Navigate to the /main route
  };
  if (!translation) 
    {
    return (
        <div className={'spinner-overlay'}>
            <div className={'spinner'}></div>
        </div>
    );
   }
  return (
    <Box className="home-container">
      {/* Header */}
      <Box className="home-header">
        {/* Translate Image */}
        <div className="header-icon-button">
          <ButtonBase onClick={() => setShowPopup(true)}>
            <img
              src="/images/ct/language-icon.png" // Replace with your actual image path
              alt="Language Icon"
              className="appstart-icon"
            />
          </ButtonBase>
        </div>

        {/* Title and Description */}
        <Box className="header-content">
          <h1 className="home-title">{translation.homePage.title}</h1>
          <p className="home-description">{translation.homePage.description}</p>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="home-main">
        <img
          src="/images/ct/worker1.png" // Replace with your actual image path
          alt="Worker"
          className="home-image"
        />

          <Typography
            variant="body1"
            className="relogin-text"
            onClick={() => navigate("/sign-in")}
          >
            כניסה חוזרת
          </Typography>

      </Box>

      {/* Footer */}
      <Box className="home-footer">
        <Button
          variant="contained"
          color="secondary"
          sx={{
            borderRadius: "14px", // Apply border-radius
            fontSize: "1.6rem", // Medium font size
          }}
          className="footer-button"
          onClick={handleButtonClick} // Navigate to /main on click
        >
          {translation.homePage.continue}
        </Button>
      </Box>

      {/* Language Selection Popup */}
      {showPopup && (
        <LanguageSelectionPopup
          onClose={() => setShowPopup(false)} // Close popup on action
          backgroundColor="#1783E0" // Blue background for this instance
        />
      )}
    </Box>
  );
};

export default HomePage;
