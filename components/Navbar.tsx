
import React from 'react';
import { View, User } from '../types';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
  cartCount: number;
  user: User | null;
  onLogout: () => void;
  onAuthClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, cartCount, user, onLogout, onAuthClick }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* LEFT SIDE: LOGO + NAVIGATION */}
          <div className="flex items-center gap-6 md:gap-12">
            <div className="flex items-center gap-2 md:gap-4 cursor-pointer group" onClick={() => setView('shop')}>
              <div className="relative flex items-center justify-center w-9 h-9 md:w-11 md:h-11">
                <div className="absolute inset-0 border-2 border-cyan-400 rounded-full border-t-transparent animate-[spin_3s_linear_infinite]"></div>
                <div className="flex items-baseline relative z-10 font-black text-sm md:text-lg">
                  <span className="text-blue-600">D</span>
                  <span className="text-green-500 -ml-0.5">S</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm md:text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors uppercase leading-none">
                  DS <span className="font-medium text-slate-500 hidden xs:inline">Service Store</span>
                </span>
                <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-blue-600 to-green-500 transition-all duration-300 mt-1"></div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: ACTIONS */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setView('cart')}
              className="relative p-2 md:p-2.5 bg-slate-50 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-slate-200">
                <div className="hidden md:block text-right">
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{user.name}</p>
                  <button onClick={onLogout} className="text-[9px] text-slate-400 hover:text-red-500 font-black uppercase tracking-widest">Sign Out</button>
                </div>
                <div 
                   onClick={onLogout}
                   className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-400 p-[2px] cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                    <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center text-xs md:text-sm font-black text-blue-600 uppercase">
                        {user.name.charAt(0)}
                    </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={onAuthClick}
                  className="hidden sm:block text-xs md:text-sm font-black text-slate-600 hover:text-blue-600 px-3 md:px-4 py-2 md:py-2.5 transition-all uppercase tracking-widest"
                >
                  In
                </button>
                <button 
                  onClick={onAuthClick}
                  className="text-[10px] md:text-xs font-black bg-slate-900 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 uppercase tracking-widest"
                >
                  Join
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
