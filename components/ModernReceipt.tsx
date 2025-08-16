import React from 'react';
import { ReceiptData, StoreSettings } from '../types';

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
};

const ModernReceipt: React.FC<{ data: ReceiptData; settings: StoreSettings }> = ({ data, settings }) => {
    const { 
        items, subtotal, variationTotal, productDiscount, cartItemDiscount, manualDiscount, voucherCode, voucherDiscount,
        taxAmount, grandTotal, bon, customer, date, paymentMethod, transactionNumber 
    } = data;
    

    return (
        <div id="printable-receipt" className="bg-white text-gray-800 p-4 shadow-lg rounded-lg break-words" style={{ width: '280px' }}>
            {/* Header */}
            <header className="text-center mb-6">
                {settings.logoUrl && (
                    <img src={settings.logoUrl} alt="Logo Toko" className="h-16 w-16 mx-auto mb-4 rounded-full object-cover" />
                )}
                <h1 className="text-2xl font-bold text-gray-900">{settings.name}</h1>
                <p className="text-sm text-gray-500">{settings.address}</p>
                <p className="text-sm text-gray-500">{settings.phone}</p>
            </header>

            {/* Transaction Details */}
            <div className="text-sm border-t border-b border-gray-200 py-3 mb-6 space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">No. Bon:</span> <span className="font-semibold">{bon}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Transaksi Ke:</span> <span className="font-semibold">#{transactionNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tanggal:</span> <span className="font-semibold">{date}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Pelanggan:</span> <span className="font-semibold">{customer}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Kasir:</span> <span className="font-semibold">Admin</span></div>
            </div>

            {/* Items Table */}
            <div className="space-y-3 mb-4">
                {items.map(item => {
                    if (item.isBundle) {
                        return (
                            <div key={item.id} className="flex items-start text-sm">
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.name} <span className="text-xs font-bold text-blue-600">[Bundling]</span></p>
                                    <ul className="text-gray-500 text-xs pl-4">
                                        {item.bundleProducts?.map(bp => (
                                            <li key={bp.product.id}>- {bp.quantity}x {bp.product.name}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="font-semibold">{formatNumber(item.price * item.quantity)}</div>
                            </div>
                        );
                    }

                    const priceAfterProductDiscount = item.price;
                    let manualDiscountAmount = 0;
                    if (item.cartItemDiscount.value > 0) {
                         if (item.cartItemDiscount.type === 'fixed') {
                            manualDiscountAmount = item.cartItemDiscount.value;
                        } else { // percentage
                            manualDiscountAmount = priceAfterProductDiscount * (item.cartItemDiscount.value / 100);
                        }
                    }
                    const finalPrice = priceAfterProductDiscount - manualDiscountAmount;
                    const variationPrice = item.selectedVariations?.reduce((sum, v) => sum + v.priceAdjustment, 0) || 0;


                    return (
                        <div key={item.id} className="flex items-start text-sm">
                            <div className="flex-grow">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-gray-500">{item.quantity} x {formatNumber(item.originalPrice)}</p>
                                {item.selectedVariations && item.selectedVariations.map(v => (
                                    <p key={v.optionName} className="text-gray-500 text-xs pl-2">
                                        + {v.optionName} ({formatNumber(v.priceAdjustment)})
                                    </p>
                                ))}
                                {item.discountAmount > 0 && (
                                    <p className="text-red-600 text-xs">Promo Produk -{formatNumber(item.discountAmount * item.quantity)}</p>
                                )}
                                {manualDiscountAmount > 0 && (
                                    <p className="text-red-600 text-xs">Diskon Manual -{formatNumber(manualDiscountAmount * item.quantity)}</p>
                                )}
                            </div>
                            <div className="font-semibold">{formatNumber((finalPrice + variationPrice) * item.quantity)}</div>
                        </div>
                    );
                })}
            </div>

            {/* Totals Section */}
            <div className="border-t border-gray-200 pt-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span> <span>{formatNumber(subtotal)}</span></div>
                {variationTotal > 0 && <div className="flex justify-between"><span className="text-gray-500">Biaya Variasi</span> <span>{formatNumber(variationTotal)}</span></div>}
                
                {productDiscount > 0 && <div className="flex justify-between text-red-600"><span className="text-gray-500">Diskon Produk</span> <span>-{formatNumber(productDiscount)}</span></div>}
                {cartItemDiscount > 0 && <div className="flex justify-between text-red-600"><span className="text-gray-500">Diskon Manual (Item)</span> <span>-{formatNumber(cartItemDiscount)}</span></div>}
                {voucherDiscount && voucherDiscount > 0 && (
                     <div className="flex justify-between text-red-600">
                        <span className="text-gray-500">Voucher ({voucherCode})</span>
                        <span>-{formatNumber(voucherDiscount)}</span>
                    </div>
                )}
                {manualDiscount > 0 && <div className="flex justify-between text-red-600"><span className="text-gray-500">Diskon Global</span> <span>-{formatNumber(manualDiscount)}</span></div>}
                
                <div className="flex justify-between"><span className="text-gray-500">Pajak</span> <span>{formatNumber(Math.round(taxAmount))}</span></div>
                <div className="flex justify-between text-lg font-bold border-t border-dashed mt-2 pt-2">
                    <span>TOTAL</span>
                    <span>{formatNumber(Math.round(grandTotal))}</span>
                </div>
            </div>
            
            {/* Payment & Footer */}
            <footer className="text-center mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold">Dibayar dengan: {paymentMethod}</p>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(settings.name + ' - ' + bon)}`} alt="QR Code Transaksi" className="mx-auto my-4 rounded-md"/>
                <p className="text-xs text-gray-500">{settings.receiptFooter}</p>
            </footer>
        </div>
    );
};

export default ModernReceipt;