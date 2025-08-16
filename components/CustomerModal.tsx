import React, { useState } from 'react';
import { Customer } from '../types';

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

interface CustomerModalProps {
    customer: Omit<Customer, 'id' | 'transactionCount' | 'totalSpend' | 'joinDate'> | Customer | null;
    onClose: () => void;
    onSave: (customer: Omit<Customer, 'id'> | Customer) => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ customer, onClose, onSave }) => {
    const isEditMode = customer && 'id' in customer;

    const getInitialState = () => {
        if (customer) {
            return {
                name: customer.name,
                phone: customer.phone,
                address: customer.address || '',
            };
        }
        return { name: '', phone: '', address: '' };
    };

    const [formData, setFormData] = useState(getInitialState());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            alert('Nama dan Nomor Telepon wajib diisi.');
            return;
        }

        if (isEditMode) {
            onSave({ ...(customer as Customer), ...formData });
        } else {
            const today = new Date();
            const joinDate = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
            onSave({
                ...formData,
                joinDate,
                transactionCount: customer && 'transactionCount' in customer ? customer.transactionCount : 0,
                totalSpend: customer && 'totalSpend' in customer ? customer.totalSpend : 0,
            });
        }
    };

    const inputClass = "block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            {isEditMode ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
                        </h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div className="p-6 space-y-5">
                        <FormInput id="name" label="Nama Pelanggan" required>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="cth: Budi Santoso" />
                        </FormInput>
                        <FormInput id="phone" label="Nomor Telepon" required>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={inputClass} placeholder="cth: 081234567890" />
                        </FormInput>
                        <FormInput id="address" label="Alamat (Opsional)">
                            <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={2} className={inputClass} placeholder="cth: Jl. Merdeka No. 123" />
                        </FormInput>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse rounded-b-xl">
                        <button type="submit" className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-blue-600 text-base font-medium text-white hover:bg-blue-700">
                            Simpan
                        </button>
                        <button type="button" onClick={onClose} className="mr-3 inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;
