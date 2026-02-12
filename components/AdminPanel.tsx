
import React, { useState, useRef, useEffect } from 'react';
import { Product, Order, CartItem } from '../types';
import { CATEGORIES, INITIAL_PRODUCTS } from '../constants';
import { supabase } from '../supabaseClient';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, p: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder?: (id: string) => void;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  orders, 
  onAddProduct, 
  onUpdateProduct,
  onDeleteProduct, 
  onUpdateOrderStatus,
  onDeleteOrder,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'ready' | 'not-found'>('checking');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const ownerPhotoUrl = "https://media.licdn.com/dms/image/v2/D5603AQF6FS5z4Ky4RQ/profile-displayphoto-shrink_200_200/B56Zu4YNm2G0AY-/0/1768324915128?e=2147483647&v=beta&t=_coKuJKl31AvjMDdGeLrigjfgyD8rtgblh-J_kP8Ruo";

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: CATEGORIES[1],
    image: '',
    stock: 10,
    rating: 5,
    is_published: true
  });

  useEffect(() => {
    const checkDb = async () => {
      const { error } = await supabase.from('products').select('id').limit(1);
      if (error) setDbStatus('not-found');
      else setDbStatus('ready');
    };
    checkDb();
  }, []);

  const totalSales = orders.reduce((sum, o) => (o.status === 'confirmed' || o.status === 'delivered') ? sum + o.total : sum, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const filePath = `product-images/${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      if (data) {
        setFormData({ ...formData, image: data.publicUrl });
        alert("✅ Image uploaded!");
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      rating: product.rating,
      is_published: product.is_published !== false
    });
    setIsFormOpen(true);
    setActiveTab('inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await onUpdateProduct(editingId, formData);
      } else {
        await onAddProduct(formData);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: 0, category: CATEGORIES[1], image: '', stock: 10, rating: 5, is_published: true });
  };

  return (
    <div className="animate-in fade-in duration-1000 max-w-7xl mx-auto space-y-10 pb-20">
      {/* 🚀 ELITE ADMIN HEADER */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-white/10 group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-[-6px] rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 animate-pulse opacity-50"></div>
              <div className="relative w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-2xl">
                <img src={ownerPhotoUrl} alt="Mehedi Hasan" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Mehedi Hasan</h1>
              <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] mb-2">DS Service Store Owner</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Master Server Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* 📊 SYSTEM METRICS DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${totalSales.toFixed(2)}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-blue-600' },
          { label: 'Pending Orders', value: pendingCount, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-amber-500', alert: pendingCount > 0 },
          { label: 'Low Stock Alerts', value: lowStockCount, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'bg-red-500', alert: lowStockCount > 0 },
          { label: 'Active Inventory', value: products.length, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'bg-indigo-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
            <div className={`w-14 h-14 ${stat.color} text-white rounded-[1.5rem] flex items-center justify-center shadow-lg relative`}>
              {stat.alert && <span className="absolute -top-1 -right-1 w-4 h-4 bg-white border-4 border-red-500 rounded-full animate-ping"></span>}
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.icon} /></svg>
            </div>
          </div>
        ))}
      </div>

      {/* 📑 NAVIGATION TABS */}
      <div className="bg-slate-100/50 p-2 rounded-[2.5rem] border border-slate-200 flex flex-wrap gap-2 w-fit mx-auto md:mx-0 shadow-inner">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
          { id: 'inventory', label: 'Product Manager', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
          { id: 'orders', label: 'Order Manager', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-6 duration-700">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Recent Performance</h3>
            <div className="space-y-6">
              {orders.slice(0, 5).map(o => (
                <div key={o.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xs font-black text-slate-400 border border-slate-200">{o.fullName.charAt(0)}</div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{o.fullName}</p>
                      <p className="text-[10px] font-bold text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-blue-600">${o.total.toFixed(2)}</span>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No recent data</p>}
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Dashboard Stock Overview</h3>
            <div className="grid grid-cols-1 gap-6 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
              {products.map(p => (
                <div key={p.id} className="group relative">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shadow-sm flex-shrink-0">
                         <img src={p.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-700 block line-clamp-1">{p.name}</span>
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[8px] font-black uppercase tracking-widest">Public</span>
                           <span className={`text-[9px] font-black ${p.stock <= 5 ? 'text-red-500' : 'text-slate-400'}`}>{p.stock} Units</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-600">${p.price.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${p.stock <= 5 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}></div>
                  </div>
                </div>
              ))}
              {products.length === 0 && <p className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No active services</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
           <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-4">Catalog Management</h2>
              <button 
                onClick={() => { if(isFormOpen) resetForm(); else setIsFormOpen(true); }} 
                className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isFormOpen ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white shadow-xl shadow-blue-100'}`}
              >
                {isFormOpen ? 'Exit Editor' : 'Deploy New Service'}
              </button>
           </div>

           {isFormOpen && (
              <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] border border-slate-200 p-10 shadow-2xl space-y-10 animate-in zoom-in-95 duration-500 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                 <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Title</label>
                        <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Configuration</label>
                        <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black focus:border-blue-600 appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Narrative</label>
                        <textarea required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold h-40 focus:border-blue-600 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Valuation ($)</label>
                            <input type="number" step="0.01" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-blue-600 text-xl" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Stock</label>
                            <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xl" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                         </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Image URL / Upload</label>
                          <div className="flex gap-4">
                            <input className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-blue-600 transition-all">{uploading ? '...' : 'Upload'}</button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                          </div>
                       </div>

                       <div className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${formData.is_published ? 'bg-green-50/50 border-green-200' : 'bg-slate-100/50 border-slate-300'}`} onClick={() => setFormData({...formData, is_published: !formData.is_published})}>
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.is_published ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </div>
                            <span className={`text-[11px] font-black uppercase tracking-widest ${formData.is_published ? 'text-green-700' : 'text-slate-500'}`}>{formData.is_published ? 'Live On Store' : 'Draft Only'}</span>
                          </div>
                          <div className={`w-12 h-6 rounded-full relative ${formData.is_published ? 'bg-green-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_published ? 'left-7' : 'left-1'}`}></div></div>
                       </div>

                       <div className="pt-4 flex gap-4">
                          <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all">{saving ? 'Processing...' : (editingId ? 'Update Service' : 'Confirm Launch')}</button>
                          <button type="button" onClick={resetForm} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Abandon</button>
                       </div>
                    </div>
                 </div>
              </form>
           )}

           <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Item</th>
                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock Level</th>
                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operational Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <img src={p.image} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-110" />
                          <div>
                            <p className="font-black text-slate-900 text-sm tracking-tight">{p.name}</p>
                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6"><span className="font-black text-slate-900">${p.price.toFixed(2)}</span></td>
                      <td className="px-10 py-6 text-center">
                        <span className={`px-4 py-2 rounded-xl text-xs font-black border-2 ${p.stock <= 5 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-100 text-slate-700'}`}>{p.stock}</span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">Public</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(p)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm hover:shadow-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M18.364 5.364a2.121 2.121 0 013 3L12 18l-4 1 1-4L18.364 5.364z" /></svg></button>
                            <button onClick={() => { if(confirm('Terminate this service from store?')) onDeleteProduct(p.id); }} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm hover:shadow-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" /></svg></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="animate-in slide-in-from-bottom-6 duration-700">
           <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                 <thead className="bg-slate-50">
                   <tr>
                     <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Consignee</th>
                     <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount ($)</th>
                     <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle Status</th>
                     <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Dossier</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {orders.map(o => (
                     <tr key={o.id} className="hover:bg-slate-50 transition-colors group">
                       <td className="px-10 py-6">
                           <p className="font-black text-slate-900 text-sm tracking-tight">{o.fullName}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{o.deliveryEmail}</p>
                       </td>
                       <td className="px-10 py-6 text-center font-black text-slate-900 text-sm">${o.total.toFixed(2)}</td>
                       <td className="px-10 py-6 text-center">
                           <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border-2 ${o.status === 'confirmed' || o.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-600' : o.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-600 animate-pulse'}`}>
                              {o.status}
                           </span>
                       </td>
                       <td className="px-10 py-6 text-right">
                           <button onClick={() => setSelectedOrder(o)} className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm">Review File</button>
                       </td>
                     </tr>
                   ))}
                   {orders.length === 0 && (
                     <tr>
                       <td colSpan={4} className="px-10 py-24 text-center">
                          <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Waiting for customer deployments...</p>
                       </td>
                     </tr>
                   )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* 📁 ORDER DOSSIER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl transition-opacity duration-700" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">
             
             <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Order Dossier</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[8px] font-black uppercase tracking-widest">REF-{selectedOrder.id.slice(0,8)}</span>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Verified</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 text-slate-300 hover:text-red-500 transition-all hover:rotate-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-4">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Consignee File</p>
                        <div className="space-y-1">
                          <p className="text-lg font-black">{selectedOrder.fullName}</p>
                          <p className="text-xs font-bold text-cyan-400 underline">{selectedOrder.deliveryEmail}</p>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">WhatsApp Comm</p>
                           <p className="text-sm font-black tracking-widest">{selectedOrder.whatsappNumber}</p>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex flex-col justify-between">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">Financial Summary</p>
                          <p className="text-3xl font-black text-blue-600">${selectedOrder.total.toFixed(2)}</p>
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{selectedOrder.paymentMethod}</p>
                        </div>
                        <div className="pt-2">
                           <p className="text-[8px] font-black text-blue-300 uppercase tracking-[0.2em] mb-0.5">Transaction Reference</p>
                           <p className="text-[10px] font-black text-blue-900 truncate tracking-widest">{selectedOrder.transactionId}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-inner">
                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Provisioning Manifest</span>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedOrder.items.length} Units</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto p-4 space-y-2">
                        {selectedOrder.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                               <div className="flex gap-2 items-center">
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                 <span className="font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
                               </div>
                               <span className="font-black text-slate-400">x{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative group/proof">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Verification Proof Attachment</p>
                   <div className="h-64 rounded-[2.5rem] border border-slate-200 overflow-hidden bg-slate-50 group-hover/proof:border-blue-400 transition-all duration-500">
                      {selectedOrder.screenshotUrl ? (
                          <img 
                            src={selectedOrder.screenshotUrl} 
                            className="w-full h-full object-contain cursor-zoom-in" 
                            onClick={() => window.open(selectedOrder.screenshotUrl, '_blank')} 
                          />
                      ) : (
                          <div className="h-full flex items-center justify-center text-slate-200 text-[10px] font-black uppercase tracking-widest">Missing Visual Proof</div>
                      )}
                   </div>
                </div>
             </div>

             <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                <div className="flex flex-wrap gap-3">
                    {selectedOrder.status === 'pending' && (
                        <>
                            <button 
                                onClick={() => { onUpdateOrderStatus(selectedOrder.id, 'confirmed'); setSelectedOrder(null); }} 
                                className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                Authorize Order
                            </button>
                            <button 
                                onClick={() => { onUpdateOrderStatus(selectedOrder.id, 'cancelled'); setSelectedOrder(null); }} 
                                className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-100 flex items-center justify-center gap-3"
                            >
                                Decline Case
                            </button>
                        </>
                    )}

                    {selectedOrder.status === 'confirmed' && (
                        <button 
                            onClick={() => { onUpdateOrderStatus(selectedOrder.id, 'delivered'); setSelectedOrder(null); }} 
                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 animate-pulse"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            Complete Delivery
                        </button>
                    )}

                    {selectedOrder.status === 'delivered' && (
                        <div className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 cursor-default">
                             <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                             Fulfilled
                        </div>
                    )}
                    
                    {onDeleteOrder && (
                        <button 
                            onClick={() => { if(confirm('Permanently purge this record?')) { onDeleteOrder(selectedOrder.id); setSelectedOrder(null); } }} 
                            className="px-6 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all"
                        >
                          Purge
                        </button>
                    )}
                    <button onClick={() => setSelectedOrder(null)} className="px-6 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all">Dismiss</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
