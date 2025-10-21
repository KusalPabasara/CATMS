import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface MargaLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'horizontal' | 'vertical' | 'icon-only';
  className?: string;
}

const MargaLogo: React.FC<MargaLogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  variant = 'horizontal',
  className 
}) => {
  const theme = useTheme();
  
  const sizeMap = {
    small: { iconSize: 40, fontSize: 16, subtitleSize: 12 },
    medium: { iconSize: 60, fontSize: 24, subtitleSize: 14 },
    large: { iconSize: 80, fontSize: 32, subtitleSize: 18 }
  };

  const { iconSize, fontSize, subtitleSize } = sizeMap[size];

  const LogoIcon = () => (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 280 280" 
      role="img" 
      aria-label="Marga.lk logo"
      className={className}
    >
      <defs>
        {/* Ring gradient */}
        <linearGradient id="gRing" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#2f8f2f"/>
          <stop offset="0.5" stopColor="#3aa3a3"/>
          <stop offset="1" stopColor="#1376c7"/>
        </linearGradient>

        {/* Fill gradient inside circle */}
        <linearGradient id="gFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.98"/>
          <stop offset="1" stopColor="#eef6fb" stopOpacity="0.95"/>
        </linearGradient>

        {/* Stroke for ECG/line */}
        <linearGradient id="gECG" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2f8f2f"/>
          <stop offset="1" stopColor="#1376c7"/>
        </linearGradient>

        {/* Subtle drop shadow */}
        <filter id="fDrop" x="-50%" y="-50%" width="200%" height="200%">
          <feOffset dx="0" dy="2" result="off"/>
          <feGaussianBlur in="off" stdDeviation="3" result="blur"/>
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 .12 0" result="shadow"/>
          <feBlend in="SourceGraphic" in2="shadow" mode="normal"/>
        </filter>
      </defs>

      {/* Outer ring */}
      <circle cx="140" cy="140" r="120" fill="none" stroke="url(#gRing)" strokeWidth="14"/>

      {/* Inner subtle circle (slightly lighter) */}
      <circle cx="140" cy="140" r="100" fill="url(#gFill)" />

      {/* ECG wave ring/halo (swoosh) */}
      <path d="M12 160 C60 150 90 138 140 138 C190 138 220 150 268 160"
            fill="none" stroke="url(#gECG)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
            transform="translate(0,-8)"/>

      {/* Stylized 'M' shape with heartbeat integrated */}
      <g transform="translate(32,18)" filter="url(#fDrop)">
        {/* background M shape */}
        <path d="M60 40 L84 40 L110 112 L136 40 L160 40 L160 170 L132 170 L132 80 L108 140 L84 80 L84 170 L60 170 Z"
              fill="#0b5f6d"/>
        {/* top lighter overlay to mimic gradient */}
        <path d="M60 40 L84 40 L110 112 L136 40 L160 40 L160 170 L132 170 L132 80 L108 140 L84 80 L84 170 L60 170 Z"
              fill="url(#gRing)" opacity="0.85" style={{mixBlendMode: 'screen'}}/>
        {/* ECG line crossing the M (white stroke with gradient outer) */}
        <path d="M0 110
                 L32 110
                 L48 88
                 L72 132
                 L96 92
                 L120 110
                 L188 110"
              transform="translate(20,8)"
              fill="none" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"/>
        {/* thin colored outline for ECG to match ring gradient */}
        <path d="M0 110
                 L32 110
                 L48 88
                 L72 132
                 L96 92
                 L120 110
                 L188 110"
              transform="translate(20,8)"
              fill="none" stroke="url(#gECG)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.85"/>
      </g>
    </svg>
  );

  if (variant === 'icon-only') {
    return <LogoIcon />;
  }

  if (variant === 'vertical') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <LogoIcon />
        {showText && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: '#2e3536',
                fontSize: fontSize,
                letterSpacing: '-0.5px',
                lineHeight: 1
              }}
            >
              Marga.lk
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500, 
                color: '#1b78c5',
                fontSize: subtitleSize,
                letterSpacing: '0.2px',
                lineHeight: 1
              }}
            >
              Digital Health Pathways
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // Horizontal variant (default)
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <LogoIcon />
      {showText && (
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#2e3536',
              fontSize: fontSize,
              letterSpacing: '-0.5px',
              lineHeight: 1
            }}
          >
            Marga.lk
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500, 
              color: '#1b78c5',
              fontSize: subtitleSize,
              letterSpacing: '0.2px',
              lineHeight: 1
            }}
          >
            Digital Health Pathways
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MargaLogo;
