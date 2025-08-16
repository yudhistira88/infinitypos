import React, { useState, useMemo, ReactNode } from 'react';
import { Voucher, Product } from '../types';
import VoucherModal from './VoucherModal';

// --- HELPER FUNCTIONS ---
const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
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


// --- MAIN PAGE COMPONENT ---
interface VoucherPageProps {
    vouchers: Voucher[];
    setVouchers: (vouchers: Voucher[]) => void;
    products: Product[];
}

const VoucherPage: React.FC<VoucherPageProps> = ({ vouchers, setVouchers, products }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    
    const stats = useMemo(() => {
        const total = vouchers.length;
        const active = vouchers.filter(v => v.status === 'Aktif').length;
        // Placeholder, in a real app this would come from order data
        const used = 3; 
        return { total, active, used };
    }, [vouchers]);
    
    const filteredVouchers = useMemo(() => {
        return vouchers.filter(voucher =>
            voucher.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vouchers, searchTerm]);

    const handleAddClick = () => {
        setSelectedVoucher(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (voucher: Voucher) => {
        setSelectedVoucher(voucher);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVoucher(null);
    };

    const handleSaveVoucher = (voucherToSave: Omit<Voucher, 'id'> & { id?: number }) => {
        if (voucherToSave.id) { // Editing
            setVouchers(vouchers.map(v => v.id === voucherToSave.id ? { ...v, ...voucherToSave } as Voucher : v));
        } else { // Adding
            const newId = vouchers.length > 0 ? Math.max(...vouchers.map(v => v.id)) + 1 : 1;
            const newVoucher: Voucher = { ...voucherToSave, id: newId };
            setVouchers([newVoucher, ...vouchers]);
        }
        handleCloseModal();
    };

    const handleDeleteVoucher = (voucherId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus voucher ini?')) {
            setVouchers(vouchers.filter(v => v.id !== voucherId));
        }
    };
    
    const getVoucherScope = (voucher: Voucher): string => {
        if (voucher.applicableCategory) {
            return `Kategori: ${voucher.applicableCategory}`;
        }
        if (voucher.applicableProductIds && voucher.applicableProductIds.length > 0) {
            return `${voucher.applicableProductIds.length} Produk`;
        }
        return 'Semua Produk';
    };


    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H7a2 2 0 01-2-2V5zM5 14a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H7a2 2 0 01-2-2v-3z" /></svg>
                        <h1 className="text-3xl font-bold text-gray-800">Manajemen Voucher</h1>
                    </div>
                    <p className="text-gray-500 mt-1">Buat, kelola, dan lacak performa kode diskon Anda.</p>
                </div>
                
                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard 
                        title="Total Voucher" 
                        value={stats.total}
                        icon={<svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>}
                    />
                    <StatCard 
                        title="Voucher Aktif" 
                        value={stats.active}
                        icon={<svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard 
                        title="Voucher Terpakai (Bulan Ini)" 
                        value={stats.used}
                        icon={<svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v.75A.75.75 0 014.5 8.25h-.75m0 0H3.75A.75.75 0 013 7.5v-.75m0 0V6A.75.75 0 013.75 5.25h.75M15 11.25a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
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
                                    placeholder="Cari kode voucher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center sm:w-auto shrink-0">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Tambah Voucher
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-600">Kode Voucher</th>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-600">Berlaku Untuk</th>
                                    <th className="py-3 px-6 text-right font-semibold text-gray-600">Nilai</th>
                                    <th className="py-3 px-6 text-right font-semibold text-gray-600">Min. Belanja</th>
                                    <th className="py-3 px-6 text-center font-semibold text-gray-600">Status</th>
                                    <th className="py-3 px-6 text-center font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredVouchers.map((voucher) => (
                                    <tr key={voucher.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-6 whitespace-nowrap">
                                            <div className="font-mono text-gray-800 font-medium">{voucher.code}</div>
                                            <div className="text-xs text-gray-500">{voucher.type === 'fixed' ? 'Potongan Tetap' : 'Persentase'}</div>
                                        </td>
                                        <td className="py-3 px-6 whitespace-nowrap text-gray-600 font-medium">{getVoucherScope(voucher)}</td>
                                        <td className="py-3 px-6 whitespace-nowrap text-right text-gray-800 font-medium">
                                            {voucher.type === 'fixed' ? formatRupiah(voucher.value) : `${voucher.value}%`}
                                        </td>
                                        <td className="py-3 px-6 whitespace-nowrap text-right text-gray-600">{voucher.minSpend ? formatRupiah(voucher.minSpend) : '-'}</td>
                                        <td className="py-3 px-6 whitespace-nowrap text-center">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${voucher.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {voucher.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 whitespace-nowrap text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={() => handleEditClick(voucher)} className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Edit ${voucher.code}`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                                </button>
                                                <button onClick={() => handleDeleteVoucher(voucher.id)} className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Delete ${voucher.code}`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredVouchers.length === 0 && (
                         <div className="text-center py-16 text-gray-500">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <h3 className="text-lg font-semibold text-gray-700">Voucher Tidak Ditemukan</h3>
                            <p className="mt-1">Coba kata kunci yang lain atau tambahkan voucher baru.</p>
                        </div>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <VoucherModal
                    voucher={selectedVoucher}
                    onClose={handleCloseModal}
                    onSave={handleSaveVoucher}
                    products={products}
                />
            )}
        </>
    );
};

export default VoucherPage;