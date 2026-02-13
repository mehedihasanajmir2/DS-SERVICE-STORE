
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
import { HeroBanner } from './components/HeroBanner';
import { Product, CartItem, User, View, Order, Category } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  
  const shopSectionRef = useRef<HTMLDivElement>(null);
  const clickCount = useRef(0);
  const lastClickTime = useRef(0);
  const ADMIN_PASSWORD = "Ajmir@#123";
  const ADMIN_SESSION_KEY = "ds_admin_session_v1";
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  
  const ownerPhotoUrl = "https://media.licdn.com/dms/image/v2/D5603AQF6FS5z4Ky4RQ/profile-displayphoto-shrink_200_200/B56Zu4YNm2G0AY-/0/1768324915128?e=2147483647&v=beta&t=_coKuJKl31AvjMDdGeLrigjfgyD8rtgblh-J_kP8Ruo"; 

  const fetchData = async () => {
    try {
      // Fetch Categories
      const { data: dbCats, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (!catError && dbCats) {
        setCategories(dbCats);
      }

      // Fetch Products
      const { data: dbProducts, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      
      if (!prodError && dbProducts) {
        const mappedProducts = (dbProducts as any[]).map((p: any) => ({
          ...p,
          isPublic: p.is_public !== undefined ? p.is_public : true
        }));
        setProducts(mappedProducts.length > 0 ? mappedProducts : INITIAL_PRODUCTS);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }

      // Fetch Orders
      const { data: dbOrders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!orderError && dbOrders) {
        const mappedOrders = (dbOrders as any[]).map((o: any) => ({
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

  // Category CRUD
  const handleAddCategory = async (name: string) => {
    const { error } = await supabase.from('categories').insert([{ name }]);
    if (error) {
      alert("❌ Tab Create Error: " + error.message);
      return;
    }
    await fetchData();
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    const { error } = await supabase.from('categories').update({ name }).eq('id', id);
    if (error) {
      alert("❌ Tab Update Error: " + error.message);
      return;
    }
    await fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert("❌ Tab Delete Error: " + error.message);
      return;
    }
    await fetchData();
  };

  // Admin CRUD Implementations
  const handleAddProduct = async (p: Omit<Product, 'id'>) => {
    const { error } = await supabase.from('products').insert([{
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      stock: p.stock,
      rating: p.rating,
      is_public: p.isPublic
    }]);
    if (error) {
      alert("❌ Save Error: " + error.message);
      return;
    }
    await fetchData();
  };

  const handleUpdateProduct = async (id: string, p: Partial<Product>) => {
    const updateData: any = { ...p };
    if (p.isPublic !== undefined) {
      updateData.is_public = p.isPublic;
      delete updateData.isPublic;
    }
    
    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);
      
    if (error) {
      alert("❌ Update Error: " + error.message);
      return;
    }
    await fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert("❌ Delete Error: " + error.message);
      return;
    }
    await fetchData();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) {
      alert("❌ Status Update Error: " + error.message);
      return;
    }
    await fetchData();
  };

  const handleDeleteOrder = async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      alert("❌ Order Delete Error: " + error.message);
      return;
    }
    await fetchData();
  };

  const dynamicCategories = useMemo(() => {
    return ['All', ...categories.map(c => c.name)];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const isVisible = currentView === 'admin' || p.isPublic;
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return isVisible && matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery, currentView]);

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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-8">
        <div className="w-12 h-12 border-[6px] border-[#0F172A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#0F172A] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Server Connection Established</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] relative">
      {(currentView === 'shop' || currentView === 'profile') && <ProductRain products={products.filter(p => p.isPublic)} />}

      <Navbar 
        currentView={currentView} 
        setView={(v) => { if(v === 'shop') resetToShop(); else setCurrentView(v); }} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        user={user}
        onLogout={async () => { await supabase.auth.signOut(); setUser(null); setCart([]); resetToShop(); }}
        onAuthClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
      />

      {currentView === 'shop' && <ProductTicker products={products.filter(p => p.isPublic)} onProductClick={(p) => { setSelectedProduct(p); setCurrentView('product-detail'); }} />}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 md:py-6 relative z-10">
        {currentView === 'shop' ? (
          <div className="space-y-4 md:space-y-6">
            
            {/* New Hero Banner Component */}
            <HeroBanner onShopClick={() => shopSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} />

            {/* Control Bar */}
            <div ref={shopSectionRef} className="bg-white border border-slate-200 rounded-2xl md:rounded-[2rem] p-1 shadow-sm flex flex-col md:flex-row items-center gap-1 md:gap-4 sticky top-24 z-30">
                <div className="flex flex-wrap items-center gap-1 w-full md:flex-1 p-1">
                    {dynamicCategories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)} 
                            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-tight md:tracking-widest transition-all whitespace-nowrap
                                ${selectedCategory === cat 
                                    ? 'bg-[#0F172A] text-white shadow-md' 
                                    : 'text-slate-400 hover:bg-slate-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="w-full md:w-auto p-1 md:pr-2">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full md:w-40 px-4 py-1.5 md:py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-[10px] md:text-xs font-bold focus:bg-white focus:border-blue-600 transition-all" 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                        />
                    </div>
                </div>
            </div>

            <div className="pb-24">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 px-1 md:px-2 animate-in fade-in duration-1000">
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
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-inner">
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No services found</p>
                  <button onClick={resetToShop} className="mt-6 text-blue-600 font-black uppercase tracking-widest text-[9px] hover:underline">Return to Home</button>
                </div>
              )}
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
              alert("✅ Order Placed Successfully!");
              setCart([]);
              resetToShop();
              fetchData();
            }
          }} />
        ) : currentView === 'profile' && user ? (
          <ProfileView user={user} orders={orders} onBack={resetToShop} onUpdatePassword={() => { setAuthMode('update'); setIsAuthModalOpen(true); }} />
        ) : currentView === 'admin' && isAdminAuthenticated ? (
          <AdminPanel 
            products={products} 
            orders={orders} 
            categories={categories}
            onAddProduct={handleAddProduct} 
            onUpdateProduct={handleUpdateProduct} 
            onDeleteProduct={handleDeleteProduct} 
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onBack={handleAdminLogout} 
          />
        ) : (
          <div className="text-center py-20"><button onClick={resetToShop} className="px-12 py-5 bg-[#0F172A] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl">Return to Catalog</button></div>
        )}
      </main>

      {showAdminPassModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-2xl">
          <div className="relative bg-white rounded-[4rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-500 w-full max-w-[480px] flex flex-col items-center border border-white">
            <div className="relative mb-12 group">
              <div className="absolute inset-[-15px] rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-40 h-40 rounded-full border-[8px] border-white overflow-hidden shadow-2xl z-10">
                <img src={ownerPhotoUrl} alt="Admin" className="w-full h-full object-cover" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-[#0F172A] uppercase mb-10 tracking-tighter">System Key</h2>
            <form className="w-full space-y-6" onSubmit={(e) => { 
                e.preventDefault(); 
                if(adminInputPass === ADMIN_PASSWORD) { 
                  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ auth: true, timestamp: Date.now() }));
                  setIsAdminAuthenticated(true); setCurrentView('admin'); setShowAdminPassModal(false); 
                } 
              }}>
              <input type="password" placeholder="••••••••" className="w-full px-10 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-center font-black tracking-[0.6em] transition-all text-2xl focus:border-blue-600 focus:bg-white outline-none" value={adminInputPass} onChange={e => setAdminInputPass(e.target.value)} />
              <button type="submit" className="w-full py-6 bg-[#0F172A] text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-blue-200">Verify Identity</button>
            </form>
          </div>
        </div>
      )}

      {currentView !== 'admin' && (
        <footer className="bg-white border-t border-slate-100 py-16 mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-4">
              {/* DS Store Footer Logo */}
              <div className="relative flex items-center justify-center w-12 h-12 flex-shrink-0 group">
                <div className="absolute inset-0 border border-cyan-400/40 rounded-full group-hover:border-cyan-400 transition-colors"></div>
                <div className="flex items-baseline relative z-10 font-black text-sm">
                  <span className="text-blue-600">D</span>
                  <span className="text-green-500 -ml-0.5">S</span>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Platform Owner</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors" onClick={handleAdminAccessTrigger}>
                  Mehedi Hasan • DS STORE GLOBAL
                </p>
              </div>
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">© 2005-2025 DS SERVICE STORE</p>
          </div>
        </footer>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={(id) => setCart(cart.filter(i => i.id !== id))} onUpdateQuantity={(id, q) => setCart(cart.map(i => i.id === id ? {...i, quantity: q} : i))} onCheckout={() => { setIsCartOpen(false); setCurrentView('checkout'); }} />
      <AuthModal isOpen={isAuthModalOpen} initialMode={authMode} onClose={() => setIsAuthModalOpen(false)} onLogin={(u) => setUser(u)} />
    </div>
  );
};

export default App;
