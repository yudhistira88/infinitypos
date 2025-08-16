import React, { useState, useContext, ReactNode, useEffect } from 'react';
import { StoreSettings, User } from '../types';
import { PrinterContext } from '../contexts/PrinterContext';
import AccountSettings from './AccountSettings';
import SecuritySettings from './SecuritySettings';

// --- ICONS ---
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const DeviceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const AccountIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const SecurityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

// --- REUSABLE UI COMPONENTS ---
export const SettingsSection: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <div className="p-6 space-y-6">
            {children}
        </div>
    </div>
);

export const FormRow: React.FC<{ label: string; description?: string; children: React.ReactNode }> = ({ label, description, children }) => (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
        <div className="md:col-span-1">
            <label className="text-sm font-semibold text-gray-800">{label}</label>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="md:col-span-2">
            {children}
        </div>
    </div>
);

export const inputClass = "w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";


// --- MAIN SETTINGS PAGE ---
interface SettingsPageProps {
    settings: StoreSettings;
    setSettings: (settings: StoreSettings) => void;
    user: User;
    setUser: (user: User) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, setSettings, user, setUser }) => {
    const [activeTab, setActiveTab] = useState('toko');
    const printer = useContext(PrinterContext);
    
    // Local state for forms that can be edited and then saved or canceled
    const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
    const [localUser, setLocalUser] = useState<User>(user);

    // Effect to reset local state if the main props change from somewhere else
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);
    
    useEffect(() => {
        setLocalUser(user);
    }, [user]);

    // Check for any unsaved changes to enable/disable the save button
    const isDirty = JSON.stringify(localSettings) !== JSON.stringify(settings) || JSON.stringify(localUser) !== JSON.stringify(user);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setLocalSettings(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };

    const handleTemplateChange = (template: 'modern' | 'simple') => {
        setLocalSettings(prev => ({ ...prev, receiptTemplate: template }));
    };

    const handleSave = () => {
        setSettings(localSettings);
        setUser(localUser);
        alert("Pengaturan berhasil disimpan!");
    };
    
    const handleCancel = () => {
        setLocalSettings(settings);
        setLocalUser(user);
    };

    const handleTestPrint = async () => {
        if (!printer.isConnected) {
            alert("Printer tidak terhubung.");
            return;
        }
        const encoder = new TextEncoder();
        const testMessage = `Test Cetak Berhasil!\nTerhubung via ${printer.connectionType}.\n\n\n`;
        try {
            await printer.print(encoder.encode(testMessage));
        } catch (error) {
            alert(`Gagal melakukan test print: ${error}`);
        }
    }

    const navigationItems = [
        { key: 'toko', label: 'Informasi Toko', icon: <StoreIcon /> },
        { key: 'struk', label: 'Struk & Pajak', icon: <ReceiptIcon /> },
        { key: 'perangkat', label: 'Perangkat & Printer', icon: <DeviceIcon /> },
        { key: 'akun', label: 'Akun', icon: <AccountIcon /> },
        { key: 'keamanan', label: 'Keamanan', icon: <SecurityIcon /> },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'toko': return (
                <SettingsSection title="Informasi Toko" description="Perbarui detail publik dan informasi kontak toko Anda.">
                    <FormRow label="Nama Toko">
                        <input type="text" name="name" value={localSettings.name} onChange={handleSettingsChange} className={inputClass} />
                    </FormRow>
                    <FormRow label="Alamat">
                        <input type="text" name="address" value={localSettings.address} onChange={handleSettingsChange} className={inputClass} />
                    </FormRow>
                    <FormRow label="Nomor Telepon">
                        <input type="text" name="phone" value={localSettings.phone} onChange={handleSettingsChange} className={inputClass} />
                    </FormRow>
                </SettingsSection>
            );
            case 'struk': return (
                <SettingsSection title="Pengaturan Struk & Pajak" description="Sesuaikan informasi yang muncul pada struk pelanggan.">
                    <FormRow label="Awalan No. Bon" description="Teks yang muncul sebelum nomor urut bon.">
                        <input type="text" name="bonPrefix" value={localSettings.bonPrefix} onChange={handleSettingsChange} className={inputClass} />
                    </FormRow>
                    <FormRow label="Pajak Default (%)" description="Persentase pajak yang otomatis diterapkan pada setiap transaksi.">
                        <input type="number" name="defaultTaxPercent" value={localSettings.defaultTaxPercent} onChange={handleSettingsChange} className={inputClass} />
                    </FormRow>
                    <FormRow label="Teks Footer Struk" description="Pesan singkat di akhir struk, misal: 'Terima kasih'.">
                        <input type="text" name="receiptFooter" value={localSettings.receiptFooter} onChange={handleSettingsChange} className={inputClass} />
                    </FormRow>
                    <FormRow label="Logo Toko" description="URL logo untuk ditampilkan di struk modern.">
                        <input type="text" name="logoUrl" value={localSettings.logoUrl || ''} onChange={handleSettingsChange} className={inputClass} placeholder="https://.../logo.png" />
                    </FormRow>
                    <FormRow label="Template Struk" description="Pilih tampilan struk untuk pelanggan dan pratinjau.">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button type="button" onClick={() => handleTemplateChange('simple')} className={`border-2 rounded-lg p-3 text-center transition-colors ${localSettings.receiptTemplate === 'simple' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300 hover:border-blue-500'}`}>
                                <div className="h-28 bg-gray-100 flex items-center justify-center font-mono text-xs p-2 overflow-hidden leading-tight text-gray-600 rounded-md">
                                    <pre className="text-left whitespace-pre">
                                        TOKO ANDA<br/>
                                        --------------<br/>
                                        1x Item A...10.000<br/>
                                        2x Item B...40.000<br/>
                                        --------------<br/>
                                        TOTAL.....50.000
                                    </pre>
                                </div>
                                <p className="font-semibold text-sm mt-2 text-gray-800">Simple (Thermal)</p>
                            </button>
                            <button type="button" onClick={() => handleTemplateChange('modern')} className={`border-2 rounded-lg p-3 text-center transition-colors ${localSettings.receiptTemplate === 'modern' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300 hover:border-blue-500'}`}>
                                 <div className="h-28 bg-gray-100 flex flex-col items-center justify-center p-2 overflow-hidden rounded-md">
                                    <div className="w-6 h-6 rounded-full bg-blue-300 mb-1"></div>
                                    <div className="w-16 h-1.5 bg-gray-300 rounded-full mb-2"></div>
                                    <div className="w-20 h-1 bg-gray-200 rounded-full mb-1"></div>
                                    <div className="w-20 h-1 bg-gray-200 rounded-full mb-1"></div>
                                    <div className="w-20 h-1 bg-gray-200 rounded-full mb-2"></div>
                                    <div className="w-12 h-1.5 bg-gray-400 rounded-full"></div>
                                </div>
                                <p className="font-semibold text-sm mt-2 text-gray-800">Modern</p>
                            </button>
                        </div>
                    </FormRow>
                </SettingsSection>
            );
            case 'perangkat': return (
                <SettingsSection title="Perangkat & Printer" description="Hubungkan dan kelola printer termal Anda.">
                     <FormRow label="Status Printer">
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                            <span className={`h-2.5 w-2.5 rounded-full ${printer.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <p className="text-sm font-medium text-gray-700">{printer.statusMessage}</p>
                        </div>
                    </FormRow>
                    <FormRow label="Koneksi Printer" description="Hubungkan printer via Bluetooth (rekomendasi) atau USB.">
                        <div className="flex items-center space-x-3">
                            {printer.isConnected ? (
                                <>
                                    <button onClick={printer.disconnect} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors">
                                        Putuskan
                                    </button>
                                    <button onClick={handleTestPrint} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                                        Test Cetak
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={printer.connectBluetooth} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
                                        Hubungkan Bluetooth
                                    </button>
                                    <button onClick={printer.connectUSB} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                                        Hubungkan USB
                                    </button>
                                </>
                            )}
                        </div>
                    </FormRow>
                </SettingsSection>
            );
            case 'akun': return (
                <AccountSettings user={localUser} onUpdateUser={setLocalUser} />
            );
             case 'keamanan': return (
                <SecuritySettings />
            );
            default: return(
                 <div className="bg-white rounded-xl shadow-md text-center p-16">
                    <h3 className="text-xl font-semibold text-gray-700">Fitur Segera Hadir</h3>
                    <p className="text-gray-500 mt-2">Halaman '{navigationItems.find(i => i.key === activeTab)?.label}' sedang dalam pengembangan.</p>
                </div>
            )
        }
    };
    
    return (
        <div className="bg-gray-50/70 -m-4 p-4 lg:p-6 min-h-[calc(100vh-64px)]">
            <div className="max-w-7xl mx-auto pb-16">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pengaturan</h1>
                    <p className="text-gray-600 mt-1">Kelola informasi toko, printer, dan preferensi Anda.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                    <aside className="md:col-span-1 sticky top-20">
                        <nav className="space-y-1" aria-label="Settings navigation">
                            {navigationItems.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveTab(item.key)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                        activeTab === item.key
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <main className="md:col-span-3">
                        {renderContent()}
                    </main>
                </div>

                 {/* Fixed Save Bar */}
                <div className="fixed bottom-0 left-0 lg:left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-10">
                    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex justify-end items-center gap-3">
                        {isDirty && (
                             <button 
                                onClick={handleCancel}
                                className="bg-white text-gray-700 border border-gray-300 font-bold py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                             >
                                Batal
                             </button>
                        )}
                        <button 
                            onClick={handleSave} 
                            disabled={!isDirty}
                            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;