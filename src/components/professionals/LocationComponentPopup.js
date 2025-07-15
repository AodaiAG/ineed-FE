import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext'; // Import useLanguage hook
import styles from '../../styles/LocationComponentPopup.module.css'; // Ensure the path is correct
function LocationComponentPopup({ onClose, onSelect, initialLocation, theme = "default" }) {
  const { translation } = useLanguage(); // Use the translation object from context
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [lat, setLat] = useState(initialLocation?.lat || 31.0461);
  const [lon, setLon] = useState(initialLocation?.lon || 34.8516);
  const [errorMessage, setErrorMessage] = useState(""); // State to hold error messages

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
      } else {
        const interval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(interval);
            initMap();
          }
        }, 100);
      }
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (initialLocation) {
      setAddress(initialLocation.address || "");
      setLat(initialLocation.lat || 31.0461);
      setLon(initialLocation.lon || 34.8516);
    }
  }, [initialLocation]);

  const initMap = () => {
    const initialLocationLatLng = { lat: lat, lng: lon };
    const map = new window.google.maps.Map(document.getElementById("popupMap"), {
      center: initialLocationLatLng,
      zoom: 13,
    });

    const marker = new window.google.maps.Marker({
      position: initialLocationLatLng,
      map,
    });

    const input = document.getElementById("popupLocationInput");
    if (input) {
      const autocomplete = new window.google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          alert("No details available for input: '" + place.name + "'");
          return;
        }

        map.setCenter(place.geometry.location);
        map.setZoom(13);
        marker.setPosition(place.geometry.location);

        setLat(place.geometry.location.lat());
        setLon(place.geometry.location.lng());
        setAddress(place.formatted_address);
      });
    } else {
      console.error("Input field for Autocomplete was not found");
    }
  };

  const handleFindMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLon(longitude);
          const location = new window.google.maps.LatLng(latitude, longitude);
          const map = new window.google.maps.Map(document.getElementById("popupMap"), {
            center: location,
            zoom: 13,
          });
          const marker = new window.google.maps.Marker({
            position: location,
            map,
          });

          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location }, (results, status) => {
            if (status === "OK" && results[0]) {
              setAddress(results[0].formatted_address);
            } else {
              alert(translation.location.unknownError);
            }
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert(translation.location.permissionDenied);
              break;
            case error.POSITION_UNAVAILABLE:
              alert(translation.location.positionUnavailable);
              break;
            case error.TIMEOUT:
              alert(translation.location.timeout);
              break;
            default:
              alert(translation.location.unknownError);
              break;
          }
        }
      );
    } else {
      alert(translation.location.noGeolocationSupport);
    }
  };

  return ReactDOM.createPortal(
    <div className={styles["popupOverlay"]}>
      <div
        className={styles["location-container"]}
        style={
          theme === "client"
            ? {
                backgroundColor: "#1783e0",
                border: "5px solid #ffffff",
              }
            : {}
        }
      >
        <h2 className={styles["location-title"]}>{translation.location.selectLocation}</h2>
        <label className={styles["location-label"]}>{translation.location.enterLocation}</label>
        <input
          type="text"
          id="popupLocationInput"
          className={styles["location-input"]}
          value={address}
          onFocus={() => setAddress("")} // Clear the value when the input gains focus
          onChange={(e) => setAddress(e.target.value)}
          placeholder={translation.location.locationPlaceholder}
        />
        <button className={styles["location-find-button"]} onClick={handleFindMe}>
          <img
            src="/images/location_icon.png"
            alt={translation.location.locationIconAlt}
            className={styles["location-button-icon"]}
          />
          {translation.location.findMe}
        </button>
        <div className={styles["location-map-container"]}>
          <div id="popupMap" className={styles["location-map-image"]} style={{ height: "200px", width: "100%" }}></div>
        </div>
        {errorMessage && <p className={styles["error-message"]}>{errorMessage}</p>} {/* Display error messages */}
        <button
          className={styles["location-continue-button"]}
          style={
            theme === "client"
              ? {
                  color: "#ffffff", // Change text color to white
                }
              : {}
          }
          onClick={() => {
            onSelect({
              address,
              lat,
              lon,
            });
            onClose();
          }}
        >
          {translation.location.continue}
        </button>
      </div>
    </div>,
    document.body
  );
}

export default LocationComponentPopup;

