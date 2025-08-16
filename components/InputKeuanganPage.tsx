import React, { useState, useMemo, ReactNode } from 'react';
import { Income, Expense } from '../types';
import TransactionModal from './TransactionModal';

// Helper Functions
const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

const parseDateForSort = (dateStr: string): number => {
    // Handles "DD/MM/YYYY"
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
};


// UI Components
const StatCard: React.FC<{ title: string; value: string; icon: ReactNode; color: string }> = ({ title, value, icon, color }) => (
     <div className="bg-white p-5 rounded-xl shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            {icon}
        </div>
    </div>
);

// Main Page Component
interface InputKeuanganPageProps {
    incomes: Income[];
    expenses: Expense[];
    addIncome: (income: Omit<Income, 'id'>) => void;
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    updateIncome: (income: Income) => void;
    updateExpense: (expense: Expense) => void;
    deleteIncome: (id: number) => void;
    deleteExpense: (id: number) => void;
}

type CombinedTransaction = (Income | Expense) & { type: 'income' | 'expense' };

const InputKeuanganPage: React.FC<InputKeuanganPageProps> = ({ incomes, expenses, addIncome, addExpense, updateIncome, updateExpense, deleteIncome, deleteExpense }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense'>('income');
    const [editingTransaction, setEditingTransaction] = useState<CombinedTransaction | null>(null);

    const dailyStats = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const todaysIncomes = incomes.filter(i => i.date === todayStr).reduce((sum, i) => sum + i.amount, 0);
        const todaysExpenses = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
        const netFlow = todaysIncomes - todaysExpenses;
        return { todaysIncomes, todaysExpenses, netFlow };
    }, [incomes, expenses]);

    const combinedTransactions = useMemo(() => {
        const all: CombinedTransaction[] = [
            ...incomes.map(i => ({ ...i, type: 'income' as const })),
            ...expenses.map(e => ({ ...e, type: 'expense' as const }))
        ];
        // Sort by date descending, then by ID descending to show newest first
        return all.sort((a, b) => {
            const dateComparison = parseDateForSort(b.date) - parseDateForSort(a.date);
            if (dateComparison !== 0) return dateComparison;
            return b.id - a.id;
        });
    }, [incomes, expenses]);

    const handleOpenModal = (type: 'income' | 'expense', transaction: CombinedTransaction | null = null) => {
        setModalType(type);
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSaveTransaction = (data: { description: string, amount: number, category: string }, type: 'income' | 'expense') => {
        const date = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        if (editingTransaction) { // Update logic
             if (type === 'income') {
                updateIncome({ ...editingTransaction, ...data } as Income);
            } else {
                updateExpense({ ...editingTransaction, ...data } as Expense);
            }
        } else { // Add logic
            if (type === 'income') {
                addIncome({ ...data, category: data.category as 'Modal Awal' | 'Lain-lain', date });
            } else {
                addExpense({ ...data, category: data.category as 'Operasional' | 'Bahan Baku' | 'Gaji', date });
            }
        }

        handleCloseModal();
    };

    return (
        <>
            <div className="space-y-6">
                <div>
                     <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        <h1 className="text-3xl font-bold text-gray-800">Buku Kas</h1>
                    </div>
                    <p className="text-gray-500 mt-1">Catat dan lihat semua arus kas masuk dan keluar dari usaha Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard 
                        title="Pemasukan Hari Ini"
                        value={formatRupiah(dailyStats.todaysIncomes)}
                        color="bg-emerald-100 text-emerald-600"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>}
                    />
                    <StatCard 
                        title="Pengeluaran Hari Ini"
                        value={formatRupiah(dailyStats.todaysExpenses)}
                        color="bg-rose-100 text-rose-600"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>}
                    />
                    <StatCard 
                        title="Arus Kas Bersih (Hari Ini)"
                        value={formatRupiah(dailyStats.netFlow)}
                        color="bg-sky-100 text-sky-600"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
                    />
                </div>
                
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h3 className="text-lg font-semibold text-gray-800">Riwayat Transaksi</h3>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleOpenModal('expense')} className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold py-2 px-4 rounded-lg text-sm flex items-center shrink-0">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                                    Tambah Pengeluaran
                                </button>
                                <button onClick={() => handleOpenModal('income')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center shrink-0">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    Tambah Pemasukan
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-600">Tanggal</th>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-600">Deskripsi</th>
                                    <th className="py-3 px-6 text-right font-semibold text-gray-600">Jumlah</th>
                                    <th className="py-3 px-6 text-center font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {combinedTransactions.map((tx) => (
                                    <tr key={`${tx.type}-${tx.id}`} className="hover:bg-gray-50">
                                        <td className="py-4 px-6 whitespace-nowrap text-gray-500">{tx.date}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="font-medium text-gray-800">{tx.description}</div>
                                            <div className="text-gray-500 text-xs">{tx.category}</div>
                                        </td>
                                        <td className={`py-4 px-6 whitespace-nowrap text-right font-semibold`}>
                                            <span className={`flex items-center justify-end gap-1 ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {tx.type === 'income' 
                                                    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                    : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                                                }
                                                {formatRupiah(tx.amount)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={() => handleOpenModal(tx.type, tx)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Edit ${tx.description}`}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                                </button>
                                                <button onClick={() => tx.type === 'income' ? deleteIncome(tx.id) : deleteExpense(tx.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Delete ${tx.description}`}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {combinedTransactions.length === 0 && (
                             <div className="text-center py-16 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-800">Belum Ada Transaksi</h3>
                                <p className="mt-1">Mulai catat pemasukan dan pengeluaran Anda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <TransactionModal
                    type={modalType}
                    transaction={editingTransaction}
                    onClose={handleCloseModal}
                    onSave={handleSaveTransaction}
                />
            )}
        </>
    );
};

export default InputKeuanganPage;