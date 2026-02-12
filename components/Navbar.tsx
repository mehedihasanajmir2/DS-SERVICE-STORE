
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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* LEFT SIDE: LOGO + NAVIGATION */}
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('shop')}>
              <div className="relative flex items-center justify-center w-12 h-12">
                {/* Animated Sci-fi Rings */}
                <div className="absolute inset-0 border-2 border-cyan-400 rounded-full border-t-transparent animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute inset-1 border border-blue-500 rounded-full border-b-transparent animate-[spin_2s_linear_infinite_reverse]"></div>
                
                {/* The DS Letters */}
                <div className="flex items-baseline relative z-10 font-black text-lg">
                  <span className="text-blue-600 drop-shadow-sm">D</span>
                  <span className="text-green-500 -ml-1 drop-shadow-sm">S</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    DS <span className="font-medium text-slate-600">SERVICE STORE</span>
                  </span>
                </div>
                <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-blue-600 to-green-500 transition-all duration-300"></div>
              </div>
            </div>

            {/* NAVIGATION LINKS */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setView('shop')}
                className={`text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${currentView === 'shop' ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}
              >
                Services
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: ACTIONS */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('cart')}
              className="relative p-2.5 bg-slate-50 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-black text-slate-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setView('profile')}>{user.name}</p>
                  <button onClick={onLogout} className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-tighter">Sign Out</button>
                </div>
                <div 
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-green-400 p-[2px] cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setView('profile')}
                >
                    <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-xs font-black text-blue-600">
                        {user.name.charAt(0)}
                    </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={onAuthClick}
                  className="hidden sm:block text-sm font-black text-slate-600 hover:text-blue-600 px-4 py-2.5 transition-all"
                >
                  Sign In
                </button>
                <button 
                  onClick={onAuthClick}
                  className="text-sm font-black bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
