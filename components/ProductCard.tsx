
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 flex flex-col h-full shadow-sm relative">
      <div 
        className="aspect-[4/3] overflow-hidden bg-[#F8FAFC] cursor-pointer relative"
        onClick={() => onViewDetails(product)}
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
            <span className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl text-[8px] font-black text-slate-900 uppercase tracking-widest shadow-sm border border-slate-50">
                {product.category}
            </span>
        </div>
        {isOutOfStock && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">Sold Out</span>
            </div>
        )}
      </div>
      
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm md:text-base tracking-tight leading-tight">
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
            <span className="font-black text-blue-600 text-xl md:text-2xl tracking-tighter">${product.price.toFixed(2)}</span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">USD</span>
        </div>
        
        <p className="text-slate-400 text-[10px] md:text-xs line-clamp-2 mb-6 min-h-[30px] md:min-h-[36px] leading-relaxed font-bold opacity-80">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-6 mt-auto">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-slate-300' : 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]'}`}></div>
                <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${isOutOfStock ? 'text-slate-400' : 'text-slate-600'}`}>
                    {isOutOfStock ? 'Out of Stock' : `${product.stock} Units Available`}
                </span>
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1.5">
                <svg className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span className="text-[10px] font-black text-slate-500">{product.rating}</span>
            </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          disabled={isOutOfStock}
          className={`w-full py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all
            ${!isOutOfStock 
              ? 'bg-[#0F172A] text-white hover:bg-blue-600 active:scale-95 shadow-xl shadow-slate-100' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
        >
          {isOutOfStock ? 'Sold Out' : 'Order Now'}
        </button>
      </div>
    </div>
  );
};
