
import React, { useState, useRef } from 'react';
import { CartItem } from '../types';

interface CheckoutViewProps {
  items: CartItem[];
  onBack: () => void;
  onSuccess: () => void;
}

type CheckoutStep = 'details' | 'proof';

export const CheckoutView: React.FC<CheckoutViewProps> = ({ items, onBack, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'ssl'>('crypto');
  const [step, setStep] = useState<CheckoutStep>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Proof fields
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const binancePayId = "573432978";
  const bdNumber = "01946406095";
  const USD_TO_BDT_RATE = 125; // Standard conversion rate for digital services

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const isDiscountEligible = totalQuantity >= 100;
  const discount = isDiscountEligible ? subtotal * 0.05 : 0;
  const total = subtotal - discount;

  const handleProceedToProof = () => {
    setStep('proof');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = () => {
    if (!transactionId) {
      alert(`Please enter your ${paymentMethod === 'crypto' ? 'Binance TxID' : 'Transaction ID'}.`);
      return;
    }
    if (!screenshot) {
      alert('Please upload a screenshot of your payment for verification.');
      return;
    }
    setIsProcessing(true);
    // Simulate verification delay
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatPrice = (amount: number) => {
    if (paymentMethod === 'ssl') {
      return `${Math.ceil(amount * USD_TO_BDT_RATE).toLocaleString()} ৳`;
    }
    return `$${amount.toFixed(2)}`;
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[3rem] border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Your cart is empty</h2>
        <button onClick={onBack} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={step === 'proof' ? () => setStep('details') : onBack} className="p-2 hover:bg-white rounded-full transition-colors group">
          <svg className="w-6 h-6 text-slate-400 group-hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          {step === 'details' ? 'Secure Checkout' : 'Submit Payment Proof'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Section */}
        <div className="lg:col-span-7 space-y-8">
          {step === 'details' ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-10 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm">1</span>
                Payment Method
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {/* GLOBAL CRYPTO OPTION */}
                <div className="space-y-4">
                  <button 
                    onClick={() => setPaymentMethod('crypto')}
                    className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'crypto' ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#F3BA2F] rounded-2xl shadow-lg border border-white/20 flex items-center justify-center p-2 overflow-hidden transition-transform hover:scale-105">
                        <img src="https://logowik.com/content/uploads/images/binance-black-icon5996.logowik.com.webp" className="w-full h-auto object-contain" alt="Binance Logo" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-slate-900 text-lg">Binance Pay</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Crypto Settlement</p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'crypto' ? 'border-indigo-600 bg-indigo-600 shadow-md' : 'border-slate-300'}`}>
                      {paymentMethod === 'crypto' && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                    </div>
                  </button>

                  {/* Binance Pay Details Box */}
                  {paymentMethod === 'crypto' && (
                    <div className="animate-in slide-in-from-top-2 duration-300 bg-slate-900 rounded-3xl p-6 text-white border border-white/10 shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#F3BA2F] rounded-lg">
                            <img src="https://logowik.com/content/uploads/images/binance-black-icon5996.logowik.com.webp" className="w-5 h-5" alt="Binance" />
                          </div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-white">Binance Payment ID</h4>
                        </div>
                        <div className="px-2 py-1 bg-green-500/20 rounded-md">
                          <span className="text-[10px] font-black text-green-400 uppercase">Verified Recipient</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 group">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Send to Pay ID</span>
                          <span className="text-2xl font-black tracking-widest text-cyan-400 font-mono">{binancePayId}</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(binancePayId, 'binance')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copiedId === 'binance' ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                          {copiedId === 'binance' ? (
                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>Copied!</>
                          ) : (
                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>Copy ID</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* BANGLADESHI USER OPTION */}
                <div className="space-y-4">
                  <button 
                    onClick={() => setPaymentMethod('ssl')}
                    className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'ssl' ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-2">
                        <img src="https://www.rainbownetworkbd.com/Theme/images/B%26N.png" className="w-full h-auto object-contain" alt="Bkash & Nagad" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-slate-900 text-lg">Only Bangladeshi User</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bkash, Nagad</p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'ssl' ? 'border-indigo-600 bg-indigo-600 shadow-md' : 'border-slate-300'}`}>
                      {paymentMethod === 'ssl' && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                    </div>
                  </button>

                  {/* BD Payment Details Box */}
                  {paymentMethod === 'ssl' && (
                    <div className="animate-in slide-in-from-top-2 duration-300 bg-slate-900 rounded-3xl p-8 text-white border border-white/10 shadow-2xl space-y-8">
                      {/* Bkash Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src="https://static.vecteezy.com/system/resources/previews/068/842/080/non_2x/bkash-logo-horizontal-mobile-banking-app-icon-emblem-transparent-background-free-png.png" 
                            className="h-8 w-auto" 
                            alt="Bkash" 
                          />
                          <h4 className="text-xs font-black uppercase tracking-widest text-pink-500">Bkash</h4>
                        </div>
                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bkash Number</span>
                            <span className="text-xl font-black tracking-widest text-pink-400 font-mono">{bdNumber}</span>
                            <span className="text-[10px] font-black text-white/40 uppercase mt-1 tracking-tighter">Only Send Money</span>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(bdNumber, 'bkash')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copiedId === 'bkash' ? 'bg-pink-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                          >
                            {copiedId === 'bkash' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-white/10 w-full"></div>

                      {/* Nagad Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src="https://www.logo.wine/a/logo/Nagad/Nagad-Vertical-Logo.wine.svg" 
                            className="h-10 w-auto brightness-150" 
                            alt="Nagad" 
                          />
                          <h4 className="text-xs font-black uppercase tracking-widest text-orange-500">Nagad</h4>
                        </div>
                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nagad Number</span>
                            <span className="text-xl font-black tracking-widest text-orange-400 font-mono">{bdNumber}</span>
                            <span className="text-[10px] font-black text-white/40 uppercase mt-1 tracking-tighter">Only Send Money</span>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(bdNumber, 'nagad')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copiedId === 'nagad' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                          >
                            {copiedId === 'nagad' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 space-y-6">
                  <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm">2</span>
                      Account Delivery Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Full Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" />
                      <input type="text" placeholder="Whatsapp Number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" />
                      <input type="email" placeholder="Delivery Email Address" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold md:col-span-2" />
                  </div>
              </div>
            </div>
          ) : (
            /* STEP 2: PROOF SUBMISSION (SCREENSHOT UPLOAD) */
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-10 shadow-sm animate-in slide-in-from-right duration-500">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Confirm Payment</h2>
                <p className="text-slate-500 font-medium">Please provide your transaction proof for verification.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Transaction ID / Order ID</label>
                  <input 
                    type="text" 
                    placeholder={paymentMethod === 'crypto' ? "Enter Binance TxID..." : "Enter Bkash/Nagad TxID..."}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-black text-lg tracking-widest"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Payment Screenshot</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`group relative h-48 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                      ${screenshot ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}
                    `}
                  >
                    {screenshot ? (
                      <div className="text-center p-4">
                        <svg className="w-10 h-10 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="font-bold text-green-600 truncate max-w-xs">{screenshot.name}</p>
                        <button onClick={(e) => { e.stopPropagation(); setScreenshot(null); }} className="mt-2 text-xs font-black text-slate-400 hover:text-red-500 uppercase tracking-widest">Remove File</button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <p className="font-black text-slate-900">Choose Screenshot</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PNG, JPG up to 10MB</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs font-bold text-amber-800 leading-relaxed">
                      Verification usually takes <span className="underline">5-10 minutes</span>. Your account details will be sent to your email immediately after confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl sticky top-24">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b border-white/10 pb-4">Order Summary</h2>
            
            <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex-shrink-0 border border-white/10 overflow-hidden">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div>
                      <p className="text-sm font-black line-clamp-1">{item.name}</p>
                      <p className="text-xs font-bold text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-black text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex justify-between items-center text-slate-400 font-bold text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {isDiscountEligible && (
                <div className="flex justify-between items-center text-green-400 font-black text-sm">
                  <span>Bulk Discount (5%)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-xl font-black">Total Amount</span>
                <span className="text-3xl font-black text-cyan-400">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <button 
              onClick={step === 'details' ? handleProceedToProof : handleFinalSubmit}
              disabled={isProcessing}
              className={`w-full mt-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95
                ${isProcessing ? 'bg-slate-700 text-slate-400 cursor-wait' : 'bg-white text-slate-900 hover:bg-cyan-400 hover:text-slate-900'}
              `}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {step === 'details' ? 'Next: Submit Proof' : 'Verify & Complete Order'}
                </>
              )}
            </button>
            
            <p className="mt-6 text-[10px] text-center text-slate-500 font-black uppercase tracking-widest">
              Encrypted SSL Transaction • {paymentMethod === 'crypto' ? 'Powered by Binance Pay' : 'Powered by Bkash & Nagad'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
