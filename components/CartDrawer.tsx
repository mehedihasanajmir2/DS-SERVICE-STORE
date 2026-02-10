
import React from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, q: number) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity, onCheckout }) => {
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
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Your Cart ({items.length})</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Your cart is empty</h3>
                <p className="text-slate-500 text-sm mt-1">Looks like you haven't added anything yet.</p>
                <button 
                  onClick={onClose}
                  className="mt-6 text-indigo-600 font-bold hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex gap-4 group">
                  <img src={item.image} className="w-20 h-20 rounded-xl object-cover border border-slate-100" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-semibold text-slate-900">{item.name}</h4>
                      <button onClick={() => onRemove(item.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-indigo-600 font-bold mt-1">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 hover:bg-slate-200 transition-colors font-black"
                        >
                          -
                        </button>
                        <input 
                          type="number"
                          className="w-12 py-1 text-sm font-black text-slate-700 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-x border-slate-200"
                          value={item.quantity}
                          onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                          onBlur={(e) => {
                            if (parseInt(e.target.value) < 1 || isNaN(parseInt(e.target.value))) {
                                onUpdateQuantity(item.id, 1);
                            }
                          }}
                        />
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-slate-200 transition-colors font-black"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className={isDiscountEligible ? "line-through text-slate-400" : "text-slate-900"}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                
                {isDiscountEligible && (
                  <>
                    <div className="flex justify-between items-center text-green-600 font-bold text-sm">
                      <span>Bulk Discount (5%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-center">
                      Threshold Reached: {totalQuantity} items
                    </div>
                  </>
                )}

                {!isDiscountEligible && (
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center py-1">
                    Add {100 - totalQuantity} more items for 5% Bulk Discount
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-900 font-black">Total</span>
                  <span className="text-2xl font-black text-indigo-600">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={onCheckout}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">
                Shipping and taxes calculated at checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
