import axios from 'axios';
import { API_URL } from "../utils/constans";

// Get the minimum date and time (for date picker)


export const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Fetch all main professions
export const getMainProfessions = async () => {
    try {
        const response = await axios.get(`${API_URL}/main-professions`);
        return response.data.slice(1);  // Remove the first element if needed
    } catch (error) {
        console.error('Error fetching main professions:', error);
        throw error;
    }
};

// Fetch sub professions based on the selected main profession
export const getSubProfessions = async (main) => {
    try {
        const response = await axios.get(`${API_URL}/sub-professions/${main}`);
        return response.data.slice(1);  // Remove the first element if needed
    } catch (error) {
        console.error('Error fetching sub professions:', error);
        throw error;
    }
};

// Send SMS function
export const sendSms = async (phoneNumber, message) => {
    try {
        const url = `https://sms.innovio.co.il/sms.php?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

        // Send the request using fetch with no-cors mode
        await fetch(url, {
            method: 'GET',
            mode: 'no-cors',
        });

        console.log('SMS sent successfully (no-cors mode)');
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};


// Get the direction based on language
export const getDirection = (language) => {
    return language === 'ar' || language === 'he' ? 'rtl' : 'ltr';
};

// Check if the language is RTL
export const isRtl = (language) => {
    return ['ar', 'he'].includes(language);
};

export const generateDayMappings = () => {
    return {
        he: ["א", "ב", "ג", "ד", "ה", "ו", "ש"],
        en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    };
};

export const languageMapping = {
    he: 0,
    en: 1,
    ru: 2,
    es: 3,
    ar: 4
};

export const shortenUrl = async (longUrl) => {
    try {
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${longUrl}`);
        return response.data; // The API returns the shortened URL as plain text
    } catch (error) {
        console.error('Error shortening URL:', error);
        // If there's an error, just return the original URL
        return longUrl;
    }
};

// Utility to generate a reverse mapping
export const languageLabelMapping = {
    0: {
        he: "עברית",
        en: "Hebrew",
        ru: "Иврит",
        es: "Hebreo",
        ar: "عبرية"
    },
    1: {
        he: "אנגלית",
        en: "English",
        ru: "Английский",
        es: "Inglés",
        ar: "إنجليزي"
    },
    2: {
        he: "רוסית",
        en: "Russian",
        ru: "Русский",
        es: "Ruso",
        ar: "روسي"
    },
    3: {
        he: "ספרדית",
        en: "Spanish",
        ru: "Испанский",
        es: "Español",
        ar: "إسباني"
    },
    4: {
        he: "ערבית",
        en: "Arabic",
        ru: "Арабский",
        es: "Árabe",
        ar: "عربي"
    }
};

export const getLanguageLabelById = (id, language = 'he') => {
    return languageLabelMapping[id] ? languageLabelMapping[id][language] : "Unknown Language";
};

// Convert day name to numeric value (regardless of language)
export const dayNameToNumber = (dayName) => {
    const dayMappings = generateDayMappings();
    const languageKeys = Object.keys(dayMappings);
    for (const language of languageKeys) {
        const index = dayMappings[language].indexOf(dayName);
        if (index !== -1) {
            return index;
        }
    }
    return null; // Return null if the dayName is not found
};

// Convert numeric value to day name based on selected language
export const dayNumberToName = (dayNumber, language = "he") => {
    const dayMappings = generateDayMappings();
    return dayMappings[language][dayNumber] || "Unknown Day";
};
