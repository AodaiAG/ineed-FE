import React, { useState } from "react";
import { Box, Button, ButtonBase } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "../../styles/client/AppStart.css"; // Import your custom CSS file
import LanguageSelectionPopup from "../../components/LanguageSelectionPopup"; // Import your popup component
import { useLanguage } from "../../contexts/LanguageContext"; // Import useLanguage for translations

const AppStart = () => {
  const [showPopup, setShowPopup] = useState(false); // State to toggle popup visibility
  const { translation } = useLanguage(); // Access translations
  const navigate = useNavigate(); // Initialize the navigation hook

  // Handlers for navigation
  const handleClientClick = () => {
    navigate("/home"); // Navigate to /home for clients
  };

  const handleServiceProviderClick = () => {
    navigate("/pro/expert-main"); // Navigate to /pro/expert-main for service providers
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
    <Box className="appstart-container">
      {/* Header */}
      <Box className="appstart-header">
        {/* Translate Icon */}
        <div className="appstart-icon-button">
          <ButtonBase onClick={() => setShowPopup(true)}> {/* Show popup on click */}
            <img
              src="/images/ct/language-icon.png" // Replace with your actual path
              alt="Language Icon"
              className="appstart-icon"
            />
          </ButtonBase>
        </div>

        {/* Title and Description */}
        <Box className="appstart-content">
          <h1 className="appstart-title">I Need</h1>
          <p className="appstart-description">{translation.appStart.description}</p>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="appstart-main">
        <img
          src="/images/ct/wk.png" // Replace with your actual path
          alt="Worker"
          className="appstart-image"
        />
      </Box>
      
      {/* Footer */}
      <Box className="appstart-footer">
        <Button
          variant="contained"
          className="service-provider-button"
          sx={{
            backgroundColor: "#000000",
            color: "#FFFFFF",
            borderRadius: "14px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            width: "45%",
          }}
          onClick={handleServiceProviderClick} // Navigate to service provider page
        >
          {translation.appStart.serviceProvider}
        </Button>
        <Button
          variant="contained"
          className="client-button"
          sx={{
            backgroundColor: "#007BFF",
            color: "#FFFFFF",
            borderRadius: "14px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            width: "45%",
          }}
          onClick={handleClientClick} // Navigate to client page
        >
          {translation.appStart.client}
        </Button>
      </Box>

      {/* Language Selection Popup */}
      {showPopup && (
        <LanguageSelectionPopup
          onClose={() => setShowPopup(false)} // Close popup on action
          backgroundColor="#1783E0" // Blue background for the client side
        />
      )}
    </Box>
  );
};

export default AppStart;
