import React, { useState, useEffect } from 'react';
import './style.css'; // Assuming this is the correct path to your CSS file
import Logo from 'data-base64:~assets/images/parrotLogo.png';
import { sendToBackground } from "@plasmohq/messaging";


function IndexPopup() {
  console.log("IndexPopup component is rendering");
  // Initialize state with value from local storage
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('isEnabled');
    return saved === 'true' ? true : false;
  });

  // Update local storage when isEnabled changes
  useEffect(() => {
    localStorage.setItem('isEnabled', isEnabled.toString());
    chrome.runtime.sendMessage({ isEnabled: isEnabled });
  }, [isEnabled]);

  const toggleExtension = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <div className="w-48 h-fit flex flex-col items-center bg-[#fffffffb]">
      <div className='w-48 flex justify-center bg-slate-300 '>
        <p className="text-lg font-extrabold">Parrot</p>
      </div>

      <img className="w-20 h-20 mt-2" src={Logo} alt="Parrot Logo" />

      <p className="text-sm font-extrabold mb-5">Ahoy, Matey!</p>

      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={isEnabled} 
          onChange={toggleExtension}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
      <p className='font-extrabold '>{isEnabled ? 'ON' : 'OFF'}</p>
     
    </div>
  );
}

export default IndexPopup;