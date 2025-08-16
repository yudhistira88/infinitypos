import React, { useState, useEffect } from 'react';
import { Income, Expense } from '../types';

type TransactionType = 'income' | 'expense';
type FormData = {
    description: string;
    amount: number | '';
    category: string;
};

interface TransactionModalProps {
    type: TransactionType;
    transaction?: (Income | Expense) & { type: TransactionType } | null;
    onClose: () => void;
    onSave: (data: { description: string, amount: number, category: string }, type: TransactionType) => void;
}

const emptyFormData: FormData = {
    description: '',
    amount: '',
    category: '',
};

const TransactionModal: React.FC<TransactionModalProps> = ({ type, transaction, onClose, onSave }) => {
    const isEditMode = !!transaction;
    const incomeCategories = ['Modal Awal', 'Lain-lain'];
    const expenseCategories = ['Operasional', 'Bahan Baku', 'Gaji'];
    
    const [formData, setFormData] = useState<FormData>(emptyFormData);

    useEffect(() => {
        if (transaction) {
            setFormData({
                description: transaction.description,
                amount: transaction.amount,
                category: transaction.category,
            });
        } else {
            setFormData({
                ...emptyFormData,
                category: type === 'income' ? incomeCategories[0] : expenseCategories[0],
            });
        }
    }, [transaction, type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? (value === '' ? '' : Number(value)) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.amount || Number(formData.amount) <= 0) {
            alert('Deskripsi dan jumlah harus diisi dengan benar.');
            return;
        }
        onSave({ ...formData, amount: Number(formData.amount) }, type);
    };

    const title = isEditMode
        ? `Edit ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`
        : `Tambah ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'} Baru`;
    
    const buttonColor = type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500';

    const inputClass = "block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100" aria-label="Close modal">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi <span className="text-red-500">*</span></label>
                            <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className={inputClass} placeholder={type === 'income' ? 'cth: Modal Awal Usaha' : 'cth: Pembelian Stok Ayam'} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Jumlah <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">Rp</span>
                                    </div>
                                    <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required className={`${inputClass} pl-9`} placeholder="500000" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                                <select name="category" id="category" value={formData.category} onChange={handleChange} className={inputClass}>
                                    {(type === 'income' ? incomeCategories : expenseCategories).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse rounded-b-xl">
                        <button
                            type="submit"
                            className={`inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 w-auto sm:text-sm ${buttonColor}`}
                        >
                            Simpan
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-auto sm:text-sm"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;