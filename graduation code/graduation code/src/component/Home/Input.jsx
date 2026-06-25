import React from 'react';
import styled from 'styled-components';

const Input = ({ value, onChange }) => {
  return (
    <StyledWrapper>
      <div className="search-orb-container">
        <div className="gooey-background-layer">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="blob-bridge" />
        </div>
        <div className="input-overlay">
          <div className="search-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
              <circle cx={11} cy={11} r={8} />
              <line x1={21} y1={21} x2="16.65" y2="16.65" />
            </svg>
          </div>

          <input
            type="text"
            className="modern-input"
            placeholder="Explore the digital void..."
            value={value}
            onChange={onChange}
          />

          <div className="focus-indicator" />
        </div>
        <svg className="gooey-svg-filter" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="enhanced-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation={12} result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;

  .search-orb-container {
    position: relative;
    width: 100%;
    max-width: 400px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    margin: 0 auto;
  }

  .gooey-background-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    filter: url("#enhanced-goo");
    z-index: 1;
  }

  .blob {
    position: absolute;
    background: linear-gradient(135deg, #6366f1, #d946ef);
    border-radius: 50%;
    transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .blob-1 {
    width: 35%;
    height: 72px;
    left: 0;
    top: 0;
    animation: blob-float 6s infinite alternate ease-in-out;
  }

  .blob-2 {
    width: 30%;
    height: 72px;
    right: 0;
    top: 0;
    background: linear-gradient(135deg, #d946ef, #8b5cf6);
    animation: blob-float 8s infinite alternate-reverse ease-in-out;
  }

  .blob-3 {
    width: 50%;
    height: 72px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    opacity: 0.9;
  }

  .blob-bridge {
    position: absolute;
    height: 40px;
    width: 80%;
    left: 10%;
    top: 16px;
    background: #8b5cf6;
    border-radius: 40px;
  }

  .input-overlay {
    position: relative;
    z-index: 10;
    width: 90%;
    height: 52px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 26px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .modern-input {
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    color: white;
    font-size: 15px;
    font-weight: 500;
    padding-left: 12px;
    letter-spacing: 0.02em;
  }

  .modern-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
  }

  .search-icon-wrapper {
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.9;
  }

  .search-icon {
    width: 18px;
    height: 18px;
  }

  .focus-indicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0%;
    height: 2px;
    background: white;
    transform: translateX(-50%);
    transition: width 0.4s ease;
    border-radius: 2px;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  }

  .search-orb-container:focus-within .input-overlay {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  }

  .search-orb-container:focus-within .focus-indicator {
    width: 40%;
  }

  .search-orb-container:focus-within .blob-1 {
    transform: scale(1.15) translateX(-20px);
    filter: brightness(1.2);
  }

  .search-orb-container:focus-within .blob-2 {
    transform: scale(1.15) translateX(20px);
    filter: brightness(1.2);
  }

  @keyframes blob-float {
    0% {
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      transform: translate(0, 0);
    }
    50% {
      border-radius: 60% 40% 50% 50% / 30% 60% 40% 70%;
      transform: translate(5px, -5px);
    }
    100% {
      border-radius: 50% 50% 30% 70% / 60% 40% 60% 40%;
      transform: translate(-5px, 5px);
    }
  }

  .gooey-svg-filter {
    position: absolute;
    width: 0;
    height: 0;
    pointer-events: none;
  }
`;

export default Input;