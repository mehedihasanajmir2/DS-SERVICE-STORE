
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
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
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
    <div className="animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16 rounded-full border-2 border-slate-100 overflow-hidden shadow-lg">
            <img src={ownerPhotoUrl} alt="Owner" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mehedi Hasan</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">DS Service Store Admin</p>
          </div>
        </div>
        <button onClick={onBack} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">Logout Panel</button>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-10 bg-slate-100/50 p-2 rounded-[1.8rem] w-fit border border-slate-200/50">
        <button onClick={() => setActiveTab('inventory')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500'}`}>Inventory</button>
        <button onClick={() => setActiveTab('orders')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500'}`}>Orders ({orders.length})</button>
      </div>

      {activeTab === 'inventory' ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Service Management</h2>
            <button onClick={() => { if(isFormOpen) resetForm(); else setIsFormOpen(true); }} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">{isFormOpen ? 'Close Editor' : 'Add New Service'}</button>
          </div>

          {isFormOpen && (
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-200 shadow-xl mb-12 animate-in slide-in-from-top-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Name</label>
                    <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price ($)</label>
                    <input type="number" step="0.01" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</label>
                    <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image URL</label>
                    <div className="flex gap-4">
                      <input className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px]">Upload</button>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    </div>
                  </div>
               </div>
               <div className="mt-8 flex gap-4">
                  <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px]">{saving ? 'Saving...' : 'Save Configuration'}</button>
                  <button type="button" onClick={resetForm} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
               </div>
            </form>
          )}

          <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Service</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Price</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase text-center">Stock</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-4">
                        <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-black text-slate-900 text-sm">{p.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-5 font-black text-indigo-600">${p.price.toFixed(2)}</td>
                    <td className="px-10 py-5 text-center font-bold text-slate-500">{p.stock}</td>
                    <td className="px-10 py-5 text-right">
                       <button onClick={() => handleEditClick(p)} className="p-2 text-slate-400 hover:text-indigo-600 mr-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M18.364 5.364a2.121 2.121 0 013 3L12 18l-4 1 1-4L18.364 5.364z" /></svg></button>
                       <button onClick={() => { if(confirm('Delete service?')) onDeleteProduct(p.id); }} className="p-2 text-slate-400 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" /></svg></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ORDERS CENTER */
        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
             <thead className="bg-slate-50">
               <tr>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Customer</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase text-center">Amount</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase text-right">View</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {orders.map(o => (
                 <tr key={o.id} className="hover:bg-slate-50/50">
                   <td className="px-10 py-5">
                       <p className="font-black text-slate-900 text-xs">{o.fullName}</p>
                       <p className="text-[9px] font-bold text-slate-400">{o.deliveryEmail}</p>
                   </td>
                   <td className="px-10 py-5 text-center font-black text-slate-900 text-xs">${o.total.toFixed(2)}</td>
                   <td className="px-10 py-5 text-center">
                       <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${o.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{o.status}</span>
                   </td>
                   <td className="px-10 py-5 text-right">
                       <button onClick={() => setSelectedOrder(o)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[8px] font-black uppercase tracking-widest">Details</button>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      )}

      {/* COMPACT ORDER DOSSIER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
             
             <div className="flex items-center justify-between p-5 border-b border-slate-50">
                 <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase">Order Details</h2>
                    <p className="text-[8px] font-black text-slate-400 uppercase mt-0.5">ID: {selectedOrder.id}</p>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 text-slate-300 hover:text-red-500 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
             </div>

             <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Customer</p>
                        <p className="text-xs font-black text-slate-900">{selectedOrder.fullName}</p>
                        <p className="text-[9px] font-bold text-indigo-600">{selectedOrder.deliveryEmail}</p>
                        <p className="text-[8px] font-bold text-slate-400">WA: {selectedOrder.whatsappNumber}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Payment</p>
                        <p className="text-xs font-black text-slate-900 uppercase">{selectedOrder.paymentMethod}</p>
                        <p className="text-[9px] font-bold text-indigo-600 truncate">TXID: {selectedOrder.transactionId}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50"><tr className="text-[7px] font-black uppercase text-slate-400"><th className="px-4 py-2">Item</th><th className="px-4 py-2 text-center">Qty</th><th className="px-4 py-2 text-right">Price</th></tr></thead>
                        <tbody className="divide-y divide-slate-50">
                            {selectedOrder.items.map((item, i) => (
                                <tr key={i}><td className="px-4 py-2 text-[9px] font-bold">{item.name}</td><td className="px-4 py-2 text-[9px] text-center">x{item.quantity}</td><td className="px-4 py-2 text-[9px] text-right">${(item.price * item.quantity).toFixed(2)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="h-64 rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                    {selectedOrder.screenshotUrl ? (
                        <img src={selectedOrder.screenshotUrl} className="w-full h-full object-contain cursor-zoom-in" onClick={() => window.open(selectedOrder.screenshotUrl, '_blank')} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase">No Screenshot</div>
                    )}
                </div>
             </div>

             <div className="p-5 bg-slate-50 border-t border-slate-100">
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => { if(confirm('Confirm order?')) { onUpdateOrderStatus(selectedOrder.id, 'confirmed'); setSelectedOrder(null); } }} 
                        className="flex-1 py-3 bg-green-600 text-white rounded-lg font-black uppercase text-[8px] hover:bg-green-700 transition-all"
                    >Confirm Order</button>
                    <button 
                        onClick={() => { if(confirm('Decline order?')) { onUpdateOrderStatus(selectedOrder.id, 'cancelled'); setSelectedOrder(null); } }} 
                        className="flex-1 py-3 bg-amber-500 text-white rounded-lg font-black uppercase text-[8px] hover:bg-amber-600 transition-all"
                    >Decline</button>
                    {onDeleteOrder && (
                        <button 
                            onClick={() => { if(confirm('Delete permanently?')) { onDeleteOrder(selectedOrder.id); setSelectedOrder(null); } }} 
                            className="px-4 py-3 bg-red-600 text-white rounded-lg font-black uppercase text-[8px] hover:bg-red-700 transition-all"
                        >Delete</button>
                    )}
                    <button onClick={() => setSelectedOrder(null)} className="px-4 py-3 bg-white border border-slate-200 text-slate-400 rounded-lg font-black uppercase text-[8px]">Close</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
