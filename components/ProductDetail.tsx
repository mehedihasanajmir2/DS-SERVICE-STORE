
import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (p: Product, q: number) => void;
  onBack: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onAddToCart, onBack }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1) {
      setQuantity(val);
    } else if (e.target.value === "") {
      // Allow empty string temporarily for typing
      setQuantity(0);
    }
  };

  const handleBlur = () => {
    if (quantity < 1) setQuantity(1);
  };

  // Pricing Logic
  const unitPrice = product.price;
  const isBulkDiscountEligible = quantity >= 100;
  const subtotal = unitPrice * quantity;
  const discount = isBulkDiscountEligible ? subtotal * 0.05 : 0;
  const finalTotal = subtotal - discount;
  const effectiveUnitPrice = isBulkDiscountEligible ? unitPrice * 0.95 : unitPrice;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm font-medium" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 transition-colors">Shop</button>
          </li>
          <li className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-slate-400">{product.category}</span>
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-square lg:aspect-auto lg:h-[600px] bg-slate-50 border-r border-slate-100 p-8 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform hover:scale-105 duration-700"
            />
            <div className="absolute top-8 left-8">
              <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                {product.category}
              </span>
            </div>
          </div>

          {/* Info Section */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-black text-slate-400">{product.rating} / 5.0 rating</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className={`text-4xl font-black transition-colors ${isBulkDiscountEligible ? 'text-green-600' : 'text-indigo-600'}`}>
                      ${effectiveUnitPrice.toFixed(2)}
                    </span>
                    {isBulkDiscountEligible && (
                      <span className="text-lg text-slate-400 line-through font-bold">
                        ${unitPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Price per unit</span>
                </div>
              </div>

              {/* Bulk Discount Alert */}
              <div className={`mb-8 p-4 rounded-2xl border transition-all ${isBulkDiscountEligible ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-100'}`}>
                 <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isBulkDiscountEligible ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-tight ${isBulkDiscountEligible ? 'text-green-700' : 'text-indigo-700'}`}>
                        {isBulkDiscountEligible ? '5% Bulk Discount Applied!' : 'Bulk Purchase Offer'}
                      </h4>
                      <p className={`text-xs font-bold ${isBulkDiscountEligible ? 'text-green-600' : 'text-slate-500'}`}>
                        {isBulkDiscountEligible 
                          ? `You are saving $${discount.toFixed(2)} on this order.` 
                          : 'Buy 100 or more items to get an instant 5% discount!'}
                      </p>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 text-slate-600">
                <p className="text-lg leading-relaxed">
                  {product.description}
                </p>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Service Details</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-black">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-900">Stock Status:</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md">{product.stock} Units Available</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Instant Activation & Delivery
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      24/7 Priority Support
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-6">
              {/* Quantity Selector Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Quantity:</label>
                  <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden bg-slate-50 w-32 shadow-inner">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-10 h-12 flex items-center justify-center font-black hover:bg-slate-200 transition-colors"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      min="1"
                      value={quantity === 0 ? "" : quantity}
                      onChange={handleQuantityChange}
                      onBlur={handleBlur}
                      className="flex-1 w-full bg-transparent text-center font-black text-lg outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-10 h-12 flex items-center justify-center font-black hover:bg-slate-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {quantity > 0 && (
                  <div className="flex justify-between items-center px-2 py-1">
                    <span className="text-sm font-bold text-slate-500">Subtotal:</span>
                    <span className="text-lg font-black text-slate-900">${finalTotal.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => onAddToCart(product, quantity)}
                  disabled={product.stock === 0}
                  className={`flex-1 py-5 px-8 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl
                    ${product.stock > 0 
                      ? 'bg-slate-900 text-white hover:bg-indigo-600 hover:scale-[1.02] active:scale-95' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  {product.stock > 0 ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Add {quantity > 1 ? `${quantity} items` : 'to Cart'}
                    </>
                  ) : 'Temporarily Out of Stock'}
                </button>
                
                <button 
                  onClick={onBack}
                  className="py-5 px-8 rounded-2xl font-black text-lg text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                >
                  Back to Shop
                </button>
              </div>
            </div>
            
            <p className="mt-8 text-xs text-center text-slate-400 font-bold uppercase tracking-tighter">
              Product ID: {product.id} • Secure SSL Checkout Enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
