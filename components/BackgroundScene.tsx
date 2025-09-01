"use client";

import React, { useEffect, useState } from "react";

const BackgroundScene = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-gradient-to-br from-blue-200 to-white">
      {/* Floating clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
        <div className="cloud cloud-4"></div>
        <div className="cloud cloud-5"></div>
      </div>

      <style jsx>{`
        @keyframes float-cloud {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(calc(100vw + 100%));
          }
        }

        .cloud {
          position: absolute;
          background: white;
          border-radius: 50px;
          opacity: 0.7;
          animation: float-cloud linear infinite;
        }

        .cloud::before,
        .cloud::after {
          content: "";
          position: absolute;
          background: white;
          border-radius: 50%;
        }

        .cloud-1 {
          width: 100px;
          height: 40px;
          top: 15%;
          animation-duration: 240s; /* 160s * 1.5 = 340s */
          animation-delay: -2s;
        }

        .cloud-1::before {
          width: 50px;
          height: 50px;
          top: -25px;
          left: 10px;
        }

        .cloud-1::after {
          width: 60px;
          height: 60px;
          top: -30px;
          right: 10px;
        }

        .cloud-2 {
          width: 80px;
          height: 30px;
          top: 35%;
          animation-duration: 270s; /* 180s * 1.5 = 360s */
          animation-delay: -10s;
        }

        .cloud-2::before {
          width: 40px;
          height: 40px;
          top: -20px;
          left: 10px;
        }

        .cloud-2::after {
          width: 50px;
          height: 50px;
          top: -25px;
          right: 10px;
        }

        .cloud-3 {
          width: 120px;
          height: 40px;
          top: 60%;
          animation-duration: 300s; /* 200s * 1.5 = 380s */
          animation-delay: -15s;
        }

        .cloud-3::before {
          width: 60px;
          height: 60px;
          top: -30px;
          left: 20px;
        }

        .cloud-3::after {
          width: 70px;
          height: 70px;
          top: -35px;
          right: 15px;
        }

        .cloud-4 {
          width: 90px;
          height: 35px;
          top: 75%;
          animation-duration: 252s; /* 168s * 1.5 = 272s */
          animation-delay: -5s;
        }

        .cloud-4::before {
          width: 45px;
          height: 45px;
          top: -22px;
          left: 15px;
        }

        .cloud-4::after {
          width: 55px;
          height: 55px;
          top: -27px;
          right: 10px;
        }

        .cloud-5 {
          width: 110px;
          height: 45px;
          top: 45%;
          animation-duration: 288s; /* 192s * 1.5 = 288s */
          animation-delay: -20s;
        }

        .cloud-5::before {
          width: 55px;
          height: 55px;
          top: -27px;
          left: 15px;
        }

        .cloud-5::after {
          width: 65px;
          height: 65px;
          top: -32px;
          right: 15px;
        }
      `}</style>
    </div>
  );
};

export default BackgroundScene;
