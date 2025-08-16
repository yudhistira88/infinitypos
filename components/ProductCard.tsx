import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price).replace(/\s/g, '');
}

const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};

const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
    let bgColor, textColor, text;

    if (stock > 10) {
        bgColor = 'bg-green-100/80 backdrop-blur-sm';
        textColor = 'text-green-900';
        text = `Stok: ${stock}`;
    } else if (stock > 0) {
        bgColor = 'bg-yellow-100/80 backdrop-blur-sm';
        textColor = 'text-yellow-900';
        text = `Stok: ${stock}`;
    } else {
        bgColor = 'bg-red-100/80 backdrop-blur-sm';
        textColor = 'text-red-900';
        text = 'Habis';
    }

    return (
        <span className={`absolute top-2.5 right-2.5 text-xs font-bold px-2.5 py-1 rounded-full ${bgColor} ${textColor}`}>
            {text}
        </span>
    );
};


const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    const isOutOfStock = product.stock <= 0;
    const hasVariations = product.variations && product.variations.length > 0;

    return (
        <div 
            className={`rounded-xl border border-slate-200 overflow-hidden flex flex-col group relative transition-all duration-300 ${
                isOutOfStock ? 'cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:shadow-lg hover:border-blue-400 hover:-translate-y-1'
            }`}
            onClick={() => !isOutOfStock && onAddToCart(product)}
        >
            <div className="relative">
                <div className="aspect-[4/3] bg-slate-100">
                     {product.imageUrl ? (
                        <img 
                            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'grayscale' : ''}`} 
                            src={product.imageUrl} 
                            alt={product.name} 
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-slate-200 ${isOutOfStock ? 'grayscale' : ''}`}>
                            <span className="text-3xl font-bold text-slate-400 select-none">
                                {getInitials(product.name)}
                            </span>
                        </div>
                    )}
                </div>
                <StockBadge stock={product.stock} />
                {isOutOfStock && (
                     <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="font-bold text-slate-600">STOK HABIS</span>
                    </div>
                )}
            </div>
            <div className="p-4 text-left flex-grow flex flex-col justify-between bg-white">
                <div>
                    <h3 className="text-md font-semibold text-slate-800 leading-tight truncate flex items-center gap-1.5">
                        {product.name}
                        {hasVariations && (
                             <span title="Produk ini memiliki variasi">
                                <svg className="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 110 4H4a2 2 0 01-2-2z" /></svg>
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-slate-500">{product.category}</p>
                </div>
                <div className="flex justify-between items-center mt-3">
                     <p className="text-lg font-bold text-slate-900">
                        {formatRupiah(product.price)}
                        {product.unit && <span className="text-sm font-normal text-slate-500">/{product.unit}</span>}
                     </p>
                     <button
                        aria-label={`Tambah ${product.name} ke keranjang`}
                        disabled={isOutOfStock}
                        className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-700 disabled:opacity-20 disabled:cursor-not-allowed translate-y-2 group-hover:translate-y-0"
                    >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;