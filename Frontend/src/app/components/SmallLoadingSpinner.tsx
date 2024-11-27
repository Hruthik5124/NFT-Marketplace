// components/SmallLoadingSpinner.tsx
import React from 'react';

const SmallLoadingSpinner: React.FC = () => {
  return (
    <div className="small-loading-container">
      <div className="small-loader"></div>
      <p className="small-loading-text">Please wait...</p>
      <style jsx>{`
        .small-loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px; /* Adjust as needed */
          background: rgba(255, 255, 255, 0.8); /* Light white background with reduced opacity */
          border-radius: 8px; /* Rounded corners */
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Slight shadow for emphasis */
        }

        .small-loader {
          border: 4px solid #f3f3f3; /* Light grey */
          border-top: 4px solid #000000; /* Black */
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 8px; /* Space between spinner and text */
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .small-loading-text {
          font-size: 0.9rem;
          color: #333; /* Dark grey text color */
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default SmallLoadingSpinner;
