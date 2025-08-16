import React, { useState, useMemo } from 'react';
import { Voucher, Product } from '../types';

// Reusable component for input fields for consistency
const FormInput = ({ id, label, required, children, description }: { id: string, label: string, required?: boolean, children: React.ReactNode, description?: string }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    </div>
);

interface VoucherModalProps {
    voucher: Voucher | null;
    onClose: () => void;
    onSave: (voucher: Omit<Voucher, 'id'> & { id?: number }) => void;
    products: Product[];
}

const emptyVoucher: Omit<Voucher, 'id' | 'status'> & { status: 'Aktif' | 'Non-Aktif' } = {
    code: '',
    type: 'fixed',
    value: 0,
    minSpend: 0,
    status: 'Aktif',
    applicableCategory: '',
    applicableProductIds: []
};

type Applicability = 'all' | 'category' | 'products';

const VoucherModal: React.FC<VoucherModalProps> = ({ voucher, onClose, onSave, products }) => {
    const [formData, setFormData] = useState(voucher || emptyVoucher);
    const [applicability, setApplicability] = useState<Applicability>(() => {
        if (voucher?.applicableCategory) return 'category';
        if (voucher?.applicableProductIds && voucher.applicableProductIds.length > 0) return 'products';
        return 'all';
    });
    const [productSearch, setProductSearch] = useState('');
    const isEditMode = !!voucher;

    const filteredProducts = useMemo(() => {
        if (!productSearch) return products;
        return products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    }, [products, productSearch]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        
        if (name === 'code') {
             setFormData(prev => ({ ...prev, code: value.toUpperCase() }));
        } else if (type === 'number') {
             setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleProductSelect = (productId: number) => {
        setFormData(prev => {
            const currentIds = prev.applicableProductIds || [];
            const newIds = currentIds.includes(productId)
                ? currentIds.filter(id => id !== productId)
                : [...currentIds, productId];
            return { ...prev, applicableProductIds: newIds };
        });
    };

    const handleTypeChange = (type: 'fixed' | 'percentage') => {
        setFormData(prev => ({ ...prev, type }));
    };

    const handleApplicabilityChange = (type: Applicability) => {
        setApplicability(type);
         setFormData(prev => ({
            ...prev,
            applicableCategory: type === 'category' ? prev.applicableCategory : '',
            applicableProductIds: type === 'products' ? prev.applicableProductIds : [],
        }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code || formData.value <= 0) {
            alert('Kode Voucher dan Nilai harus diisi dan lebih dari 0.');
            return;
        }
        
        const finalData = { ...formData };
        if (applicability === 'all') {
            delete finalData.applicableCategory;
            delete finalData.applicableProductIds;
        } else if (applicability === 'category') {
            delete finalData.applicableProductIds;
        } else if (applicability === 'products') {
            delete finalData.applicableCategory;
        }
        onSave(finalData);
    };

    const inputClass = "block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            {isEditMode ? 'Edit Voucher' : 'Tambah Voucher Baru'}
                        </h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100" aria-label="Close modal">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
                        <FormInput id="code" label="Kode Voucher" required>
                            <input type="text" name="code" id="code" value={formData.code} onChange={handleChange} required className={`${inputClass} font-mono`} placeholder="HEMAT10K" />
                        </FormInput>

                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Diskon</label>
                             <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => handleTypeChange('fixed')} className={`p-3 border rounded-lg text-sm text-left ${formData.type === 'fixed' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300 hover:border-blue-400'}`}>
                                    <p className="font-semibold">Potongan Tetap (Rp)</p>
                                    <p className="text-xs text-gray-500">Diskon dengan jumlah nominal tetap.</p>
                                </button>
                                <button type="button" onClick={() => handleTypeChange('percentage')} className={`p-3 border rounded-lg text-sm text-left ${formData.type === 'percentage' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300 hover:border-blue-400'}`}>
                                    <p className="font-semibold">Persentase (%)</p>
                                    <p className="text-xs text-gray-500">Diskon berdasarkan persentase total.</p>
                                </button>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput id="value" label="Nilai" required>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">{formData.type === 'fixed' ? 'Rp' : '%'}</span>
                                    </div>
                                    <input type="number" name="value" id="value" value={formData.value} onChange={handleChange} required className={`${inputClass} pl-8`} placeholder={formData.type === 'fixed' ? '10000' : '15'} />
                                </div>
                            </FormInput>

                            <FormInput id="minSpend" label="Minimal Belanja (Opsional)">
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">Rp</span>
                                    </div>
                                    <input type="number" name="minSpend" id="minSpend" value={formData.minSpend} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="50000" />
                                </div>
                            </FormInput>
                        </div>

                         <div className="p-4 bg-gray-50 rounded-lg border">
                             <label className="block text-sm font-medium text-gray-700 mb-2">Berlaku Untuk</label>
                             <div className="flex bg-gray-200 p-1 rounded-lg">
                                <button type="button" onClick={() => handleApplicabilityChange('all')} className={`w-1/3 py-1 rounded-md text-sm font-semibold ${applicability === 'all' ? 'bg-white shadow' : ''}`}>Semua Produk</button>
                                <button type="button" onClick={() => handleApplicabilityChange('category')} className={`w-1/3 py-1 rounded-md text-sm font-semibold ${applicability === 'category' ? 'bg-white shadow' : ''}`}>Kategori</button>
                                <button type="button" onClick={() => handleApplicabilityChange('products')} className={`w-1/3 py-1 rounded-md text-sm font-semibold ${applicability === 'products' ? 'bg-white shadow' : ''}`}>Produk</button>
                             </div>
                             {applicability === 'category' && (
                                <div className="mt-3">
                                    <input type="text" name="applicableCategory" value={formData.applicableCategory} onChange={e => setFormData(prev => ({...prev, applicableCategory: e.target.value}))} className={inputClass} placeholder="cth: Makanan" />
                                </div>
                             )}
                              {applicability === 'products' && (
                                <div className="mt-3">
                                    <input type="search" value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Cari produk..." className={inputClass} />
                                    <div className="mt-2 max-h-36 overflow-y-auto border rounded-md p-2 space-y-1">
                                        {filteredProducts.map(p => (
                                            <label key={p.id} className="flex items-center space-x-3 p-1.5 hover:bg-gray-100 rounded-md cursor-pointer">
                                                <input type="checkbox" checked={formData.applicableProductIds?.includes(p.id)} onChange={() => handleProductSelect(p.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700">{p.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                             )}
                         </div>

                         <FormInput id="status" label="Status">
                            <select name="status" id="status" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Aktif' | 'Non-Aktif' }))} className={inputClass}>
                                <option value="Aktif">Aktif</option>
                                <option value="Non-Aktif">Non-Aktif</option>
                            </select>
                        </FormInput>

                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse rounded-b-xl">
                        <button
                            type="submit"
                            className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 w-auto sm:text-sm"
                        >
                            Simpan Voucher
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

export default VoucherModal;