
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  showText = true 
}) => {
  const logoUrl = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-tOSBiRm6cK2SRWil_uZrNKlcjtSkIWS8EChGPmGoGhEJqWM_FfHE8hhB5b45pO2hrFGHbo61rRRlsbqE1iLHQkF2bdJUAebrIQl0J4O0j5EXggDlKulPD9TefhiIMXF1hV_MpH5kgX_Xcl9Xi2aHtTq7z-xecRk4INXhWAoD-MBWMX2Bihh0TKzKFlDJ/s623/Gemini_Generated_Image_pnxgvipnxgvipnxg%20%281%29.png";

  return (
    <div className={`flex items-center group select-none ${className}`}>
      {/* Brand Logo Image */}
      <div className="relative flex-shrink-0 transition-transform duration-500 group-hover:scale-[1.02]">
        <img 
          src={logoUrl} 
          alt="DS SERVICE STORE" 
          className="h-10 md:h-12 w-auto object-contain drop-shadow-sm"
          referrerPolicy="no-referrer"
        />
        
        {/* Subtle Shine Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
