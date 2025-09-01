"use client";

import React from "react";

const BackgroundSun = () => {
  return (
    <div className="sun-container sm:block hidden absolute" style={{
      top: '10px',
      left: '100%',
      marginLeft: '20px',
      transform: 'translateY(-50%)'
    }}>
      <div className="sun-glow-outer"></div>
      <div className="sun-glow-inner"></div>
      <div className="sun-core"></div>
      <style jsx>{`
        /* Sun Styles */
        @keyframes sun-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        .sun-container {
          width: 96px;
          height: 96px;
          animation: sun-pulse 8s ease-in-out infinite alternate;
        }

        .sun-glow-outer,
        .sun-glow-inner,
        .sun-core {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .sun-glow-outer {
          background-color: #fcd34d;
          filter: blur(40px);
          opacity: 0.6;
        }

        .sun-glow-inner {
          background-color: #fde047;
          filter: blur(20px);
          opacity: 0.8;
        }

        .sun-core {
          background-color: #facc15;
          filter: blur(5px);
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default BackgroundSun;