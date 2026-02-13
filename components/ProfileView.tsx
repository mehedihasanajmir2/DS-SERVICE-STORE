
import React, { useMemo, useState, useRef } from 'react';
import { User, Order, CartItem } from '../types';
import { supabase } from '../supabaseClient';

interface ProfileViewProps {
  user: User;
  orders: Order[];
  onUpdatePassword: () => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onBack: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, orders, onUpdatePassword, onUpdateUser, onBack }) => {
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userOrders = useMemo(() => {
    return orders.filter(o => o.userId === user.id);
  }, [orders, user.id]);

  const stats = useMemo(() => {
    const totalSpent = userOrders
      .filter(o => o.status === 'confirmed' || o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);
    
    const pendingOrders = userOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

    return {
      totalOrders: userOrders.length,
      totalSpent,
      pendingOrders
    };
  }, [userOrders]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploading(true);

      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products') // Reusing existing bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3. Update User Metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      // 4. Notify App state
      onUpdateUser({ photoUrl: publicUrl });
      alert("✅ Profile photo updated successfully!");

    } catch (error: any) {
      alert("❌ Upload Failed: " + (error.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group shadow-sm">
          <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">My DS Account</h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Order History & Asset Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="px-8 pb-8 -mt-12 text-center">
              <div className="inline-block relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="absolute inset-0 bg-white rounded-[2.5rem] scale-110 shadow-lg group-hover:bg-blue-50 transition-colors"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-green-400 rounded-[2.2rem] p-[3px] z-10 overflow-hidden">
                  <div className="w-full h-full bg-white rounded-[1.8rem] flex items-center justify-center text-3xl font-black text-blue-600 overflow-hidden relative">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                    
                    {/* Upload Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>

                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                />
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 mt-6 tracking-tight">{user.name}</h2>
              <p className="text-sm font-bold text-slate-400">{user.email}</p>
              
              <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
                <button 
                  onClick={onUpdatePassword}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                >
                  Change Security Key
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Verified Asset Owner
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Investment Total</p>
                <p className="text-2xl font-black text-blue-600 mt-1">${stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Orders</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm h-full flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Orders History</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Real-time status of your digital orders</p>
              </div>
              {stats.pendingOrders > 0 && (
                <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 animate-pulse">
                  {stats.pendingOrders} Processing
                </div>
              )}
            </div>

            <div className="flex-1 overflow-x-auto">
              {userOrders.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {userOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 font-mono tracking-widest uppercase">
                                #{order.id.slice(0, 8)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="text-sm font-black text-slate-900">${order.total.toFixed(2)}</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                            order.status === 'confirmed' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                            order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-600 shadow-inner' :
                            order.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-600' :
                            'bg-amber-50 border-amber-200 text-amber-600'
                          }`}>
                            {order.status === 'delivered' ? '✅ Delivered' : order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                            <button 
                                onClick={() => setSelectedOrderDetails(order)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
                            >
                                Details
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-8 py-24 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                    <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <h4 className="text-lg font-black text-slate-300 uppercase tracking-widest">Empty Portfolio</h4>
                  <button onClick={onBack} className="mt-6 text-sm font-black text-blue-600 uppercase hover:underline">Start Trading Services</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedOrderDetails(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Order Details</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Dossier ID: {selectedOrderDetails.id}</p>
               </div>
               <button onClick={() => setSelectedOrderDetails(null)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
                {selectedOrderDetails.status === 'delivered' && (
                    <div className="bg-green-600 text-white p-6 rounded-[2rem] shadow-xl shadow-green-100 flex items-center gap-6 animate-pulse">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <h4 className="font-black uppercase tracking-widest text-lg">Delivery Successful</h4>
                            <p className="text-xs font-bold text-green-100">Your digital products have been fulfilled and sent to your email.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Tracking</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${selectedOrderDetails.status === 'delivered' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                            <p className="text-sm font-black text-slate-900 uppercase">{selectedOrderDetails.status}</p>
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Via</p>
                        <p className="text-sm font-black text-slate-900 uppercase">{selectedOrderDetails.paymentMethod}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Purchased Items</p>
                    <div className="space-y-3">
                        {selectedOrderDetails.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <img src={item.image} className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm" alt="" />
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-black text-blue-600">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex justify-between items-center shadow-xl shadow-blue-100">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Transaction Amount</p>
                        <p className="text-2xl font-black text-blue-400 mt-1">${selectedOrderDetails.total.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivery Email</p>
                        <p className="text-xs font-bold text-white mt-1">{selectedOrderDetails.deliveryEmail}</p>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    End-to-End Encrypted Order Data
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
