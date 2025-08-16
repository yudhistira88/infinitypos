import React from 'react';
import { Bundle } from '../types';
import { DEFAULT_BUNDLE_IMAGE_URL } from '../constants';

interface BundleCardProps {
    bundle: Bundle;
    onAddBundleToCart: (bundle: Bundle) => void;
}

const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price).replace(/\s/g, '');
}

const BundleCard: React.FC<BundleCardProps> = ({ bundle, onAddBundleToCart }) => {
    const isInactive = bundle.status === 'Non-Aktif';
    const imageUrl = bundle.imageUrl || DEFAULT_BUNDLE_IMAGE_URL;

    return (
        <div 
            className={`rounded-xl border border-gray-200 overflow-hidden flex flex-col group relative transition-all duration-300 ${
                isInactive ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:shadow-lg hover:border-blue-400 hover:-translate-y-1'
            }`}
            onClick={() => !isInactive && onAddBundleToCart(bundle)}
        >
            <div className="relative">
                <div className="aspect-[4/3] bg-gray-100">
                    <img 
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isInactive ? 'grayscale' : ''}`} 
                        src={imageUrl} 
                        alt={bundle.name} 
                    />
                </div>
                <span className={`absolute top-2.5 right-2.5 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${
                    isInactive ? 'bg-red-100/80 text-red-900' : 'bg-green-100/80 text-green-900'
                }`}>
                    {isInactive ? 'Non-Aktif' : 'Tersedia'}
                </span>
                 {isInactive && (
                     <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="font-bold text-gray-600">NON-AKTIF</span>
                    </div>
                )}
            </div>
            <div className="p-4 text-left flex-grow flex flex-col justify-between bg-white">
                <div>
                    <h3 className="text-md font-semibold text-gray-800 leading-tight truncate">{bundle.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">Paket Bundling</p>
                </div>
                <div className="flex justify-between items-center mt-3">
                     <p className="text-lg font-bold text-gray-900">
                        {formatRupiah(bundle.price)}
                     </p>
                     <button
                        aria-label={`Tambah ${bundle.name} ke keranjang`}
                        disabled={isInactive}
                        className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-700 disabled:opacity-20 disabled:cursor-not-allowed translate-y-2 group-hover:translate-y-0"
                    >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BundleCard;
