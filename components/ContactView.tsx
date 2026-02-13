
import React from 'react';

interface ContactViewProps {
  onBack: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onBack }) => {
  const whatsappNumber = "+8801946406095";
  const personalEmail = "mehedihasanajmir1000@gmail.com";
  const businessEmail = "mehedihasanajmir2@gmail.com";

  return (
    <div className="max-w-4xl mx-auto py-10 md:py-20 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-4">Get In Touch</h1>
        <p className="text-slate-500 font-medium text-lg">We are here to assist you with your digital needs 24/7.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Whatsapp Card */}
        <a 
          href={`https://wa.me/${whatsappNumber.replace('+', '')}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-green-100 transition-colors"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-500 text-white rounded-[2rem] flex items-center justify-center shadow-lg mb-8 group-hover:rotate-12 transition-transform">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">WhatsApp Support</h3>
            <p className="text-slate-400 font-bold mb-6">Instant messaging for fast resolutions</p>
            <span className="px-8 py-3 bg-green-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest">{whatsappNumber}</span>
          </div>
        </a>

        {/* Email Cards Container */}
        <div className="space-y-8">
          {/* Business Email */}
          <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg hover:shadow-2xl transition-all flex items-center gap-6 overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-blue-50 rounded-full blur-[40px] -ml-12 -mt-12 group-hover:bg-blue-100 transition-colors"></div>
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div className="relative z-10 overflow-hidden">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Business Inquiries</h4>
              <p className="font-bold text-slate-900 truncate">{businessEmail}</p>
            </div>
          </div>

          {/* Personal Email */}
          <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg hover:shadow-2xl transition-all flex items-center gap-6 overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-slate-50 rounded-full blur-[40px] -ml-12 -mt-12 group-hover:bg-blue-50 transition-colors"></div>
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div className="relative z-10 overflow-hidden">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner Contact</h4>
              <p className="font-bold text-slate-900 truncate">{personalEmail}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <button 
          onClick={onBack}
          className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 shadow-2xl active:scale-95 transition-all"
        >
          Return to Store
        </button>
      </div>
    </div>
  );
};
