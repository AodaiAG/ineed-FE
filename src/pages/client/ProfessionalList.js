import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Card, Typography, Avatar, Divider, Radio, FormControlLabel } from "@mui/material";
import styles from "../../styles/client/ProfessionalList.module.css";

const ProfessionalList = () => {
  const { id } = useParams(); // Get the request ID from the route

  const professionals = [
    {
      id: 1,
      name: "אחמד פרחון עלי",
      profileImage: "/images/professional1.png",
      offer: "500₪",
      company: "שלמה אינסטלציה בע״מ",
    },
    {
      id: 2,
      name: "אלי רגדג",
      profileImage: "/images/professional2.png",
      offer: "400₪",
      company: "שלמה אינסטלציה בע״מ",
    },
  ];

  const [selectedProfessional, setSelectedProfessional] = useState(null);

  const handleSelect = (id) => {
    setSelectedProfessional(id);
  };

  return (
    <Box className={styles.professionalListContainer}>
      {/* Header */}
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.title}>
          רשימת מומחים
        </Typography>
        <Typography className={styles.requestId}>קריאה {id}</Typography>
      </Box>

      {/* Request Details */}
      <Box className={styles.requestDetails}>
        <Typography className={styles.detailsText}>אינסטלציה, התקנת ברז</Typography>
        <Typography className={styles.dateText}>17.05.2025 18:40</Typography>
      </Box>

      <Divider className={styles.divider} />

      {/* Professionals List */}
      <Box className={styles.professionalsList}>
        {professionals.map((professional) => (
          <Card key={professional.id} className={styles.professionalCard}>
            <Box className={styles.cardContent}>
              <Box className={styles.radioContainer}>
                <Radio
                  checked={selectedProfessional === professional.id}
                  onChange={() => handleSelect(professional.id)}
                  className={styles.radio}
                />
              </Box>
              <Box className={styles.avatarContainer}>
                <Avatar
                  src={professional.profileImage}
                  alt={professional.name}
                  className={styles.avatar}
                />
              </Box>
              <Box className={styles.textContainer}>
                <Typography className={styles.nameText}>{professional.name}</Typography>
                <Typography className={styles.offerText}>הצעה: {professional.offer}</Typography>
                <Typography className={styles.companyText}>{professional.company}</Typography>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Footer */}
      <Box className={styles.footer}>
        <button
          className={styles.submitButton}
          onClick={() => alert(`Selected Professional ID: ${selectedProfessional}`)}
        >
          המשך
        </button>
      </Box>
    </Box>
  );
};

export default ProfessionalList;
