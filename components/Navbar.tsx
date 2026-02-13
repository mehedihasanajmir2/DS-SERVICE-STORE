
import React, { useState } from 'react';
import { View, User, Notification } from '../types';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
  cartCount: number;
  user: User | null;
  notifications: Notification[];
  onLogout: () => void;
  onAuthClick: () => void;
  onMarkNotificationsRead: () => void;
  onServicesClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setView, 
  cartCount, 
  user, 
  notifications,
  onLogout, 
  onAuthClick,
  onMarkNotificationsRead,
  onServicesClick
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* LEFT SIDE: LOGO + NAVIGATION */}
          <div className="flex items-center gap-8 md:gap-12">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('shop')}>
              <div className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12">
                <div className="absolute inset-0 border-2 border-cyan-400 rounded-full border-t-transparent animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute inset-1 border border-blue-500 rounded-full border-b-transparent animate-[spin_2s_linear_infinite_reverse]"></div>
                <div className="flex items-baseline relative z-10 font-black text-sm md:text-lg">
                  <span className="text-blue-600 drop-shadow-sm">D</span>
                  <span className="text-green-500 -ml-1 drop-shadow-sm">S</span>
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-base md:text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  DS <span className="font-medium text-slate-600">STORE</span>
                </span>
              </div>
            </div>

            {/* NAV LINKS */}
            <div className="flex items-center gap-4 md:gap-8">
              <button 
                onClick={onServicesClick}
                className="text-[10px] md:text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => setView('contact')}
                className={`text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors ${currentView === 'contact' ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}
              >
                Contact
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* NOTIFICATION BELL */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => { setIsNotifOpen(!isNotifOpen); if(!isNotifOpen) onMarkNotificationsRead(); }}
                  className="p-2.5 bg-slate-50 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all relative"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>

                {/* NOTIFICATION DROPDOWN */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Notifications</span>
                      {unreadCount > 0 && <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">New</span>}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'order_status' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-[11px] font-bold text-slate-900 leading-relaxed">{n.message}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={() => setView('cart')}
              className="relative p-2.5 bg-slate-50 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
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
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-green-400 p-[2px] cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                  onClick={() => setView('profile')}
                >
                    <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-xs font-black text-blue-600 overflow-hidden">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0)
                        )}
                    </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={onAuthClick} className="hidden sm:block text-sm font-black text-slate-600 hover:text-blue-600 px-4 py-2.5 transition-all">Sign In</button>
                <button onClick={onAuthClick} className="text-sm font-black bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
