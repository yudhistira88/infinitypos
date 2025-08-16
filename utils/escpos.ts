import { ReceiptData, StoreSettings } from '../types';

const encoder = new TextEncoder();

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
};
const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};


// ESC/POS Commands
const INIT_PRINTER = new Uint8Array([0x1B, 0x40]);
const LINE_FEED = new Uint8Array([0x0A]);
const TEXT_ALIGN_CENTER = new Uint8Array([0x1B, 0x61, 1]);
const TEXT_ALIGN_LEFT = new Uint8Array([0x1B, 0x61, 0]);
const TEXT_BOLD_ON = new Uint8Array([0x1B, 0x45, 1]);
const TEXT_BOLD_OFF = new Uint8Array([0x1B, 0x45, 0]);
const CUT_PAPER = new Uint8Array([0x1D, 0x56, 66, 0]);
const TEXT_NORMAL_SIZE = new Uint8Array([0x1D, 0x21, 0x00]);
const TEXT_DOUBLE_HEIGHT_WIDTH = new Uint8Array([0x1D, 0x21, 0x11]);


function textToBytes(text: string): Uint8Array {
    return encoder.encode(text);
}

function createLine(left: string, right: string, width: number = 32): string {
    return left.padEnd(width - right.length) + right + '\n';
}

export function generateReceiptBytes(data: ReceiptData, settings: StoreSettings): Uint8Array {
    const { 
        items, subtotal, variationTotal, productDiscount, cartItemDiscount, manualDiscount, voucherCode, voucherDiscount,
        taxAmount, grandTotal, bon, customer, date, paymentMethod, transactionNumber 
    } = data;
    
    const cashPaid = Math.ceil(grandTotal / 1000) * 1000;
    const change = cashPaid - grandTotal;
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);


    let commands: Uint8Array[] = [];
    const separator = '--------------------------------\n';

    // Header
    commands.push(INIT_PRINTER);
    commands.push(TEXT_ALIGN_CENTER);
    commands.push(TEXT_BOLD_ON);
    commands.push(textToBytes(`${settings.name.toUpperCase()}\n`));
    commands.push(TEXT_BOLD_OFF);
    commands.push(textToBytes(`${settings.address}\n`));
    commands.push(textToBytes(`PHONE ${settings.phone}\n`));
    
    // Transaction Info
    commands.push(TEXT_ALIGN_LEFT);
    commands.push(textToBytes(`${date} ${bon}\n`));
    commands.push(textToBytes(`TRX NO:${transactionNumber}\n`));
    commands.push(textToBytes(`REG:01 CSH:13022022\n`));
    commands.push(textToBytes(`NAME:${customer || 'Umum'}\n`));
    commands.push(textToBytes(separator));
    
    // Items
    items.forEach(item => {
        if (item.isBundle) {
            const bundleTotal = formatNumber(item.price * item.quantity);
            const bundleNameWithQty = `${item.quantity}x ${item.name} [B]`;
            commands.push(textToBytes(createLine(bundleNameWithQty, bundleTotal)));
            item.bundleProducts?.forEach(bp => {
                commands.push(textToBytes(`  - ${bp.quantity}x ${bp.product.name}\n`));
            });
            return;
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
        const itemTotal = formatNumber(finalPrice * item.quantity);
        const itemNameWithQty = `${item.quantity}x ${item.name}`;
        commands.push(textToBytes(createLine(itemNameWithQty, itemTotal)));

        if (item.selectedVariations) {
            item.selectedVariations.forEach(v => {
                 const priceAdjStr = v.priceAdjustment > 0 ? `+${formatNumber(v.priceAdjustment)}` : '';
                 commands.push(textToBytes(createLine(`  + ${v.optionName}`, priceAdjStr)));
            });
        }
        
        if (item.discountAmount > 0 || manualDiscountAmount > 0) {
            const originalPriceStr = ` (@${formatNumber(item.originalPrice)})`;
            const totalItemDiscount = (item.discountAmount + manualDiscountAmount) * item.quantity;
            const discountTotalStr = `-${formatNumber(totalItemDiscount)}`;
            commands.push(textToBytes(createLine(originalPriceStr, discountTotalStr)));
        }
    });
    
    commands.push(textToBytes(separator));
    
    // Totals
    commands.push(textToBytes(createLine('SUB TOTAL', formatNumber(subtotal))));
    if (variationTotal > 0) {
        commands.push(textToBytes(createLine('BIAYA VARIASI', formatNumber(variationTotal))));
    }

    if (productDiscount > 0) {
        commands.push(textToBytes(createLine('DISKON PRODUK', `-${formatNumber(productDiscount)}`)));
    }
     if (cartItemDiscount > 0) {
        commands.push(textToBytes(createLine('DISKON MANUAL (ITEM)', `-${formatNumber(cartItemDiscount)}`)));
    }
    if (voucherCode && voucherDiscount && voucherDiscount > 0) {
        commands.push(textToBytes(createLine(`VOUCHER(${voucherCode})`, `-${formatNumber(voucherDiscount)}`)));
    }
    if (manualDiscount > 0) {
        commands.push(textToBytes(createLine('DISKON GLOBAL', `-${formatNumber(manualDiscount)}`)));
    }
    
    commands.push(textToBytes(createLine('Pajak', formatNumber(Math.round(taxAmount)))));
    commands.push(textToBytes(createLine('PAYMENT', paymentMethod.toUpperCase())));
    
    commands.push(TEXT_BOLD_ON);
    commands.push(textToBytes(createLine('TOTAL', `Rp ${formatNumber(Math.round(grandTotal))}`)));
    commands.push(TEXT_BOLD_OFF);

    if (paymentMethod === 'Tunai') {
        commands.push(textToBytes(createLine('CASH', formatNumber(cashPaid))));
        commands.push(textToBytes(createLine('KEMBALI', formatNumber(Math.round(change > 0 ? change : 0)))));
    }


    // Footer
    commands.push(textToBytes(separator));
    commands.push(TEXT_ALIGN_CENTER);
    commands.push(textToBytes(`# ITEM TERJUAL ${totalItems}\n\n\n\n`));
    
    // Combine all commands into a single Uint8Array
    const totalLength = commands.reduce((acc, val) => acc + val.length, 0);
    const receipt = new Uint8Array(totalLength);
    let offset = 0;
    for (const command of commands) {
        receipt.set(command, offset);
        offset += command.length;
    }

    return receipt;
}