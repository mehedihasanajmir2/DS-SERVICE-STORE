
import React, { useState, useRef } from 'react';
import { Product, Order } from '../types';
import { CATEGORIES, INITIAL_PRODUCTS } from '../constants';
import { supabase } from '../supabaseClient';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, p: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  orders, 
  onAddProduct, 
  onUpdateProduct,
  onDeleteProduct, 
  onUpdateOrderStatus,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'setup'>('inventory');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: CATEGORIES[1],
    image: '',
    stock: 10,
    rating: 5
  });

  const sqlSetup = `-- 1. Create 'products' table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  stock INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 5
);

-- 2. Create 'orders' table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  full_name TEXT,
  whatsapp_number TEXT,
  delivery_email TEXT,
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  screenshot_url TEXT
);

-- 3. Enable Storage (Go to Storage tab and create 'products' bucket with PUBLIC access)`;

  const handleSyncData = async () => {
    if (!confirm("This will push all default demo products to your Supabase database. Continue?")) return;
    
    setIsSyncing(true);
    try {
      // Remove hardcoded IDs so Supabase generates new ones
      const productsToSync = INITIAL_PRODUCTS.map(({ id, ...rest }) => rest);
      
      const { error } = await supabase
        .from('products')
        .insert(productsToSync);

      if (error) throw error;
      
      alert("✅ Success! All demo products have been synced to your Supabase database. Please refresh the page.");
      window.location.reload();
    } catch (error: any) {
      alert("❌ Sync Failed: " + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      if (data) {
        setFormData({ ...formData, image: data.publicUrl });
        alert("✅ Image uploaded successfully!");
      }
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
      console.error(error);
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
      rating: product.rating
    });
    setIsFormOpen(true);
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
      console.error("Submit Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ 
      name: '', 
      description: '', 
      price: 0, 
      category: CATEGORIES[1], 
      image: '', 
      stock: 10, 
      rating: 5 
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Admin Control Center</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your products and customer orders in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-6 py-3 border-2 border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Exit Admin</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Product Catalog
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Customer Orders ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab('setup')}
          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'setup' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Database Setup Guide 🛠️
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <>
          <div className="flex justify-end mb-6">
            <button 
              onClick={() => { if(isFormOpen) resetForm(); else setIsFormOpen(true); }}
              className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all ${isFormOpen ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
            >
              {isFormOpen ? 'Cancel Entry' : 'Add New Service'}
            </button>
          </div>

          {isFormOpen && (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl mb-12 animate-in zoom-in-95">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">
                {editingId ? 'Update Service Details' : 'Register New Service'}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Name</label>
                    <input required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Premium Apple ID" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                    <textarea required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-bold h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe your service..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                      <select className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Image</label>
                      <div className="flex gap-3">
                        <input 
                          type="url" 
                          className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-bold" 
                          value={formData.image} 
                          onChange={e => setFormData({...formData, image: e.target.value})} 
                          placeholder="Paste URL or upload →" 
                        />
                        <button 
                          type="button"
                          disabled={uploading}
                          onClick={() => fileInputRef.current?.click()}
                          className={`px-4 rounded-2xl flex items-center justify-center transition-all border-2 border-dashed ${uploading ? 'bg-slate-100 border-slate-200' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'}`}
                        >
                          {uploading ? (
                            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Image Preview</label>
                    <div className="aspect-square w-full rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                      {formData.image ? (
                        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Invalid+Image+URL'; }} />
                      ) : (
                        <div className="text-center p-4">
                          <svg className="w-10 h-10 text-slate-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No Image Selected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price ($)</label>
                      <input type="number" step="0.01" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stock</label>
                      <input type="number" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={uploading || saving} 
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (editingId ? 'Save Changes' : 'Publish Listing')}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stock</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img src={p.image} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm" alt="" />
                          <span className="font-black text-slate-900 text-sm">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{p.category}</span></td>
                      <td className="px-8 py-5 font-black text-blue-600 text-sm">${p.price.toFixed(2)}</td>
                      <td className="px-8 py-5 font-black text-slate-400 text-sm">{p.stock} Units</td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditClick(p)} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M18.364 5.364a2.121 2.121 0 013 3L12 18l-4 1 1-4L18.364 5.364z" /></svg></button>
                          <button onClick={() => { if(confirm('Delete this service permanently?')) onDeleteProduct(p.id); }} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeTab === 'orders' ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Date & Info</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No orders received yet.</p>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-black text-slate-900">{new Date(order.createdAt).toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {order.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900">{order.fullName}</span>
                          <span className="text-[10px] font-bold text-blue-600">{order.whatsappNumber}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-900">${order.total.toFixed(2)}</span>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{order.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                          ${order.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-600' : 
                            order.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                            'bg-red-100 text-red-600'}
                        `}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md transition-all"
                            >
                              Confirm
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-sm animate-in zoom-in-95">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6">Supabase Database Setup Guide</h2>
          
          {/* Quick Sync Card */}
          <div className="mb-10 p-8 bg-indigo-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Sync Demo Products</h3>
              <p className="text-indigo-200 text-sm mb-6 max-w-md">আপনার ডাটাবেসটি কি এখন খালি? নিচের বাটনে ক্লিক করলে কোডের সব ডেমো প্রোডাক্ট এক ক্লিকে আপনার সুুপাবাস ডাটাবেসে সেভ হয়ে যাবে।</p>
              <button 
                onClick={handleSyncData}
                disabled={isSyncing}
                className={`px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center gap-3 shadow-lg ${isSyncing ? 'opacity-50' : ''}`}
              >
                {isSyncing ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {isSyncing ? 'Syncing...' : 'Sync Initial Data to DB'}
              </button>
            </div>
          </div>

          <p className="text-slate-600 mb-8 leading-relaxed">
            আপনার ডাটাবেসটি ম্যানুয়ালি সঠিকভাবে কাজ করার জন্য নিচের SQL কোডটি কপি করে আপনার Supabase প্রজেক্টের <b>SQL Editor</b>-এ রান করুন। এটি প্রয়োজনীয় টেবিলগুলো তৈরি করে দিবে।
          </p>
          
          <div className="relative group">
            <pre className="bg-slate-900 text-cyan-400 p-6 rounded-3xl overflow-x-auto text-xs font-mono leading-relaxed shadow-2xl border border-white/10">
              {sqlSetup}
            </pre>
            <button 
              onClick={() => { navigator.clipboard.writeText(sqlSetup); alert('SQL Copied to clipboard!'); }}
              className="absolute top-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Copy SQL
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
              <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight mb-2">1. টেবিল তৈরি</h4>
              <p className="text-xs text-blue-700 leading-relaxed font-medium">উপরের SQL কোডটি Supabase SQL Editor-এ রান করলে `products` এবং `orders` টেবিল তৈরি হয়ে যাবে। এরপরই আপনি ওয়েবসাইট থেকে সার্ভিস যোগ করতে পারবেন।</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
              <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight mb-2">2. স্টোরেজ সেটআপ</h4>
              <p className="text-xs text-indigo-700 leading-relaxed font-medium">ইমেজ আপলোড করার জন্য Supabase Storage-এ গিয়ে `products` নামে একটি <b>Public</b> বাকেট তৈরি করুন। অন্যথায় ইমেজ সেভ হবে না।</p>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Order Details</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Order ID: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <section>
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Customer Info</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase">Full Name</span>
                        <span className="text-lg font-black text-slate-900">{selectedOrder.fullName}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase">WhatsApp</span>
                        <span className="text-lg font-black text-blue-600 underline cursor-pointer">{selectedOrder.whatsappNumber}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase">Delivery Email</span>
                        <span className="text-lg font-black text-slate-900">{selectedOrder.deliveryEmail}</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Payment Details</h3>
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-400 uppercase">Method</span>
                        <span className="text-sm font-black text-slate-900">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-400 uppercase">Trx ID / Order ID</span>
                        <span className="text-sm font-black text-cyan-600 font-mono tracking-widest">{selectedOrder.transactionId}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <span className="text-xs font-black text-slate-400 uppercase">Total Amount</span>
                        <span className="text-2xl font-black text-slate-900">${selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Ordered Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-xs font-black text-slate-900">{item.name} <span className="text-slate-400 ml-1">(x{item.quantity})</span></span>
                          <span className="text-xs font-black text-blue-600">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Payment Proof</h3>
                  {selectedOrder.screenshotUrl ? (
                    <div className="relative group">
                      <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
                        <img 
                          src={selectedOrder.screenshotUrl} 
                          alt="Payment Proof" 
                          className="w-full h-auto object-contain cursor-zoom-in transition-transform group-hover:scale-105 duration-500"
                          onClick={() => window.open(selectedOrder.screenshotUrl, '_blank')}
                        />
                      </div>
                      <p className="text-center text-[10px] font-black text-slate-400 uppercase mt-4">Click Image to View Full Size</p>
                    </div>
                  ) : (
                    <div className="h-64 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-xs font-black uppercase tracking-widest">No Screenshot Provided</span>
                    </div>
                  )}

                  <div className="mt-12 space-y-4">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => { onUpdateOrderStatus(selectedOrder.id, 'confirmed'); setSelectedOrder(null); }}
                        className="py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-xl shadow-green-200 transition-all"
                      >
                        Approve Order
                      </button>
                      <button 
                        onClick={() => { onUpdateOrderStatus(selectedOrder.id, 'cancelled'); setSelectedOrder(null); }}
                        className="py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
