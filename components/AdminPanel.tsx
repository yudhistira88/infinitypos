import React, { useState, ReactNode } from 'react';
import PlaceholderPage from './PlaceholderPage';

// Icon Components
const ReportIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const SettingsIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const CustomerIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const ServiceIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
const HelpIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const GuideIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;
const SubscriptionIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>;
const InfoIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;

interface NavItemProps {
    label: string;
    icon: ReactNode;
    isActive: boolean;
    onClick: () => void;
    hasSubItems?: boolean;
    isSubItemOpen?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, isActive, onClick, hasSubItems, isSubItemOpen }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
    >
        <div className="flex items-center">
            {icon}
            <span>{label}</span>
        </div>
        {hasSubItems && <ChevronDownIcon />}
    </button>
);

const SubNavItem: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
     <button
        onClick={onClick}
        className={`w-full text-left pl-11 pr-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
    >
        {label}
    </button>
);


const AdminPanel: React.FC = () => {
    const [activePage, setActivePage] = useState('Laporan Penjualan');
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
        laporan: true,
        setting: false,
    });

    const toggleMenu = (menu: string) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const menuItems = [
        {
            name: 'Laporan',
            key: 'laporan',
            icon: <ReportIcon />,
            subItems: ['Laporan Penjualan', 'Laporan Keuangan'],
        },
        {
            name: 'Setting',
            key: 'setting',
            icon: <SettingsIcon />,
            subItems: ['Profil', 'Pembayaran', 'Karyawan', 'Perangkat', 'Struk', 'Pajak', 'Service Charge', 'Rekening Bank', 'QRIS', 'Custom Amount', 'Jenis Order'],
        },
        { name: 'Pelanggan', icon: <CustomerIcon /> },
        { name: 'Layanan', icon: <ServiceIcon /> },
        { name: 'Bantuan', icon: <HelpIcon /> },
        { name: 'Panduan Pengguna', icon: <GuideIcon /> },
        { name: 'Paket Langganan', icon: <SubscriptionIcon /> },
        { name: 'Tentang Aplikasi', icon: <InfoIcon /> },
    ];

    const renderPageContent = () => {
        // In a real app, you'd have different components for each page.
        // For now, we use a placeholder.
        return <PlaceholderPage title={activePage} />;
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)]"> {/* Adjust height based on header */}
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
                <nav className="flex-grow space-y-1">
                    {menuItems.map(item => (
                        <div key={item.name}>
                            <NavItem
                                label={item.name}
                                icon={item.icon}
                                isActive={!item.subItems && activePage === item.name}
                                onClick={() => item.subItems ? toggleMenu(item.key!) : setActivePage(item.name)}
                                hasSubItems={!!item.subItems}
                                isSubItemOpen={item.key ? openMenus[item.key] : false}
                            />
                            {item.subItems && openMenus[item.key!] && (
                                <div className="mt-1 space-y-1">
                                    {item.subItems.map(subItem => (
                                        <SubNavItem
                                            key={subItem}
                                            label={subItem}
                                            isActive={activePage === subItem}
                                            onClick={() => setActivePage(subItem)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
                 <div className="mt-auto">
                    <button
                        onClick={() => alert('Logout!')}
                        className="w-full flex items-center text-left px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                    >
                        <LogoutIcon />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow bg-gray-100 p-6">
                {renderPageContent()}
            </main>
        </div>
    );
};

export default AdminPanel;
