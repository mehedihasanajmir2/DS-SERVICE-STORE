
import React from 'react';

interface HeroBannerProps {
  onShopClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopClick }) => {
  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="relative overflow-hidden rounded-[3rem] md:rounded-[4.5rem] bg-[#050A18] min-h-[350px] md:min-h-[480px] flex items-center shadow-2xl border border-white/5">
        
        {/* Deep Space / Earth Background */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000" 
            alt="Global Digital Infrastructure" 
            className="w-full h-full object-cover opacity-60"
          />
          {/* Subtle gradient overlay to enhance text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050A18] via-[#050A18]/70 to-transparent"></div>
        </div>

        {/* Content Section aligned like the image */}
        <div className="relative z-10 px-8 md:px-24 py-16 flex flex-col items-start gap-4 md:gap-6 w-full max-w-full">
          
          {/* Main Logo Text Area - Sized smaller as requested and forced to single line */}
          <div className="w-full overflow-visible">
            <h1 className="text-xl sm:text-3xl md:text-[3.5rem] lg:text-[4.5rem] font-black tracking-tighter leading-none text-white whitespace-nowrap flex items-center">
              <span>DS</span>
              <span className="text-[#22D3EE] ml-2 md:ml-4 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                SERVICE STORE
              </span>
            </h1>
          </div>

          {/* Subtitle list of services */}
          <div className="max-w-3xl">
            <p className="text-[10px] md:text-base font-black text-slate-200 uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-90 leading-relaxed">
              BUY NOW APPLE ID, ICLOUD ID, GMAIL, FACEBOOK, VIRTUAL VISA CARDS
            </p>
          </div>

          {/* Styled Button matching the image */}
          <div className="mt-6 md:mt-10">
            <button 
              onClick={onShopClick}
              className="bg-white text-[#050A18] px-10 md:px-14 py-4 md:py-6 rounded-full font-black text-xs md:text-base uppercase tracking-[0.1em] hover:bg-[#22D3EE] hover:text-white transition-all shadow-2xl active:scale-95 group flex items-center gap-4"
            >
              SHOP NOW
              <svg 
                className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

        </div>

        {/* Decorative Light Glows */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#22D3EE]/10 blur-[100px] rounded-full"></div>
      </div>
    </div>
  );
};
