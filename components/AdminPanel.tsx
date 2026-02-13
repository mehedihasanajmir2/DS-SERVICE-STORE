
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product, Order, Category } from '../types';
import { supabase } from '../supabaseClient';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../constants';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  categories: Category[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, p: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onAddCategory: (name: string) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  orders, 
  categories,
  onAddProduct, 
  onUpdateProduct,
  onDeleteProduct, 
  onUpdateOrderStatus,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders' | 'tabs'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const [selectedAdminOrder, setSelectedAdminOrder] = useState<Order | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ownerPhotoUrl = "https://media.licdn.com/dms/image/v2/D5603AQF6FS5z4Ky4RQ/profile-displayphoto-shrink_200_200/B56Zu4YNm2G0AY-/0/1768324915128?e=2147483647&v=beta&t=_coKuJKl31AvjMDdGeLrigjfgyD8rtgblh-J_kP8Ruo";

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    stock: 10,
    rating: 5,
    isPublic: true
  });

  const stats = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => (o.status === 'confirmed' || o.status === 'delivered') ? sum + o.total : sum, 0);
    const pending = orders.filter(o => o.status === 'pending').length;
    return { totalRev, pending };
  }, [orders]);

  useEffect(() => {
    if (!formData.category) {
      if (categories.length > 0) {
        setFormData(prev => ({ ...prev, category: categories[0].name }));
      } else {
        setFormData(prev => ({ ...prev, category: DEFAULT_CATEGORIES[1] }));
      }
    }
  }, [categories, isFormOpen]);

  const handleImportDefaultTabs = async () => {
    if (!confirm("Add default categories to database? (Apple, iCloud, Gmail etc.)")) return;
    setSaving(true);
    try {
      const tabsToImport = DEFAULT_CATEGORIES.filter(c => c !== 'All');
      for (const tabName of tabsToImport) {
        if (!categories.find(c => c.name === tabName)) {
          await onAddCategory(tabName);
        }
      }
      alert("✅ Default tabs have been synced to the database!");
    } catch (e: any) {
      alert("❌ Import failed: " + (e.message || "Connection error"));
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files?.[0]) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `product-images/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      if (data) setFormData(prev => ({ ...prev, image: data.publicUrl }));
    } catch (error: any) {
      alert("❌ Upload error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      rating: product.rating,
      isPublic: product.isPublic !== undefined ? product.isPublic : true
    });
    setIsFormOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) { await onUpdateProduct(editingId, formData); }
      else { await onAddProduct(formData); }
      resetForm();
      alert("✅ Product saved!");
    } catch (e: any) {
      alert("❌ Failed to save product.");
    } finally { setSaving(false); }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setSaving(true);
    try {
      if (editingCategoryId) { 
        await onUpdateCategory(editingCategoryId, categoryName.trim()); 
        alert("✅ Tab updated!");
      } else { 
        await onAddCategory(categoryName.trim()); 
        alert("✅ New Tab added successfully!");
      }
      setCategoryName('');
      setEditingCategoryId(null);
      setIsCategoryFormOpen(false);
    } catch (e: any) {
      alert("❌ Tab action failed.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ 
      name: '', description: '', price: 0, 
      category: categories.length > 0 ? categories[0].name : DEFAULT_CATEGORIES[1], 
      image: '', stock: 10, rating: 5, isPublic: true 
    });
  };

  const getStatusColor = (status: Order['status']) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-600 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-amber-100 text-amber-600 border-amber-200';
    }
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto space-y-8 pb-24">
      {/* HEADER */}
      <div className="bg-[#0F172A] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl">
              <img src={ownerPhotoUrl} alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Control Center</h1>
              <p className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mt-2">Master Administrator: Mehedi Hasan</p>
            </div>
          </div>
          <button onClick={onBack} className="px-10 py-4 bg-white/5 hover:bg-red-500/20 text-white border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl backdrop-blur-md">
            Exit Admin
          </button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue', value: `$${stats.totalRev.toFixed(2)}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2', color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Awaiting', value: stats.pending, icon: 'M12 8v4l3 3', color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Stock Units', value: products.length, icon: 'M20 7l-8-4-8 4', color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Active Tabs', value: categories.length, icon: 'M7 7h.01M7 3h5', color: 'text-blue-500', bg: 'bg-blue-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.icon} /></svg>
            </div>
          </div>
        ))}
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-full border border-slate-200 flex flex-wrap gap-1 shadow-lg">
          {[
            { id: 'dashboard', label: 'Overview' },
            { id: 'inventory', label: 'Product Manager' },
            { id: 'orders', label: 'Order Manager' },
            { id: 'tabs', label: 'Tab Manager' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#0F172A] text-white shadow-xl scale-105' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB MANAGER TAB (REDESIGNED TO TABLE) */}
      {activeTab === 'tabs' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
           <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 gap-6 shadow-sm">
              <div className="ml-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Tab Configuration</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master digital category management</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                 <button onClick={handleImportDefaultTabs} disabled={saving} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Sync Defaults</button>
                 <button onClick={() => { setIsCategoryFormOpen(true); setEditingCategoryId(null); setCategoryName(''); }} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all">+ Create Master Tab</button>
              </div>
           </div>

           {isCategoryFormOpen && (
              <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-10 shadow-2xl max-w-2xl mx-auto w-full animate-in zoom-in-95">
                <form onSubmit={handleCategorySubmit}>
                   <h3 className="text-xl font-black text-slate-900 uppercase mb-8 text-center">{editingCategoryId ? 'Rename Global Tab' : 'Create Master Tab'}</h3>
                   <input 
                     required 
                     className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-2xl text-center mb-8 focus:border-blue-500 transition-all shadow-inner uppercase" 
                     value={categoryName} 
                     onChange={e => setCategoryName(e.target.value)} 
                     placeholder="e.g. GMAIL (USA)" 
                     autoFocus
                   />
                   <div className="flex gap-4">
                      <button type="submit" disabled={saving} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-900 transition-all">Confirm Change</button>
                      <button type="button" onClick={() => setIsCategoryFormOpen(false)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs hover:bg-red-50 hover:text-red-500 transition-all">Cancel</button>
                   </div>
                </form>
              </div>
           )}

           <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-[#0F172A] border-b border-slate-800">
                 <tr>
                   <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest"># Index</th>
                   <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Tab Name</th>
                   <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Service Count</th>
                   <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {categories.map((cat, idx) => {
                   const serviceCount = products.filter(p => p.category === cat.name).length;
                   return (
                     <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-10 py-6">
                         <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">{idx + 1}</div>
                       </td>
                       <td className="px-10 py-6">
                         <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{cat.name}</p>
                       </td>
                       <td className="px-10 py-6 text-center">
                         <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-400">{serviceCount} Items</span>
                       </td>
                       <td className="px-10 py-6 text-right">
                         <div className="flex justify-end gap-3">
                           <button onClick={() => { setEditingCategoryId(cat.id); setCategoryName(cat.name); setIsCategoryFormOpen(true); }} className="p-2.5 bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M18.364 5.364a2.121 2.121 0 013 3L12 18l-4 1 1-4L18.364 5.364z" /></svg>
                           </button>
                           <button onClick={() => { if(confirm(`Delete "${cat.name}" and all associated category data?`)) onDeleteCategory(cat.id); }} className="p-2.5 bg-slate-100 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6" /></svg>
                           </button>
                         </div>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
             {categories.length === 0 && <div className="py-24 text-center text-slate-300 font-black uppercase tracking-widest">No tabs configured in database</div>}
           </div>
        </div>
      )}

      {/* OTHER TABS (DASHBOARD, INVENTORY, ORDERS) REMAINS HERE... */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Recent Activity</h3>
            <div className="space-y-4">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white transition-all shadow-sm" onClick={() => { setSelectedAdminOrder(order); setActiveTab('orders'); }}>
                  <div>
                    <p className="text-xs font-black text-slate-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{order.fullName}</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center py-10 text-slate-300 font-black uppercase tracking-widest">No orders yet</p>}
            </div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl -mr-16 -mt-16"></div>
             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl relative z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
             </div>
             <h3 className="text-2xl font-black uppercase tracking-tighter relative z-10">Business Pulse</h3>
             <p className="text-slate-400 text-sm font-bold mt-2 relative z-10">Monitoring all digital service transactions.</p>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
             <div className="ml-4">
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Product Manager</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comprehensive digital service control</p>
             </div>
             <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all">+ Add Service</button>
          </div>

          {isFormOpen && (
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 md:p-12 shadow-2xl animate-in zoom-in-95">
              <form onSubmit={handleSubmitProduct} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Product Name</label>
                      <input required type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:border-blue-500 transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Description</label>
                      <textarea required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 min-h-[140px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Price ($)</label>
                        <input required type="number" step="0.01" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Initial Stock</label>
                        <input required type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Category</label>
                        <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Visibility</label>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, isPublic: !formData.isPublic})}
                          className={`w-full px-6 py-4 border-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.isPublic ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                        >
                          {formData.isPublic ? 'Publicly Listed' : 'Hidden from Shop'}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Media Upload</label>
                        <div className="flex gap-4">
                           <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                              {formData.image && <img src={formData.image} className="w-full h-full object-cover" />}
                           </div>
                           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                           <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                              {uploading ? 'Processing...' : 'Sync Asset Image'}
                           </button>
                        </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-6 border-t border-slate-100">
                  <button type="submit" disabled={saving || uploading} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-900 transition-all">{saving ? 'Syncing...' : (editingId ? 'Update Asset' : 'Publish Asset')}</button>
                  <button type="button" onClick={resetForm} className="px-12 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs hover:bg-red-50 hover:text-red-500 transition-all">Dismiss</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-[#0F172A] border-b border-slate-800">
                 <tr>
                   <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Asset</th>
                   <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Units</th>
                   <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Base Price</th>
                   <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Visibility</th>
                   <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {products.map(p => (
                   <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <img src={p.image} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm" alt="" />
                           <div>
                              <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate max-w-[200px]">{p.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{p.category}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-center">
                        <span className={`text-sm font-black ${p.stock <= 0 ? 'text-red-500' : 'text-slate-900'}`}>{p.stock}</span>
                     </td>
                     <td className="px-8 py-6 text-center">
                        <span className="text-sm font-black text-slate-900">${p.price.toFixed(2)}</span>
                     </td>
                     <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${p.isPublic ? 'bg-green-100 text-green-600 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {p.isPublic ? 'Public' : 'Unpublic'}
                        </span>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                           <button onClick={() => handleEditProduct(p)} className="p-2.5 bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M18.364 5.364a2.121 2.121 0 013 3L12 18l-4 1 1-4L18.364 5.364z" /></svg>
                           </button>
                           <button onClick={() => { if(confirm('Permanently delete this product?')) onDeleteProduct(p.id); }} className="p-2.5 bg-slate-100 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6" /></svg>
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {products.length === 0 && <div className="py-24 text-center text-slate-300 font-black uppercase tracking-widest">No products in inventory</div>}
           </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="animate-in slide-in-from-bottom-4 space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-[#0F172A] border-b border-slate-800">
                 <tr>
                   <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Order Reference</th>
                   <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                   <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                   <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                   <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {orders.map(order => (
                   <tr key={order.id} className="hover:bg-slate-50/50 cursor-pointer transition-colors group" onClick={() => setSelectedAdminOrder(order)}>
                     <td className="px-8 py-6">
                        <p className="font-mono text-xs text-slate-900 font-black tracking-widest uppercase">#{order.id.slice(0, 8)}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-xs font-black text-slate-900 uppercase">{order.fullName}</p>
                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter mt-1">{order.whatsappNumber}</p>
                     </td>
                     <td className="px-8 py-6 text-center text-sm font-black text-slate-900">${order.total.toFixed(2)}</td>
                     <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">View Details</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {orders.length === 0 && <div className="py-24 text-center text-slate-300 font-black uppercase tracking-widest">No transaction logs available</div>}
           </div>
        </div>
      )}

      {/* ADMIN ORDER DETAIL MODAL */}
      {selectedAdminOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl transition-all duration-500 animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 md:p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Order Investigation</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Ref ID: {selectedAdminOrder.id}</p>
                </div>
                <button onClick={() => setSelectedAdminOrder(null)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide space-y-10">
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32"></div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow Controller</p>
                            <h4 className="text-3xl font-black tracking-tighter uppercase">Current: <span className="text-cyan-400">{selectedAdminOrder.status}</span></h4>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {['pending', 'confirmed', 'delivered', 'cancelled'].map((s) => (
                                    <button 
                                        key={s} 
                                        onClick={() => {
                                          onUpdateOrderStatus(selectedAdminOrder.id, s as any);
                                          setSelectedAdminOrder({...selectedAdminOrder, status: s as any});
                                        }}
                                        className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedAdminOrder.status === s ? 'bg-cyan-400 text-slate-900 shadow-xl' : 'bg-white/10 hover:bg-white/20'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Grand Total Settlement</p>
                            <p className="text-5xl font-black text-white tracking-tighter">${selectedAdminOrder.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-600 pl-4">Delivery & Contact</h4>
                        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-6">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Full Name</p>
                                <p className="text-lg font-black text-slate-900 uppercase">{selectedAdminOrder.fullName}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp Primary</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-lg font-black text-blue-600 tracking-widest">{selectedAdminOrder.whatsappNumber}</p>
                                    <a href={`https://wa.me/${selectedAdminOrder.whatsappNumber}`} target="_blank" className="p-2 bg-green-500 text-white rounded-lg hover:scale-110 transition-transform">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                    </a>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Delivery Gmail</p>
                                <p className="text-sm font-black text-slate-900 border-b border-blue-100 pb-1">{selectedAdminOrder.deliveryEmail}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-cyan-400 pl-4">Payment Verification</h4>
                        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-6">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction ID / Method</p>
                                <p className="text-lg font-mono font-black text-slate-900 uppercase tracking-tighter">{selectedAdminOrder.transactionId}</p>
                                <span className="text-[9px] font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded uppercase mt-1 inline-block">{selectedAdminOrder.paymentMethod}</span>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Snapshot</p>
                                {selectedAdminOrder.screenshotUrl ? (
                                    <div className="relative group rounded-3xl overflow-hidden border border-slate-200 shadow-xl aspect-video cursor-zoom-in" onClick={() => window.open(selectedAdminOrder.screenshotUrl, '_blank')}>
                                        <img src={selectedAdminOrder.screenshotUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Payment Proof" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Click to view full size</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-300">
                                        <p className="text-[10px] font-black uppercase">No screenshot provided</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pb-10">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-slate-900 pl-4">Digital Items Purchased</h4>
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Unit Price</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Quantity</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {selectedAdminOrder.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <img src={item.image} className="w-10 h-10 rounded-xl object-cover" />
                                            <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[200px]">{item.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs font-bold text-slate-400">${item.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center text-xs font-black text-slate-900">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right text-sm font-black text-blue-600">${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center items-center gap-6">
                 <button onClick={() => setSelectedAdminOrder(null)} className="px-10 py-4 bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-300">Close Investigation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
