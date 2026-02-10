
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetail } from './components/ProductDetail';
import { ProductTicker } from './components/ProductTicker';
import { CheckoutView } from './components/CheckoutView';
import { AuthModal } from './components/AuthModal';
import { Product, CartItem, User, View } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './constants';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  // State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentView, setCurrentView] = useState<View>('shop');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot' | 'update'>('signin');
  const [loading, setLoading] = useState(true);
  
  const shopSectionRef = useRef<HTMLDivElement>(null);

  // Initialize Auth & Fetch Products
  useEffect(() => {
    const initialize = async () => {
      // 1. Check current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          isAdmin: false
        });
      }

      // 2. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setAuthMode('update');
          setIsAuthModalOpen(true);
        }

        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            isAdmin: false
          });
        } else {
          setUser(null);
        }
      });

      // 3. Fetch Products from Supabase
      try {
        const { data: dbProducts, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });

        if (!error && dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        }
      } catch (err) {
        console.error("Failed to fetch products from Supabase, using defaults.");
      } finally {
        setLoading(false);
      }

      return () => subscription.unsubscribe();
    };

    initialize();
  }, []);

  // Computed
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // Handlers
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (!user) {
      setAuthMode('signin');
      setIsAuthModalOpen(true);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, q: number) => {
    const validQ = Math.max(1, q);
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: validQ } : item));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      setAuthMode('signin');
      setIsAuthModalOpen(true);
      return;
    }
    setIsCartOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCart([]);
    resetToShop();
  };

  const resetToShop = () => {
    setCurrentView('shop');
    setSelectedProduct(null);
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const scrollToShop = () => {
    resetToShop();
    setTimeout(() => {
        shopSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-900 font-black uppercase tracking-[0.2em] text-sm animate-pulse">Initializing DS System</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar 
        currentView={currentView} 
        setView={scrollToShop} 
        cartCount={cartCount}
        user={user}
        onLogout={handleLogout}
        onAuthClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
      />

      {/* LIVE PRODUCT TICKER */}
      {currentView === 'shop' && (
        <ProductTicker 
          products={products} 
          onProductClick={handleViewDetails} 
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'shop' ? (
          <div className="space-y-12">
            {/* HERO SECTION */}
            <div 
              className="relative rounded-[2.5rem] overflow-hidden min-h-[500px] flex items-center shadow-2xl border border-white/10"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/60 to-transparent"></div>
              
              <div className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                  {[...Array(15)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute bg-cyan-400 rounded-full blur-2xl animate-pulse"
                      style={{
                        width: Math.random() * 80 + 20 + 'px',
                        height: Math.random() * 80 + 20 + 'px',
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                        animationDelay: Math.random() * 5 + 's',
                        opacity: Math.random() * 0.3
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="relative z-10 max-w-4xl px-8 md:px-16 pt-8 pb-12 -mt-12">
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight text-white tracking-tighter whitespace-nowrap overflow-hidden">
                  DS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">SERVICE STORE</span>
                </h1>
                
                <div className="inline-block px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 mb-8 shadow-2xl">
                    <p className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-1.5">
                        Buy this product in my website
                    </p>
                    <p className="text-[10px] md:text-xs font-bold text-blue-200 uppercase tracking-widest opacity-90 leading-relaxed">
                        All Type Apple Id, All Type Icloud, Verified New & Old Gmail Id & Visa Cards
                    </p>
                </div>

                <div className="flex items-center gap-6 mb-10 flex-wrap">
                   <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="h-5 w-auto invert" alt="Apple ID" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Apple Verified</span>
                   </div>
                   <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" alt="Visa" className="h-4 w-auto brightness-200" />
                   </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-5">
                   <button 
                    onClick={scrollToShop}
                    className="group relative px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-base transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
                   >
                     <span className="relative z-10">Shop Now</span>
                     <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                     </svg>
                   </button>
                </div>
              </div>
            </div>

            {/* Verification Icons Bar */}
            <div className="bg-white rounded-[2rem] border border-slate-200/60 p-10 shadow-xl shadow-slate-200/50">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 justify-center">
                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-black text-slate-900 mb-2">Verified Ecosystem</h4>
                        <p className="text-sm text-slate-500 font-medium">Seamless integration with global standard accounts and payments.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                        <div className="group flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-lg transition-all">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Account" className="h-7 w-auto opacity-70 group-hover:opacity-100" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apple ID</span>
                        </div>
                        <div className="group flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-lg transition-all">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" className="h-6 w-auto opacity-70 group-hover:opacity-100" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Verified Gmail Id</span>
                        </div>
                        <div className="h-12 w-[1px] bg-slate-200 hidden lg:block mx-4"></div>
                        <div className="group flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-lg transition-all">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" alt="Visa" className="w-10 opacity-70 group-hover:opacity-100" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visa</span>
                        </div>
                        <div className="group flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-lg transition-all">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 w-auto opacity-70 group-hover:opacity-100" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Search */}
            <div ref={shopSectionRef} className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm scroll-mt-24">
              <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                      ${selectedCategory === cat 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full lg:w-[320px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search services..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all shadow-inner placeholder:text-slate-400 text-sm font-medium"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Service Grid Section Heading */}
            <div className="flex items-center gap-4 px-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Our Services</h2>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-20">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onViewDetails={handleViewDetails}
                  />
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-300">
                   <h3 className="text-2xl font-black text-slate-900">No results found</h3>
                   <p className="text-slate-500 mt-3 font-medium">Try adjusting your search filters.</p>
                </div>
              )}
            </div>
          </div>
        ) : currentView === 'product-detail' && selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onAddToCart={handleAddToCart}
            onBack={resetToShop}
          />
        ) : currentView === 'checkout' ? (
          <CheckoutView 
            items={cart} 
            onBack={resetToShop} 
            onSuccess={() => {
                alert('Payment Successful! Thank you for your purchase.');
                setCart([]);
                resetToShop();
            }}
          />
        ) : null}
      </main>

      <footer className="bg-[#0F172A] text-slate-400 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-10 h-10">
                        <div className="absolute inset-0 border-2 border-cyan-400/40 rounded-full border-t-transparent animate-spin"></div>
                        <div className="flex items-baseline relative z-10 font-black text-sm">
                            <span className="text-blue-500">D</span>
                            <span className="text-green-400 -ml-0.5">S</span>
                        </div>
                    </div>
                    <h3 className="text-white text-xl font-black tracking-tight">DS <span className="font-normal text-slate-400">SERVICE STORE</span></h3>
                </div>
                <p className="text-base leading-relaxed text-slate-400/80">
                    Scientific precision for digital growth. Scale your vision with the DS platform.
                </p>
            </div>
            <div>
                <h4 className="text-white font-black text-lg mb-10 tracking-wide uppercase text-xs">Expertise</h4>
                <ul className="space-y-5 text-sm font-bold">
                    <li>Software Architecture</li>
                    <li>Growth Engineering</li>
                    <li>Search Optimization</li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-black text-lg mb-10 tracking-wide uppercase text-xs">Support</h4>
                <ul className="space-y-5 text-sm font-bold">
                    <li>Documentation</li>
                    <li>Technical Audits</li>
                    <li>API Reference</li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-black text-lg mb-10 tracking-wide uppercase text-xs">Contact</h4>
                <div className="space-y-3">
                    <p className="text-sm font-bold text-slate-300">Whatsapp : +8801946406095</p>
                    <p className="text-sm font-bold text-slate-300 underline underline-offset-4 decoration-blue-500/50">Email : mehedihasanajmir1000@gmail.com</p>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/60 pt-12 flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
            <div className="space-y-2">
                <p className="text-sm font-black text-slate-400 tracking-wide uppercase">Mehedi Hasan, the owner of this website,</p>
                <p className="text-xs font-bold text-slate-600 tracking-wider">© 2005 DS SERVICE STORE. ALL RIGHTS RESERVED.</p>
            </div>
            <div className="flex gap-8 items-center opacity-30">
                <img src="https://logowik.com/content/uploads/images/binance-black-icon5996.logowik.com.webp" className="h-5 w-auto grayscale contrast-125" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 w-auto grayscale" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 w-auto grayscale" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" className="h-4 w-auto grayscale" />
            </div>
        </div>
      </footer>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleProceedToCheckout}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(u) => setUser(u)}
      />
    </div>
  );
};

export default App;
