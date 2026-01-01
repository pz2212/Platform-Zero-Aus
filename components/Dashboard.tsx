
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, Product, Customer, UserRole, InventoryItem, Driver, Packer, AppNotification } from '../types';
import { mockService } from '../services/mockDataService';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { Settings as SettingsComponent } from './Settings';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { 
  Package, Truck, MapPin, LayoutDashboard, 
  Users, Clock, CheckCircle, X, Mail, Smartphone, Building,
  Settings, Calculator, FileText, ChevronRight, LayoutGrid, Search, Bell, History, Calendar, Printer, AlertTriangle, TrendingUp, Globe, Star, UserPlus, ArrowUpRight,
  Plus, Store, MessageSquare, Camera, Image as ImageIcon, Loader2, Send, ChevronDown, DollarSign,
  Briefcase, Boxes, ClipboardCheck, UserCheck, Timer, ArrowRight, ShoppingCart, Check, Zap, HandCoins, Target, MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

const OrderFulfillmentModal = ({ isOpen, onClose, order, products, customers, onUpdate }: any) => {
    const [selectedPacker, setSelectedPacker] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !order) return null;

    const buyer = customers.find((c: any) => c.id === order.buyerId);
    
    const handleAccept = async () => {
        setIsProcessing(true);
        mockService.acceptOrderV2(order.id);
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        onUpdate();
    };

    const handlePack = async () => {
        if (!selectedPacker) return alert("Assign a packer first.");
        setIsProcessing(true);
        mockService.packOrder(order.id, selectedPacker);
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        onUpdate();
    };

    const handleDispatch = async () => {
        if (!selectedDriver) return alert("Assign a driver first.");
        setIsProcessing(true);
        const targetOrder = mockService.getOrders('u1').find(o => o.id === order.id);
        if (targetOrder) {
            targetOrder.status = 'Shipped';
            targetOrder.shippedAt = new Date().toISOString();
            targetOrder.logistics = { ...targetOrder.logistics, driverName: selectedDriver };
        }
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#043003] rounded-2xl flex items-center justify-center text-white font-black shadow-lg">P</div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Order Fulfillment</h2>
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1.5">REF: #{order.id.split('-').pop()} • {buyer?.businessName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-white rounded-full border border-gray-100 shadow-sm transition-all"><X size={24} strokeWidth={2.5}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <FileText size={14}/> PRODUCT PACKING LIST
                            </h3>
                            <div className="divide-y divide-gray-50 border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/30">
                                {order.items.map((item: any, idx: number) => {
                                    const p = products.find((prod: any) => prod.id === item.productId);
                                    return (
                                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-white transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                                    <img src={p?.imageUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-sm uppercase truncate max-w-[120px]">{p?.name}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p?.variety}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900 text-lg tracking-tighter">{item.quantityKg}{p?.unit || 'kg'}</p>
                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">${item.pricePerKg.toFixed(2)}/u</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100 flex items-start gap-4">
                            <MapPin className="text-indigo-500 mt-1 shrink-0" size={20}/>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Delivery Coordinates</p>
                                <p className="text-sm font-black text-gray-900 mt-1">{buyer?.onboardingData?.deliveryAddress || 'Market Location: ' + buyer?.location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {order.status === 'Pending' ? (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem] text-center space-y-4">
                                    <Clock size={40} className="mx-auto text-orange-400 animate-pulse" />
                                    <h4 className="text-xl font-black text-orange-900 uppercase tracking-tight">Market Acceptance Required</h4>
                                    <p className="text-sm text-orange-700 font-medium">Verify stock availability before committing to the buyer.</p>
                                    <button onClick={handleAccept} disabled={isProcessing} className="w-full py-5 bg-[#043003] hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all">
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20}/> Confirm Availability</>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center px-2">
                                    {['ACCEPTED', 'PACKED', 'SHIPPED'].map((s, idx) => {
                                        const isActive = (s === 'ACCEPTED' && order.status === 'Confirmed') || (s === 'PACKED' && order.status === 'Ready for Delivery') || (s === 'SHIPPED' && order.status === 'Shipped');
                                        const isPast = (s === 'ACCEPTED' && ['Ready for Delivery', 'Shipped', 'Delivered'].includes(order.status)) || (s === 'PACKED' && ['Shipped', 'Delivered'].includes(order.status));
                                        return (
                                            <div key={s} className="flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isPast ? 'bg-emerald-500 border-emerald-500 text-white' : isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-300'}`}>
                                                    {isPast ? <Check size={14} strokeWidth={4}/> : <span className="text-[10px] font-black">{idx + 1}</span>}
                                                </div>
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${isActive || isPast ? 'text-gray-900' : 'text-gray-300'}`}>{s}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className={`p-8 rounded-[2rem] border transition-all ${order.status === 'Confirmed' ? 'bg-white border-indigo-200 shadow-lg' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'Confirmed' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                            <Boxes size={24}/>
                                        </div>
                                        <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest">Assign Packing</h4>
                                    </div>
                                    <select disabled={order.status !== 'Confirmed'} className="w-full p-4 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest mb-4" value={selectedPacker} onChange={(e) => setSelectedPacker(e.target.value)}>
                                        <option value="">Choose Personnel...</option>
                                        <option value="Alex Packer">Alex Packer</option>
                                        <option value="Sam Sort">Sam Sort</option>
                                    </select>
                                    {order.status === 'Confirmed' && (
                                        <button onClick={handlePack} disabled={!selectedPacker} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">Mark as Packed</button>
                                    )}
                                </div>
                                <div className={`p-8 rounded-[2rem] border transition-all ${order.status === 'Ready for Delivery' ? 'bg-white border-emerald-200 shadow-lg' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'Ready for Delivery' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                            <Truck size={24}/>
                                        </div>
                                        <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest">Dispatch Fleet</h4>
                                    </div>
                                    <select disabled={order.status !== 'Ready for Delivery'} className="w-full p-4 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest mb-4" value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                                        <option value="">Assign Driver...</option>
                                        <option value="Dave Transit">Dave Transit</option>
                                        <option value="Route Hub">External: PZ Hub</option>
                                    </select>
                                    {order.status === 'Ready for Delivery' && (
                                        <button onClick={handleDispatch} disabled={!selectedDriver} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">Confirm Dispatch</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Platform Zero Operations Protocol v2.5</p>
                    <button onClick={onClose} className="px-10 py-3 bg-white border-2 border-gray-200 text-gray-400 rounded-xl font-black uppercase text-[10px] tracking-widest">Back</button>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'BUYING' | 'SCANNER' | 'BUYERS' | 'SETTINGS'>('ORDERS');
  const [orderSubTab, setOrderSubTab] = useState<'INCOMING' | 'PROCESSING' | 'ACTIVE' | 'HISTORY'>('INCOMING');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [buyingOrders, setBuyingOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [matchingDemand, setMatchingDemand] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Buying List Logic
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [supplierInventory, setSupplierInventory] = useState<Record<string, InventoryItem[]>>({});
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);

  const products = mockService.getAllProducts();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    const allSellingOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setOrders(allSellingOrders);
    const allBuyingOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
    setBuyingOrders(allBuyingOrders);
    setCustomers(mockService.getCustomers());

    // Industry Intelligence Matching
    const myInterests = user.activeSellingInterests || ['Tomatoes', 'Lettuce', 'Eggplants'];
    const matched = mockService.getCustomers().filter(c => 
        myInterests.some(interest => c.commonProducts?.toLowerCase().includes(interest.toLowerCase()))
    ).map(c => ({
        ...c,
        matchingInterest: myInterests.find(i => c.commonProducts?.toLowerCase().includes(i.toLowerCase()))
    }));
    setMatchingDemand(matched);

    // Buying View Data
    const allUsers = mockService.getAllUsers();
    const networkSuppliers = allUsers.filter(u => u.id !== user.id && (u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
    setSuppliers(networkSuppliers);
    
    const invMap: Record<string, InventoryItem[]> = {};
    networkSuppliers.forEach(s => {
        invMap[s.id] = mockService.getInventory(s.id).filter(i => i.status === 'Available');
    });
    setSupplierInventory(invMap);
  };

  const incomingQueue = orders.filter(o => o.status === 'Pending');
  const processingQueue = orders.filter(o => ['Confirmed', 'Ready for Delivery'].includes(o.status));
  const activeFulfillment = orders.filter(o => o.status === 'Shipped');
  const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  const currentSellingList = orderSubTab === 'INCOMING' ? incomingQueue : 
                           orderSubTab === 'PROCESSING' ? processingQueue :
                           orderSubTab === 'ACTIVE' ? activeFulfillment : pastOrders;

  const handlePurchaseFromBuying = (supplierId: string, item: InventoryItem) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;
      
      const confirmMsg = `Initiate purchase for ${item.quantityKg}${product.unit || 'kg'} of ${product.name} from ${suppliers.find(s => s.id === supplierId)?.businessName}?\nTotal: $${(item.quantityKg * product.defaultPricePerKg).toFixed(2)} + $${(item.logisticsPrice || 0).toFixed(2)} logistics.`;
      if (window.confirm(confirmMsg)) {
          mockService.createInstantOrder(user.id, item, item.quantityKg, product.defaultPricePerKg);
          alert("Purchase successful! Check your Buying history.");
          loadData();
      }
  };

  return (
    <div className="animate-in fade-in duration-500 min-h-screen pb-20">
      
      {/* HEADER SECTION */}
      <div className="mb-12 border-b border-gray-100 pb-10 px-2 space-y-10">
        <div>
            <h1 className="text-[44px] font-black text-[#0F172A] tracking-tighter uppercase leading-none">Partner Operations</h1>
            <p className="text-gray-400 font-bold text-sm tracking-tight mt-2 flex items-center gap-3 uppercase">
                Management Console <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span> {user.businessName}
            </p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 border border-gray-200 shadow-inner-sm w-full md:w-max overflow-x-auto no-scrollbar">
            {[
                { id: 'ORDERS', label: 'Orders', icon: LayoutGrid },
                { id: 'BUYING', label: 'Buying', icon: ShoppingCart },
                { id: 'SCANNER', label: 'Scanner', icon: Camera },
                { id: 'BUYERS', label: 'Buyers', icon: Users },
                { id: 'SETTINGS', label: 'Config', icon: Settings }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 md:flex-none px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <tab.icon size={14}/> {tab.label}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'ORDERS' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-2">
            
            {/* LEFT SIDE: ORDER FULFILLMENT PIPELINE (8 Columns) */}
            <div className="xl:col-span-8 space-y-8 animate-in slide-in-from-left-4 duration-700">
                <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
                    <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-8 shrink-0">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-md border border-gray-100 shrink-0">
                                <LayoutGrid size={28}/>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Fulfillment Pipeline</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Managing your direct sales trade flow</p>
                            </div>
                        </div>

                        <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 border border-gray-200 shadow-inner-sm w-full md:w-auto">
                            {[
                                { id: 'INCOMING', label: 'Incoming', count: incomingQueue.length, icon: Bell, color: 'text-orange-500' },
                                { id: 'PROCESSING', label: 'Processing', count: processingQueue.length, icon: Package, color: 'text-indigo-500' },
                                { id: 'ACTIVE', label: 'Active Runs', count: activeFulfillment.length, icon: Truck, color: 'text-emerald-500' },
                                { id: 'HISTORY', label: 'History', count: null, icon: History, color: 'text-gray-400' }
                            ].map((sub) => (
                                <button 
                                    key={sub.id}
                                    onClick={() => setOrderSubTab(sub.id as any)}
                                    className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${orderSubTab === sub.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <sub.icon size={14} className={orderSubTab === sub.id ? sub.color : 'text-gray-400'}/> {sub.label} 
                                    {sub.count !== null && sub.count > 0 && <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white ${sub.color.replace('text-', 'bg-')}`}>{sub.count}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                        {currentSellingList.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-32 grayscale">
                                <ShoppingCart size={64} className="mb-6 text-gray-200" />
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">No active orders in this phase</p>
                            </div>
                        ) : (
                            currentSellingList.map(order => {
                                const buyer = customers.find(c => c.id === order.buyerId);
                                const isMarketplace = order.source === 'Marketplace';
                                
                                return (
                                    <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group animate-in slide-in-from-bottom-2">
                                        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                                            <div className="flex items-center gap-6 flex-1 w-full">
                                                <div className="w-16 h-16 rounded-[1.75rem] bg-gray-50 flex items-center justify-center text-gray-400 font-black text-2xl shadow-inner-sm uppercase border border-gray-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                                                    {buyer?.businessName.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none truncate">{buyer?.businessName}</h4>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                            isMarketplace 
                                                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                        }`}>
                                                            {isMarketplace ? 'PZ Marketplace' : 'Customer Direct'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> {new Date(order.date).toLocaleDateString()}</span>
                                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                            order.status === 'Shipped' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-10 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-0 border-gray-50 pt-6 lg:pt-0">
                                                <div className="text-left lg:text-right">
                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Total</p>
                                                    <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">${order.totalAmount.toFixed(2)}</p>
                                                </div>
                                                
                                                <button onClick={() => setSelectedOrder(order)} className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${order.status === 'Pending' ? 'bg-[#043003] text-white hover:bg-black' : 'bg-white border-2 border-indigo-100 text-indigo-600'}`}>
                                                    {order.status === 'Pending' ? 'Accept Order' : 'Manage Ops'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: MARKET INTELLIGENCE & BUYER DEMAND */}
            <div className="xl:col-span-4 space-y-8 animate-in slide-in-from-right-4 duration-700">
                <div className="bg-[#0B1221] rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col h-full min-h-[700px] relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 pointer-events-none"><Zap size={200} className="text-emerald-400"/></div>
                    
                    <div className="p-10 border-b border-white/5 relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <Target size={24}/>
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Buyer Intelligence</h2>
                        </div>
                        <p className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.25em]">Industry-wide matching</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 space-y-6 relative z-10 custom-scrollbar">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Buyers needing your stock</h3>
                        
                        {matchingDemand.length === 0 ? (
                            <div className="py-20 text-center text-slate-500 opacity-20">
                                <Users size={48} className="mx-auto mb-4"/>
                                <p className="text-xs font-black uppercase tracking-widest">No active matches</p>
                            </div>
                        ) : matchingDemand.map(buyer => (
                            <div key={buyer.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-white font-black text-lg uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{buyer.businessName}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin size={10} className="text-slate-500"/>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{buyer.location || 'Adelaide Central'}</p>
                                        </div>
                                    </div>
                                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">Needs: {buyer.matchingInterest}</span>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sentiment</p>
                                        <span className="text-[10px] font-black text-emerald-400 uppercase">High Intent</span>
                                    </div>
                                    <button onClick={() => triggerNativeSms(buyer.phone || '0400000000', `Hi ${buyer.contactName}, this is Sarah from Fresh Wholesalers. We have premium ${buyer.matchingInterest} ready for dispatch. Interested?`)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-50 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                                        <HandCoins size={16}/> Propose Direct Sale
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* VIEW: BUYING MANAGEMENT - REFACTORED TO LIST SUPPLIERS & PRODUCTS */}
      {activeTab === 'BUYING' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 px-2">
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
                <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-8 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-md border border-gray-100 shrink-0">
                            <ShoppingCart size={28}/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Supply Network</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Source inventory from verified partners</p>
                        </div>
                    </div>
                    
                    <div className="bg-emerald-50 px-6 py-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                         <Globe size={16} className="text-emerald-600 animate-spin-slow"/>
                         <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{suppliers.length} Verified Partners Live</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                    {suppliers.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-32 grayscale">
                            <ShoppingCart size={64} className="mb-6 text-gray-200" />
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">No suppliers available in your network</p>
                        </div>
                    ) : (
                        suppliers.map(supplier => {
                            const items = supplierInventory[supplier.id] || [];
                            const isExpanded = expandedSupplierId === supplier.id;
                            
                            return (
                                <div key={supplier.id} className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden group transition-all hover:shadow-xl">
                                    <div 
                                        onClick={() => setExpandedSupplierId(isExpanded ? null : supplier.id)}
                                        className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner-sm border ${supplier.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                                {supplier.businessName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-2">{supplier.businessName}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={10}/> {supplier.businessProfile?.businessLocation || 'Adelaide Market'}</span>
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5"><Package size={10}/> {items.length} Products</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); triggerNativeSms(supplier.phone || '0400000000', `Hi ${supplier.name}, interested in connecting regarding your produce...`); }}
                                                className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center gap-2"
                                            >
                                                <Users size={14}/> Connect
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setExpandedSupplierId(supplier.id); /* Open chat logic could go here */ }}
                                                className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center gap-2"
                                            >
                                                <MessageCircle size={14}/> Chat
                                            </button>
                                            <div className={`p-2 rounded-lg bg-gray-100 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={20}/>
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-gray-50 bg-gray-50/20 p-8 animate-in slide-in-from-top-2 duration-300">
                                            {items.length === 0 ? (
                                                <div className="py-12 text-center text-gray-400 italic text-sm">No live products found for this supplier</div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {items.map(item => {
                                                        const p = products.find(prod => prod.id === item.productId);
                                                        return (
                                                            <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group/item">
                                                                <div className="flex items-center gap-4 mb-6">
                                                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-50 bg-gray-50 shrink-0">
                                                                        <img src={p?.imageUrl} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h4 className="font-black text-gray-900 uppercase text-sm truncate">{p?.name}</h4>
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.quantityKg}{p?.unit || 'kg'} available</p>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-3 mb-6">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Price</span>
                                                                        <span className="text-base font-black text-emerald-600 tracking-tighter">${p?.defaultPricePerKg.toFixed(2)}/u</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logistics Price</span>
                                                                        <span className="text-sm font-black text-indigo-600 tracking-tight">${(item.logisticsPrice || 0).toFixed(2)}</span>
                                                                    </div>
                                                                </div>

                                                                <button 
                                                                    onClick={() => handlePurchaseFromBuying(supplier.id, item)}
                                                                    className="w-full py-4 bg-indigo-600 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                                                                >
                                                                    <ShoppingCart size={16}/> Instant Purchase
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
      )}

      {/* VIEW: BUYERS MANAGEMENT */}
      {activeTab === 'BUYERS' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 px-2">
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
                <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-8 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#043003] shadow-md border border-gray-100 shrink-0">
                            <Users size={28}/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Buyer Network</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Manage your connected customer accounts</p>
                        </div>
                    </div>
                    <button className="px-8 py-4 bg-[#043003] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center gap-2">
                        <Plus size={18}/> Invite New Buyer
                    </button>
                </div>
                
                <div className="p-8">
                    <div className="relative mb-8 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#043003] transition-colors" size={20}/>
                        <input 
                            placeholder="Search buyer database..." 
                            className="w-full pl-14 pr-8 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm font-bold text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customers.filter(c => c.connectedSupplierId === user.id).map(customer => (
                            <div key={customer.id} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:shadow-xl transition-all group flex flex-col justify-between min-h-[300px]">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 bg-indigo-50 rounded-[1.25rem] flex items-center justify-center font-black text-2xl text-indigo-700 shadow-inner-sm">
                                            {customer.businessName.charAt(0)}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                            customer.connectionStatus === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                            {customer.connectionStatus}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-gray-900 text-2xl tracking-tight leading-tight mb-2 group-hover:text-indigo-600 transition-colors uppercase">{customer.businessName}</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">{customer.category}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all">Profile</button>
                                    <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100">
                                        <MessageSquare size={20}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'SCANNER' && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            <AiOpportunityMatcher user={user} />
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="animate-in fade-in duration-300">
          <SettingsComponent user={user} onRefreshUser={loadData} />
        </div>
      )}

      <OrderFulfillmentModal 
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        products={products}
        customers={customers}
        onUpdate={loadData}
      />
    </div>
  );
};
