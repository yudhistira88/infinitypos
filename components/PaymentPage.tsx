import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { PaymentSettings, BankAccount, Order } from '../types';

// --- Reusable Components & Icons ---

const SettingsSection: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const ToggleSwitch: React.FC<{ enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ enabled, setEnabled }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
        onClick={() => setEnabled(!enabled)}
    >
        <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
    </button>
);

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

const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const CardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const QrisIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /><path d="M3.5 3.5h2v2h-2zm4 0h2v2h-2zm4 0h2v2h-2z" strokeWidth={1}/><path d="M3.5 7.5h2v2h-2zm4 0h2v2h-2zm4 4h2v2h-2zm-4 0h2v2h-2zm-4 0h2v2h-2z" strokeWidth={1}/><path d="M3.5 11.5h2v2h-2zm8 4h2v2h-2zm-4 0h2v2h-2zm-4 0h2v2h-2z" strokeWidth={1}/><path d="M15.5 3.5h2v2h-2zm4 0h2v2h-2zm-4 4h2v2h-2zm4 0h2v2h-2zm-4 4h2v2h-2zm4 0h2v2h-2zm-4 4h2v2h-2zm4 0h2v2h-2z" strokeWidth={1}/></svg>;

const paymentMethodIcons: { [key: string]: ReactNode } = {
    'Tunai': <CashIcon />,
    'QRIS': <QrisIcon />,
    'Kartu Debit': <CardIcon />,
    'Kartu Kredit': <CardIcon />,
};

// --- Bank Account Modal ---
const BankAccountModal: React.FC<{
    account: BankAccount | null;
    onClose: () => void;
    onSave: (account: Omit<BankAccount, 'id'> | BankAccount) => void;
}> = ({ account, onClose, onSave }) => {
    const isEditMode = !!account;
    const [formData, setFormData] = useState(
        account || { bankName: '', accountNumber: '', accountHolderName: '' }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Omit<BankAccount, 'id'> | BankAccount);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit' : 'Tambah'} Akun Bank</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <input name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Nama Bank (cth: BCA)" required className="w-full border-gray-300 rounded-lg" />
                        <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Nomor Rekening" required className="w-full border-gray-300 rounded-lg" />
                        <input name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} placeholder="Nama Pemilik Rekening" required className="w-full border-gray-300 rounded-lg" />
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-sm text-white hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Page Component ---
interface PaymentPageProps {
    settings: PaymentSettings;
    setSettings: (settings: PaymentSettings) => void;
    orders: Order[];
}

const PaymentPage: React.FC<PaymentPageProps> = ({ settings, setSettings, orders }) => {
    const [localSettings, setLocalSettings] = useState<PaymentSettings>(settings);
    const [isDirty, setIsDirty] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    useEffect(() => {
        setIsDirty(JSON.stringify(localSettings) !== JSON.stringify(settings));
    }, [localSettings, settings]);

    const stats = useMemo(() => {
        const counts = orders.reduce((acc, order) => {
            acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const favorite = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        return { favorite };
    }, [orders]);

    const handleMethodToggle = (method: string, enabled: boolean) => {
        setLocalSettings(prev => {
            const activeMethods = enabled
                ? [...prev.activeMethods, method]
                : prev.activeMethods.filter(m => m !== method);
            return { ...prev, activeMethods };
        });
    };

    const handleQrisToggle = (enabled: boolean) => {
        setLocalSettings(prev => ({ ...prev, qris: { ...prev.qris, enabled } }));
    };

    const handleSaveBankAccount = (account: Omit<BankAccount, 'id'> | BankAccount) => {
        setLocalSettings(prev => {
            const bankAccounts = 'id' in account
                ? prev.bankAccounts.map(a => a.id === account.id ? account : a)
                : [...prev.bankAccounts, { ...account, id: Date.now() }];
            return { ...prev, bankAccounts };
        });
        setIsModalOpen(false);
    };

    const handleDeleteBankAccount = (id: number) => {
        if (window.confirm('Yakin ingin menghapus akun bank ini?')) {
            setLocalSettings(prev => ({
                ...prev,
                bankAccounts: prev.bankAccounts.filter(a => a.id !== id)
            }));
        }
    };

    const handleSaveChanges = () => {
        setSettings(localSettings);
        alert('Pengaturan pembayaran berhasil disimpan!');
    };
    
    const handleCancel = () => {
        setLocalSettings(settings);
    };


    return (
        <div className="space-y-6 pb-20">
            {isModalOpen && <BankAccountModal account={editingAccount} onClose={() => setIsModalOpen(false)} onSave={handleSaveBankAccount} />}

            <div>
                 <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    <h1 className="text-3xl font-bold text-gray-800">Manajemen Pembayaran</h1>
                </div>
                <p className="text-gray-500 mt-1">Atur metode pembayaran yang tersedia untuk pelanggan Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Metode Favorit" value={stats.favorite} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
                <StatCard title="Status QRIS" value={localSettings.qris.enabled ? 'Aktif' : 'Tidak Aktif'} icon={<QrisIcon />} />
                <StatCard title="Akun Bank Terdaftar" value={localSettings.bankAccounts.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SettingsSection title="Metode Pembayaran Umum" description="Aktifkan atau non-aktifkan metode pembayaran di kasir.">
                    <div className="space-y-4">
                        {['Tunai', 'Kartu Debit', 'Kartu Kredit'].map(method => (
                            <div key={method} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <span className="text-blue-600">{paymentMethodIcons[method]}</span>
                                    <span className="font-semibold text-gray-700">{method}</span>
                                </div>
                                <ToggleSwitch enabled={localSettings.activeMethods.includes(method)} setEnabled={(e) => handleMethodToggle(method, e)} />
                            </div>
                        ))}
                    </div>
                </SettingsSection>

                <SettingsSection title="Pengaturan QRIS" description="Kelola pembayaran via QRIS.">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <span className="text-blue-600">{paymentMethodIcons['QRIS']}</span>
                                <span className="font-semibold text-gray-700">Aktifkan Pembayaran QRIS</span>
                            </div>
                            <ToggleSwitch enabled={localSettings.qris.enabled} setEnabled={handleQrisToggle} />
                        </div>
                        <div className="pt-2">
                             <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-1">Nama Merchant</label>
                             <input id="merchantName" type="text" value={localSettings.qris.merchantName} onChange={(e) => setLocalSettings(p => ({...p, qris: {...p.qris, merchantName: e.target.value}}))} className="w-full border-gray-300 rounded-lg" />
                        </div>
                    </div>
                </SettingsSection>
            </div>

            <SettingsSection title="Rekening Bank" description="Daftar rekening untuk menerima pembayaran via transfer.">
                <div className="space-y-4">
                    {localSettings.bankAccounts.map(acc => (
                         <div key={acc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800">{acc.accountHolderName}</p>
                                <p className="text-sm text-gray-500">{acc.bankName} - {acc.accountNumber}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setEditingAccount(acc); setIsModalOpen(true); }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                                <button onClick={() => handleDeleteBankAccount(acc.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        </div>
                    ))}
                     <button onClick={() => { setEditingAccount(null); setIsModalOpen(true); }} className="w-full text-sm font-semibold text-blue-600 border-2 border-dashed border-gray-300 rounded-lg py-3 hover:bg-blue-50">
                        + Tambah Akun Bank
                    </button>
                </div>
            </SettingsSection>

            {isDirty && (
                <div className="fixed bottom-0 left-0 lg:left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-10">
                    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex justify-end items-center gap-3">
                         <button 
                            onClick={handleCancel}
                            className="bg-white text-gray-700 border border-gray-300 font-bold py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                         >
                            Batal
                         </button>
                        <button 
                            onClick={handleSaveChanges} 
                            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;