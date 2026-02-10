
import React from 'react';
import { Product } from '../types';

interface ProductTickerProps {
  products: Product[];
  onProductClick: (p: Product) => void;
}

export const ProductTicker: React.FC<ProductTickerProps> = ({ products, onProductClick }) => {
  // Double the products to create a seamless infinite loop
  const displayProducts = [...products, ...products, ...products];

  return (
    <div className="w-full bg-slate-900 overflow-hidden border-b border-white/5 py-3 relative group">
      {/* Decorative Gradient Overlays for Fade Effect */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>

      <div className="flex animate-[scroll_40s_linear_infinite] whitespace-nowrap gap-12 hover:[animation-play-state:paused]">
        {displayProducts.map((product, idx) => (
          <div 
            key={`${product.id}-${idx}`}
            onClick={() => onProductClick(product)}
            className="flex items-center gap-4 cursor-pointer group/item"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
              <img src={product.image} alt="" className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all" />
              <div className="absolute inset-0 bg-blue-500/10 group-hover/item:bg-transparent"></div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover/item:text-cyan-400 transition-colors">
                  {product.name}
                </span>
                <span className="h-1 w-1 bg-cyan-400 rounded-full animate-pulse"></span>
              </div>
              <span className="text-[9px] font-bold text-slate-400">Available: ${product.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
