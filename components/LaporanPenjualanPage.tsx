import React, { useState, useMemo, ReactNode } from 'react';
import { Order, CartItem, Product } from '../types';

// --- HELPER FUNCTIONS ---
const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

const parseDate = (dateStr: string): Date | null => {
    const parts = dateStr.split(/[\/, :]/);
    if (parts.length >= 3) {
        // Assuming format DD/MM/YYYY, optional HH:MM
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    return null;
};


const isDateInPeriod = (dateStr: string, period: 'Hari Ini' | '7 Hari Terakhir' | 'Bulan Ini' | 'Semua Waktu'): boolean => {
    const transactionDate = parseDate(dateStr);
    if (!transactionDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (period) {
        case 'Hari Ini':
            return transactionDate.getTime() === today.getTime();
        case '7 Hari Terakhir':
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6); // Include today
            return transactionDate >= sevenDaysAgo && transactionDate <= today;
        case 'Bulan Ini':
            return transactionDate.getMonth() === today.getMonth() && transactionDate.getFullYear() === today.getFullYear();
        case 'Semua Waktu':
            return true;
        default:
            return true;
    }
};


// --- UI SUB-COMPONENTS ---
const StatCard: React.FC<{ title: string; value: string | number; icon: ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            {icon}
        </div>
    </div>
);

const SalesChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800">Tren Penjualan</h3>
             <p className="text-sm text-gray-500 mb-6">Pendapatan kotor selama periode terpilih.</p>
            <div className="flex-grow flex items-end justify-around gap-2 text-center">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="relative w-full h-full flex items-end">
                            <div 
                                className="bg-blue-400 w-full rounded-t-md group-hover:bg-blue-600 transition-colors"
                                style={{ height: `${(item.value / maxValue) * 100}%` }}
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-gray-800 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {formatRupiah(item.value)}
                                </div>
                            </div>
                        </div>
                        <p className="mt-2 text-xs font-medium text-gray-500">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
interface LaporanPenjualanPageProps {
    orders: Order[];
}

const LaporanPenjualanPage: React.FC<LaporanPenjualanPageProps> = ({ orders }) => {
    const [filter, setFilter] = useState<'Hari Ini' | '7 Hari Terakhir' | 'Bulan Ini' | 'Semua Waktu'>('Bulan Ini');
    
    const reportData = useMemo(() => {
        const filteredOrders = orders.filter(o => isDateInPeriod(o.date, filter));

        const totalSales = filteredOrders.reduce((sum, order) => sum + order.grandTotal, 0);
        const totalTransactions = filteredOrders.length;
        const itemsSold = filteredOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
        
        const itemSales = new Map<string, { name: string, quantity: number; revenue: number; item: CartItem | Product }>();

        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const key = item.isBundle ? `bundle-${item.bundleId}` : `product-${item.id}`;
                const existing = itemSales.get(key);
                const itemRevenue = item.isBundle ? item.price * item.quantity : (item.price - (item.cartItemDiscount.type === 'fixed' ? item.cartItemDiscount.value : item.price * (item.cartItemDiscount.value/100))) * item.quantity;

                if(existing) {
                    existing.quantity += item.quantity;
                    existing.revenue += itemRevenue;
                } else {
                    itemSales.set(key, {
                        name: item.name,
                        quantity: item.quantity,
                        revenue: itemRevenue,
                        item: item
                    });
                }
            });
        });

        const bestsellingItems = Array.from(itemSales.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        
        // Chart Data Generation
        let chartData: { label: string; value: number }[] = [];
        if (filter === '7 Hari Terakhir') {
            const days = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return { label: d.toLocaleDateString('id-ID', { weekday: 'short' }), date: d.toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'}), value: 0 };
            }).reverse();

            filteredOrders.forEach(order => {
                const orderDateStr = parseDate(order.date)?.toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'});
                const day = days.find(d => d.date === orderDateStr);
                if (day) day.value += order.grandTotal;
            });
            chartData = days.map(({label, value}) => ({label, value}));
        } else { // Default chart view for other filters (simplified)
            chartData = filteredOrders.slice(-7).map(o => ({label: o.bon.slice(-4), value: o.grandTotal}));
             if (chartData.length === 0) {
                chartData = [{label: 'Data', value: 0}];
            }
        }
        
        return { totalSales, totalTransactions, itemsSold, averageTransaction, bestsellingItems, chartData, filteredOrders };

    }, [orders, filter]);

    const filterOptions: typeof filter[] = ['Hari Ini', '7 Hari Terakhir', 'Bulan Ini', 'Semua Waktu'];

    return (
        <div className="space-y-6 bg-gray-50/50 p-1 -m-4">
             {/* Header with Title and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <h1 className="text-3xl font-bold text-gray-800">Laporan Penjualan</h1>
                    </div>
                    <p className="text-gray-500 mt-1">Analisis performa penjualan Anda berdasarkan periode waktu.</p>
                </div>
                <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    {filterOptions.map(opt => (
                        <button 
                            key={opt}
                            onClick={() => setFilter(opt)}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${filter === opt ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard 
                    title="Total Penjualan" 
                    value={formatRupiah(reportData.totalSales)} 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>}
                />
                <StatCard 
                    title="Total Transaksi" 
                    value={reportData.totalTransactions} 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}
                />
                <StatCard 
                    title="Item Terjual" 
                    value={reportData.itemsSold} 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>}
                />
                 <StatCard 
                    title="Rata-rata Transaksi" 
                    value={formatRupiah(reportData.averageTransaction)} 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
                />
            </div>
            
             {/* Main Content Grid (Chart + Bestsellers) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SalesChart data={reportData.chartData} />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800">Item Terlaris</h3>
                     <p className="text-sm text-gray-500 mb-4">Top 5 produk & bundling berdasarkan kuantitas.</p>
                     {reportData.bestsellingItems.length > 0 ? (
                        <ul className="space-y-4">
                            {reportData.bestsellingItems.map(({item, name, quantity, revenue}) => (
                                <li key={name} className="flex items-center gap-4">
                                    <img src={item.imageUrl} alt={name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm text-gray-800">{name} {(item as CartItem).isBundle && <span className="text-xs text-blue-600">[B]</span>}</p>
                                        <p className="text-xs text-gray-500">{formatRupiah(revenue)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-blue-600">{quantity}</p>
                                        <p className="text-xs text-gray-500">terjual</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                     ) : (
                         <div className="text-center py-10 text-gray-500 text-sm">
                            <p>Belum ada item terjual.</p>
                        </div>
                     )}
                </div>
            </div>

            {/* Transaction Details Table */}
             <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800">Detail Transaksi</h3>
                    <p className="text-sm text-gray-500">Daftar semua transaksi pada periode terpilih.</p>
                </div>
                 <div className="overflow-x-auto">
                    {reportData.filteredOrders.length > 0 ? (
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-600">No. Bon</th>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-600">Customer</th>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-600">Tanggal</th>
                                    <th className="py-3 px-6 text-right font-semibold text-gray-600">Total</th>
                                    <th className="py-3 px-6 text-center font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportData.filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6 whitespace-nowrap text-gray-700 font-medium">{order.bon}</td>
                                        <td className="py-4 px-6 whitespace-nowrap text-gray-700">{order.customer}</td>
                                        <td className="py-4 px-6 whitespace-nowrap text-gray-500">{order.date}</td>
                                        <td className="py-4 px-6 whitespace-nowrap text-gray-800 text-right font-medium">{formatRupiah(order.grandTotal)}</td>
                                        <td className="py-4 px-6 whitespace-nowrap text-center">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Lunas' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-16">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                            <h3 className="mt-2 text-lg font-semibold text-gray-700">Tidak Ada Data Transaksi</h3>
                            <p className="text-gray-500 mt-1">Belum ada transaksi yang tercatat pada periode ini.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default LaporanPenjualanPage;