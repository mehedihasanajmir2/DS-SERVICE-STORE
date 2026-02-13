
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetail } from './components/ProductDetail';
import { ProductTicker } from './components/ProductTicker';
import { CheckoutView } from './components/CheckoutView';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { ProductRain } from './components/ProductRain';
import { ProfileView } from './components/ProfileView';
import { Product, CartItem, User, View, Order } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './constants';
import { supabase } from './supabaseClient';
import { getProductRecommendations } from './services/geminiService';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
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
  const ADMIN_SESSION_KEY = "ds_admin_session_v1";
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  
  const ownerPhotoUrl = "https://media.licdn.com/dms/image/v2/D5603AQF6FS5z4Ky4RQ/profile-displayphoto-shrink_200_200/B56Zu4YNm2G0AY-/0/1768324915128?e=2147483647&v=beta&t=_coKuJKl31AvjMDdGeLrigjfgyD8rtgblh-J_kP8Ruo"; 

  const fetchData = async () => {
    try {
      const { data: dbProducts, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      
      if (!prodError && dbProducts) {
        setProducts(dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }

      const { data: dbOrders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!orderError && dbOrders) {
        const mappedOrders = dbOrders.map((o: any) => ({
          id: o.id,
          userId: o.user_id,
          items: o.items,
          total: o.total,
          status: o.status,
          createdAt: o.created_at,
          fullName: o.full_name,
          whatsappNumber: o.whatsapp_number,
          deliveryEmail: o.delivery_email || o.deliveryEmail || '',
          paymentMethod: o.payment_method,
          transactionId: o.transaction_id,
          screenshotUrl: o.screenshot_url
        }));
        setOrders(mappedOrders as Order[]);
      }
    } catch (err) {
      console.error("General Fetch Error:", err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          const now = Date.now();
          if (now - sessionData.timestamp < TWENTY_FOUR_HOURS) {
            setIsAdminAuthenticated(true);
          } else {
            localStorage.removeItem(ADMIN_SESSION_KEY);
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            isAdmin: false
          });
        }
        await fetchData();
      } catch (e) {
        console.error("Initialization error", e);
      } finally {
        setLoading(false);
      }
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

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([newProduct]);

      if (error) throw error;
      
      alert("✅ Product Published Successfully!");
      await fetchData();
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }
  };

  const handleUpdateProduct = async (id: string, updatedFields: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updatedFields)
        .eq('id', id);

      if (error) throw error;

      alert("✅ Product Updated in Database!");
      await fetchData();
    } catch (err: any) {
      alert("❌ Update Failed: " + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      alert("🗑️ Product Removed.");
      await fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (orderUpdateError) throw orderUpdateError;
      
      await fetchData();
      alert(`✅ Order status updated to: ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      alert("❌ Operational Error: " + err.message);
    }
  };

  const resetToShop = () => {
    setCurrentView('shop');
    setSelectedProduct(null);
    setSelectedCategory('All');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminAccessTrigger = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
      return;
    }

    const now = Date.now();
    if (now - lastClickTime.current > 3000) clickCount.current = 1;
    else clickCount.current += 1;
    lastClickTime.current = now;

    if (clickCount.current >= 5) {
      clickCount.current = 0;
      setShowAdminPassModal(true);
      setAdminInputPass('');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdminAuthenticated(false);
    resetToShop();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-900 font-black uppercase tracking-[0.2em] text-xs">Connecting to DS Vault...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] relative">
      {(currentView === 'shop' || currentView === 'profile') && <ProductRain products={products} />}

      <Navbar 
        currentView={currentView} 
        setView={(v) => { if(v === 'shop') resetToShop(); else setCurrentView(v); }} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        user={user}
        onLogout={async () => { await supabase.auth.signOut(); setUser(null); setCart([]); resetToShop(); }}
        onAuthClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
      />

      {currentView === 'shop' && <ProductTicker products={products} onProductClick={(p) => { setSelectedProduct(p); setCurrentView('product-detail'); }} />}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {currentView === 'shop' ? (
          <div className="space-y-12">
            <div className="relative rounded-[2.5rem] overflow-hidden min-h-[450px] flex items-center shadow-2xl border border-white/10"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-slate-900/80"></div>
              <div className="relative z-10 px-8 md:px-16 w-full lg:w-2/3 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">DS <span className="text-cyan-400">SERVICE STORE</span></h1>
                <p className="text-sm font-black text-blue-200 uppercase tracking-[0.15em] mb-8 leading-relaxed">Buy Now Apple id, Icloud id, Gmail, Facebook, virtual Visa cards</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <button onClick={() => shopSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-lg active:scale-95">Shop Now</button>
                </div>
              </div>
            </div>

            <div ref={shopSectionRef} className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm scroll-mt-24">
              <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>{cat}</button>
                ))}
              </div>
              <input type="text" placeholder="Search services..." className="w-full lg:w-72 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={(p) => {
                   if (!user) { setAuthMode('signin'); setIsAuthModalOpen(true); return; }
                   setCart(prev => {
                     const existing = prev.find(item => item.id === p.id);
                     if (existing) return prev.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
                     return [...prev, { ...p, quantity: 1 }];
                   });
                   setIsCartOpen(true);
                }} onViewDetails={(p) => { setSelectedProduct(p); setCurrentView('product-detail'); }} />
              ))}
            </div>
          </div>
        ) : currentView === 'product-detail' && selectedProduct ? (
          <ProductDetail product={selectedProduct} onAddToCart={(p, q) => {
            if (!user) { setAuthMode('signin'); setIsAuthModalOpen(true); return; }
            setCart(prev => {
              const existing = prev.find(item => item.id === p.id);
              if (existing) return prev.map(item => item.id === p.id ? { ...item, quantity: item.quantity + q } : item);
              return [...prev, { ...p, quantity: q }];
            });
            setIsCartOpen(true);
          }} onBack={resetToShop} />
        ) : currentView === 'checkout' ? (
          <CheckoutView items={cart} onBack={resetToShop} onSuccess={async (order) => {
            for (const item of order.items) {
              const { data: currentProduct } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.id)
                .single();
              
              if (currentProduct) {
                const newStock = Math.max(0, currentProduct.stock - item.quantity);
                await supabase
                  .from('products')
                  .update({ stock: newStock })
                  .eq('id', item.id);
              }
            }

            const { error } = await supabase.from('orders').insert([{
              user_id: user?.id,
              items: order.items,
              total: order.total,
              status: 'pending',
              full_name: order.fullName,
              whatsapp_number: order.whatsappNumber,
              delivery_email: order.deliveryEmail,
              payment_method: order.paymentMethod,
              transaction_id: order.transactionId,
              screenshot_url: order.screenshotUrl
            }]);

            if (!error) {
              alert("✅ Order Placed Successfully! Stock has been updated.");
              setCart([]);
              resetToShop();
              fetchData();
            } else {
              alert("❌ Order Creation Error: " + error.message);
            }
          }} />
        ) : currentView === 'profile' && user ? (
          <ProfileView 
            user={user} 
            orders={orders} 
            onBack={resetToShop} 
            onUpdatePassword={() => { setAuthMode('update'); setIsAuthModalOpen(true); }} 
          />
        ) : currentView === 'admin' && isAdminAuthenticated ? (
          <AdminPanel 
            products={products} 
            orders={orders}
            onAddProduct={handleAddProduct} 
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct} 
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={async (id) => {
              if (confirm('Permanently delete this order record?')) {
                const { error } = await supabase.from('orders').delete().eq('id', id);
                if (!error) await fetchData();
                else alert("❌ Error deleting order: " + error.message);
              }
            }}
            onBack={handleAdminLogout} 
          />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-black text-slate-900 uppercase">Access Denied</h2>
            <button onClick={resetToShop} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase">Home</button>
          </div>
        )}
      </main>

      {showAdminPassModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xl transition-all duration-700">
          <div className="relative bg-white/90 rounded-[4rem] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-500 w-full max-w-[500px] flex flex-col items-center border border-white/50">
            <div className="relative mb-8 group">
              <div className="absolute inset-[-12px] rounded-full bg-gradient-to-tr from-blue-600 via-cyan-400 to-green-400 opacity-60 blur-sm animate-[spin_8s_linear_infinite]"></div>
              <div className="relative w-40 h-40 rounded-full border-[6px] border-white overflow-hidden shadow-2xl z-10 transition-transform group-hover:scale-105 duration-500">
                <img src={ownerPhotoUrl} alt="Mehedi Hasan" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 right-2 w-10 h-10 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center z-20 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Mehedi Hasan</h2>
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 rounded-full shadow-lg">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Owner Identity Verified</span>
              </div>
            </div>

            <form className="w-full space-y-8" onSubmit={(e) => { 
                e.preventDefault(); 
                if(adminInputPass === ADMIN_PASSWORD) { 
                  const sessionData = { auth: true, timestamp: Date.now() };
                  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
                  setIsAdminAuthenticated(true); 
                  setCurrentView('admin'); 
                  setShowAdminPassModal(false); 
                } else { 
                  setAdminError(true); 
                  setTimeout(() => setAdminError(false), 2000);
                } 
              }}>
              <div className="relative">
                <input 
                  autoFocus 
                  type="password" 
                  placeholder="MASTER KEY REQUIRED" 
                  className={`w-full px-8 py-7 bg-slate-50 border-2 rounded-3xl outline-none text-center font-black tracking-[0.4em] transition-all text-xl shadow-inner ${adminError ? 'border-red-500 bg-red-50 text-red-600 animate-bounce' : 'border-slate-100 focus:border-blue-600 focus:bg-white focus:shadow-2xl focus:shadow-blue-100'}`} 
                  value={adminInputPass} 
                  onChange={e => setAdminInputPass(e.target.value)} 
                />
                {adminError && <p className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-black text-red-500 uppercase tracking-widest">Unauthorized Access Detected</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setShowAdminPassModal(false)} className="py-5 bg-slate-100 text-slate-500 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all hover:scale-105">Cancel</button>
                <button type="submit" className="py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all hover:scale-105 shadow-xl shadow-slate-200 flex items-center justify-center gap-2">Unlock Access <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {currentView !== 'admin' && (
        <footer className="bg-[#0F172A] text-white/30 py-16 mt-20 border-t border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex items-center gap-4">
               <div className="flex items-baseline font-black text-lg">
                  <span className="text-blue-500">D</span>
                  <span className="text-green-500 -ml-1">S</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest">Owner: Mehedi Hasan</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer hover:text-white" onClick={handleAdminAccessTrigger}>©2005-2024 DS SERVICE STORE</p>
                </div>
            </div>
          </div>
        </footer>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={(id) => setCart(cart.filter(i => i.id !== id))} onUpdateQuantity={(id, q) => setCart(cart.map(i => i.id === id ? {...i, quantity: q} : i))} onCheckout={() => { setIsCartOpen(false); setCurrentView('checkout'); }} />
      <AuthModal isOpen={isAuthModalOpen} initialMode={authMode} onClose={() => setIsAuthModalOpen(false)} onLogin={(u) => setUser(u)} />
    </div>
  );
};

export default App;
