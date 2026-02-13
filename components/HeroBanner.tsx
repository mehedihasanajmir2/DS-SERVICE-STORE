
import React from 'react';

interface HeroBannerProps {
  onShopClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopClick }) => {
  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-[#0A0F1E] aspect-[16/9] md:aspect-[3.5/1] flex items-center shadow-2xl border border-white/5">
        {/* Background Image - Earth from Space Theme */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000" 
            alt="Digital Space Background" 
            className="w-full h-full object-cover opacity-50"
          />
          {/* Darkness Overlay to match screenshot depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1E] via-[#0A0F1E]/60 to-transparent"></div>
        </div>

        {/* Floating Product Rain (Decorative elements from the screenshot) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            <div className="absolute top-10 left-[10%] w-12 h-12 bg-white/10 rounded-xl rotate-12 blur-sm"></div>
            <div className="absolute bottom-10 right-[20%] w-16 h-16 bg-white/10 rounded-2xl -rotate-45 blur-md"></div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 px-10 md:px-24 max-w-5xl">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl md:text-7xl font-black tracking-tighter text-white flex flex-wrap items-center gap-x-4 md:gap-x-6">
              DS <span className="text-[#22D3EE] drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">SERVICE STORE</span>
            </h1>
            
            <p className="text-[9px] md:text-sm font-black text-slate-300 uppercase tracking-[0.25em] md:tracking-[0.4em] mb-4 md:mb-8 opacity-90 max-w-2xl">
              BUY NOW APPLE ID, ICLOUD ID, GMAIL, FACEBOOK, VIRTUAL VISA CARDS
            </p>

            <div>
                <button 
                  onClick={onShopClick}
                  className="bg-white text-slate-950 px-8 md:px-14 py-3.5 md:py-5 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-sm uppercase tracking-widest hover:bg-[#22D3EE] hover:text-white transition-all shadow-2xl active:scale-95 group flex items-center gap-3"
                >
                  Shop Now
                  <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
