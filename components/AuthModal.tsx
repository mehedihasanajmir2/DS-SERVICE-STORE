
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

  // Sync mode with initialMode prop when it changes (e.g., from App.tsx)
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
          setSuccessMsg(`We've sent a confirmation link to ${formData.email}. Please check your inbox.`);
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
        setSuccessMsg("Check your email for the password reset link.");
      } else if (mode === 'update') {
        const { error: updateError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });
        if (updateError) throw updateError;
        setSuccessMsg("Password updated successfully! You can now sign in.");
        setTimeout(() => setMode('signin'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    switch(mode) {
      case 'signup': return { title: 'Create Account', sub: 'Join DS Service Store today' };
      case 'signin': return { title: 'Welcome Back', sub: 'Sign in to continue your purchase' };
      case 'forgot': return { title: 'Reset Password', sub: 'We will send a recovery link to your Gmail' };
      case 'update': return { title: 'New Password', sub: 'Set a secure new password for your account' };
    }
  };

  const header = renderHeader();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-cyan-400 to-green-500"></div>
        
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              {header.title}
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              {header.sub}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-2xl flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  type="text"
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all disabled:opacity-50"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            {(mode === 'signin' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  required
                  type="email"
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all disabled:opacity-50"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            )}

            {(mode === 'signin' || mode === 'signup') && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  {mode === 'signin' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input 
                  required
                  type="password"
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all disabled:opacity-50"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            )}

            {mode === 'update' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <input 
                  required
                  type="password"
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all disabled:opacity-50"
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg transition-all hover:bg-blue-600 shadow-xl active:scale-95 mt-4 flex items-center justify-center gap-3 disabled:bg-slate-700"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                mode === 'signup' ? 'Get Started' : mode === 'signin' ? 'Sign In Now' : mode === 'forgot' ? 'Send Reset Link' : 'Update Password'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            {mode === 'forgot' ? (
              <button 
                onClick={() => setMode('signin')}
                className="text-slate-500 font-bold text-sm hover:text-blue-600 transition-colors"
                disabled={loading}
              >
                ← Back to Sign In
              </button>
            ) : mode === 'update' ? null : (
              <p className="text-slate-500 font-bold text-sm">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                <button 
                  onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); setSuccessMsg(null); }}
                  className="ml-2 text-blue-600 hover:underline disabled:opacity-50"
                  disabled={loading}
                >
                  {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            )}
          </div>
        </div>
        
        <button 
          onClick={onClose}
          disabled={loading}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-0"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
