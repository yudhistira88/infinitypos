import React, { useState, useMemo, useRef } from 'react';
import { Product, Bundle, BundleProduct } from '../types';
import ProductModal from './ProductModal';

interface ProductPageProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    bundles: Bundle[];
    addBundle: (bundle: Omit<Bundle, 'id'>) => void;
    updateBundle: (bundle: Bundle) => void;
    deleteBundle: (bundleId: number) => void;
}

const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

// Helper function to get initials from a name
const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};


const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center items-center space-x-1 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md bg-white disabled:opacity-50"
            >
                &laquo;
            </button>
            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`px-3 py-1 border rounded-md ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-white'}`}
                >
                    {number}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md bg-white disabled:opacity-50"
            >
                &raquo;
            </button>
        </div>
    );
};

const BundleModal: React.FC<{
    bundle: Bundle | null,
    products: Product[],
    onClose: () => void,
    onSave: (bundle: Omit<Bundle, 'id'> | Bundle) => void,
}> = ({ bundle, products, onClose, onSave }) => {
    const isEditMode = !!bundle;
    const [formData, setFormData] = useState(bundle || { name: '', price: 0, status: 'Aktif' as 'Aktif' | 'Non-Aktif', products: [] as BundleProduct[] });
    const [productSearch, setProductSearch] = useState('');

    const includedProductDetails = useMemo(() => {
        return formData.products.map(bp => {
            const product = products.find(p => p.id === bp.productId);
            return { ...bp, name: product?.name || 'Produk tidak ditemukan' };
        }).filter(p => p.name !== 'Produk tidak ditemukan');
    }, [formData.products, products]);

    const availableProducts = useMemo(() => {
        const includedIds = new Set(formData.products.map(p => p.productId));
        return products.filter(p => !includedIds.has(p.id) && p.name.toLowerCase().includes(productSearch.toLowerCase()));
    }, [products, formData.products, productSearch]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'status') {
            setFormData(p => ({ ...p, status: value as 'Aktif' | 'Non-Aktif' }));
        } else {
            setFormData(p => ({ ...p, [name]: (name === 'price') ? Number(value) : value }));
        }
    }

    const handleProductQuantityChange = (productId: number, quantity: number) => {
        if (quantity < 1) return;
        setFormData(p => ({
            ...p,
            products: p.products.map(prod => prod.productId === productId ? { ...prod, quantity } : prod)
        }));
    };

    const addProductToBundle = (product: Product) => {
        setFormData(p => ({
            ...p,
            products: [...p.products, { productId: product.id, quantity: 1 }]
        }));
        setProductSearch('');
    };
    
    const removeProductFromBundle = (productId: number) => {
        setFormData(p => ({
            ...p,
            products: p.products.filter(prod => prod.productId !== productId)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const inputClass = "block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
                 <form onSubmit={handleSubmit}>
                     <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Paket Bundling' : 'Buat Paket Bundling'}</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                    </div>
                     <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-1">Nama Bundling</label><input type="text" name="name" id="name" required value={formData.name} onChange={handleFormChange} className={inputClass} /></div>
                            <div><label htmlFor="price" className="text-sm font-medium text-gray-700 block mb-1">Harga Bundling</label><input type="number" name="price" id="price" required value={formData.price} onChange={handleFormChange} className={inputClass} /></div>
                         </div>
                        
                         <div className="p-4 bg-gray-50 rounded-lg border">
                            <h3 className="text-md font-semibold text-gray-800 mb-2">Produk dalam Bundling</h3>
                            <div className="space-y-2">
                                {includedProductDetails.map(p => (
                                    <div key={p.productId} className="flex items-center gap-2 bg-white p-2 rounded-md border">
                                        <p className="flex-grow text-sm font-medium">{p.name}</p>
                                        <input type="number" value={p.quantity} onChange={(e) => handleProductQuantityChange(p.productId, Number(e.target.value))} className="w-16 text-center border-gray-300 rounded-md text-sm p-1" />
                                        <button type="button" onClick={() => removeProductFromBundle(p.productId)} className="text-red-500 hover:text-red-700 p-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>
                                    </div>
                                ))}
                                {formData.products.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Belum ada produk ditambahkan.</p>}
                            </div>

                            <div className="mt-3">
                                <input type="search" placeholder="Cari untuk tambah produk..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className={inputClass} />
                                {productSearch && (
                                    <div className="mt-1 border rounded-md max-h-40 overflow-y-auto bg-white">
                                        {availableProducts.map(p => (
                                            <button type="button" key={p.id} onClick={() => addProductToBundle(p)} className="w-full text-left p-2 text-sm hover:bg-gray-100">{p.name}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                         </div>
                        <div><label htmlFor="status" className="text-sm font-medium text-gray-700 block mb-1">Status</label><select name="status" id="status" value={formData.status} onChange={handleFormChange} className={inputClass}><option value="Aktif">Aktif</option><option value="Non-Aktif">Non-Aktif</option></select></div>
                     </div>
                     <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse rounded-b-xl">
                        <button type="submit" className="inline-flex justify-center rounded-lg shadow-sm px-5 py-2.5 bg-blue-600 text-base font-medium text-white hover:bg-blue-700">Simpan Bundling</button>
                        <button type="button" onClick={onClose} className="mr-3 inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


const ProductPage: React.FC<ProductPageProps> = ({ products, setProducts, bundles, addBundle, updateBundle, deleteBundle }) => {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
    const [activeTab, setActiveTab] = useState('Produk');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const categories = useMemo(() => {
        const categoryCount = products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(categoryCount).map(([name, count]) => ({ name, count }));
    }, [products]);

    const handleEditProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    const handleAddProductClick = () => {
        setSelectedProduct(null);
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = (productToSave: Omit<Product, 'id'> & { id?: number }) => {
        if (productToSave.id) { // Editing existing product
            setProducts(products.map(p => p.id === productToSave.id ? { ...p, ...productToSave } as Product : p));
        } else { // Adding new product
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            const newProduct: Product = { ...productToSave, id: newId };
            setProducts([newProduct, ...products]);
        }
        setIsProductModalOpen(false);
    };

    const handleDeleteProduct = (productId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            setProducts(products.filter(p => p.id !== productId));
        }
    };
    
    // Bundle Modal Handlers
    const handleAddBundleClick = () => {
        setSelectedBundle(null);
        setIsBundleModalOpen(true);
    };
    
    const handleEditBundleClick = (bundle: Bundle) => {
        setSelectedBundle(bundle);
        setIsBundleModalOpen(true);
    };
    
    const handleSaveBundle = (bundleToSave: Omit<Bundle, 'id'> | Bundle) => {
        if ('id' in bundleToSave) {
            updateBundle(bundleToSave);
        } else {
            addBundle(bundleToSave);
        }
        setIsBundleModalOpen(false);
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);
    
    const filteredBundles = useMemo(() => {
        return bundles.filter(bundle => 
            bundle.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bundles, searchTerm]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil((activeTab === 'Produk' ? filteredProducts.length : filteredBundles.length) / ITEMS_PER_PAGE);

    const getDiscountedPrice = (product: Product): number => {
        if (!product.discount) return product.price;
        if (product.discount.type === 'fixed') {
            return product.price - product.discount.value;
        }
        return product.price * (1 - product.discount.value / 100);
    };

    const tabItems = [
        { name: 'Produk', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>, count: products.length },
        { name: 'Bundling', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a2 2 0 002 2v2" /></svg>, count: bundles.length },
        { name: 'Kategori', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v-3c0-1.1.9-2 2-2z" /></svg>, count: categories.length },
    ];


    return (
        <>
            <div className="bg-white rounded-xl shadow-lg">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                           <h2 className="text-2xl font-bold text-gray-800">Manajemen Data</h2>
                           <p className="text-sm text-gray-500 mt-1">Kelola produk, bundling, variasi, dan kategori Anda di sini.</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="relative flex-grow">
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                <input
                                    type="text"
                                    placeholder={activeTab === 'Produk' ? "Cari produk..." : "Cari bundling..."}
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button onClick={activeTab === 'Bundling' ? handleAddBundleClick : handleAddProductClick} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center shrink-0">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                {activeTab === 'Bundling' ? 'Tambah Bundling' : 'Tambah Produk'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        {tabItems.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`${activeTab === tab.name ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                            >
                                {tab.icon}
                                {tab.name}
                                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.name ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {activeTab === 'Produk' && (
                    <div className="p-4 sm:p-6">
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">Produk</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">Keterangan</th>
                                        <th className="py-3 px-4 text-center font-semibold text-gray-600">Variasi</th>
                                        <th className="py-3 px-4 text-right font-semibold text-gray-600">Harga</th>
                                        <th className="py-3 px-4 text-center font-semibold text-gray-600">Stok</th>
                                        <th className="py-3 px-4 text-center font-semibold text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-md bg-gray-100 flex-shrink-0">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover rounded-md" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-gray-200 rounded-md">
                                                                <span className="text-sm font-bold text-gray-500 select-none">
                                                                    {getInitials(product.name)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-800">{product.name}</div>
                                                        <div className="text-gray-500 text-xs">{product.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={product.description}>
                                                {product.description || '-'}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-center">
                                                {product.variations && product.variations.length > 0 ? (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {product.variations.length} Grup
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-right font-medium">
                                                {product.discount ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-red-600">{formatRupiah(getDiscountedPrice(product))}</span>
                                                        <span className="text-gray-400 line-through text-xs">{formatRupiah(product.price)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-800">{formatRupiah(product.price)}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    product.stock <= 5 ? 'bg-red-100 text-red-800' :
                                                    product.stock <= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => handleEditProductClick(product)} className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Edit ${product.name}`}>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(product.id)} className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Delete ${product.name}`}>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredProducts.length === 0 && (
                             <div className="text-center py-16 text-gray-500">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-800">Produk tidak ditemukan</h3>
                                <p className="mt-1">Coba kata kunci lain atau tambahkan produk baru.</p>
                            </div>
                        )}
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                )}
                {activeTab === 'Bundling' && (
                     <div className="p-4 sm:p-6">
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">Nama Bundling</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">Isi Produk</th>
                                        <th className="py-3 px-4 text-right font-semibold text-gray-600">Harga</th>
                                        <th className="py-3 px-4 text-center font-semibold text-gray-600">Status</th>
                                        <th className="py-3 px-4 text-center font-semibold text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredBundles.map((bundle) => (
                                        <tr key={bundle.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-800">{bundle.name}</td>
                                            <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                                                {bundle.products.length} Produk
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-right font-medium text-gray-800">{formatRupiah(bundle.price)}</td>
                                            <td className="py-3 px-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    bundle.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {bundle.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => handleEditBundleClick(bundle)} className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button>
                                                    <button onClick={() => deleteBundle(bundle.id)} className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </div>
                )}
                {activeTab === 'Kategori' && (
                     <div className="p-4 sm:p-6">
                        <div className="flex justify-end mb-4">
                             <button onClick={() => alert('Fitur tambah kategori akan segera hadir!')} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Tambah Kategori
                            </button>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-600">Nama Kategori</th>
                                        <th className="py-3 px-4 text-center font-semibold text-gray-600">Jumlah Produk</th>
                                        <th className="py-3 px-4 text-center font-semibold text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {categories.map((category) => (
                                        <tr key={category.name} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-800">{category.name}</td>
                                            <td className="py-3 px-4 text-center text-gray-600">{category.count}</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => alert(`Fitur edit untuk ${category.name} akan segera hadir!`)} className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Edit ${category.name}`}>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                                    </button>
                                                    <button onClick={() => alert(`Fitur hapus untuk ${category.name} akan segera hadir!`)} className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label={`Delete ${category.name}`}>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            {isProductModalOpen && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setIsProductModalOpen(false)}
                    onSave={handleSaveProduct}
                />
            )}
            {isBundleModalOpen && (
                 <BundleModal
                    bundle={selectedBundle}
                    products={products}
                    onClose={() => setIsBundleModalOpen(false)}
                    onSave={handleSaveBundle}
                />
            )}
        </>
    );
};

export default ProductPage;