import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Notification, User } from '../types';
import NotificationPanel from './NotificationPanel';


interface NavItemProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}

// Modern "pill" style navigation item
const NavItem: React.FC<NavItemProps> = ({ children, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            isActive 
            ? 'bg-slate-100 text-blue-600 font-semibold' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
        }`}
        aria-current={isActive ? 'page' : undefined}
    >
        {icon}
        <span>{children}</span>
    </button>
);


interface HeaderProps {
    activePage: string;
    onNavigate: (page: string) => void;
    storeName: string;
    user: User;
    notifications: Notification[];
    onMarkAsRead: (id: number) => void;
    onMarkAllAsRead: () => void;
    onLogout: () => void;
}

// --- Dropdown Components ---
const DropdownItem: React.FC<{ icon: ReactNode; onClick: () => void; children: ReactNode; isActive?: boolean }> = ({ icon, onClick, children, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 group ${
            isActive
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-100'
        }`}
    >
        <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{icon}</span>
        <span>{children}</span>
    </button>
);

const DropdownDivider: React.FC = () => <div className="h-px bg-slate-200 my-1" />;


const Header: React.FC<HeaderProps> = ({ activePage, onNavigate, storeName, user, notifications, onMarkAsRead, onMarkAllAsRead, onLogout }) => {
    const [isOwnerMenuOpen, setIsOwnerMenuOpen] = useState(false);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const ownerMenuRef = useRef<HTMLDivElement>(null);
    const notificationPanelRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;
    
    const navItems = [
        { name: 'Beranda', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> },
        { name: 'Produk', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg> },
        { name: 'Kasir', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-6m-3 6v-6m7-3a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7z"></path></svg> },
        { name: 'Keuangan', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> },
    ];
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ownerMenuRef.current && !ownerMenuRef.current.contains(event.target as Node)) {
                setIsOwnerMenuOpen(false);
            }
            if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) {
                setIsNotificationPanelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDropdownNavigate = (page: string) => {
        onNavigate(page);
        setIsOwnerMenuOpen(false);
    };

    const handleLogout = () => {
        setIsOwnerMenuOpen(false);
        onLogout();
    }

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 h-16">
            <div className="px-4 lg:px-6 h-full">
                <div className="flex justify-between items-center h-full">
                    <div className="flex items-center gap-6">
                         <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                            </svg>
                            <span className="text-xl font-bold text-slate-800 tracking-tight">InfinityPOS</span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-2">
                            {navItems.map(item => (
                                <NavItem
                                    key={item.name}
                                    isActive={activePage === item.name}
                                    onClick={() => onNavigate(item.name)}
                                    icon={item.icon}
                                >
                                    {item.name}
                                </NavItem>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative" ref={notificationPanelRef}>
                            <button 
                                onClick={() => setIsNotificationPanelOpen(prev => !prev)}
                                className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                                aria-label="Notifications"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                                    </span>
                                )}
                            </button>
                             {isNotificationPanelOpen && (
                                <NotificationPanel
                                    notifications={notifications}
                                    onMarkAsRead={onMarkAsRead}
                                    onMarkAllAsRead={onMarkAllAsRead}
                                    onClose={() => setIsNotificationPanelOpen(false)}
                                />
                            )}
                        </div>
                        <button onClick={() => onNavigate('Settings')} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Settings">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </button>

                         <div className="w-px h-6 bg-slate-200 mx-2"></div>

                        <div className="relative" ref={ownerMenuRef}>
                            <button 
                                onClick={() => setIsOwnerMenuOpen(!isOwnerMenuOpen)}
                                className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 overflow-hidden"
                                aria-haspopup="true"
                                aria-expanded={isOwnerMenuOpen}
                            >
                                <span className="sr-only">Open user menu</span>
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                )}
                            </button>
                            {isOwnerMenuOpen && (
                                <div className="absolute right-0 mt-2 w-72 origin-top-right bg-white rounded-xl shadow-xl z-30 ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                                    <div className="p-2">
                                        <div className="flex items-center gap-3 p-2 border-b border-slate-200 mb-1">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{user.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-md font-semibold text-slate-900 truncate">{storeName}</p>
                                                <p className="text-sm text-slate-500 truncate">{user.name}</p>
                                            </div>
                                        </div>
                                        
                                        <DropdownItem 
                                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
                                            onClick={() => handleDropdownNavigate('Laporan Penjualan')} 
                                            isActive={activePage === 'Laporan Penjualan'}>
                                            Laporan Penjualan
                                        </DropdownItem>
                                        <DropdownItem 
                                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
                                            onClick={() => handleDropdownNavigate('Laporan Keuangan')} 
                                            isActive={activePage === 'Laporan Keuangan'}>
                                            Laporan Keuangan
                                        </DropdownItem>

                                        <DropdownDivider />
                                        
                                        <DropdownItem 
                                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
                                            onClick={() => handleDropdownNavigate('Pelanggan')} 
                                            isActive={activePage === 'Pelanggan'}>
                                            Data Pelanggan
                                        </DropdownItem>
                                         <DropdownItem 
                                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"></path></svg>}
                                            onClick={() => handleDropdownNavigate('Karyawan')} 
                                            isActive={activePage === 'Karyawan'}>
                                            Data Karyawan
                                        </DropdownItem>
                                         <DropdownItem 
                                            icon={<svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>}
                                            onClick={() => handleDropdownNavigate('Voucher')} 
                                            isActive={activePage === 'Voucher'}>
                                            Manajemen Voucher
                                        </DropdownItem>
                                        <DropdownItem 
                                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>}
                                            onClick={() => handleDropdownNavigate('Pembayaran')}
                                            isActive={activePage === 'Pembayaran'}>
                                            Manajemen Pembayaran
                                        </DropdownItem>
                                        
                                        <DropdownDivider />

                                        <DropdownItem 
                                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>}
                                            onClick={() => handleDropdownNavigate('Paket Langganan')}>
                                            Paket Langganan
                                        </DropdownItem>
                                        <DropdownItem 
                                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                                            onClick={() => handleDropdownNavigate('Bantuan')}>
                                            Bantuan
                                        </DropdownItem>
                                        <DropdownItem 
                                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                                            onClick={() => handleDropdownNavigate('Tentang Aplikasi')}>
                                            Tentang Aplikasi
                                        </DropdownItem>
                                        
                                        <DropdownDivider />
                                        
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 group text-red-600 hover:bg-red-50"
                                        >
                                            <span className="mr-3 text-red-500 group-hover:text-red-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            </span>
                                            <span className="font-semibold">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;