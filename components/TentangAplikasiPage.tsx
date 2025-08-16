import React, { ReactNode } from 'react';

// --- Icon Components ---
const FeatureIconWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
        {children}
    </div>
);
const CashRegisterIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>;
const BoxIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>;
const ChartIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const SparklesIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6.343 6.343l1.414 1.414m3.536 3.536l6.364-6.364M10.5 21v-4m-3.536-3.536l-1.414-1.414M17.657 17.657l-1.414-1.414m-12.728-3.536h4M21 10.5h-4m-3.536 3.536l-1.414 1.414M12 21a9 9 0 110-18 9 9 0 010 18z"></path></svg>;


const TentangAplikasiPage: React.FC = () => {
    const features = [
        {
            icon: <CashRegisterIcon />,
            title: "Kasir Cepat & Intuitif",
            description: "Proses transaksi penjualan dengan cepat dan mudah, mengurangi antrian dan meningkatkan kepuasan pelanggan."
        },
        {
            icon: <BoxIcon />,
            title: "Manajemen Stok Terpusat",
            description: "Kelola inventaris Anda secara efisien, pantau stok masuk dan keluar, dan dapatkan notifikasi untuk produk yang hampir habis."
        },
        {
            icon: <ChartIcon />,
            title: "Laporan Komprehensif",
            description: "Dapatkan wawasan mendalam tentang kinerja bisnis Anda dengan laporan penjualan dan keuangan yang mudah dipahami."
        },
        {
            icon: <SparklesIcon />,
            title: "Didukung oleh AI Cerdas",
            description: "Manfaatkan kekuatan kecerdasan buatan (AI) untuk membuat deskripsi produk yang menarik secara otomatis."
        }
    ];

    return (
        <div className="bg-gray-50/70 -m-4 p-4 lg:p-6 min-h-[calc(100vh-64px)]">
            <div className="max-w-5xl mx-auto">
                {/* Hero Section */}
                <header className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg border border-gray-200">
                    <div className="flex justify-center mb-4">
                         <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Tentang <span className="text-blue-600">InfinityPOS</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        Memberdayakan bisnis Anda dengan solusi Point of Sale yang cerdas, modern, dan mudah digunakan.
                    </p>
                </header>

                {/* Our Mission Section */}
                <section className="py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Misi Kami</h2>
                            <p className="mt-4 text-gray-600">
                                Di InfinityPOS, misi kami adalah menyediakan alat yang dibutuhkan oleh usaha kecil dan menengah (UMKM) untuk dapat bersaing di era digital. Kami percaya bahwa teknologi canggih tidak harus rumit atau mahal.
                            </p>
                            <p className="mt-4 text-gray-600">
                                Kami berkomitmen untuk terus berinovasi dan menyederhanakan operasional bisnis, mulai dari pencatatan penjualan hingga analisis data, sehingga Anda dapat lebih fokus pada hal yang terpenting: mengembangkan bisnis Anda.
                            </p>
                        </div>
                         <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                            <blockquote className="text-gray-700 italic text-center">
                                “Teknologi seharusnya menjadi enabler, bukan penghalang. Kami membangun InfinityPOS untuk menjembatani kesenjangan tersebut bagi setiap pemilik usaha.”
                            </blockquote>
                            <footer className="mt-4 text-right">
                                <p className="font-semibold text-gray-800">Tim InfinityPOS</p>
                            </footer>
                        </div>
                    </div>
                </section>

                {/* Key Features Section */}
                <section className="py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
                    <div className="text-center px-6">
                        <h2 className="text-3xl font-bold text-gray-800">Fitur Unggulan</h2>
                        <p className="mt-3 max-w-2xl mx-auto text-gray-600">
                            Semua yang Anda butuhkan untuk menjalankan bisnis dengan lebih efisien, dalam satu aplikasi.
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 px-6">
                        {features.map((feature) => (
                            <div key={feature.title} className="flex items-start space-x-4">
                                <FeatureIconWrapper>{feature.icon}</FeatureIconWrapper>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                                    <p className="mt-1 text-gray-600">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* Version Info */}
                <footer className="text-center py-10 mt-8">
                    <p className="text-sm text-gray-500">InfinityPOS Versi 1.0.0</p>
                    <p className="text-xs text-gray-400 mt-1">© 2024 InfinityPOS. Hak Cipta Dilindungi.</p>
                </footer>
            </div>
        </div>
    );
};

export default TentangAplikasiPage;
