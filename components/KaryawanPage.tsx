import React, { useState, useMemo, ReactNode } from 'react';
import { Employee } from '../types';
import EmployeeModal from './EmployeeModal';

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
interface KaryawanPageProps {
    employees: Employee[];
    addEmployee: (employee: Omit<Employee, 'id'>) => void;
    updateEmployee: (employee: Employee) => void;
    deleteEmployee: (employeeId: number) => void;
}

const KaryawanPage: React.FC<KaryawanPageProps> = ({ employees, addEmployee, updateEmployee, deleteEmployee }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const employeeStats = useMemo(() => {
        const total = employees.length;
        const active = employees.filter(e => e.status === 'Aktif').length;
        const admins = employees.filter(e => e.role === 'Admin').length;
        return { total, active, admins };
    }, [employees]);
    
    const filteredEmployees = useMemo(() => {
        return employees.filter(employee =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const handleOpenModal = (employee: Employee | null = null) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleSaveEmployee = (employee: Omit<Employee, 'id'> | Employee) => {
        if ('id' in employee) {
            updateEmployee(employee);
        } else {
            addEmployee(employee);
        }
        handleCloseModal();
    };


    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                        <h1 className="text-3xl font-bold text-gray-800">Manajemen Karyawan</h1>
                    </div>
                    <p className="text-gray-500 mt-1">Kelola data, peran, dan status karyawan Anda.</p>
                </div>
                
                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <StatCard 
                        title="Total Karyawan" 
                        value={employeeStats.total}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"></path></svg>}
                    />
                    <StatCard 
                        title="Karyawan Aktif" 
                        value={employeeStats.active}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    />
                    <StatCard 
                        title="Admin" 
                        value={employeeStats.admins}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>}
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
                                    placeholder="Cari karyawan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button onClick={() => handleOpenModal(null)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center sm:w-auto shrink-0">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Tambah Karyawan
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-600">Karyawan</th>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-600">Peran</th>
                                    <th className="py-3 px-6 text-center font-semibold text-gray-600">Status</th>
                                    <th className="py-3 px-6 text-center font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-6 whitespace-nowrap">
                                            <div className="font-medium text-gray-800">{employee.name}</div>
                                            <div className="text-gray-500 text-xs">ID: {employee.id}</div>
                                        </td>
                                        <td className="py-3 px-6 whitespace-nowrap text-gray-600">{employee.role}</td>
                                        <td className="py-3 px-6 whitespace-nowrap text-center">
                                             <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${employee.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {employee.status}
                                            </span>
                                        </td>
                                         <td className="py-3 px-6 whitespace-nowrap text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={() => handleOpenModal(employee)} className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Edit ${employee.name}`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                                </button>
                                                <button onClick={() => deleteEmployee(employee.id)} className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Delete ${employee.name}`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                     {filteredEmployees.length === 0 && (
                         <div className="text-center py-16 text-gray-500">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <h3 className="text-lg font-semibold text-gray-700">Karyawan Tidak Ditemukan</h3>
                            <p className="mt-1">Coba kata kunci pencarian yang lain.</p>
                        </div>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <EmployeeModal
                    employee={selectedEmployee}
                    onClose={handleCloseModal}
                    onSave={handleSaveEmployee}
                />
            )}
        </>
    );
};

export default KaryawanPage;