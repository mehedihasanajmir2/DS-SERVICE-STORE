
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  initialMode?: 'signin' | 'signup' | 'forgot' | 'update';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'update'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    newPassword: '',
  });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name },
            emailRedirectTo: window.location.origin
          },
        });

        if (signUpError) {
          if (signUpError.message.toLowerCase().includes('already registered') || signUpError.status === 422) {
            throw new Error('This Gmail is already created');
          }
          throw signUpError;
        }
        
        if (data.user) {
          setSuccessMsg(`Check ${formData.email} for a link.`);
        }
      } else if (mode === 'signin') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          onLogin({
            id: data.user.id,
            name: data.user.user_metadata.full_name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            isAdmin: false,
          });
          onClose();
        }
      } else if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}`,
        });
        if (resetError) throw resetError;
        setSuccessMsg("Check your email for reset link.");
      } else if (mode === 'update') {
        const { error: updateError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });
        if (updateError) throw updateError;
        setSuccessMsg("Updated! Signing in...");
        setTimeout(() => setMode('signin'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    switch(mode) {
      case 'signup': return { title: 'Create Account', sub: 'Join DS Store today' };
      case 'signin': return { title: 'Welcome Back', sub: 'Sign in to continue' };
      case 'forgot': return { title: 'Reset Access', sub: 'Enter your account email' };
      case 'update': return { title: 'New Password', sub: 'Set a secure new password' };
    }
  };

  const header = renderHeader();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-green-500 shrink-0"></div>
        
        <div className="overflow-y-auto p-6 sm:p-10 scrollbar-hide">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
              {header.title}
            </h2>
            <p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-wider">
              {header.sub}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-black rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-xs font-black rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  type="text"
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all disabled:opacity-50 text-sm"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            {(mode === 'signin' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input 
                  required
                  type="email"
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all disabled:opacity-50 text-sm"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            )}

            {(mode === 'signin' || mode === 'signup') && (
              <div className="space-y-1">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  {mode === 'signin' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[9px] font-black text-blue-600 uppercase tracking-widest"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input 
                  required
                  type="password"
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all disabled:opacity-50 text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            )}

            {mode === 'update' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <input 
                  required
                  type="password"
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all disabled:opacity-50 text-sm"
                  placeholder="Min 6 characters"
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm transition-all hover:bg-blue-600 active:scale-[0.98] mt-4 flex items-center justify-center gap-3 uppercase tracking-widest disabled:bg-slate-700 shadow-xl"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                mode === 'signup' ? 'Sign Up' : mode === 'signin' ? 'Sign In' : mode === 'forgot' ? 'Send Link' : 'Update'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            {mode === 'forgot' ? (
              <button 
                onClick={() => setMode('signin')}
                className="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                ← Back to Login
              </button>
            ) : mode === 'update' ? null : (
              <p className="text-slate-500 font-bold text-xs uppercase tracking-tight">
                {mode === 'signup' ? 'Have account?' : "New here?"}
                <button 
                  onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); setSuccessMsg(null); }}
                  className="ml-2 text-blue-600 hover:underline font-black"
                >
                  {mode === 'signup' ? 'Login' : 'Join Us'}
                </button>
              </p>
            )}
          </div>
        </div>
        
        <button 
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
