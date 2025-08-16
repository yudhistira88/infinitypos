import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CartItem as CartItemType, Customer } from '../types';
import CartItem from './CartItem';

interface CartProps {
    items: { [category: string]: CartItemType[] };
    onRemoveFromCart: (productId: number) => void;
    onUpdateQuantity: (productId: number, quantity: number) => void;
    onUpdateCartItemDiscount: (productId: number, discount: { type: 'percentage' | 'fixed'; value: number; }) => void;
    onCheckout: () => void;
    
    // Calculation results from Kasir component
    subtotal: number;
    productDiscount: number;
    cartItemDiscount: number;
    voucherDiscount: number;
    manualDiscount: number;
    taxAmount: number;
    grandTotal: number;

    // State setters for manual discount
    discountPercent: number;
    setDiscountPercent: (value: number) => void;
    discountRp: number;
    setDiscountRp: (value: number) => void;
    
    // Other props
    bonNumber: string;
    customerName: string;
    setCustomerName: (name: string) => void;
    customers: Customer[];
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
    voucherCode: string;
    setVoucherCode: (code: string) => void;
    onApplyVoucher: () => void;
    onRemoveVoucher: () => void;
    appliedVoucher: { code: string; discount: number } | null;
    voucherError: string | null;
    setVoucherError: (error: string | null) => void;
}

const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(price);
}

const SummaryRow: React.FC<{ label: string; children: React.ReactNode; isBold?: boolean; className?: string; isDiscount?: boolean }> = ({ label, children, isBold, className = '', isDiscount }) => (
    <div className={`flex justify-between items-center ${isBold ? 'font-semibold text-gray-800' : 'text-sm text-gray-600'} ${className}`}>
        <span>{label}</span>
        <span className={`${isBold ? 'text-xl' : ''} ${isDiscount ? 'text-red-600' : ''}`}>{children}</span>
    </div>
);


const Cart: React.FC<CartProps> = ({ 
    items, onRemoveFromCart, onUpdateQuantity, onUpdateCartItemDiscount, onCheckout,
    subtotal, productDiscount, cartItemDiscount, voucherDiscount, manualDiscount, taxAmount, grandTotal,
    discountPercent, setDiscountPercent, discountRp, setDiscountRp,
    bonNumber, customerName, setCustomerName, customers, paymentMethod, setPaymentMethod,
    voucherCode, setVoucherCode, onApplyVoucher, onRemoveVoucher, appliedVoucher, voucherError, setVoucherError
}) => {
    const categories = Object.keys(items);
    const [isCustomerListVisible, setIsCustomerListVisible] = useState(false);
    const customerInputRef = useRef<HTMLDivElement>(null);

    const filteredCustomers = useMemo(() => {
        if (!customerName) return customers;
        return customers.filter(c => 
            c.name.toLowerCase().includes(customerName.toLowerCase())
        );
    }, [customers, customerName]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (customerInputRef.current && !customerInputRef.current.contains(event.target as Node)) {
                setIsCustomerListVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCustomerSelect = (name: string) => {
        setCustomerName(name);
        setIsCustomerListVisible(false);
    };
    
    return (
        <div className="bg-white rounded-xl shadow-sm flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Keranjang
                </h2>
                <p className="text-sm text-gray-500 mt-1">No. Bon: <span className="font-medium text-gray-700">{bonNumber}</span></p>
            </div>
            
            {/* Customer & Order Info */}
            <div className="p-4 space-y-4 border-b border-gray-200">
                <div className="relative" ref={customerInputRef}>
                    <label htmlFor="customerName" className="text-sm font-medium text-gray-700 mb-1 block">Customer</label>
                    <input 
                        id="customerName"
                        type="text" 
                        placeholder="Cari atau masukkan nama baru" 
                        value={customerName}
                        onChange={(e) => {
                            setCustomerName(e.target.value);
                            if (!isCustomerListVisible) setIsCustomerListVisible(true);
                        }}
                        onFocus={() => setIsCustomerListVisible(true)}
                        autoComplete="off"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {isCustomerListVisible && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map(customer => (
                                    <button
                                        type="button"
                                        key={customer.id}
                                        onClick={() => handleCustomerSelect(customer.name)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {customer.name}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-500">
                                    {customerName ? "Tidak ada pelanggan ditemukan." : "Mulai ketik untuk mencari..."}
                                </div>
                            )}
                            <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
                                Anda juga bisa memasukkan nama baru secara langsung.
                            </div>
                        </div>
                    )}
                </div>
                <div>
                     <label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700 mb-1 block">Metode Pembayaran</label>
                    <select 
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option>Tunai</option>
                        <option>QRIS</option>
                        <option>Kartu Debit</option>
                        <option>Kartu Kredit</option>
                    </select>
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-2">
                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="mt-4 font-semibold text-gray-700">Keranjang Anda Kosong</p>
                        <p className="text-sm">Silakan pilih produk dari daftar di sebelah kiri.</p>
                    </div>
                ) : (
                     <div className="divide-y divide-gray-100">
                        {categories.flatMap(category => items[category]).map(item => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onRemoveFromCart={onRemoveFromCart}
                                onUpdateQuantity={onUpdateQuantity}
                                onUpdateCartItemDiscount={onUpdateCartItemDiscount}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Summary & Checkout */}
            {categories.length > 0 && (
                 <div className="mt-auto bg-gray-50 rounded-b-xl border-t border-gray-200">
                    <div className="p-4 space-y-3">
                        <SummaryRow label="Subtotal">Rp {formatRupiah(subtotal)}</SummaryRow>
                        
                        {productDiscount > 0 && <SummaryRow label="Diskon Produk" isDiscount>-Rp {formatRupiah(productDiscount)}</SummaryRow>}
                        {cartItemDiscount > 0 && <SummaryRow label="Diskon Manual (Item)" isDiscount>-Rp {formatRupiah(cartItemDiscount)}</SummaryRow>}


                        {/* VOUCHER SECTION */}
                        {!appliedVoucher ? (
                            <div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Kode Voucher" 
                                        value={voucherCode} 
                                        onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError(null); }}
                                        className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button 
                                        onClick={onApplyVoucher}
                                        disabled={!voucherCode}
                                        className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-md text-sm hover:bg-gray-900 transition-colors disabled:bg-gray-300"
                                    >
                                        Pakai
                                    </button>
                                </div>
                                {voucherError && <p className="text-xs text-red-500 mt-1.5">{voucherError}</p>}
                            </div>
                        ) : (
                             <SummaryRow label={`Voucher (${appliedVoucher.code})`} isDiscount>
                                <div className="flex items-center">
                                    <span className="font-bold mr-2">-Rp {formatRupiah(voucherDiscount)}</span>
                                    <button onClick={onRemoveVoucher} className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                             </SummaryRow>
                        )}

                        {/* MANUAL DISCOUNT */}
                        <div className={`transition-opacity duration-300 ${appliedVoucher ? 'opacity-40 cursor-not-allowed' : ''}`}>
                             <div className="flex justify-between items-center">
                                 <span className="text-sm text-gray-600">Diskon Global</span>
                                 <div className="flex items-center gap-2 w-1/2">
                                     <div className="relative flex-grow"><input type="number" value={discountPercent} onChange={e => setDiscountPercent(parseFloat(e.target.value) || 0)} disabled={!!appliedVoucher} className="w-full text-right border-gray-300 rounded-md px-2 py-1 text-sm disabled:bg-gray-100"/><span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span></div>
                                     <div className="relative flex-grow"><input type="number" value={discountRp} onChange={e => setDiscountRp(parseFloat(e.target.value) || 0)} disabled={!!appliedVoucher} className="w-full text-right border-gray-300 rounded-md pl-7 pr-2 py-1 text-sm disabled:bg-gray-100"/><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Rp</span></div>
                                 </div>
                             </div>
                        </div>

                        {manualDiscount > 0 && !appliedVoucher && <SummaryRow label="Total Diskon Global" isDiscount>-Rp {formatRupiah(manualDiscount)}</SummaryRow>}

                        <SummaryRow label={`Pajak`}>Rp {formatRupiah(taxAmount)}</SummaryRow>
                        
                        <div className="border-t border-dashed border-gray-300 !my-2"></div>
                        
                        <SummaryRow label="Grand Total" isBold className="!text-blue-600">
                             <span>Rp {formatRupiah(grandTotal)}</span>
                        </SummaryRow>
                    </div>
                    <div className="p-4 border-t border-gray-200">
                        <button onClick={onCheckout} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center text-md shadow-sm active:bg-blue-800">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Bayar & Cetak Struk
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;