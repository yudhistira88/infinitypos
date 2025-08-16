import React, { useRef } from 'react';
import { SettingsSection, FormRow, inputClass } from './SettingsPage';

interface User {
    name: string;
    email: string;
    phone: string;
    role: string;
    avatarUrl: string | null;
}

interface AccountSettingsProps {
    user: User;
    onUpdateUser: (user: User) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user, onUpdateUser }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateUser({ ...user, [e.target.name]: e.target.value });
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateUser({ ...user, avatarUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const getInitials = (name: string): string => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="space-y-6">
            <SettingsSection title="Profil Akun" description="Kelola informasi pribadi dan detail kontak Anda.">
                <FormRow label="Foto Profil">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-blue-600">{getInitials(user.name)}</span>
                            )}
                        </div>
                        <div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-white border border-gray-300 rounded-md font-semibold text-xs hover:bg-gray-50">
                                Ganti Foto
                            </button>
                             <button type="button" onClick={() => onUpdateUser({...user, avatarUrl: null})} className="ml-2 text-xs text-gray-500 hover:text-red-600">
                                Hapus
                            </button>
                        </div>
                    </div>
                </FormRow>
                <FormRow label="Nama Lengkap">
                    <input type="text" name="name" value={user.name} onChange={handleChange} className={inputClass} />
                </FormRow>
                 <FormRow label="Alamat Email" description="Email tidak dapat diubah.">
                    <input type="email" name="email" value={user.email} disabled className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                </FormRow>
                <FormRow label="Nomor Telepon">
                    <input type="text" name="phone" value={user.phone} onChange={handleChange} className={inputClass} />
                </FormRow>
                 <FormRow label="Peran">
                    <input type="text" name="role" value={user.role} disabled className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                </FormRow>
            </SettingsSection>
        </div>
    );
};

export default AccountSettings;