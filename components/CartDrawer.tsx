
import React, { useState } from 'react';
import { CartItem, Order } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  orders: Order[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, q: number) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  orders,
  onRemove, 
  onUpdateQuantity, 
  onCheckout 
}) => {
  const [activeTab, setActiveTab] = useState<'cart' | 'history'>('cart');
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Bulk discount: 5% if total items >= 100
  const isDiscountEligible = totalQuantity >= 100;
  const discount = isDiscountEligible ? subtotal * 0.05 : 0;
  const finalTotal = subtotal - discount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* Header with Tabs */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">My Bag</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => setActiveTab('cart')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cart' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Active Cart ({items.length})
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Order History ({orders.length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'cart' ? (
              items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Your cart is empty</h3>
                  <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Start adding premium services</p>
                  <button 
                    onClick={onClose}
                    className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4 group bg-slate-50/50 p-4 rounded-[2rem] border border-transparent hover:border-slate-200 transition-all">
                    <img src={item.image} className="w-20 h-20 rounded-2xl object-cover border border-white shadow-sm" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-slate-900 text-xs uppercase tracking-tight">{item.name}</h4>
                        <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-blue-600 font-black text-sm mt-1">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1.5 hover:bg-slate-50 transition-colors font-black text-slate-400 hover:text-slate-900"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1.5 hover:bg-slate-50 transition-colors font-black text-slate-400 hover:text-slate-900"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              /* ORDER HISTORY TAB */
              orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
                    <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Orders Yet</h3>
                  <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">History will appear after purchase</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                          <p className="text-xs font-black text-slate-900 font-mono">#{order.id.slice(0, 8)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                          order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-600' :
                          order.status === 'confirmed' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                          'bg-amber-50 border-amber-200 text-amber-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                            <p className="text-sm font-black text-blue-600">${order.total.toFixed(2)}</p>
                         </div>
                         <p className="text-[9px] font-bold text-slate-300 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {activeTab === 'cart' && items.length > 0 && (
            <div className="p-8 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm">
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center text-slate-500 font-bold text-xs uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className={isDiscountEligible ? "line-through text-slate-300" : "text-slate-900"}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                
                {isDiscountEligible && (
                  <div className="flex justify-between items-center text-green-600 font-black text-xs uppercase tracking-widest">
                    <span>Bulk Discount (5%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <span className="text-slate-900 font-black uppercase tracking-widest text-sm">Grand Total</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={onCheckout}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 transition-all shadow-2xl active:scale-[0.98]"
              >
                Checkout Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
