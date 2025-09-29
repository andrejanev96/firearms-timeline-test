import React from 'react';

interface AmericanFlagProps {
  className?: string;
  width?: number;
  height?: number;
}

const AmericanFlag: React.FC<AmericanFlagProps> = ({
  className = 'american-flag',
  width = 32,
  height = 24
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 32 24"
      fill="none"
      aria-hidden="true"
    >
      <rect width="32" height="24" fill="#B22234"/>
      <rect width="32" height="1.85" y="1.85" fill="white"/>
      <rect width="32" height="1.85" y="5.54" fill="white"/>
      <rect width="32" height="1.85" y="9.23" fill="white"/>
      <rect width="32" height="1.85" y="12.92" fill="white"/>
      <rect width="32" height="1.85" y="16.61" fill="white"/>
      <rect width="32" height="1.85" y="20.31" fill="white"/>
      <rect width="12.8" height="12.92" fill="#3C3B6E"/>
      <g fill="white">
        <circle cx="2.13" cy="1.85" r="0.5"/>
        <circle cx="6.4" cy="1.85" r="0.5"/>
        <circle cx="10.67" cy="1.85" r="0.5"/>
        <circle cx="4.27" cy="3.69" r="0.5"/>
        <circle cx="8.53" cy="3.69" r="0.5"/>
        <circle cx="2.13" cy="5.54" r="0.5"/>
        <circle cx="6.4" cy="5.54" r="0.5"/>
        <circle cx="10.67" cy="5.54" r="0.5"/>
        <circle cx="4.27" cy="7.38" r="0.5"/>
        <circle cx="8.53" cy="7.38" r="0.5"/>
        <circle cx="2.13" cy="9.23" r="0.5"/>
        <circle cx="6.4" cy="9.23" r="0.5"/>
        <circle cx="10.67" cy="9.23" r="0.5"/>
        <circle cx="4.27" cy="11.08" r="0.5"/>
        <circle cx="8.53" cy="11.08" r="0.5"/>
      </g>
    </svg>
  );
};

export default AmericanFlag;