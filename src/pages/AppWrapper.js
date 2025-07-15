import React from "react";
import styles from "../styles/AppWrapper.module.css"; // ✅ Import CSS

const AppWrapper = ({ children }) => {
  return (
    <>
      {/* ✅ Only render the phone frame on large screens */}
      <div className={styles.iphoneWrapper}>
        <div className={styles.iphoneFrame}>
          <div className={styles.iphoneScreen} id="drawer-container">{children}</div>
        </div>
      </div>

      {/* ✅ On small screens, just render the normal app */}
      <div className={styles.mobileWrapper} >{children}</div>
    </>
  );
};

export default AppWrapper;
