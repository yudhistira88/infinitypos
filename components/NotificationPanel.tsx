import React, { useState, useMemo, ReactNode } from 'react';
import { Notification } from '../types';

// --- Icon Components for Notification Types ---
const StokIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>;
const LaporanIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const SistemIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"></path></svg>;
const PromoIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path></svg>;

const notificationIcons: { [key in Notification['type']]: { icon: ReactNode; color: string } } = {
    stok: { icon: <StokIcon />, color: 'bg-red-100 text-red-600' },
    laporan: { icon: <LaporanIcon />, color: 'bg-blue-100 text-blue-600' },
    sistem: { icon: <SistemIcon />, color: 'bg-indigo-100 text-indigo-600' },
    promo: { icon: <PromoIcon />, color: 'bg-green-100 text-green-600' },
};


interface NotificationPanelProps {
    notifications: Notification[];
    onMarkAsRead: (id: number) => void;
    onMarkAllAsRead: () => void;
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) => {
    const [activeTab, setActiveTab] = useState<'Semua' | 'Belum Dibaca'>('Semua');
    const unreadCount = notifications.filter(n => !n.read).length;

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'Belum Dibaca') {
            return notifications.filter(n => !n.read);
        }
        return notifications;
    }, [notifications, activeTab]);

    return (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right bg-white rounded-xl shadow-2xl z-30 ring-1 ring-black ring-opacity-5 focus:outline-none flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Notifikasi</h3>
                    {unreadCount > 0 && (
                        <button onClick={onMarkAllAsRead} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                            Tandai semua sudah dibaca
                        </button>
                    )}
                </div>
                 <div className="mt-3 flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('Semua')}
                        className={`w-1/2 py-1 rounded-md text-sm font-semibold transition-colors ${activeTab === 'Semua' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                    >
                        Semua
                    </button>
                     <button 
                        onClick={() => setActiveTab('Belum Dibaca')}
                        className={`w-1/2 py-1 rounded-md text-sm font-semibold transition-colors relative ${activeTab === 'Belum Dibaca' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                    >
                        Belum Dibaca
                         {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="flex-grow overflow-y-auto max-h-96">
                {filteredNotifications.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {filteredNotifications.map(n => (
                            <li 
                                key={n.id} 
                                onClick={() => onMarkAsRead(n.id)} 
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notificationIcons[n.type].color}`}>
                                        {notificationIcons[n.type].icon}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                                        <p className="text-sm text-gray-600">{n.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{n.timestamp}</p>
                                    </div>
                                    {!n.read && (
                                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 flex-shrink-0" aria-label="Unread"></div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16 px-4">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h4 className="font-semibold text-gray-700">Tidak ada notifikasi</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            {activeTab === 'Belum Dibaca' ? 'Semua notifikasi sudah dibaca.' : 'Anda akan melihat notifikasi penting di sini.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                 <button className="w-full text-center py-2 text-sm font-semibold text-blue-600 hover:bg-gray-200 rounded-md transition-colors">
                    Lihat Semua Notifikasi
                </button>
            </div>
        </div>
    );
};

export default NotificationPanel;