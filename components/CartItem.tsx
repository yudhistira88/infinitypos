import React, { useState, useMemo } from 'react';
import { CartItem as CartItemType } from '../types';

interface CartItemProps {
    item: CartItemType;
    onRemoveFromCart: (productId: number) => void;
    onUpdateQuantity: (productId: number, quantity: number) => void;
    onUpdateCartItemDiscount: (productId: number, discount: { type: 'percentage' | 'fixed'; value: number; }) => void;
}

const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(price);
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemoveFromCart, onUpdateQuantity, onUpdateCartItemDiscount }) => {
    const [showDiscountInput, setShowDiscountInput] = useState(false);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = parseInt(e.target.value, 10);
        if (!isNaN(newQuantity)) {
            onUpdateQuantity(item.id, newQuantity > 0 ? newQuantity : 1);
        }
    };

    const handleDiscountChange = (field: 'type' | 'value', value: string | number) => {
        const newDiscount = { ...item.cartItemDiscount };
        if (field === 'type') {
            newDiscount.type = value as 'fixed' | 'percentage';
        } else {
            newDiscount.value = Number(value) < 0 ? 0 : Number(value);
        }
        onUpdateCartItemDiscount(item.id, newDiscount);
    };
    
    const { finalPrice, manualDiscountAmount, variationPriceAdjustment } = useMemo(() => {
        let price = item.price; // Price after product-level promo
        let manualDiscountAmount = 0;
        const variationPriceAdjustment = item.selectedVariations?.reduce((sum, v) => sum + v.priceAdjustment, 0) || 0;

        // Apply manual discount
        if (item.cartItemDiscount && item.cartItemDiscount.value > 0) {
            if (item.cartItemDiscount.type === 'fixed') {
                manualDiscountAmount = item.cartItemDiscount.value;
            } else { // percentage
                manualDiscountAmount = (price + variationPriceAdjustment) * (item.cartItemDiscount.value / 100);
            }
        }
        
        const finalPrice = price + variationPriceAdjustment;
        manualDiscountAmount = Math.min(manualDiscountAmount, finalPrice);
        
        return { finalPrice: finalPrice - manualDiscountAmount, manualDiscountAmount, variationPriceAdjustment };
    }, [item.price, item.cartItemDiscount, item.selectedVariations]);

    
    return (
        <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg">
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />

            <div className="flex-grow">
                <p className="font-semibold text-sm text-gray-800">
                    {item.name}
                    {item.isBundle && <span className="ml-2 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Bundling</span>}
                </p>
                
                {item.selectedVariations && item.selectedVariations.length > 0 && (
                     <ul className="text-xs text-gray-500 mt-1 space-y-0.5 list-disc list-inside">
                        {item.selectedVariations.map(v => (
                            <li key={v.optionName}>
                                {v.variationName}: {v.optionName}
                                {v.priceAdjustment > 0 && <span className="text-green-700"> (+{formatRupiah(v.priceAdjustment)})</span>}
                            </li>
                        ))}
                    </ul>
                )}


                {item.isBundle ? (
                    <ul className="text-xs text-gray-500 mt-1 space-y-0.5 list-disc list-inside">
                        {item.bundleProducts?.map(bp => (
                            <li key={bp.product.id}>{bp.quantity}x {bp.product.name}</li>
                        ))}
                    </ul>
                ) : (
                     <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        {finalPrice < item.originalPrice ? (
                            <>
                                <span className="text-red-600 font-bold">{formatRupiah(item.price + variationPriceAdjustment)}</span>
                                <span className="line-through ml-1.5">{formatRupiah(item.originalPrice)}</span>
                            </>
                        ) : (
                            formatRupiah(item.originalPrice + variationPriceAdjustment)
                        )}
                        {item.unit ? ` / ${item.unit}` : ''}
                        {item.discountAmount > 0 && <div className="text-green-700">Promo: -{formatRupiah(item.discountAmount)}</div>}
                        {manualDiscountAmount > 0 && <div className="text-green-700">Diskon: -{formatRupiah(manualDiscountAmount)}</div>}
                    </div>
                )}


                <div className="flex items-center mt-2">
                    <div className="flex items-center">
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md border text-gray-600 bg-white hover:bg-gray-100 transition-colors"
                            aria-label="Kurangi kuantitas"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={item.quantity}
                            onChange={handleQuantityChange}
                            className="w-10 text-center border-t border-b border-gray-200 bg-white text-sm p-1 h-6 focus:outline-none"
                            min="1"
                        />
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md border text-gray-600 bg-white hover:bg-gray-100 transition-colors"
                            aria-label="Tambah kuantitas"
                        >
                            +
                        </button>
                    </div>
                    {!item.isBundle && (
                        <button onClick={() => setShowDiscountInput(p => !p)} className="ml-3 text-xs font-semibold text-blue-600 hover:text-blue-800">
                            Diskon
                        </button>
                    )}
                </div>

                {showDiscountInput && !item.isBundle && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-gray-100 rounded-md">
                        <div className="relative flex-grow">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                <span className="text-gray-500 sm:text-xs">{item.cartItemDiscount.type === 'fixed' ? 'Rp' : '%'}</span>
                            </div>
                            <input
                                type="number"
                                value={item.cartItemDiscount.value}
                                onChange={(e) => handleDiscountChange('value', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm pl-7 text-sm py-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={item.cartItemDiscount.type}
                            onChange={(e) => handleDiscountChange('type', e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm text-sm py-1 h-full focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="fixed">Rp</option>
                            <option value="percentage">%</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="text-right flex-shrink-0 flex flex-col items-end justify-between self-stretch">
                <button 
                    onClick={() => onRemoveFromCart(item.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    aria-label={`Hapus ${item.name}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                 <p className="font-bold text-sm text-gray-800 mt-auto">{formatRupiah(item.isBundle ? item.price * item.quantity : finalPrice * item.quantity)}</p>
            </div>
        </div>
    );
};

export default CartItem;