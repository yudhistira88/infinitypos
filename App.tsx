import React, { useState } from 'react';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_EMPLOYEES, MOCK_EXPENSES, MOCK_INCOMES, MOCK_NOTIFICATIONS, MOCK_VOUCHERS, MOCK_BUNDLES, MOCK_PAYMENT_SETTINGS } from './constants';
import { Product, StoreSettings, Order, ReceiptData, Customer, Employee, Expense, Income, Notification, User, Voucher, Bundle, PaymentSettings } from './types';

import Header from './components/Header';
import Kasir from './components/Kasir';
import Dashboard from './components/Dashboard';
import ProductPage from './components/MasterData';
import PlaceholderPage from './components/PlaceholderPage';
import SettingsPage from './components/SettingsPage';
import LaporanPenjualanPage from './components/LaporanPenjualanPage';
import LaporanKeuanganPage from './components/LaporanKeuanganPage';
import InputKeuanganPage from './components/InputKeuanganPage';
import PelangganPage from './components/PelangganPage';
import KaryawanPage from './components/KaryawanPage';
import BantuanPage from './components/BantuanPage';
import { PrinterProvider } from './contexts/PrinterContext';
import TentangAplikasiPage from './components/TentangAplikasiPage';
import PaketLanggananPage from './components/PaketLanggananPage';
import VoucherPage from './components/VoucherPage';
import PaymentPage from './components/PaymentPage';
import LoginPage from './components/LoginPage';


const App: React.FC = () => {
    const [page, setPage] = useState('Beranda');
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
    const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
    const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
    const [incomes, setIncomes] = useState<Income[]>(MOCK_INCOMES);
    const [orders, setOrders] = useState<Order[]>([]);
    const [vouchers, setVouchers] = useState<Voucher[]>(MOCK_VOUCHERS);
    const [bundles, setBundles] = useState<Bundle[]>(MOCK_BUNDLES);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(MOCK_PAYMENT_SETTINGS);
    const [storeSettings, setStoreSettings] = useState<StoreSettings>({
        name: 'Toko Anda',
        address: 'Jl. Alamat Toko No. 1',
        phone: '08123456789',
        bonPrefix: 'BON/',
        defaultTaxPercent: 0,
        receiptFooter: 'Terima kasih telah berbelanja!',
        logoUrl: '',
        receiptTemplate: 'modern',
    });
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const handleLogin = () => {
        const defaultUser: User = {
            name: 'Admin',
            email: 'admin@toko.com',
            phone: '',
            role: 'Admin',
            avatarUrl: null,
        };
        setCurrentUser(defaultUser);
        setPage('Beranda');
    };
    
    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            setCurrentUser(null);
        }
    };


    const addOrder = (receiptData: ReceiptData) => {
        const newOrder: Order = {
            ...receiptData,
            id: receiptData.bon,
            status: 'Lunas', // Default status for now
        };
        setOrders(prevOrders => [newOrder, ...prevOrders]); // Add to the top of the list
    };
    
    const addCustomer = (customerData: Omit<Customer, 'id'>) => {
        const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
        const newCustomer: Customer = { id: newId, ...customerData };
        setCustomers(prev => [newCustomer, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const updateCustomer = (updatedCustomer: Customer) => {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    };

    const deleteCustomer = (customerId: number) => {
         if (window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini? Riwayat transaksi tidak akan terhapus.')) {
            setCustomers(prev => prev.filter(c => c.id !== customerId));
        }
    };

    const handleCustomerTransaction = (customerName: string, spend: number) => {
        setCustomers(prevCustomers =>
            prevCustomers.map(customer =>
                customer.name.toLowerCase() === customerName.toLowerCase()
                    ? {
                        ...customer,
                        transactionCount: customer.transactionCount + 1,
                        totalSpend: (customer.totalSpend || 0) + spend,
                      }
                    : customer
            )
        );
    };

    // --- Income/Expense CRUD ---
    const addIncome = (incomeToAdd: Omit<Income, 'id'>) => {
        const newId = incomes.length > 0 ? Math.max(...incomes.map(i => i.id)) + 1 : 1;
        const newIncome: Income = { ...incomeToAdd, id: newId };
        setIncomes(prev => [newIncome, ...prev]);
    };

    const addExpense = (expenseToAdd: Omit<Expense, 'id'>) => {
        const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
        const newExpense: Expense = { ...expenseToAdd, id: newId };
        setExpenses(prev => [newExpense, ...prev]);
    };
    
    const updateIncome = (updatedIncome: Income) => {
        setIncomes(prev => prev.map(i => i.id === updatedIncome.id ? updatedIncome : i));
    };

    const updateExpense = (updatedExpense: Expense) => {
        setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    };
    
    const deleteIncome = (id: number) => {
        if (window.confirm('Yakin ingin menghapus pemasukan ini?')) {
            setIncomes(prev => prev.filter(i => i.id !== id));
        }
    };

    const deleteExpense = (id: number) => {
        if (window.confirm('Yakin ingin menghapus pengeluaran ini?')) {
            setExpenses(prev => prev.filter(e => e.id !== id));
        }
    };
    
    // --- Employee CRUD ---
     const addEmployee = (employeeData: Omit<Employee, 'id'>) => {
        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        const newEmployee: Employee = { id: newId, ...employeeData };
        setEmployees(prev => [newEmployee, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const updateEmployee = (updatedEmployee: Employee) => {
        setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    };

    const deleteEmployee = (employeeId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
            setEmployees(prev => prev.filter(e => e.id !== employeeId));
        }
    };


    const handleMarkNotificationAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const addBundle = (bundle: Omit<Bundle, 'id'>) => {
        const newId = bundles.length > 0 ? Math.max(...bundles.map(b => b.id)) + 1 : 1;
        setBundles(prev => [{...bundle, id: newId }, ...prev]);
    };

    const updateBundle = (updatedBundle: Bundle) => {
        setBundles(prev => prev.map(b => b.id === updatedBundle.id ? updatedBundle : b));
    };
    
    const deleteBundle = (bundleId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus paket bundling ini?')) {
            setBundles(prev => prev.filter(b => b.id !== bundleId));
        }
    };


    const renderPage = () => {
        switch (page) {
            case 'Beranda':
                return <Dashboard products={products} setPage={setPage} orders={orders} expenses={expenses} incomes={incomes} customers={customers} />;
            case 'Kasir':
                return <Kasir 
                    products={products} 
                    storeSettings={storeSettings} 
                    addOrder={addOrder} 
                    orders={orders} 
                    vouchers={vouchers} 
                    bundles={bundles}
                    customers={customers} 
                    addCustomer={addCustomer}
                    handleCustomerTransaction={handleCustomerTransaction}
                />;
            case 'Produk':
                return <ProductPage 
                    products={products} 
                    setProducts={setProducts} 
                    bundles={bundles}
                    addBundle={addBundle}
                    updateBundle={updateBundle}
                    deleteBundle={deleteBundle}
                />;
            case 'Keuangan':
                return <InputKeuanganPage 
                    incomes={incomes} 
                    expenses={expenses} 
                    addIncome={addIncome} 
                    addExpense={addExpense}
                    updateIncome={updateIncome}
                    updateExpense={updateExpense}
                    deleteIncome={deleteIncome}
                    deleteExpense={deleteExpense}
                 />;
            case 'Settings':
                return <SettingsPage settings={storeSettings} setSettings={setStoreSettings} user={currentUser!} setUser={setCurrentUser} />;
            // Admin Pages from Dropdown
            case 'Laporan Penjualan':
                 return <LaporanPenjualanPage orders={orders} />;
            case 'Laporan Keuangan':
                 return <LaporanKeuanganPage orders={orders} expenses={expenses} incomes={incomes} setPage={setPage} />;
            case 'Pelanggan':
                 return <PelangganPage 
                    customers={customers} 
                    addCustomer={addCustomer}
                    updateCustomer={updateCustomer}
                    deleteCustomer={deleteCustomer}
                 />;
            case 'Karyawan':
                 return <KaryawanPage 
                    employees={employees} 
                    addEmployee={addEmployee}
                    updateEmployee={updateEmployee}
                    deleteEmployee={deleteEmployee}
                 />;
            case 'Voucher':
                 return <VoucherPage vouchers={vouchers} setVouchers={setVouchers} products={products} />;
            case 'Pembayaran':
                return <PaymentPage settings={paymentSettings} setSettings={setPaymentSettings} orders={orders}/>;
            case 'Profil':
            case 'Perangkat':
            case 'Struk':
            case 'Pajak & Service Charge':
            case 'QRIS & Rekening Bank':
            case 'Custom Amount':
            case 'Jenis Order':
                 return <PlaceholderPage title={page} />;
            case 'Bantuan':
                 return <BantuanPage />;
            case 'Panduan Pengguna':
                 return <PlaceholderPage title={page} />;
             case 'Paket Langganan':
                return <PaketLanggananPage />;
            case 'Tentang Aplikasi':
                return <TentangAplikasiPage />;
            default:
                return <Dashboard products={products} setPage={setPage} orders={orders} expenses={expenses} incomes={incomes} customers={customers} />;
        }
    };

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <PrinterProvider>
            <div className="min-h-screen bg-slate-50 font-sans">
                <Header 
                    activePage={page} 
                    onNavigate={setPage} 
                    storeName={storeSettings.name}
                    user={currentUser}
                    notifications={notifications}
                    onMarkAsRead={handleMarkNotificationAsRead}
                    onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                    onLogout={handleLogout}
                />
                <main className="mx-auto p-4 sm:p-6 lg:p-8">
                    {renderPage()}
                </main>
            </div>
        </PrinterProvider>
    );
};

export default App;