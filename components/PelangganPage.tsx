import React, { useState, useMemo, ReactNode } from 'react';
import { Customer } from '../types';
import CustomerModal from './CustomerModal';

// --- HELPER FUNCTIONS ---
const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

const parseJoinDate = (dateStr: string): Date | null => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    return null;
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


const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center space-x-1 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border rounded-md bg-white text-sm font-medium text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
                &laquo;
            </button>
            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`px-3 py-1.5 border rounded-md text-sm font-medium ${currentPage === number ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                    {number}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border rounded-md bg-white text-sm font-medium text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
                &raquo;
            </button>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
interface PelangganPageProps {
    customers: Customer[];
    addCustomer: (customer: Omit<Customer, 'id'>) => void;
    updateCustomer: (customer: Customer) => void;
    deleteCustomer: (customerId: number) => void;
}

const ITEMS_PER_PAGE = 8;

const PelangganPage: React.FC<PelangganPageProps> = ({ customers, addCustomer, updateCustomer, deleteCustomer }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    
    const customerStats = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const newThisMonth = customers.filter(c => {
            const joinDate = parseJoinDate(c.joinDate);
            return joinDate && joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
        }).length;

        const totalTransactions = customers.reduce((sum, c) => sum + c.transactionCount, 0);
        
        return {
            total: customers.length,
            newThisMonth,
            totalTransactions, 
        };
    }, [customers]);
    
    const filteredCustomers = useMemo(() => {
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredCustomers, currentPage]);

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

    const handleOpenModal = (customer: Customer | null = null) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleSaveCustomer = (customer: Omit<Customer, 'id'> | Customer) => {
        if ('id' in customer) {
            updateCustomer(customer);
        } else {
            addCustomer(customer);
        }
        handleCloseModal();
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <h1 className="text-3xl font-bold text-gray-800">Manajemen Pelanggan</h1>
                    </div>
                    <p className="text-gray-500 mt-1">Lihat, cari, dan kelola semua data pelanggan Anda.</p>
                </div>
                
                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard 
                        title="Total Pelanggan" 
                        value={customerStats.total}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
                    />
                    <StatCard 
                        title="Pelanggan Baru (Bulan Ini)" 
                        value={customerStats.newThisMonth}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>}
                    />
                    <StatCard 
                        title="Total Transaksi Pelanggan" 
                        value={customerStats.totalTransactions}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}
                    />
                </div>
                
                {/* Main Table Content */}
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="relative flex-grow sm:max-w-xs">
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                <input
                                    type="text"
                                    placeholder="Cari pelanggan..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button onClick={() => handleOpenModal(null)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center sm:w-auto shrink-0">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Tambah Pelanggan
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-600">Pelanggan</th>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-600">Bergabung</th>
                                    <th className="py-3 px-6 text-center font-semibold text-gray-600">Total Transaksi</th>
                                    <th className="py-3 px-6 text-right font-semibold text-gray-600">Total Belanja</th>
                                    <th className="py-3 px-6 text-center font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-6 whitespace-nowrap">
                                            <div className="font-medium text-gray-800">{customer.name}</div>
                                            <div className="text-gray-500 text-xs">{customer.phone}</div>
                                        </td>
                                        <td className="py-3 px-6 whitespace-nowrap text-gray-600">{customer.joinDate}</td>
                                        <td className="py-3 px-6 whitespace-nowrap text-center text-gray-800 font-medium">{customer.transactionCount}x</td>
                                        <td className="py-3 px-6 whitespace-nowrap text-right text-gray-800 font-semibold">{formatRupiah(customer.totalSpend)}</td>
                                        <td className="py-3 px-6 whitespace-nowrap text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={() => handleOpenModal(customer)} className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Edit ${customer.name}`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                                </button>
                                                <button onClick={() => deleteCustomer(customer.id)} className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Delete ${customer.name}`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCustomers.length === 0 && (
                        <div className="text-center py-16 text-gray-500">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <h3 className="text-lg font-semibold text-gray-700">Pelanggan Tidak Ditemukan</h3>
                            <p className="mt-1">Coba kata kunci yang lain.</p>
                        </div>
                    )}
                    
                    <div className="p-4 border-t border-gray-200">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <CustomerModal
                    customer={selectedCustomer}
                    onClose={handleCloseModal}
                    onSave={handleSaveCustomer}
                />
            )}
        </>
    );
};

export default PelangganPage;