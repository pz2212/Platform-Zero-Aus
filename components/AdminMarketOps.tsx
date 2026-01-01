
import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockDataService';
import { Order, OrderIssue, Customer, User, UserRole } from '../types';
import { 
  ShoppingCart, Package, Truck, CheckCircle, Clock, AlertCircle, 
  MessageSquare, User as UserIcon, Store, ChevronRight, Activity, 
  ArrowRight, ShieldCheck, Timer, Gavel, Eye, AlertTriangle, Loader2,
  Check,
  PackageCheck,
  FileWarning,
  UserCheck
} from 'lucide-react';

export const AdminMarketOps: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TRANSIT' | 'DELIVERED'>('TRANSIT');
  const [orders, setOrders] = useState<Order[]>([]);
  const [issues, setIssues] = useState<OrderIssue[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const load = () => {
        setOrders(mockService.getOrders('u1'));
        setIssues(mockService.getTodayIssues());
        setCustomers(mockService.getCustomers());
        setUsers(mockService.getAllUsers());
    };
    load();
    const dataInterval = setInterval(load, 5000);
    const timeInterval = setInterval(() => setNow(new Date()), 1000);
    return () => {
        clearInterval(dataInterval);
        clearInterval(timeInterval);
    };
  }, []);

  const transitOrders = orders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  const getWholesalerName = (id: string) => users.find(u => u.id === id)?.businessName || 'PZ Partner';
  const getBuyerName = (id: string) => customers.find(c => c.id === id)?.businessName || 'Guest';

  // Countdown Helper: 90 Minutes from deliveredAt
  const getCountdown = (deliveredAt: string | undefined) => {
    if (!deliveredAt) return "00:00:00";
    const deliveredTime = new Date(deliveredAt).getTime();
    const expiryTime = deliveredTime + (90 * 60 * 1000);
    const diff = expiryTime - now.getTime();
    
    if (diff <= 0) return "PROCESSED";
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-8 animate-in fade-in duration-500">
      
      {/* LEFT SIDE: LIVE TRANSACTIONS */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Live Transactions</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Marketplace Movement Feed</p>
                </div>
                <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full flex items-center gap-2">
                    <Activity size={14} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Market Flow</span>
                </div>
            </div>

            <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 border border-gray-200 shadow-inner-sm">
                <button 
                    onClick={() => setActiveTab('TRANSIT')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'TRANSIT' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Truck size={14}/> Outgoing Today ({transitOrders.length})
                </button>
                <button 
                    onClick={() => setActiveTab('DELIVERED')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'DELIVERED' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <PackageCheck size={14}/> Verifying Orders ({deliveredOrders.length})
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/30">
            {(activeTab === 'TRANSIT' ? transitOrders : deliveredOrders).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingCart size={32} className="text-gray-300" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">No active shipments in this category</p>
                </div>
            ) : (activeTab === 'TRANSIT' ? transitOrders : deliveredOrders).map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-5 flex-1">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl shadow-inner-sm uppercase border border-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all shrink-0">
                                {getBuyerName(order.buyerId).charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-base uppercase tracking-tight leading-none mb-2">{getBuyerName(order.buyerId)}</h4>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1"><Store size={10}/> {getWholesalerName(order.sellerId)}</span>
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">• REF: #{order.id.split('-').pop()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                            {activeTab === 'DELIVERED' ? (
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Pre-Invoice Lock</p>
                                    <div className={`flex items-center gap-2 font-black text-lg font-mono ${getCountdown(order.deliveredAt) === 'PROCESSED' ? 'text-gray-400' : 'text-emerald-600'}`}>
                                        <Timer size={18} className={getCountdown(order.deliveredAt) !== 'PROCESSED' ? "animate-pulse" : ""}/> {getCountdown(order.deliveredAt)}
                                    </div>
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Report Deadline</p>
                                </div>
                            ) : (
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Fulfillment Stage</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 shadow-sm ${
                                            order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            order.status === 'Ready for Delivery' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                            'bg-orange-50 text-orange-700 border-orange-100'
                                        }`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="text-right">
                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Trade Value</p>
                                <p className="font-black text-gray-900 text-xl tracking-tighter">${order.totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* RIGHT SIDE: ISSUE RESOLUTION CENTER */}
      <div className="w-full lg:w-[480px] bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-100 bg-gray-900 text-white shrink-0 relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 transform rotate-12 scale-150"><Gavel size={120} /></div>
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-1">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20"><FileWarning size={22} /></div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Market Quality Disputes</h2>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Produce & Delivery Reports</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
            {issues.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-20 grayscale">
                    <ShieldCheck size={48} className="text-gray-300 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">All orders verified & settled</p>
                </div>
            ) : issues.map(issue => (
                <div key={issue.id} className="bg-white rounded-[2.5rem] border-2 border-red-50 p-6 shadow-sm hover:shadow-xl hover:border-red-100 transition-all animate-in slide-in-from-right-4 duration-500 overflow-hidden relative group">
                    <div className="absolute -top-4 -right-4 bg-red-50 p-8 rounded-full opacity-0 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle size={80}/>
                    </div>

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[9px] font-black bg-red-100 text-red-700 px-3 py-1 rounded-lg uppercase tracking-widest border border-red-200 shadow-sm">Produce Dispute</span>
                            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mt-3 leading-none">{getBuyerName(orders.find(o => o.id === issue.orderId)?.buyerId || '')}</h3>
                        </div>
                        <div className="text-right">
                             <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Reported</p>
                             <p className="text-[10px] font-black text-gray-600 uppercase">{new Date(issue.reportedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>

                    <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100/50 mb-8">
                        <p className="text-red-900 font-bold text-sm italic">"{issue.description}"</p>
                    </div>

                    <div className="space-y-6">
                        {/* SUPPLIER ACKNOWLEDGMENT */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                     <Store size={14} className="text-indigo-400"/>
                                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Supplier Response</p>
                                </div>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border shadow-inner-sm ${
                                    issue.supplierStatus === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                                }`}>
                                    {issue.supplierStatus}
                                </span>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                                {issue.supplierStatus === 'PENDING' ? (
                                    <div className="flex items-center gap-3 text-gray-400 italic text-xs">
                                        <Loader2 size={14} className="animate-spin" /> Awaiting Partner Action
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-emerald-600"><CheckCircle size={14} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-900 uppercase">Decision: {issue.supplierAction}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Credit applied to ledger</p>
                                        </div>
                                    </div>
                                )}
                                <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-indigo-600 transition-all"><MessageSquare size={16}/></button>
                            </div>
                        </div>

                        {/* ASSIGNED REP STATUS */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <UserCheck size={14} className="text-indigo-400" />
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">PZ Representative Oversight</p>
                                </div>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border shadow-inner-sm ${
                                    issue.repStatus === 'UNSEEN' ? 'bg-gray-100 text-gray-400 border-gray-200' : 
                                    'bg-indigo-50 text-indigo-700 border-indigo-100'
                                }`}>
                                    {issue.repStatus}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black shadow-inner-sm shrink-0">
                                    {users.find(u => u.id === issue.assignedRepId)?.name.charAt(0) || 'R'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{users.find(u => u.id === issue.assignedRepId)?.name || 'HQ Representative'}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                        {issue.repStatus === 'ACTIONING' ? 'Actively mediating trade' : 'Case queued for review'}
                                    </p>
                                </div>
                                <button className="px-5 py-2.5 bg-[#0F172A] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95">Open Case</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="p-8 border-t border-gray-100 bg-white">
             <button className="w-full py-5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-3 group">
                <AlertTriangle size={18} className="group-hover:animate-shake"/> Open HQ Arbitration
             </button>
        </div>
      </div>
    </div>
  );
};
