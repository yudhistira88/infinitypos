import React, { useState } from 'react';
import { Employee } from '../types';

interface EmployeeModalProps {
    employee: Employee | null;
    onClose: () => void;
    onSave: (employee: Omit<Employee, 'id'> | Employee) => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, onClose, onSave }) => {
    const isEditMode = !!employee;
    const getInitialState = () => {
        if (employee) return employee;
        return { name: '', role: 'Kasir' as const, status: 'Aktif' as const };
    };

    const [formData, setFormData] = useState(getInitialState());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('Nama Karyawan wajib diisi.');
            return;
        }
        onSave(formData);
    };

    const inputClass = "block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            {isEditMode ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
                        </h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div className="p-6 space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Karyawan <span className="text-red-500">*</span></label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="cth: Andi Wijaya" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Peran</label>
                                <select name="role" id="role" value={formData.role} onChange={handleChange} className={inputClass}>
                                    <option value="Kasir">Kasir</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" id="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                    <option value="Aktif">Aktif</option>
                                    <option value="Non-Aktif">Non-Aktif</option>
                                </select>
                            </div>
                        </div>
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

export default EmployeeModal;