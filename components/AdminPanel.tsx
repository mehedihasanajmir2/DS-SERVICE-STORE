
import React, { useState } from 'react';
import { Product, Order } from '../types';
import { CATEGORIES } from '../constants';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  orders, 
  onAddProduct, 
  onDeleteProduct, 
  onUpdateOrderStatus,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('orders');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: CATEGORIES[1],
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400',
    stock: 10,
    rating: 5
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct(formData);
    setIsAdding(false);
    setFormData({ name: '', description: '', price: 0, category: CATEGORIES[1], image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400', stock: 10, rating: 5 });
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

      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Customer Orders ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Product Catalog
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <>
          <div className="flex justify-end mb-6">
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              {isAdding ? 'Cancel Entry' : 'Add New Service'}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Name</label>
                  <input required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Premium Apple ID" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-bold h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Service details..." />
                </div>
              </div>
              <div className="space-y-6">
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
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">Publish Listing</button>
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
                          <img src={p.image} className="w-12 h-12 rounded-xl object-cover border border-slate-100" alt="" />
                          <span className="font-black text-slate-900 text-sm">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{p.category}</span></td>
                      <td className="px-8 py-5 font-black text-blue-600 text-sm">${p.price.toFixed(2)}</td>
                      <td className="px-8 py-5 font-black text-slate-400 text-sm">{p.stock} Units</td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => { if(confirm('Delete this service permanently?')) onDeleteProduct(p.id); }}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
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
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-black text-slate-900">{new Date(order.createdAt).toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {order.id.slice(0, 8)}</span>
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {order.items.map((item, idx) => (
                              <span key={idx} className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0.5 rounded-md font-bold">
                                {item.name} (x{item.quantity})
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900">{order.fullName}</span>
                          <span className="text-[10px] font-bold text-blue-600">{order.whatsappNumber}</span>
                          <span className="text-[10px] font-bold text-slate-400">{order.deliveryEmail}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-900">${order.total.toFixed(2)}</span>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">via {order.paymentMethod}</span>
                          <span className="text-[9px] font-mono text-cyan-600 truncate max-w-[100px]">TxID: {order.transactionId}</span>
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
                        <div className="flex justify-end gap-2">
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md transition-all"
                            >
                              Confirm
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button 
                              onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-700 shadow-md transition-all"
                            >
                              Deliver
                            </button>
                          )}
                          <button 
                            onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
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
      )}
    </div>
  );
};
