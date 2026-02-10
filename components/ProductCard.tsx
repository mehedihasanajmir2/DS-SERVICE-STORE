
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
      <div 
        className="aspect-square overflow-hidden bg-slate-100 cursor-pointer relative"
        onClick={() => onViewDetails(product)}
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-indigo-600 uppercase tracking-widest shadow-sm">
                {product.category}
            </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <span className="font-bold text-indigo-600 text-lg">${product.price.toFixed(2)}</span>
        </div>
        
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 min-h-[40px]">
          {product.description}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-300'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <span className="text-xs text-slate-400 font-medium">({product.rating})</span>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
            ${product.stock > 0 
              ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-sm active:scale-95' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
        >
          {product.stock > 0 ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add to Cart
            </>
          ) : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};
