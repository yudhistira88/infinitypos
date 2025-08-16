import React, { useState, useMemo, ReactNode } from 'react';
import { Order, Expense, Income } from '../types';

// --- HELPER FUNCTIONS ---
const formatRupiah = (price: number, showSymbol: boolean = true) => {
    const formatted = new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(price);
    return showSymbol ? formatted : formatted.replace('Rp', '').trim();
};

const isDateInPeriod = (dateStr: string, period: 'Hari Ini' | '7 Hari Terakhir' | 'Bulan Ini' | 'Semua Waktu'): boolean => {
    const [day, month, year] = dateStr.split(/[\/, ]/g).map(Number);
    // Handle potential time part like '14:30'
    const transactionDate = new Date(year, month - 1, day);
    if (isNaN(transactionDate.getTime())) return false; // Invalid date format

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (period) {
        case 'Hari Ini':
            return transactionDate.getTime() === today.getTime();
        case '7 Hari Terakhir':
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            return transactionDate >= sevenDaysAgo && transactionDate <= today;
        case 'Bulan Ini':
            return transactionDate.getMonth() === today.getMonth() && transactionDate.getFullYear() === today.getFullYear();
        case 'Semua Waktu':
            return true;
        default:
            return true;
    }
};

const parseDateForSort = (dateStr: string): number => {
    // Handles "DD/MM/YYYY" and "DD/MM/YYYY, HH:mm"
    const [datePart, timePart] = dateStr.split(', ');
    const [day, month, year] = datePart.split('/').map(Number);

    if (timePart && timePart.includes(':')) {
        const [hours, minutes] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes).getTime();
    }
    return new Date(year, month - 1, day).getTime();
};


// --- UI SUB-COMPONENTS ---
const StatCard: React.FC<{ title: string; value: string; change?: string; icon: ReactNode; color: string }> = ({ title, value, change, icon, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
            {change && <p className={`text-xs font-semibold mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{change}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            {icon}
        </div>
    </div>
);

const FinancialChart: React.FC<{ income: number; expense: number }> = ({ income, expense }) => {
    const max = Math.max(income, expense, 1);
    const incomeHeight = (income / max) * 100;
    const expenseHeight = (expense / max) * 100;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800">Perbandingan Pendapatan & Pengeluaran</h3>
            <p className="text-sm text-gray-500 mb-6">Visualisasi arus kas Anda untuk periode yang dipilih.</p>
            <div className="flex-grow flex items-end justify-around gap-8">
                <div className="flex flex-col items-center w-1/3">
                    <div className="w-full h-64 bg-slate-100 rounded-t-lg flex items-end">
                        <div className="bg-emerald-400 w-full rounded-t-lg transition-all duration-500" style={{ height: `${incomeHeight}%` }}></div>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-700">Pendapatan</p>
                    <p className="text-xs text-gray-500">{formatRupiah(income)}</p>
                </div>
                <div className="flex flex-col items-center w-1/3">
                    <div className="w-full h-64 bg-slate-100 rounded-t-lg flex items-end">
                        <div className="bg-rose-400 w-full rounded-t-lg transition-all duration-500" style={{ height: `${expenseHeight}%` }}></div>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-700">Pengeluaran</p>
                    <p className="text-xs text-gray-500">{formatRupiah(expense)}</p>
                </div>
            </div>
        </div>
    );
};

interface TransactionItem { id: number | string; description: string; date: string; amount: number; }
type TransactionType = 'income' | 'expense';

const TransactionTable: React.FC<{ title: string; items: TransactionItem[]; type: TransactionType }> = ({ title, items, type }) => (
    <div className="bg-white rounded-xl shadow-sm flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="flex-grow overflow-y-auto">
            {items.length > 0 ? (
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                        <tr>
                            <th className="py-2 px-4 text-left font-semibold text-slate-600">Deskripsi</th>
                            <th className="py-2 px-4 text-right font-semibold text-slate-600">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map(item => (
                            <tr key={`${type}-${item.id}`} className="hover:bg-slate-50">
                                <td className="py-2.5 px-4">
                                    <p className="font-medium text-gray-800 truncate">{item.description}</p>
                                    <p className="text-xs text-gray-500">{item.date.split(',')[0]}</p>
                                </td>
                                <td className={`py-2.5 px-4 text-right font-semibold ${type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {formatRupiah(item.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center py-12 text-gray-500 text-sm flex flex-col items-center justify-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="font-semibold text-gray-600">Tidak ada data</p>
                    <p>Transaksi akan muncul di sini.</p>
                </div>
            )}
        </div>
    </div>
);


// --- MAIN PAGE COMPONENT ---
interface LaporanKeuanganPageProps {
    orders: Order[];
    expenses: Expense[];
    incomes: Income[];
    setPage: (page: string) => void;
}

const LaporanKeuanganPage: React.FC<LaporanKeuanganPageProps> = ({ orders, expenses, incomes, setPage }) => {
    const [filter, setFilter] = useState<'Hari Ini' | '7 Hari Terakhir' | 'Bulan Ini' | 'Semua Waktu'>('Bulan Ini');
    
    const financialSummary = useMemo(() => {
        const filteredOrders = orders.filter(o => isDateInPeriod(o.date, filter));
        const filteredExpenses = expenses.filter(e => isDateInPeriod(e.date, filter));
        const filteredIncomes = incomes.filter(i => isDateInPeriod(i.date, filter));

        const totalPenjualan = filteredOrders.reduce((sum, order) => sum + order.grandTotal, 0);
        const totalPemasukanLain = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
        const totalPendapatan = totalPenjualan + totalPemasukanLain;
        const totalPengeluaran = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const labaBersih = totalPendapatan - totalPengeluaran;
        
        const allIncomes = [
            ...filteredOrders.map(o => ({id: o.id, description: `Penjualan #${o.bon}`, date: o.date, amount: o.grandTotal})),
            ...filteredIncomes
        ].sort((a,b) => parseDateForSort(b.date) - parseDateForSort(a.date));

        return { totalPendapatan, totalPengeluaran, labaBersih, allIncomes, filteredExpenses };
    }, [orders, expenses, incomes, filter]);

    const filterOptions: typeof filter[] = ['Hari Ini', '7 Hari Terakhir', 'Bulan Ini', 'Semua Waktu'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                     <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                        <h1 className="text-3xl font-bold text-gray-800">Dasbor Keuangan</h1>
                    </div>
                    <p className="text-gray-500 mt-1">Ringkasan pendapatan, pengeluaran, dan laba bersih usaha Anda.</p>
                </div>
                <div className="flex items-center gap-2">
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value as typeof filter)}
                        className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                    >
                        {filterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                     <button onClick={() => setPage('Keuangan')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Catat Transaksi Baru
                    </button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Pendapatan" 
                    value={formatRupiah(financialSummary.totalPendapatan, false)} 
                    change="+15.3%"
                    color="bg-emerald-100 text-emerald-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>}
                />
                 <StatCard 
                    title="Total Pengeluaran" 
                    value={formatRupiah(financialSummary.totalPengeluaran, false)} 
                    change="-5.1%"
                    color="bg-rose-100 text-rose-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>}
                />
                 <StatCard 
                    title="Laba Bersih" 
                    value={formatRupiah(financialSummary.labaBersih, false)} 
                    change="+10.2%"
                    color="bg-sky-100 text-sky-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
                />
            </div>

            {/* Main Content Grid (Chart + Transaction Lists) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                <FinancialChart income={financialSummary.totalPendapatan} expense={financialSummary.totalPengeluaran} />
                 <div className="grid grid-rows-2 gap-6 h-full">
                    <TransactionTable title="Pemasukan" items={financialSummary.allIncomes} type="income" />
                    <TransactionTable title="Pengeluaran" items={financialSummary.filteredExpenses} type="expense" />
                </div>
            </div>
        </div>
    );
};

export default LaporanKeuanganPage;
