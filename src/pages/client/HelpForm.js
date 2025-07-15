import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import LocationComponentPopup from "../../components/professionals/LocationComponentPopup";
import "../../styles/client/HelpForm.css";
import { API_URL } from "../../utils/constans";
import { useLanguage } from '../../contexts/LanguageContext';
import { getDirection } from "../../utils/generalUtils"; // Import getDirection
import axios from "axios";
import useClientAuthCheck from '../../hooks/useClientAuthCheck';
import { debounce } from "lodash"; // ✅ Import debounce to prevent excessive API calls
import { useMessage } from "../../contexts/MessageContext";



const HelpForm = () => {
  const navigate = useNavigate();
  const { translation } = useLanguage();
  const [subProfessions, setSubProfessions] = useState([]); // Ensure it starts as an empty array
  const [selectedSubProfession, setSelectedSubProfession] = useState(() => {
    const savedSubProfession = JSON.parse(sessionStorage.getItem("subProfession"));
    return savedSubProfession || null;
  });
  

  
  const [domain, setDomain] = useState(
    JSON.parse(sessionStorage.getItem("domain")) || null
  );
  const [mainProfession, setMainProfession] = useState(
    JSON.parse(sessionStorage.getItem("mainProfession")) || null
  );
  const [city, setCity] = useState(
    sessionStorage.getItem("city") || ""
  );
  const [date, setDate] = useState(
    sessionStorage.getItem("date") || ""
  );
  const [domains, setDomains] = useState([]);
  const [mainProfessions, setMainProfessions] = useState([]);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [selectedLanguage] = useState(
    localStorage.getItem("userLanguage") || "he"
  );

  
  const [problem, setProblem] = useState(""); // ✅ Stores user input
  const [aiSuggestions, setAiSuggestions] = useState([]); // ✅ AI suggestions list
  const [showDropdown, setShowDropdown] = useState(false); // ✅ Controls AI suggestions dropdown visibility
  const [isTyping, setIsTyping] = useState(false);

  const { isAuthenticated, loading ,user} = useClientAuthCheck();
  const { showMessage } = useMessage();


  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) 
        {
          console.log("yes");

        } 

    else {
        console.log("NO");
    }
}, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    const direction = getDirection(selectedLanguage); // Get the direction using the utility function
    document.documentElement.style.setProperty("--container-direction", direction);
  }, [selectedLanguage]);

  // Fetch domains dynamically
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/${selectedLanguage}/domains`
        );
        setDomains(response.data);
      } catch (error) {
        console.error("Error fetching domains:", error);
      }
    };

    fetchDomains();
  }, [selectedLanguage]);

  // Fetch main professions dynamically when a domain is selected
  useEffect(() => {
    if (domain) {
      const fetchMainProfessions = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/${selectedLanguage}/main-professions?domain=${domain.domain}`
          );
          setMainProfessions(response.data);
        } catch (error) {
          console.error("Error fetching main professions:", error);
        }
      };

      fetchMainProfessions();
    } else {
      setMainProfessions([]); // Clear main professions if no domain is selected
    }
  }, [domain, selectedLanguage]);

useEffect(() => {
  if (mainProfession) {
    const fetchSubProfessions = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/${selectedLanguage}/sub-professions/${mainProfession.main}`
        );
        setSubProfessions(Array.isArray(response.data) ? response.data : []); // Ensure it's an array
      } catch (error) {
        console.error("Error fetching sub professions:", error);
        setSubProfessions([]); // Set to an empty array in case of an error
      }
    };

    fetchSubProfessions();
  } else {
    setSubProfessions([]); // Clear if no main profession is selected
  }
}, [mainProfession, selectedLanguage]);

const fetchAiSuggestions = debounce(async (query) => {
  if (!query) {
    
    setAiSuggestions([]);
    setShowDropdown(false);
    return;
  }

  try {
    // 1️⃣ Get the selected language (if you store it in state/localStorage)
    const language = localStorage.getItem("userLanguage") || "he";

    // 2️⃣ Call AI API (Returns only IDs)
    const aiResponse = await axios.post(`${API_URL}/ai/suggest`, { query, lang: language });

    if (!aiResponse.data || aiResponse.data.length === 0) {
      setAiSuggestions([]);
      setShowDropdown(false);
      return;
    }

    console.log("🔹 AI Returned IDs:", aiResponse.data); // Debugging

    // 3️⃣ Fetch full details for each returned ID using your existing API
    const jobDetailsRequests = aiResponse.data.map(id =>
      axios.get(`${API_URL}/professionals/profession/${id}/${language}`)
    );

    // 4️⃣ Wait for all requests to complete
    const jobDetailsResponses = await Promise.all(jobDetailsRequests);

    // 5️⃣ Extract profession data and preserve the original ID
    const fullJobDetails = jobDetailsResponses.map((res, index) => ({
      ...res.data.data,
      id: aiResponse.data[index] // Preserve the original ID from AI response
    }));

    console.log("🔹 Full Job Details:", fullJobDetails); // Debugging

    // 6️⃣ Update state with fetched details
    setAiSuggestions(fullJobDetails);
    setShowDropdown(fullJobDetails.length > 0); // Show dropdown if results exist

  } catch (error) {
    console.error("❌ Error fetching AI suggestions:", error);
    setAiSuggestions([]);
    setShowDropdown(false);
  }
}, 500); // ✅ 0.5s debounce



const handleSearchChange = (event) => {
  const query = event.target.value;
  setProblem(query);
  setIsTyping(query !== "");
  fetchAiSuggestions(query); // Call AI API after debounce
};

const handleSuggestionClick = (suggestion) => {
  console.log("🔹 User Selected:", suggestion); // ✅ Debug Click Event

  setDomain({ domain: suggestion.domain });
  setMainProfession({ main: suggestion.main });
  setSelectedSubProfession({ id: suggestion.id, sub: suggestion.sub }); // Match manual selection structure

  setProblem(`${suggestion.domain} - ${suggestion.main} - ${suggestion.sub}`); // ✅ Fill search box
  setShowDropdown(false); // ✅ Hide dropdown
};


  if (!translation) 
    {
    return (
        <div className={'spinner-overlay'}>
            <div className={'spinner'}></div>
        </div>
    );
   }

  const handleSubmit = () => {
    if (!domain || !mainProfession || !city || !date) {
    showMessage("יש למלא את כל השדות הנדרשים.", "error");
      return;
    }

    // Save data to sessionStorage
    sessionStorage.setItem("domain", JSON.stringify(domain));
    sessionStorage.setItem("mainProfession", JSON.stringify(mainProfession));
    sessionStorage.setItem("city", city);
    sessionStorage.setItem("date", date);
    sessionStorage.setItem("subProfession", JSON.stringify(selectedSubProfession)); // Save selected sub-profession

    if (isAuthenticated) {
      navigate("/summary");

    }
    else
    {
// Navigate to /about
    navigate("/about");
    }
    
  };

  const handleLocationSelect = (location) => {
    setCity(location.address); // Update city with the selected address
  };

  return (
    <Box className="help-form-container">
      {/* Title */}
      <h2 className="help-form-title">{translation.helpForm.title}</h2>

      {/* 🔍 Search Box (AI-Powered, Keeping Original UI) */}
      <Box className="help-form-search-container">
        <TextField
          className="help-form-search"
          placeholder={translation.helpForm.searchPlaceholder}
          variant="outlined"
          size="small"
          fullWidth
          value={problem}
          onChange={handleSearchChange}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Hide dropdown on blur (delay to allow clicks)
        />
        <Box className={`search-icon-box ${isTyping ? "is-typing" : ""}`}>
          <SearchIcon
            className="search-icon"
            sx={{
              width: "100%",
              height: "100%",
            }}
          />
        </Box>
      </Box>

      {/* 🔹 AI Suggestions Dropdown */}
      {showDropdown && (
        <Box className="ai-suggestions-dropdown">
          {aiSuggestions.map((suggestion) => (
            <Box
              key={suggestion.id}
              className="ai-suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.domain} - {suggestion.main} - {suggestion.sub}
            </Box>
          ))}
        </Box>
      )}

     {/* 🔹 Grouped Input Fields for Better Control */}
<Box className="help-form-fields-container">
  <Box className="help-form-field">
    <label>{translation.helpForm.selectDomain}</label>
    <Autocomplete
      options={domains}
      getOptionLabel={(option) => option.domain || ""}
      isOptionEqualToValue={(option, value) => option.domain === value.domain}
      value={domain}
      onChange={(event, newValue) => setDomain(newValue)}
      openOnFocus
      renderInput={(params) => (
        <TextField {...params} placeholder={translation.helpForm.selectDomain} fullWidth className="help-form-input" />
      )}
    />
  </Box>

  <Box className="help-form-field">
    <label>{translation.helpForm.selectProfession}</label>
    <Autocomplete
      options={mainProfessions}
      getOptionLabel={(option) => option.main || ""}
      isOptionEqualToValue={(option, value) => option.main === value.main}
      value={mainProfession}
      onChange={(event, newValue) => setMainProfession(newValue)}
      openOnFocus
      disabled={!domain}
      renderInput={(params) => (
        <TextField {...params} placeholder={translation.helpForm.selectProfession} fullWidth className="help-form-input" />
      )}
    />
  </Box>

  <Box className="help-form-field">
    <label>{translation.helpForm.selectSubProfession || "Select Sub-Profession"}</label>
    <Autocomplete
      options={subProfessions}
      getOptionLabel={(option) => option.sub || ""}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={selectedSubProfession}
      onChange={(event, newValue) => setSelectedSubProfession(newValue)}
      openOnFocus
      disabled={!mainProfession}
      renderInput={(params) => (
        <TextField {...params} placeholder={translation.helpForm.selectSubProfession} fullWidth className="help-form-input" />
      )}
    />
  </Box>

  <Box className="help-form-field">
    <label>{translation.helpForm.selectCity}</label>
    <TextField
      value={city}
      onClick={() => setShowLocationPopup(true)}
      placeholder={translation.helpForm.selectCity}
      fullWidth
      className="help-form-input"
      inputProps={{ readOnly: true, style: { cursor: "pointer" } }}
    />
  </Box>

  <Box className="help-form-field">
    <label>{translation.helpForm.selectDate}</label>
    <TextField
      type="datetime-local"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      fullWidth
      className="help-form-input"
      inputProps={{ style: { textAlign: "center" } }}
    />
  </Box>
</Box>

      {/* Submit Button */}
      <Button
        variant="contained"
        className="help-form-submit"
        onClick={handleSubmit}
        sx={{
          borderRadius: "14px",
          fontSize: "1.6rem",
        }}
      >
        {translation.helpForm.continue}
      </Button>

      {/* Location Popup */}
      {showLocationPopup && (
        <LocationComponentPopup
          onClose={() => setShowLocationPopup(false)}
          onSelect={handleLocationSelect}
          initialLocation={{ address: city }}
          theme="client" // Apply client-specific styles
        />
      )}
    </Box>
  );
};

export default HelpForm;
