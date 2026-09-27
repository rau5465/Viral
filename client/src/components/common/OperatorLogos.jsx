import React from 'react';

/**
 * Authentic SVG Logos for Indian Telecom Operators: Jio, Airtel, Vi, and BSNL
 */

export const JioLogo = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0, display: 'inline-block' }}
  >
    <circle cx="50" cy="50" r="48" fill="#005CB9" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
    <circle cx="50" cy="50" r="44" fill="#0A3E92" />
    {/* Clean, authentic bold Jio typography */}
    <text
      x="50%"
      y="54%"
      dominantBaseline="middle"
      textAnchor="middle"
      fill="#FFFFFF"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontWeight="900"
      fontSize="42"
      letterSpacing="-1px"
    >
      Jio
    </text>
  </svg>
);

export const AirtelLogo = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0, display: 'inline-block' }}
  >
    <rect width="100" height="100" rx="50" fill="#ED1B24" />
    {/* Airtel Swoop Icon */}
    <path
      d="M34 68C26 62 24 48 30 38C36 28 50 24 62 30C74 36 78 50 72 62C68 70 58 74 48 72C38 70 32 60 36 50C40 40 50 36 60 40"
      stroke="#FFFFFF"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="56" cy="46" r="5" fill="#FFFFFF" />
  </svg>
);

export const ViLogo = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0, display: 'inline-block' }}
  >
    <rect width="100" height="100" rx="50" fill="#E60000" />
    {/* V lettermark */}
    <path
      d="M26 32L45 68L64 32H53L45 52L37 32H26Z"
      fill="#FFFFFF"
    />
    {/* i lettermark with warm yellow dot */}
    <rect x="68" y="44" width="8" height="24" rx="4" fill="#FFFFFF" />
    <circle cx="72" cy="34" r="5.5" fill="#FFC20E" />
  </svg>
);

export const BsnlLogo = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0, display: 'inline-block' }}
  >
    <circle cx="50" cy="50" r="48" fill="#002B7F" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
    {/* Saffron & White directional swooshes */}
    <path
      d="M24 42C28 32 38 26 50 26C62 26 72 32 76 42"
      stroke="#FF7900"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path
      d="M76 58C72 68 62 74 50 74C38 74 28 68 24 58"
      stroke="#FFFFFF"
      strokeWidth="6"
      strokeLinecap="round"
    />
    {/* BSNL text */}
    <text
      x="50%"
      y="54%"
      dominantBaseline="middle"
      textAnchor="middle"
      fill="#FFFFFF"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontWeight="900"
      fontSize="21"
      letterSpacing="1px"
    >
      BSNL
    </text>
  </svg>
);

/**
 * Universal Operator Logo Dispatcher
 */
export const OperatorLogo = ({ operator, size = 28, className = '' }) => {
  const norm = (operator || '').toLowerCase();

  if (norm.includes('jio')) {
    return <JioLogo size={size} className={className} />;
  }
  if (norm.includes('airtel')) {
    return <AirtelLogo size={size} className={className} />;
  }
  if (norm.includes('vi') || norm.includes('vodafone') || norm.includes('idea')) {
    return <ViLogo size={size} className={className} />;
  }
  if (norm.includes('bsnl')) {
    return <BsnlLogo size={size} className={className} />;
  }

  // Fallback generic carrier badge
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0066ff, #00eefd)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: size * 0.45,
        fontWeight: 800,
      }}
      className={className}
    >
      {(operator || 'OP').slice(0, 2).toUpperCase()}
    </div>
  );
};

export default OperatorLogo;
