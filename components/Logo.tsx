
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
  iconSize?: number;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  showText = true, 
  textColor = "text-slate-900",
  iconSize = 48 
}) => {
  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Live Animated Tech Icon */}
      <div className="relative flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
        <svg 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Animated Glow Filter */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <linearGradient id="paint0_linear_logo" x1="30" y1="35" x2="58" y2="65" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563EB" />
              <stop offset="1" stopColor="#22D3EE" />
            </linearGradient>

            <style>{`
              @keyframes rotate-cw {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes rotate-ccw {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
              }
              @keyframes pulse-glow {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.05); }
              }
              @keyframes shimmer {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
              }
              @keyframes pulse-dot {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.5; }
              }
              .ring-cw { transform-origin: center; animation: rotate-cw 12s linear infinite; }
              .ring-ccw { transform-origin: center; animation: rotate-ccw 8s linear infinite; }
              .group:hover .ring-cw { animation-duration: 4s; }
              .group:hover .ring-ccw { animation-duration: 3s; }
              
              .shimmer-text-main {
                background: linear-gradient(90deg, #0F172A 0%, #2563EB 25%, #0F172A 50%, #22D3EE 75%, #0F172A 100%);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shimmer 8s linear infinite;
              }

              .shimmer-text-sub {
                background: linear-gradient(90deg, #64748B 0%, #22D3EE 50%, #64748B 100%);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shimmer 5s linear infinite;
              }

              .pulse-dot-anim { animation: pulse-dot 2s ease-in-out infinite; transform-origin: center; }
            `}</style>
          </defs>

          {/* Core Glow */}
          <circle cx="50" cy="50" r="30" fill="url(#paint0_linear_logo)" opacity="0.1" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }} />

          {/* Static Background Ring */}
          <circle cx="50" cy="50" r="45" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 4" />
          
          {/* Animated Outer Rings */}
          <g className="ring-cw">
            <path 
              d="M50 5 A45 45 0 0 1 95 50" 
              stroke="#22D3EE" 
              strokeWidth="3" 
              strokeLinecap="round" 
              filter="url(#glow)"
            />
            <circle cx="95" cy="50" r="3" fill="#22D3EE" className="pulse-dot-anim" />
          </g>

          <g className="ring-ccw">
            <path 
              d="M5 50 A45 45 0 0 0 50 95" 
              stroke="#2563EB" 
              strokeWidth="4" 
              strokeLinecap="round" 
              filter="url(#glow)"
            />
            <circle cx="5" cy="50" r="3" fill="#2563EB" />
          </g>
          
          {/* Inner Tech Ring Fragments */}
          <g className="ring-cw" style={{ animationDuration: '20s' }}>
            <path 
              d="M85 50 A35 35 0 0 1 50 85" 
              stroke="#84CC16" 
              strokeWidth="2" 
              strokeDasharray="10 5" 
            />
            <circle cx="50" cy="85" r="2" fill="#84CC16" />
          </g>
          
          {/* The "D" */}
          <g filter="url(#glow)">
            <path 
              d="M30 35 V65 H42 C52 65 58 58 58 50 C58 42 52 35 42 35 H30Z" 
              fill="url(#paint0_linear_logo)" 
            />
            <path 
              d="M36 41 V59 H41 C46 59 49 56 49 50 C49 44 46 41 41 41 H36Z" 
              fill="white" 
            />
          </g>
          
          {/* The "S" */}
          <path 
            d="M68 35 H55 V41 H65 C67 41 68 42 68 44 C68 46 67 47 65 47 H58 C54 47 52 49 52 53 C52 57 54 59 58 59 H71 V53 H61 C59 53 58 52 58 50 C58 48 59 47 61 47 H68 C72 47 74 45 74 41 C74 37 72 35 68 35Z" 
            fill="#84CC16" 
            filter="url(#glow)"
          />
        </svg>
      </div>

      {/* Brand Text with Synchronized Live Shimmer */}
      {showText && (
        <div className="flex flex-col md:flex-row md:items-baseline">
          <span className="text-xl md:text-2xl font-black uppercase tracking-tighter shimmer-text-main leading-none">
            DS
          </span>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] shimmer-text-sub md:ml-2 leading-none mt-1 md:mt-0">
            SERVICE STORE
          </span>
        </div>
      )}
    </div>
  );
};
