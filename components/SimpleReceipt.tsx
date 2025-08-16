import React from 'react';
import { ReceiptData, StoreSettings } from '../types';

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
};

const SimpleReceipt: React.FC<{ data: ReceiptData; settings: StoreSettings }> = ({ data, settings }) => {
    const { 
        items, subtotal, variationTotal, productDiscount, cartItemDiscount, manualDiscount, voucherCode, voucherDiscount,
        taxAmount, grandTotal, bon, customer, date, paymentMethod, transactionNumber 
    } = data;
    
    // Simulate cash payment for display
    const cashPaid = Math.ceil(grandTotal / 1000) * 1000;
    const change = cashPaid - grandTotal;

    return (
        <div id="printable-receipt" className="bg-white text-black text-xs p-2 font-mono break-words" style={{ width: '280px' }}>
            <div className="text-center mb-2">
                <h1 className="text-2xl font-bold tracking-wider">{settings.name.toUpperCase()}</h1>
                <p className="text-[10px]">{settings.address}</p>
                <p className="text-[10px]">PHONE {settings.phone}</p>
            </div>
            
            <div className="text-[10px] space-y-0.5">
                <p>{date} {bon}</p>
                <p>TRX NO:{transactionNumber}</p>
                <p>REG:01 CSH:13022022</p>
                <p>NAME:{customer || 'Umum'}</p>
            </div>

            <hr className="my-1 border-t border-dashed border-black"/>
            
            <div>
                {items.map(item => {
                    if (item.isBundle) {
                        return (
                            <div key={item.id} className="mb-1">
                                <div className="flex justify-between">
                                    <span>{`${item.quantity}x ${item.name} [B]`}</span>
                                    <span>{formatNumber(item.price * item.quantity)}</span>
                                </div>
                                {item.bundleProducts?.map(bp => (
                                    <div key={bp.product.id} className="pl-2 text-[10px]">
                                        <span>- {bp.quantity}x {bp.product.name}</span>
                                    </div>
                                ))}
                            </div>
                        )
                    }

                    const priceAfterProductDiscount = item.price;
                    let manualDiscountAmount = 0;
                    if (item.cartItemDiscount.value > 0) {
                        if (item.cartItemDiscount.type === 'fixed') {
                            manualDiscountAmount = item.cartItemDiscount.value;
                        } else {
                            manualDiscountAmount = priceAfterProductDiscount * (item.cartItemDiscount.value / 100);
                        }
                    }
                    const variationPrice = item.selectedVariations?.reduce((sum, v) => sum + v.priceAdjustment, 0) || 0;
                    const finalPrice = priceAfterProductDiscount - manualDiscountAmount + variationPrice;

                    return (
                        <div key={item.id} className="mb-1">
                            <div className="flex justify-between">
                                <span>{`${item.quantity}x ${item.name}`}</span>
                                <span>{formatNumber(finalPrice * item.quantity)}</span>
                            </div>
                            {item.selectedVariations && item.selectedVariations.map(v => (
                                <div key={v.optionName} className="pl-2 flex justify-between text-[10px]">
                                    <span>+ {v.optionName}</span>
                                    {v.priceAdjustment > 0 && <span>{formatNumber(v.priceAdjustment)}</span>}
                                </div>
                            ))}
                            {(item.discountAmount > 0 || manualDiscountAmount > 0) && (
                                <div className="pl-2 flex justify-between text-[10px]">
                                    <span>(Harga Asli: {formatNumber(item.originalPrice)})</span>
                                    <span>-{formatNumber((item.discountAmount + manualDiscountAmount) * item.quantity)}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <hr className="my-1 border-t border-dashed border-black"/>
            
            <div className="space-y-0.5 text-xs">
                <div className="flex justify-between">
                    <span>SUB TOTAL</span>
                    <span>{formatNumber(subtotal)}</span>
                </div>
                 {variationTotal > 0 && (
                    <div className="flex justify-between">
                        <span>BIAYA VARIASI</span>
                        <span>{formatNumber(variationTotal)}</span>
                    </div>
                )}
                {productDiscount > 0 && (
                    <div className="flex justify-between">
                        <span>DISKON PRODUK</span>
                        <span>-{formatNumber(productDiscount)}</span>
                    </div>
                )}
                {cartItemDiscount > 0 && (
                     <div className="flex justify-between">
                        <span>DISKON MANUAL (ITEM)</span>
                        <span>-{formatNumber(cartItemDiscount)}</span>
                    </div>
                )}
                {voucherCode && voucherDiscount && voucherDiscount > 0 && (
                    <div className="flex justify-between">
                        <span>VOUCHER ({voucherCode})</span>
                        <span>-{formatNumber(voucherDiscount)}</span>
                    </div>
                )}
                {manualDiscount > 0 && (
                    <div className="flex justify-between">
                        <span>DISKON GLOBAL</span>
                        <span>-{formatNumber(manualDiscount)}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>Pajak</span>
                    <span>{formatNumber(Math.round(taxAmount))}</span>
                </div>
                <div className="flex justify-between">
                    <span>PAYMENT</span>
                    <span>{paymentMethod.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-base font-bold mt-1">
                    <span>TOTAL</span>
                    <span>Rp {formatNumber(Math.round(grandTotal))}</span>
                </div>
                {paymentMethod === 'Tunai' && (
                    <>
                        <div className="flex justify-between">
                            <span>CASH</span>
                            <span>{formatNumber(cashPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>KEMBALI</span>
                            <span>{formatNumber(Math.round(change > 0 ? change : 0))}</span>
                        </div>
                    </>
                )}
            </div>
            
             <hr className="my-1 border-t border-dashed border-black"/>
             <div className="text-center text-[10px]">
                <p># ITEM TERJUAL {items.reduce((acc, item) => acc + item.quantity, 0)}</p>
             </div>

        </div>
    );
};

export default SimpleReceipt;