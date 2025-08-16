import React, { useState } from 'react';

// --- Icon Components ---
const CheckIcon = () => <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>;
const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => <svg className={`w-5 h-5 text-gray-500 transition-transform transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;

// --- Sub-Components ---

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-t border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-5"
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-gray-800">{question}</span>
                <ChevronDownIcon isOpen={isOpen} />
            </button>
            {isOpen && (
                <div className="pb-5 text-gray-600">
                    {children}
                </div>
            )}
        </div>
    );
};

const PricingCard: React.FC<{ plan: any; isPopular?: boolean }> = ({ plan, isPopular }) => (
    <div className={`relative border rounded-2xl p-8 flex flex-col ${isPopular ? 'border-blue-600 shadow-2xl' : 'border-gray-200 bg-white'}`}>
        {isPopular && (
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                 <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold tracking-wide text-white bg-blue-600">
                    Paling Populer
                </span>
            </div>
        )}
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
        <div className="mt-6">
            <span className="text-5xl font-extrabold text-gray-900 tracking-tight">{plan.price}</span>
            <span className="text-base font-medium text-gray-500">/bulan</span>
        </div>
        <a href="#" className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
            {plan.cta}
        </a>
        <ul className="mt-8 space-y-4 text-sm text-gray-600 flex-grow">
            {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                    <CheckIcon />
                    <span className="ml-3">{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);


const PaketLanggananPage: React.FC = () => {
    const plans = [
        {
            name: 'Basic',
            price: 'Gratis',
            description: 'Untuk memulai dan mencoba fitur dasar Point of Sale.',
            cta: 'Mulai Sekarang',
            features: [
                'Hingga 50 produk',
                'Pencatatan transaksi dasar',
                '1 Akun Karyawan',
                'Laporan penjualan harian',
            ],
        },
        {
            name: 'Pro',
            price: 'Rp 99.000',
            description: 'Solusi lengkap untuk UMKM dan bisnis yang sedang berkembang.',
            cta: 'Pilih Paket Pro',
            isPopular: true,
            features: [
                'Produk tanpa batas',
                'Manajemen stok & inventaris',
                'Manajemen Karyawan & Pelanggan',
                'Laporan keuangan & analitik lengkap',
                'Integrasi Printer Bluetooth & USB',
                'Dukungan Prioritas',
            ],
        },
        {
            name: 'Enterprise',
            price: 'Kustom',
            description: 'Fitur lanjutan dan dukungan khusus untuk bisnis skala besar.',
            cta: 'Hubungi Kami',
            features: [
                'Semua fitur di Pro',
                'Manajemen multi-cabang',
                'Integrasi API pihak ketiga',
                'Manajer akun khusus',
                'SLA & dukungan enterprise',
            ],
        }
    ];

    return (
        <div className="bg-gray-50/70 -m-4 p-4 lg:p-6 min-h-[calc(100vh-64px)]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="text-center py-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Pilih Paket yang Tepat untuk Bisnis Anda
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        Solusi fleksibel untuk setiap skala usaha, dari pemula hingga enterprise. Mulai gratis dan upgrade kapan saja.
                    </p>
                </header>

                {/* Pricing Cards */}
                <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
                     {plans.map(plan => <PricingCard key={plan.name} plan={plan} isPopular={plan.isPopular} />)}
                </div>
                
                {/* FAQ Section */}
                <section className="mt-20 max-w-4xl mx-auto">
                     <h2 className="text-3xl font-bold text-center text-gray-800">Pertanyaan Umum</h2>
                     <div className="mt-8">
                        <FaqItem question="Apakah ada masa percobaan gratis?">
                            Paket 'Basic' kami sepenuhnya gratis dan dapat digunakan selamanya. Ini adalah cara terbaik untuk mencoba fitur-fitur inti kami tanpa risiko. Anda bisa upgrade ke paket Pro kapan saja saat bisnis Anda membutuhkannya.
                        </FaqItem>
                        <FaqItem question="Metode pembayaran apa saja yang diterima?">
                            Kami menerima pembayaran melalui transfer bank, kartu kredit (Visa, MasterCard), dan dompet digital (QRIS). Pembayaran akan ditagihkan secara otomatis setiap bulan pada tanggal yang sama saat Anda memulai langganan.
                        </FaqItem>
                        <FaqItem question="Bisakah saya membatalkan langganan kapan saja?">
                            Tentu saja. Anda memiliki kontrol penuh atas langganan Anda. Anda dapat membatalkannya kapan saja melalui halaman pengaturan akun. Jika Anda membatalkan, Anda masih dapat mengakses fitur berbayar hingga akhir siklus penagihan Anda saat ini.
                        </FaqItem>
                         <FaqItem question="Apa yang terjadi jika saya melebihi batas pada paket Basic?">
                            Jika Anda mencapai batas 50 produk pada paket Basic, Anda tidak akan bisa menambahkan produk baru. Sistem akan memberikan notifikasi dan mengarahkan Anda untuk meng-upgrade ke paket Pro untuk menikmati produk tanpa batas dan fitur canggih lainnya.
                        </FaqItem>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PaketLanggananPage;
