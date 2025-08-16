import React, { useState } from 'react';
import { SettingsSection, FormRow, inputClass } from './SettingsPage';


// A simple toggle switch component
const ToggleSwitch: React.FC<{ enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ enabled, setEnabled }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
        onClick={() => setEnabled(!enabled)}
    >
        <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
    </button>
);


const SecuritySettings: React.FC = () => {
    const [is2faEnabled, setIs2faEnabled] = useState(false);

    const loginHistory = [
        { device: 'Chrome di Windows', location: 'Jakarta, ID', time: 'Aktif sekarang', current: true },
        { device: 'Aplikasi Mobile', location: 'Bandung, ID', time: '2 jam yang lalu', current: false },
        { device: 'Safari di macOS', location: 'Surabaya, ID', time: '1 hari yang lalu', current: false },
    ];

    return (
        <div className="space-y-6">
            <SettingsSection title="Ubah Kata Sandi" description="Untuk keamanan, disarankan untuk menggunakan kata sandi yang kuat dan unik.">
                <FormRow label="Kata Sandi Saat Ini">
                    <input type="password" name="currentPassword" className={inputClass} />
                </FormRow>
                <FormRow label="Kata Sandi Baru">
                    <input type="password" name="newPassword" className={inputClass} />
                </FormRow>
                <FormRow label="Konfirmasi Kata Sandi Baru">
                    <input type="password" name="confirmPassword" className={inputClass} />
                </FormRow>
            </SettingsSection>
            
            <SettingsSection title="Autentikasi Dua Faktor (2FA)" description="Tambahkan lapisan keamanan ekstra pada akun Anda.">
                <FormRow label="Aktifkan 2FA">
                    <div className="flex items-center gap-4">
                        <ToggleSwitch enabled={is2faEnabled} setEnabled={setIs2faEnabled} />
                        <span className={`text-sm font-semibold ${is2faEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                            {is2faEnabled ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                    </div>
                </FormRow>
                {is2faEnabled && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800">Langkah 1: Pindai Kode QR</h4>
                        <p className="text-xs text-gray-500 mt-1">Gunakan aplikasi autentikator (spt. Google Authenticator) untuk memindai kode ini.</p>
                        <div className="mt-3 flex justify-center bg-white p-2 rounded-md">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/InfinityPOS:admin@infinitypos.app?secret=JBSWY3DPEHPK3PXP&issuer=InfinityPOS" alt="QR Code" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mt-4">Langkah 2: Simpan Kode Pemulihan</h4>
                        <p className="text-xs text-gray-500 mt-1">Simpan kode ini di tempat yang aman. Kode ini dapat digunakan jika Anda kehilangan akses ke aplikasi autentikator.</p>
                        <div className="mt-2 p-3 bg-gray-200 rounded-md font-mono text-center tracking-widest text-sm">
                            <p>abcd-1234-efgh-5678</p>
                        </div>
                    </div>
                )}
            </SettingsSection>
            
            <SettingsSection title="Riwayat Login" description="Tinjau sesi aktif dan riwayat login untuk memastikan akun Anda aman.">
                <ul className="space-y-3">
                    {loginHistory.map((session, index) => (
                        <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-sm text-gray-800">{session.device}</p>
                                <p className="text-xs text-gray-500">{session.location} - {session.time}</p>
                            </div>
                            {session.current && (
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Sesi Ini</span>
                            )}
                        </li>
                    ))}
                </ul>
                 <div className="border-t border-gray-200 pt-4">
                    <button className="text-sm font-semibold text-red-600 hover:text-red-800">
                        Keluar dari semua perangkat lain
                    </button>
                </div>
            </SettingsSection>
        </div>
    );
};

export default SecuritySettings;
