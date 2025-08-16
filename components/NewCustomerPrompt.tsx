import React from 'react';

interface NewCustomerPromptProps {
    customerName: string;
    onConfirm: () => void;
    onDecline: () => void;
}

const NewCustomerPrompt: React.FC<NewCustomerPromptProps> = ({ customerName, onConfirm, onDecline }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center">
                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Tambah Pelanggan Baru?</h3>
                <p className="mt-2 text-sm text-gray-500">
                    Pelanggan "<strong className="text-gray-700">{customerName}</strong>" tidak ditemukan. Apakah Anda ingin menambahkannya ke daftar pelanggan?
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <button
                        type="button"
                        onClick={onDecline}
                        className="w-full inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        Tidak, Lanjutkan
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2 bg-blue-600 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                        Ya, Tambahkan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewCustomerPrompt;
