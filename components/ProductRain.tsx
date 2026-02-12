
import React, { useMemo } from 'react';
import { Product } from '../types';

interface ProductRainProps {
  products: Product[];
}

export const ProductRain: React.FC<ProductRainProps> = ({ products }) => {
  const rainItems = useMemo(() => {
    if (products.length === 0) return [];
    
    // Create 40 falling particles
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      image: products[i % products.length].image,
      left: `${Math.random() * 100}%`,
      duration: `${15 + Math.random() * 25}s`,
      delay: `${Math.random() * -30}s`,
      size: `${20 + Math.random() * 40}px`,
      opacity: 0.05 + Math.random() * 0.1,
    }));
  }, [products]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {rainItems.map((item) => (
        <div
          key={item.id}
          className="absolute top-[-100px] animate-fall"
          style={{
            left: item.left,
            animationDuration: item.duration,
            animationDelay: item.delay,
            opacity: item.opacity,
          }}
        >
          <div 
            className="rounded-xl overflow-hidden border border-white/20 shadow-2xl"
            style={{ 
              width: item.size, 
              height: item.size,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            <img src={item.image} alt="" className="w-full h-full object-cover grayscale" />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(120vh) rotate(360deg);
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
};
