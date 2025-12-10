
import React, { useState, useEffect } from 'react';
import { Globe, Menu, Bell } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Orders from './components/Orders';
import Customers from './components/Customers';
import StaffView from './components/Staff';
import Production from './components/Production';
import Finance from './components/Finance';
import Login from './components/Login';
import Toast from './components/Toast';
import { Language, Customer, Product, RawMaterial, Order, Staff, Expense, Notification } from './types';
import { TRANSLATIONS } from './constants';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  // 1. ALL HOOKS MUST BE AT THE TOP
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [lang, setLang] = useState<Language>(Language.AR);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loginStaff, setLoginStaff] = useState<Staff[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);

  const isRTL = lang === Language.AR;

  // 2. EFFECTS

  // Check LocalStorage for existing session on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('carton_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.id) {
            setCurrentUser(parsedUser);
            setIsLoggedIn(true);
        }
      } catch (e) {
        localStorage.removeItem('carton_user');
      }
    }
  }, []);

  // Fetch Staff list for Login screen
  useEffect(() => {
    const fetchLoginStaff = async () => {
        const { data } = await supabase.from('staff').select('*');
        if(data) {
            setLoginStaff(data.map((s: any) => ({
                ...s, roleAr: s.role_ar, roleFr: s.role_fr, lastPaymentDate: s.last_payment_date, advanceTaken: s.advance_taken 
            })));
        }
    };
    fetchLoginStaff();
  }, []);

  // Fetch Main Data only when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  // 3. FUNCTIONS
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: staffData } = await supabase.from('staff').select('*');
      if(staffData) setStaff(staffData.map((s: any) => ({
        ...s, roleAr: s.role_ar, roleFr: s.role_fr, lastPaymentDate: s.last_payment_date, advanceTaken: s.advance_taken 
      })));

      const { data: prodData } = await supabase.from('products').select('*');
      if(prodData) setProducts(prodData.map((p: any) => ({
        ...p, nameAr: p.name_ar, nameFr: p.name_fr, maxQuantity: p.max_quantity 
      })));

      const { data: matData } = await supabase.from('raw_materials').select('*');
      if(matData) setMaterials(matData.map((m: any) => ({
        ...m, nameAr: m.name_ar, nameFr: m.name_fr, maxQuantity: m.max_quantity, minLevel: m.min_level 
      })));

      const { data: custData } = await supabase.from('customers').select('*');
      if(custData) setCustomers(custData);

      const { data: expData } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if(expData) setExpenses(expData);

      const { data: ordData } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if(ordData) setOrders(ordData.map((o: any) => ({
        ...o, customerId: o.customer_id, customerName: o.customer_name, totalAmount: o.total_amount 
      })));

    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Error loading database data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => setLang(prev => prev === Language.AR ? Language.FR : Language.AR);
  
  const handleLogin = (user: Staff) => { 
    localStorage.setItem('carton_user', JSON.stringify(user)); 
    setCurrentUser(user); 
    setIsLoggedIn(true); 
  };
  
  const handleLogout = () => { 
    localStorage.removeItem('carton_user'); 
    setIsLoggedIn(false); 
    setCurrentUser(null); 
    setCurrentView('dashboard'); 
  };
  
  const showNotification = (message: string, type: 'success' | 'error') => setNotification({ message, type });

  // 4. CONDITIONAL RENDERING
  if (!isLoggedIn) {
    return <Login lang={lang} onLogin={handleLogin} toggleLanguage={toggleLanguage} staff={loginStaff} />;
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`flex h-screen bg-slate-50 overflow-hidden ${isRTL ? 'font-cairo' : 'font-sans'}`}>
      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} isRTL={isRTL} />}
      
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        lang={lang} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-700"><Menu size={24} /></button>
             <h2 className="hidden md:block text-lg font-bold text-slate-800 tracking-wide">{TRANSLATIONS[currentView][lang]}</h2>
          </div>
          <div className="flex items-center gap-4">
             {isLoading && <span className="text-xs text-blue-600 animate-pulse">Syncing...</span>}
             <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-sm font-medium">
               <Globe size={16} /><span>{lang === Language.AR ? 'Français' : 'العربية'}</span>
             </button>
             <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
               <Bell size={20} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
             </button>
             <div className="hidden md:flex items-center gap-2 cursor-pointer group" onClick={handleLogout}>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200">
                  {currentUser?.name.charAt(0)}
                </div>
                <div className="text-xs text-left">
                    <p className="font-semibold text-slate-700">{currentUser?.name}</p>
                    <p className="text-slate-400">Logout</p>
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 bg-slate-50/50 print:p-0 print:bg-white">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === 'dashboard' && <Dashboard lang={lang} setCurrentView={setCurrentView} orders={orders} staff={staff} expenses={expenses} />}
            {/* We pass refreshData to all components that modify data */}
            {currentView === 'inventory' && <Inventory lang={lang} materials={materials} products={products} showNotification={showNotification} refreshData={fetchData} />}
            {currentView === 'orders' && <Orders lang={lang} customers={customers} orders={orders} products={products} showNotification={showNotification} refreshData={fetchData} />}
            {currentView === 'customers' && <Customers lang={lang} customers={customers} showNotification={showNotification} refreshData={fetchData} />}
            {currentView === 'staff' && <StaffView lang={lang} staff={staff} showNotification={showNotification} refreshData={fetchData} />}
            {currentView === 'production' && <Production lang={lang} products={products} materials={materials} showNotification={showNotification} refreshData={fetchData} />}
            {currentView === 'finance' && <Finance lang={lang} expenses={expenses} orders={orders} showNotification={showNotification} refreshData={fetchData} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
