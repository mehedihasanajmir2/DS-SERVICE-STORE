
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
import { ContactView } from './components/ContactView';
import { Product, CartItem, User, View, Order, Category, Notification } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './constants';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
  const logoUrl = "https://play-lh.googleusercontent.com/OdTRFsZcHBBeN3XzAtlD9F-y9E19vuTSt_MZhh7QWdsQRrtpAqbEffvzNGGtlkMs2yCj";

  const fetchData = async () => {
    try {
      const { data: dbCats, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (!catError && dbCats) {
        setCategories(dbCats);
      }

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
      }

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
    if (!user) {
      setNotifications([]);
      return;
    }

    const stored = localStorage.getItem(`notifs_${user.id}`);
    if (stored) setNotifications(JSON.parse(stored));

    const channel = supabase
      .channel('order_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newStatus = payload.new.status;
          const oldStatus = payload.old.status;

          if (newStatus !== oldStatus) {
            const newNotif: Notification = {
              id: Date.now().toString(),
              message: `Your Order ID: #${payload.new.id.slice(0,8)} is now ${newStatus.toUpperCase()}`,
              type: 'order_status',
              createdAt: new Date().toISOString(),
              isRead: false,
              orderId: payload.new.id
            };
            setNotifications(prev => {
              const updated = [newNotif, ...prev];
              localStorage.setItem(`notifs_${user.id}`, JSON.stringify(updated.slice(0, 20)));
              return updated;
            });
            alert(`🔔 Order Update: Your order is now ${newStatus}!`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
            isAdmin: false,
            photoUrl: session.user.user_metadata.avatar_url
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

  const handleMarkNotifsRead = () => {
    if (!user) return;
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      localStorage.setItem(`notifs_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddCategory = async (name: string) => {
    const maxIndex = categories.reduce((max, c) => Math.max(max, c.order_index), 0);
    const { error } = await supabase.from('categories').insert([{ name, order_index: maxIndex + 1 }]);
    if (error) throw error;
    await fetchData();
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    const { error } = await supabase.from('categories').update({ name }).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

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
    if (error) return;
    await fetchData();
  };

  const handleUpdateProduct = async (id: string, p: Partial<Product>) => {
    const updateData: any = { ...p };
    if (p.isPublic !== undefined) {
      updateData.is_public = p.isPublic;
      delete updateData.isPublic;
    }
    const { error } = await supabase.from('products').update(updateData).eq('id', id);
    if (error) return;
    await fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return;
    await fetchData();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) return;
    await fetchData();
  };

  // Improved dynamicCategories to always have data even if DB is empty
  const dynamicCategories = useMemo(() => {
    const dbCategoryNames = categories.map(c => c.name);
    if (dbCategoryNames.length === 0) {
      return CATEGORIES; // Use defaults from constants.ts if DB is empty
    }
    return ['All', ...dbCategoryNames];
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

  const handleServicesNav = () => {
    if (currentView !== 'shop') {
      setCurrentView('shop');
      setTimeout(() => {
        shopSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      shopSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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
      {(currentView === 'shop' || currentView === 'profile' || currentView === 'contact') && <ProductRain products={products.filter(p => p.isPublic)} />}

      <Navbar 
        currentView={currentView} 
        setView={(v) => { if(v === 'shop') resetToShop(); else setCurrentView(v); }} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        user={user}
        notifications={notifications}
        onLogout={async () => { await supabase.auth.signOut(); setUser(null); setCart([]); resetToShop(); }}
        onAuthClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
        onMarkNotificationsRead={handleMarkNotifsRead}
        onServicesClick={handleServicesNav}
      />

      {currentView === 'shop' && <ProductTicker products={products.filter(p => p.isPublic)} onProductClick={(p) => { setSelectedProduct(p); setCurrentView('product-detail'); }} />}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 md:py-6 relative z-10">
        {currentView === 'shop' ? (
          <div className="space-y-4 md:space-y-6">
            <HeroBanner onShopClick={() => shopSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} />

            {/* CATEGORY TAB BAR - Improved for visibility */}
            <div ref={shopSectionRef} className="bg-white border border-slate-200 rounded-2xl md:rounded-[2.5rem] p-1.5 shadow-xl flex flex-col md:flex-row items-center gap-2 md:gap-4 sticky top-24 z-40 transition-all">
                <div className="flex flex-nowrap overflow-x-auto items-center gap-1 w-full md:flex-1 p-1 scrollbar-hide">
                    {dynamicCategories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)} 
                            className={`px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                                ${selectedCategory === cat 
                                  ? 'bg-[#0F172A] text-white shadow-[0_10px_20px_-5px_rgba(15,23,42,0.3)] scale-[1.02]' 
                                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="w-full md:w-auto p-1 md:pr-3 flex items-center">
                    <div className="relative w-full">
                      <input 
                        type="text" 
                        placeholder="Search services..." 
                        className="w-full md:w-56 pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none text-[10px] md:text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                      />
                      <svg className="w-4 h-4 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                </div>
            </div>

            <div className="pb-24 mt-8">
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
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No services found in this category</p>
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
            const { error, data } = await supabase.from('orders').insert([{
              user_id: user?.id,
              items: order.items,
              total: order.total,
              status: 'pending',
              full_name: order.fullName,
              whatsapp_number: order.whatsappNumber,
              delivery_email: order.deliveryEmail,
              payment_method: order.paymentMethod,
              transaction_id: order.transaction_id,
              screenshot_url: order.screenshotUrl
            }]).select();
            if (!error) {
              const newNotif: Notification = {
                id: Date.now().toString(),
                message: `✅ Order Placed! ID: #${data[0].id.slice(0,8)}. Admin will verify soon.`,
                type: 'system',
                createdAt: new Date().toISOString(),
                isRead: false
              };
              setNotifications(prev => [newNotif, ...prev]);
              setCart([]);
              resetToShop();
              fetchData();
            }
          }} />
        ) : currentView === 'profile' && user ? (
          <ProfileView 
            user={user} 
            orders={orders} 
            onBack={resetToShop} 
            onUpdatePassword={() => { setAuthMode('update'); setIsAuthModalOpen(true); }}
            onUpdateUser={(updatedUser) => setUser({...user, ...updatedUser})}
          />
        ) : currentView === 'admin' && isAdminAuthenticated ? (
          <AdminPanel 
            products={products} 
            orders={orders} 
            categories={categories}
            onAddProduct={handleAddProduct} 
            onUpdateProduct={handleUpdateProduct} 
            onDeleteProduct={handleDeleteProduct} 
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onBack={handleAdminLogout} 
          />
        ) : currentView === 'contact' ? (
          <ContactView onBack={resetToShop} />
        ) : (
          <div className="text-center py-20"><button onClick={resetToShop} className="px-12 py-5 bg-[#0F172A] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl">Return to Catalog</button></div>
        )}
      </main>

      {showAdminPassModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-3xl transition-all duration-700 animate-in fade-in">
          <div className="relative bg-white rounded-[4rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-500 w-full max-w-[440px] flex flex-col items-center">
            <div className="relative mb-10 group">
              <div className="absolute inset-[-15px] rounded-full border-2 border-dashed border-blue-500/30 animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-[-10px] rounded-full bg-gradient-to-tr from-blue-600 via-cyan-400 to-blue-600 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-700"></div>
              <div className="relative w-40 h-40 rounded-full border-[8px] border-white overflow-hidden shadow-2xl z-10 transition-transform duration-700 group-hover:scale-105">
                <img src={ownerPhotoUrl} alt="Mehedi Hasan" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-2 right-2 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-50 scale-100 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-6 h-6 text-blue-600 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              </div>
            </div>
            <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-[#0F172A] uppercase tracking-tighter">Mehedi Hasan</h3>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] whitespace-nowrap">Security Terminal</h2>
            </div>
            <form className="w-full space-y-8" onSubmit={(e) => { 
                e.preventDefault(); 
                if(adminInputPass === ADMIN_PASSWORD) { 
                  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ auth: true, timestamp: Date.now() }));
                  setIsAdminAuthenticated(true); setCurrentView('admin'); setShowAdminPassModal(false); 
                } else { alert("❌ Invalid Identity Key"); }
              }}>
              <input type="password" placeholder="••••••••" className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-center font-black tracking-[0.8em] transition-all text-2xl focus:border-blue-500 focus:bg-white outline-none shadow-inner" value={adminInputPass} onChange={e => setAdminInputPass(e.target.value)} />
              <button type="submit" className="w-full py-6 bg-[#0F172A] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-600 shadow-2xl transition-all">Authorize Access</button>
            </form>
            <button onClick={() => setShowAdminPassModal(false)} className="mt-10 text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-red-500 transition-colors">Cancel Authentication</button>
          </div>
        </div>
      )}

      {currentView !== 'admin' && (
        <footer className="bg-white border-t border-slate-100 py-16 mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => resetToShop()}>
                <img src={logoUrl} alt="DS Logo" className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                <span className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tighter">
                  DS <span className="text-slate-500">SERVICE STORE</span>
                </span>
              </div>
              <div className="flex flex-col items-start border-l border-slate-100 pl-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Platform Owner</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors" onClick={handleAdminAccessTrigger}>Mehedi Hasan • DS STORE GLOBAL</p>
              </div>
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">© 2005-2025 DS SERVICE STORE</p>
          </div>
        </footer>
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        orders={orders.filter(o => o.userId === user?.id)}
        onRemove={(id) => setCart(cart.filter(i => i.id !== id))} 
        onUpdateQuantity={(id, q) => setCart(cart.map(i => i.id === id ? {...i, quantity: q} : i))} 
        onCheckout={() => { setIsCartOpen(false); setCurrentView('checkout'); }} 
      />
      <AuthModal isOpen={isAuthModalOpen} initialMode={authMode} onClose={() => setIsAuthModalOpen(false)} onLogin={(u) => setUser(u)} />
    </div>
  );
};

export default App;
