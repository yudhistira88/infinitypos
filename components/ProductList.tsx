import React from 'react';
import { Product, Bundle } from '../types';
import ProductCard from './ProductCard';
import BundleCard from './BundleCard';

interface ProductListProps {
    products: Product[];
    bundles: Bundle[];
    onAddToCart: (product: Product) => void;
    onAddBundleToCart: (bundle: Bundle) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    categories: string[];
}

const ProductList: React.FC<ProductListProps> = ({ 
    products, 
    bundles,
    onAddToCart, 
    onAddBundleToCart,
    searchTerm, 
    setSearchTerm, 
    selectedCategory, 
    setSelectedCategory,
    categories
}) => {
    // Bundles should also be filterable by search term
    const filteredBundles = bundles.filter(bundle => 
        bundle.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-sm">
             <div className="p-4 space-y-4">
                <div className="relative">
                    <svg className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input
                        type="text"
                        placeholder={selectedCategory === 'Bundling' ? "Cari paket bundling..." : "Cari menu berdasarkan nama..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="relative">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                    selectedCategory === cat 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 border-t border-gray-200">
                {selectedCategory === 'Bundling' ? (
                    filteredBundles.length > 0 ? filteredBundles.map(bundle => (
                        <BundleCard
                            key={bundle.id}
                            bundle={bundle}
                            onAddBundleToCart={onAddBundleToCart}
                        />
                    )) : (
                         <div className="col-span-full text-center text-gray-500 py-16">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" /></svg>
                            <h3 className="text-lg font-semibold text-gray-700">Paket Bundling Tidak Ditemukan</h3>
                            <p className="mt-1">Coba kata kunci atau kategori yang lain.</p>
                        </div>
                    )
                ) : (
                    products.length > 0 ? products.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onAddToCart={onAddToCart}
                        />
                    )) : (
                        <div className="col-span-full text-center text-gray-500 py-16">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <h3 className="text-lg font-semibold text-gray-700">Menu Tidak Ditemukan</h3>
                            <p className="mt-1">Coba kata kunci atau kategori yang lain.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ProductList;