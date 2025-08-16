import React, { useMemo, ReactNode } from 'react';
import { Product, Order, Expense, Income, Customer } from '../types';

// Helper to format currency
const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

// Stat Card component
interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subValue?: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subValue, color }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-5 border border-slate-200/80">
        <div className={`p-4 rounded-lg ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
            {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
        </div>
    </div>
);


// QuickLink component
interface QuickLinkProps {
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
}

const QuickLink: React.FC<QuickLinkProps> = ({ icon, title, onClick }) => (
    <button onClick={onClick} className="flex items-center p-4 -m-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 w-full text-left">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            {icon}
        </div>
        <div className="ml-4">
            <h3 className="text-md font-semibold text-slate-800">{title}</h3>
        </div>
        <svg className="w-5 h-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
    </button>
);

// Dashboard component
interface DashboardProps {
    products: Product[];
    orders: Order[];
    expenses: Expense[];
    incomes: Income[];
    customers: Customer[];
    setPage: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, orders, expenses, incomes, customers, setPage }) => {
    
    const todayStats = useMemo(() => {
        const today = new Date();
        const todayDateString = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Format: DD/MM/YYYY

        const todaysOrders = orders.filter(order => order.date.startsWith(todayDateString));
        const todaysSales = todaysOrders.reduce((sum, order) => sum + order.grandTotal, 0);

        const todaysExpenses = expenses.filter(expense => expense.date === todayDateString);
        const todaysExpensesTotal = todaysExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        const todaysIncomes = incomes.filter(income => income.date === todayDateString);
        const todaysIncomesTotal = todaysIncomes.reduce((sum, income) => sum + income.amount, 0);

        const todaysTransactionsCount = todaysOrders.length;
        
        const todaysProfit = todaysSales + todaysIncomesTotal - todaysExpensesTotal;

        const todaysProductsSoldCount = todaysOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        
        const recentTransactions = [...todaysOrders].reverse().slice(0, 5);

        // Integrated Stats
        const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
        const newCustomersToday = customers.filter(c => c.joinDate === todayDateString).length;

        return {
            todaysSales,
            todaysExpensesTotal,
            todaysProfit,
            todaysTransactionsCount,
            todaysProductsSoldCount,
            recentTransactions,
            lowStockProducts,
            newCustomersToday,
            totalProducts: products.length,
        };

    }, [orders, expenses, incomes, products, customers]);
    
    const today = new Date();
    const dateString = today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">Selamat Datang, Owner! <span className="text-3xl ml-2">👋</span></h1>
                <p className="text-slate-500">{dateString}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Penjualan Hari Ini" 
                    value={formatRupiah(todayStats.todaysSales)}
                    color="bg-green-100 text-green-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>}
                />
                <StatCard 
                    title="Perkiraan Laba" 
                    value={formatRupiah(todayStats.todaysProfit)}
                    color="bg-blue-100 text-blue-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
                />
                <StatCard 
                    title="Pengeluaran" 
                    value={formatRupiah(todayStats.todaysExpensesTotal)}
                    color="bg-red-100 text-red-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>}
                />
                <StatCard 
                    title="Transaksi" 
                    value={todayStats.todaysTransactionsCount}
                    subValue="Transaksi hari ini"
                    color="bg-indigo-100 text-indigo-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}
                />
                <StatCard 
                    title="Stok Rendah" 
                    value={todayStats.lowStockProducts.length}
                    subValue="Produk butuh restock"
                    color="bg-yellow-100 text-yellow-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
                />
                 <StatCard 
                    title="Total Produk" 
                    value={todayStats.totalProducts}
                    subValue="Jumlah item aktif"
                    color="bg-purple-100 text-purple-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>}
                />
                <StatCard 
                    title="Pelanggan Baru" 
                    value={todayStats.newCustomersToday}
                    subValue="Pelanggan baru hari ini"
                    color="bg-pink-100 text-pink-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>}
                />
                 <StatCard 
                    title="Produk Terjual" 
                    value={todayStats.todaysProductsSoldCount}
                    subValue="Item terjual hari ini"
                    color="bg-cyan-100 text-cyan-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200/80">
                    <div className="p-6 flex justify-between items-center border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800">Transaksi Terakhir Hari Ini</h3>
                        <button onClick={() => setPage('Laporan Penjualan')} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Lihat Semua</button>
                    </div>
                    <div className="overflow-x-auto">
                        {todayStats.recentTransactions.length > 0 ? (
                            <table className="min-w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500">No. Bon</th>
                                        <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500">Waktu</th>
                                        <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500">Customer</th>
                                        <th className="py-3 px-6 text-right text-xs font-semibold text-slate-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {todayStats.recentTransactions.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/70">
                                            <td className="py-4 px-6 text-sm text-slate-700 font-medium whitespace-nowrap">{order.bon}</td>
                                            <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">{order.date.split(', ')[1]}</td>
                                            <td className="py-4 px-6 text-sm text-slate-900 whitespace-nowrap">{order.customer}</td>
                                            <td className="py-4 px-6 text-sm text-slate-800 text-right font-semibold whitespace-nowrap">{formatRupiah(order.grandTotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-16">
                                <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                <h3 className="text-lg font-semibold text-slate-700">Belum Ada Transaksi Hari Ini</h3>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                     <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200/80">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Akses Cepat</h3>
                        <div className="space-y-2">
                            <QuickLink title="Buka Kasir" onClick={() => setPage('Kasir')} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>} />
                            <QuickLink title="Kelola Produk" onClick={() => setPage('Produk')} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>} />
                            <QuickLink title="Lihat Laporan" onClick={() => setPage('Laporan Keuangan')} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>} />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
                        <div className="p-6 border-b border-slate-200">
                             <h3 className="text-lg font-semibold text-slate-800">Stok Hampir Habis</h3>
                        </div>
                        {todayStats.lowStockProducts.length > 0 ? (
                             <ul className="divide-y divide-slate-200 p-6 max-h-60 overflow-y-auto">
                                {todayStats.lowStockProducts.map(product => (
                                    <li key={product.id} className="py-3 flex justify-between items-center">
                                        <p className="text-sm font-medium text-slate-800">{product.name}</p>
                                        <p className="text-sm font-bold text-red-500">{product.stock} tersisa</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-10 px-6">Semua stok aman!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;