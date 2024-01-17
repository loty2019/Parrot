import React, { useState } from 'react';
import './style.css'; // Assuming this is the correct path to your CSS file
import Logo from 'data-base64:~assets/images/parrotLogo.png';

function IndexPopup() {
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleExtension = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <div className="popup-container">
      <img className="logo" src={Logo} alt="Parrot Logo" />
      <label className="switch m-5">
        <input type="checkbox" checked={isEnabled} onChange={toggleExtension} />
        <span className="slider round"></span>
      </label>
    </div>
  );
}

export default IndexPopup;