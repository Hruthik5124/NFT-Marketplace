// components/LoadingScreen.tsx
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loader"></div>
      <p className="loading-text">Please wait...</p>
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
          background: rgba(255, 255, 255, 0.8); /* Light white background with reduced opacity */
          position: fixed; /* Fixes the loader in place */
          top: 0;
          left: 0;
          z-index: 9999; /* Ensures it is on top of other content */
        }

        .loader {
          border: 8px solid #f3f3f3; /* Light grey */
          border-top: 8px solid #000000; /* Black */
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px; /* Space between spinner and text */
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          font-size: 1.2rem;
          color: #333; /* Dark grey text color */
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
