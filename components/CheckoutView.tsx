
import React, { useState, useRef, useMemo } from 'react';
import { CartItem, Order } from '../types';
import { supabase } from '../supabaseClient';

interface CheckoutViewProps {
  items: CartItem[];
  onBack: () => void;
  onSuccess: (orderData: Omit<Order, 'id' | 'userId' | 'createdAt'>) => void;
}

type CheckoutStep = 'details' | 'proof';

export const CheckoutView: React.FC<CheckoutViewProps> = ({ items, onBack, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'ssl' | null>(null);
  const [step, setStep] = useState<CheckoutStep>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Account Delivery Information State
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [deliveryEmail, setDeliveryEmail] = useState('');

  // Proof fields
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const binancePayId = "573432978";
  const bdNumber = "01946406095";
  const adminWhatsApp = "+8801946406095";
  const USD_TO_BDT_RATE = 125; 

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const isDiscountEligible = totalQuantity >= 100;
  const discount = isDiscountEligible ? subtotal * 0.05 : 0;
  const totalAmount = subtotal - discount;

  // Validation Logic
  const isDetailsValid = useMemo(() => {
    return (
      paymentMethod !== null &&
      fullName.trim().length > 0 &&
      whatsappNumber.length === 11 && 
      deliveryEmail.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) &&
      agreedToTerms
    );
  }, [paymentMethod, fullName, whatsappNumber, deliveryEmail, agreedToTerms]);

  const isProofValid = useMemo(() => {
    return transactionId.trim().length > 0 && screenshot !== null;
  }, [transactionId, screenshot]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setScreenshot(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleProceedToProof = () => {
    if (!isDetailsValid) return;
    setStep('proof');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    if (!isProofValid || !screenshot) {
      alert(`Please enter your transaction ID and upload a screenshot.`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, screenshot);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      onSuccess({
        items,
        total: totalAmount,
        status: 'pending',
        fullName,
        whatsappNumber,
        deliveryEmail,
        paymentMethod: paymentMethod === 'crypto' ? 'Binance' : 'Mobile Banking',
        transactionId,
        screenshotUrl: urlData.publicUrl
      });
    } catch (error: any) {
      console.error("Checkout Error:", error);
      alert("Failed to process payment proof: " + error.message);
    } finally {
      setIsProcessing(false);
    }
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
        <div className="lg:col-span-7 space-y-8">
          {step === 'details' ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-10 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm">1</span>
                Payment Method
              </h2>

              <div className="grid grid-cols-1 gap-4 mb-10">
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

                  {paymentMethod === 'crypto' && (
                    <div className="animate-in slide-in-from-top-2 duration-300 bg-slate-900 rounded-3xl p-6 text-white border border-white/10 shadow-2xl">
                      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pay ID</span>
                          <span className="text-2xl font-black tracking-widest text-cyan-400 font-mono">{binancePayId}</span>
                        </div>
                        <button onClick={() => copyToClipboard(binancePayId, 'binance')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${copiedId === 'binance' ? 'bg-green-500' : 'bg-white/10 hover:bg-white/20'}`}>
                          {copiedId === 'binance' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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
                        <p className="font-black text-slate-900 text-lg">Mobile Banking</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bkash, Nagad</p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'ssl' ? 'border-indigo-600 bg-indigo-600 shadow-md' : 'border-slate-300'}`}>
                      {paymentMethod === 'ssl' && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                    </div>
                  </button>

                  {paymentMethod === 'ssl' && (
                    <div className="animate-in slide-in-from-top-2 duration-300 bg-slate-900 rounded-3xl p-6 text-white border border-white/10 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Send Money (Personal)</span>
                          <span className="text-xl font-black tracking-widest text-pink-400 font-mono">{bdNumber}</span>
                        </div>
                        <button onClick={() => copyToClipboard(bdNumber, 'bkash')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${copiedId === 'bkash' ? 'bg-pink-500' : 'bg-white/10'}`}>
                          {copiedId === 'bkash' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                  <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm">2</span>
                      Delivery Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input type="text" placeholder="Full Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                      <div className="relative">
                        <input 
                          type="tel" 
                          placeholder="WhatsApp Number" 
                          maxLength={11} 
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold pr-16" 
                          value={whatsappNumber} 
                          onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, ''))} 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400 tracking-widest shadow-sm">
                          {whatsappNumber.length}/11
                        </div>
                      </div>
                      <input type="email" placeholder="Delivery Email" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" value={deliveryEmail} onChange={(e) => setDeliveryEmail(e.target.value)} />
                  </div>
              </div>

              {/* Mandatory Notice Box */}
              <div className="mt-10 p-6 bg-amber-50 border-2 border-amber-200 rounded-[2rem] space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black uppercase tracking-tight text-amber-900">Delivery Notice</h4>
                    <p className="text-xs font-bold text-amber-700 mt-1 leading-relaxed">
                      I understand that the standard delivery time is 1-10 minutes. If my order is not delivered within 10 minutes, I agree to contact support via WhatsApp <a href={`https://wa.me/${adminWhatsApp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-black">{adminWhatsApp}</a> with my Transaction ID.
                    </p>
                  </div>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer group p-3 bg-white rounded-xl border border-amber-100 hover:border-amber-400 transition-all">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <div className="w-6 h-6 border-2 border-slate-300 rounded-md bg-white peer-checked:bg-amber-600 peer-checked:border-amber-600 transition-all flex items-center justify-center">
                      <svg className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest select-none">I agree to the 10-minute delivery terms</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-10 shadow-sm animate-in slide-in-from-right duration-500">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-indigo-100/50">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Verification</h2>
                <p className="text-slate-500 font-medium">Please provide the transaction proof below to confirm your order.</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Transaction ID / Reference</label>
                  <input 
                    type="text" 
                    placeholder="Enter your Transaction ID here..." 
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 font-black tracking-widest transition-all" 
                    value={transactionId} 
                    onChange={(e) => setTransactionId(e.target.value)} 
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Payment Screenshot</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative min-h-[220px] rounded-[2.5rem] border-4 border-dashed transition-all group overflow-hidden flex flex-col items-center justify-center cursor-pointer
                      ${previewUrl ? 'border-green-400 bg-white' : 'border-slate-100 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30'}
                    `}
                  >
                    {previewUrl ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Screenshot Preview" />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-black uppercase tracking-widest text-[10px]">Change Screenshot</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-slate-300 group-hover:text-indigo-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                           </svg>
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">Click to Upload</p>
                          <p className="text-xs font-bold text-slate-400 mt-1">PNG, JPG or JPEG up to 10MB</p>
                        </div>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl sticky top-24">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b border-white/10 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-slate-400 font-bold text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-xl font-black">Total Amount</span>
                <span className="text-3xl font-black text-cyan-400">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button 
              onClick={step === 'details' ? handleProceedToProof : handleFinalSubmit}
              disabled={isProcessing || (step === 'details' && !isDetailsValid) || (step === 'proof' && !isProofValid)}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl
                ${isProcessing || (step === 'details' && !isDetailsValid) || (step === 'proof' && !isProofValid)
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50' 
                  : 'bg-white text-slate-900 hover:bg-cyan-400'}
              `}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-slate-900" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (step === 'details' ? 'Confirm & Next' : 'Complete Order')}
            </button>
            
            <p className="mt-6 text-[10px] text-center text-slate-500 font-black uppercase tracking-widest">
              Secure SSL Transaction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
