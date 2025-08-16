import React from 'react';

const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

interface QrisModalProps {
    onConfirm: () => void;
    onClose: () => void;
    amount: number;
    storeName: string;
    bonNumber: string;
}

const QrisModal: React.FC<QrisModalProps> = ({ onConfirm, onClose, amount, storeName, bonNumber }) => {
    // A real QRIS payload would follow the EMVCo standard.
    // This is a simplified version for display purposes.
    const qrData = `QRIS Payment\nStore: ${storeName}\nBon: ${bonNumber}\nAmount: ${amount}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[70] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col p-6 transform transition-all duration-300 scale-95 animate-scale-in">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Pembayaran QRIS</h2>
                    <p className="text-gray-500 mt-1">Pindai kode QR di bawah ini dengan aplikasi pembayaran favorit Anda.</p>
                </div>

                <div className="my-6 p-4 border-4 border-gray-800 rounded-xl bg-white self-center">
                    <img src={qrUrl} alt="QR Code Pembayaran" className="w-48 h-48 rounded-md" />
                </div>

                <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">Total Pembayaran</p>
                    <p className="text-3xl font-extrabold text-blue-900 tracking-tight">{formatRupiah(amount)}</p>
                </div>

                <div className="text-center my-4 text-sm text-gray-500">
                    <p>Menunggu pembayaran...</p>
                </div>

                <div className="mt-auto space-y-3">
                    <button 
                        onClick={onConfirm} 
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg shadow-lg active:bg-blue-800 flex items-center justify-center"
                    >
                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Saya Sudah Bayar
                    </button>
                    <button 
                        onClick={onClose} 
                        className="w-full bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QrisModal;