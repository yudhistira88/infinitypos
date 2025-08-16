import React, { useState } from 'react';

// --- Icon Components ---
const SearchIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const GettingStartedIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;
const KasirIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const ProductIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>;
const ReportIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const DeviceIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>;
const AccountIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => <svg className={`w-5 h-5 text-gray-500 transition-transform transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
const EmailIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
const WhatsAppIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52s-.67-.816-.923-1.107-.504-.249-.699-.249h-.597c-.249 0-.645.124-.82.371-.174.247-.644.782-.644 1.901 0 1.12.67 2.204.769 2.353.099.149 1.394 2.132 3.383 2.992.47.205.84.326 1.12.418.475.152.9.129 1.23.078.396-.053 1.255-.513 1.429-.988.174-.474.174-.883.125-1.004s-.174-.198-.372-.347zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></svg>;


interface HelpCategoryCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const HelpCategoryCard: React.FC<HelpCategoryCardProps> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
);


const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 px-1"
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-gray-800">{question}</span>
                <ChevronDownIcon isOpen={isOpen} />
            </button>
            {isOpen && (
                <div className="pb-4 px-1 text-gray-600 text-sm">
                    {children}
                </div>
            )}
        </div>
    );
};


const BantuanPage: React.FC = () => {
    const helpCategories = [
        { title: 'Memulai', description: 'Panduan pengaturan awal toko dan produk pertama Anda.', icon: <GettingStartedIcon /> },
        { title: 'Kasir & Penjualan', description: 'Proses transaksi, kelola keranjang, dan cetak struk.', icon: <KasirIcon /> },
        { title: 'Manajemen Produk', description: 'Tambah, edit, dan atur stok produk serta kategori.', icon: <ProductIcon /> },
        { title: 'Laporan & Analitik', description: 'Pahami laporan penjualan, keuangan, dan performa bisnis.', icon: <ReportIcon /> },
        { title: 'Pengaturan Perangkat', description: 'Hubungkan printer termal melalui Bluetooth atau USB.', icon: <DeviceIcon /> },
        { title: 'Akun & Langganan', description: 'Kelola detail akun, profil, dan paket langganan Anda.', icon: <AccountIcon /> },
    ];

    return (
        <div className="bg-gray-50/70 -m-4 p-4 lg:p-6 min-h-[calc(100vh-64px)]">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Pusat Bantuan</h1>
                    <p className="mt-3 text-lg text-gray-500">Punya pertanyaan? Kami siap membantu. Cari jawaban Anda di bawah ini.</p>
                    <div className="mt-8 max-w-lg mx-auto">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input
                                type="search"
                                placeholder="Cari topik bantuan (cth: cara cetak struk)"
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </header>

                {/* Categories */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {helpCategories.map(cat => <HelpCategoryCard key={cat.title} {...cat} />)}
                    </div>
                </section>

                {/* FAQ */}
                <section className="mt-16">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Pertanyaan yang Sering Diajukan</h2>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <FaqItem question="Bagaimana cara menghubungkan printer Bluetooth?">
                            <p>Pastikan printer Anda menyala dan Bluetooth diaktifkan. Pergi ke menu 'Settings' > 'Perangkat & Printer', lalu klik 'Hubungkan Bluetooth'. Pilih printer Anda dari daftar yang muncul. Jika ini pertama kalinya, browser akan meminta izin untuk mengakses perangkat Bluetooth.</p>
                        </FaqItem>
                        <FaqItem question="Apakah saya bisa menambahkan diskon dalam Rupiah dan Persen sekaligus?">
                            <p>Tentu. Di halaman Kasir, Anda bisa mengisi kedua kolom diskon. Sistem akan menghitung diskon persen terlebih dahulu, kemudian mengurangi hasilnya dengan diskon Rupiah.</p>
                        </FaqItem>
                         <FaqItem question="Produk yang saya tambahkan tidak muncul di halaman Kasir. Apa yang harus saya lakukan?">
                            <p>Pastikan stok produk lebih dari 0. Produk dengan stok 0 tidak akan ditampilkan di halaman Kasir untuk mencegah penjualan barang kosong. Periksa juga filter kategori yang sedang aktif, mungkin Anda perlu memilih 'Semua Kategori'.</p>
                        </FaqItem>
                        <FaqItem question="Bagaimana cara melihat laporan penjualan bulan lalu?">
                            <p>Saat ini, filter laporan menyediakan opsi 'Bulan Ini'. Fitur untuk memilih rentang tanggal kustom, termasuk bulan-bulan sebelumnya, sedang dalam pengembangan dan akan segera tersedia.</p>
                        </FaqItem>
                    </div>
                </section>
                
                {/* Contact Us */}
                 <section className="mt-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Tidak Menemukan Jawaban?</h2>
                    <p className="mt-2 text-gray-500">Tim kami siap membantu Anda.</p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-6">
                         <a href="mailto:support@infinitypos.app" className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                            <EmailIcon />
                            <span className="font-semibold text-gray-700">Email Kami</span>
                        </a>
                         <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors">
                            <WhatsAppIcon />
                            <span className="font-semibold">Chat via WhatsApp</span>
                        </a>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default BantuanPage;
