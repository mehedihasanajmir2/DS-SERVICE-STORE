
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetail } from './components/ProductDetail';
import { ProductTicker } from './components/ProductTicker';
import { CheckoutView } from './components/CheckoutView';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { Product, CartItem, User, View, Order } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './constants';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
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
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminPassModal, setShowAdminPassModal] = useState(false);
  const [adminInputPass, setAdminInputPass] = useState('');
  const [adminError, setAdminError] = useState(false);
  
  const shopSectionRef = useRef<HTMLDivElement>(null);
  const clickCount = useRef(0);
  const lastClickTime = useRef(0);
  const ADMIN_PASSWORD = "Ajmir@#123";

  const fetchData = async () => {
    try {
      // প্রোডাক্ট নিয়ে আসা
      const { data: dbProducts, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      
      if (prodError) {
        console.error("Product Fetch Error:", prodError);
        // যদি টেবিল খুঁজে না পায় বা অন্য কোনো সমস্যা হয়
        if (prodError.code === '42P01') {
          console.warn("Table 'products' does not exist. Using initial data.");
        }
      } else if (dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts);
      }

      // অর্ডার নিয়ে আসা
      const { data: dbOrders, error: orderError } = await supabase
        .from('orders')
        .select(`
          id, 
          userId:user_id, 
          items, 
          total, 
          status, 
          createdAt:created_at, 
          fullName:full_name, 
          whatsappNumber:whatsapp_number, 
          deliveryEmail:delivery_email, 
          paymentMethod:payment_method, 
          transactionId:transaction_id
        `)
        .order('created_at', { ascending: false });

      if (orderError) {
        console.error("Order Fetch Error:", orderError);
      } else if (dbOrders) {
        setOrders(dbOrders as unknown as Order[]);
      }
    } catch (err) {
      console.error("General Fetch Error:", err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          isAdmin: false
        });
      }

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

      await fetchData();
      setLoading(false);
      return () => subscription.unsubscribe();
    };
    initialize();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (!user) { setAuthMode('signin'); setIsAuthModalOpen(true); return; }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const resetToShop = () => {
    setCurrentView('shop');
    setSelectedProduct(null);
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const handleAdminAccessTrigger = () => {
    const now = Date.now();
    if (now - lastClickTime.current > 3000) {
      clickCount.current = 1;
    } else {
      clickCount.current += 1;
    }
    lastClickTime.current = now;

    if (clickCount.current >= 5) {
      clickCount.current = 0;
      setShowAdminPassModal(true);
      setAdminError(false);
      setAdminInputPass('');
    }
  };

  const verifyAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminInputPass === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setCurrentView('admin');
      setShowAdminPassModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setAdminError(true);
      setTimeout(() => setAdminError(false), 2000);
    }
  };

  const handlePlaceOrder = async (orderInfo: Omit<Order, 'id' | 'userId' | 'createdAt'>) => {
    const orderData = {
      user_id: user?.id || 'guest',
      items: orderInfo.items,
      total: orderInfo.total,
      status: orderInfo.status,
      full_name: orderInfo.fullName,
      whatsapp_number: orderInfo.whatsappNumber,
      delivery_email: orderInfo.deliveryEmail,
      payment_method: orderInfo.paymentMethod,
      transaction_id: orderInfo.transactionId,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select(`
          id, 
          userId:user_id, 
          items, 
          total, 
          status, 
          createdAt:created_at, 
          fullName:full_name, 
          whatsappNumber:whatsapp_number, 
          deliveryEmail:delivery_email, 
          paymentMethod:payment_method, 
          transactionId:transaction_id
        `);

      if (error) throw error;

      if (data) {
        setOrders(prev => [data[0] as unknown as Order, ...prev]);
        alert("✅ Order Placed Successfully! Your order is being verified.");
        setCart([]);
        resetToShop();
      }
    } catch (err: any) {
      console.error("Order error:", err);
      alert("❌ Failed to place order. Error: " + err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      alert(`✅ Order marked as ${status.toUpperCase()}`);
    } catch (err: any) {
      alert("❌ Failed to update status: " + err.message);
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (!error && data) {
      setProducts(prev => [...data, ...prev]);
      alert("✅ Product Added to Catalog!");
    } else {
      alert("Error adding product: " + error?.message);
    }
  };

  const handleUpdateProduct = async (id: string, updatedFields: Partial<Product>) => {
    const { data, error } = await supabase.from('products').update(updatedFields).eq('id', id).select();
    if (!error && data) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data[0] } : p));
      alert("✅ Product Updated Successfully!");
    } else {
      alert("Error updating product: " + error?.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
      alert("🗑️ Product Removed Successfully.");
    } else {
      alert("Error deleting product: " + error.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-900 font-black uppercase tracking-[0.2em] text-xs">Accessing Secure Vault</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar 
        currentView={currentView} 
        setView={(v) => { if(v === 'shop') resetToShop(); else setCurrentView(v); }} 
        cartCount={cartCount}
        user={user}
        onLogout={async () => { await supabase.auth.signOut(); setUser(null); setCart([]); resetToShop(); }}
        onAuthClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
      />

      {currentView === 'shop' && <ProductTicker products={products} onProductClick={(p) => { setSelectedProduct(p); setCurrentView('product-detail'); }} />}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'shop' ? (
          <div className="space-y-12">
            <div className="relative rounded-[2.5rem] overflow-hidden min-h-[450px] flex items-center shadow-2xl border border-white/10"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-slate-900/80"></div>
              <div className="relative z-10 px-8 md:px-16">
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">DS <span className="text-cyan-400">SERVICE STORE</span></h1>
                <p className="text-sm font-black text-blue-200 uppercase tracking-[0.3em] mb-8">Verified Premium Digital Ecosystem</p>
                <button onClick={() => shopSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-400 transition-all">Shop Services</button>
              </div>
            </div>

            <div ref={shopSectionRef} className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm scroll-mt-24">
              <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>{cat}</button>
                ))}
              </div>
              <input type="text" placeholder="Search..." className="w-full lg:w-72 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m4.688 4.406A4.948 4.948 0 0011 15.19c-.066.002-.132.005-.198.005a4.978 4.978 0 00-2.522.682M10.5 21l-2-2m2 2l2-2m-2 2V15" /></svg>
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">No Services Found</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Try another category or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={(p) => handleAddToCart(p, 1)} onViewDetails={(p) => { setSelectedProduct(p); setCurrentView('product-detail'); }} />
                ))}
              </div>
            )}
          </div>
        ) : currentView === 'product-detail' && selectedProduct ? (
          <ProductDetail product={selectedProduct} onAddToCart={handleAddToCart} onBack={resetToShop} />
        ) : currentView === 'checkout' ? (
          <CheckoutView items={cart} onBack={resetToShop} onSuccess={handlePlaceOrder} />
        ) : currentView === 'admin' && isAdminAuthenticated ? (
          <AdminPanel 
            products={products} 
            orders={orders}
            onAddProduct={handleAddProduct} 
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct} 
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onBack={resetToShop} 
          />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Unauthorized Access</h2>
            <button onClick={resetToShop} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest">Back to Home</button>
          </div>
        )}
      </main>

      <footer className="bg-[#0F172A] text-white/50 py-20 mt-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-4">DS <span className="text-slate-500 font-light">STORE</span></h3>
            
            <div 
              className="group cursor-pointer p-4 -m-4 select-none active:bg-white/5 transition-colors rounded-lg" 
              onClick={handleAdminAccessTrigger}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-300 transition-colors">
                © 2005-2024 DS SERVICE STORE. ALL RIGHTS RESERVED.
              </p>
              <div className="h-px w-0 group-hover:w-full bg-slate-800 transition-all duration-700 mt-2"></div>
            </div>
          </div>
          
          <div className="flex gap-10 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="h-6 invert" alt="Apple" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" className="h-5 brightness-200" alt="Visa" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-5" alt="PayPal" />
          </div>
        </div>
      </footer>

      {showAdminPassModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Secure Terminal</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Authorized Access Only</p>
            </div>
            
            <form onSubmit={verifyAdmin} className="space-y-4">
              <input 
                autoFocus
                type="password"
                placeholder="Enter Access Key..."
                className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-black text-center tracking-widest transition-all ${adminError ? 'border-red-500 bg-red-50 animate-shake' : 'border-slate-100 focus:border-blue-600'}`}
                value={adminInputPass}
                onChange={e => setAdminInputPass(e.target.value)}
              />
              {adminError && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest">Access Denied</p>}
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setShowAdminPassModal(false)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">Unlock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={(id) => setCart(cart.filter(i => i.id !== id))} onUpdateQuantity={(id, q) => setCart(cart.map(i => i.id === id ? {...i, quantity: q} : i))} onCheckout={() => { setIsCartOpen(false); setCurrentView('checkout'); }} />
      <AuthModal isOpen={isAuthModalOpen} initialMode={authMode} onClose={() => setIsAuthModalOpen(false)} onLogin={(u) => setUser(u)} />
    </div>
  );
};

export default App;
