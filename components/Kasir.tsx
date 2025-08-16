import React, { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import { Product, CartItem, ReceiptData, StoreSettings, Order, Voucher, Customer, Bundle, SelectedVariation, ProductVariation, ProductVariationOption } from '../types';
import ProductList from './ProductList';
import Cart from './Cart';
import Receipt from './Receipt';
import { PrinterContext } from '../contexts/PrinterContext';
import { generateReceiptBytes } from '../utils/escpos';
import NewCustomerPrompt from './NewCustomerPrompt';
import CustomerModal from './CustomerModal';
import { DEFAULT_BUNDLE_IMAGE_URL } from '../constants';
import QrisModal from './QrisModal';

interface KasirProps {
    products: Product[];
    storeSettings: StoreSettings;
    addOrder: (receiptData: ReceiptData) => void;
    orders: Order[];
    vouchers: Voucher[];
    bundles: Bundle[];
    customers: Customer[];
    addCustomer: (customer: Omit<Customer, 'id'>) => void;
    handleCustomerTransaction: (customerName: string, spend: number) => void;
}

const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

// Generates a plain text summary of the receipt for digital sharing
const generateReceiptText = (data: ReceiptData, settings: StoreSettings): string => {
    let text = `*Struk Digital - ${settings.name}*\n\n`;
    text += `No. Bon: *${data.bon}*\n`;
    text += `Transaksi Ke: #${data.transactionNumber}\n`;
    text += `Tanggal: ${data.date}\n`;
    text += `Pelanggan: ${data.customer}\n`;
    text += `--------------------------------\n\n`;

    data.items.forEach(item => {
        text += `*${item.name}${item.isBundle ? ' [BUNDLING]' : ''}*\n`;
        if (item.isBundle && item.bundleProducts) {
            item.bundleProducts.forEach(bp => {
                text += `  - ${bp.quantity}x ${bp.product.name}\n`;
            });
            text += `${item.quantity} x ${formatRupiah(item.price)} = *${formatRupiah(item.price * item.quantity)}*\n\n`;
        } else {
            const variationPrice = item.selectedVariations?.reduce((s, v) => s + v.priceAdjustment, 0) || 0;
            text += `${item.quantity} x ${formatRupiah(item.originalPrice + variationPrice)} = *${formatRupiah((item.price + variationPrice) * item.quantity)}*\n`;
             if (item.selectedVariations) {
                item.selectedVariations.forEach(v => {
                    text += `  + ${v.optionName}\n`;
                });
            }
            if(item.discountAmount > 0) {
                text += `  (Diskon -${formatRupiah(item.discountAmount * item.quantity)})\n`;
            }
            text += `\n`;
        }
    });

    text += `--------------------------------\n`;
    text += `Subtotal: ${formatRupiah(data.subtotal)}\n`;
    if (data.variationTotal > 0) text += `Biaya Variasi: ${formatRupiah(data.variationTotal)}\n`;

    if (data.productDiscount > 0) text += `Diskon Produk: -${formatRupiah(data.productDiscount)}\n`;
    if (data.voucherDiscount && data.voucherDiscount > 0) text += `Voucher (${data.voucherCode}): -${formatRupiah(data.voucherDiscount)}\n`;
    if (data.manualDiscount > 0) text += `Diskon Manual: -${formatRupiah(data.manualDiscount)}\n`;
    
    text += `Pajak: ${formatRupiah(data.taxAmount)}\n`;
    text += `*TOTAL: ${formatRupiah(data.grandTotal)}*\n\n`;

    text += `Metode Bayar: ${data.paymentMethod}\n\n`;
    text += `_${settings.receiptFooter || 'Terima kasih telah berbelanja!'}_\n`;

    return text;
};


const BundleSuggestionModal: React.FC<{
    suggestion: { product: Product, bundles: Bundle[] };
    onAddBundle: (bundle: Bundle) => void;
    onAddProduct: (product: Product) => void;
    onClose: () => void;
}> = ({ suggestion, onAddBundle, onAddProduct, onClose }) => {
    const { product, bundles } = suggestion;
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-gray-800">Tersedia Paket Bundling!</h3>
                <p className="mt-2 text-sm text-gray-600">
                    Produk "{product.name}" tersedia dalam paket bundling berikut dengan harga lebih hemat.
                </p>
                <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
                    {bundles.map(bundle => (
                        <button key={bundle.id} onClick={() => onAddBundle(bundle)} className="w-full text-left p-3 border rounded-lg hover:bg-gray-100 hover:border-blue-500 transition-colors">
                            <p className="font-semibold text-blue-700">{bundle.name}</p>
                            <p className="text-sm font-bold">{formatRupiah(bundle.price)}</p>
                        </button>
                    ))}
                </div>
                 <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={() => onAddProduct(product)} className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        Tidak, Tambah Produk Saja
                    </button>
                    <button onClick={onClose} className="w-full sm:w-auto px-4 py-2 border rounded-md bg-gray-600 text-sm font-semibold text-white hover:bg-gray-700">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
};

const VariationSelectionModal: React.FC<{
    product: Product;
    onClose: () => void;
    onAddToCart: (product: Product, selectedVariations: SelectedVariation[]) => void;
}> = ({ product, onClose, onAddToCart }) => {
    const [selected, setSelected] = useState<Record<string, SelectedVariation[]>>({});

    const handleSelection = (variation: ProductVariation, option: ProductVariationOption) => {
        setSelected(prev => {
            const currentSelections = prev[variation.name] || [];
            if (variation.selectionType === 'single') {
                return { ...prev, [variation.name]: [{ variationName: variation.name, optionName: option.name, priceAdjustment: option.priceAdjustment }] };
            } else { // multiple
                const isSelected = currentSelections.some(s => s.optionName === option.name);
                if (isSelected) {
                    return { ...prev, [variation.name]: currentSelections.filter(s => s.optionName !== option.name) };
                } else {
                    return { ...prev, [variation.name]: [...currentSelections, { variationName: variation.name, optionName: option.name, priceAdjustment: option.priceAdjustment }] };
                }
            }
        });
    };
    
    const isAddToCartDisabled = useMemo(() => {
        return product.variations?.some(v => v.required && (!selected[v.name] || selected[v.name].length === 0)) || false;
    }, [product.variations, selected]);

    const finalSelections = useMemo(() => Object.values(selected).flat(), [selected]);
    const totalPrice = useMemo(() => {
        return product.price + finalSelections.reduce((sum, s) => sum + s.priceAdjustment, 0);
    }, [product.price, finalSelections]);

    return (
         <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                    {product.variations?.map(v => (
                        <div key={v.name}>
                            <h3 className="font-semibold text-gray-800">{v.name} {v.required && <span className="text-red-500">*</span>}</h3>
                            <p className="text-xs text-gray-500 mb-2">{v.selectionType === 'single' ? 'Pilih satu' : 'Bisa pilih lebih dari satu'}</p>
                            <div className="space-y-2">
                                {v.options.map(o => {
                                    const isChecked = selected[v.name]?.some(s => s.optionName === o.name) || false;
                                    return (
                                        <label key={o.name} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${isChecked ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}>
                                            <input 
                                                type={v.selectionType === 'single' ? 'radio' : 'checkbox'} 
                                                name={v.name} 
                                                checked={isChecked}
                                                onChange={() => handleSelection(v, o)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="ml-3 flex-grow text-sm font-medium text-gray-800">{o.name}</span>
                                            {o.priceAdjustment !== 0 && (
                                                <span className="text-sm text-gray-600">{o.priceAdjustment > 0 ? '+' : ''}{formatRupiah(o.priceAdjustment)}</span>
                                            )}
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-xl">
                     <p className="text-lg font-bold text-gray-900">Total: {formatRupiah(totalPrice)}</p>
                    <button onClick={() => onAddToCart(product, finalSelections)} disabled={isAddToCartDisabled} className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                        Tambah ke Keranjang
                    </button>
                </div>
            </div>
         </div>
    )
};


const Kasir: React.FC<KasirProps> = ({ products, storeSettings, addOrder, orders, vouchers, bundles, customers, addCustomer, handleCustomerTransaction }) => {
    const [activeTab, setActiveTab] = useState('Kasir');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Semua Kategori');
    const [discountPercent, setDiscountPercent] = useState(0);
    const [taxPercent, setTaxPercent] = useState(storeSettings.defaultTaxPercent || 0);
    const [discountRp, setDiscountRp] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [bonNumber, setBonNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Tunai');
    const [lastTransactionForPrint, setLastTransactionForPrint] = useState<ReceiptData | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false); // New state to control flow
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
    const [voucherError, setVoucherError] = useState<string | null>(null);
    
    // State for modals
    const [whatsAppNumber, setWhatsAppNumber] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [pendingTransaction, setPendingTransaction] = useState<ReceiptData | null>(null);
    const [showNewCustomerPrompt, setShowNewCustomerPrompt] = useState(false);
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [bundleSuggestion, setBundleSuggestion] = useState<{ product: Product, bundles: Bundle[] } | null>(null);
    const [productForVariations, setProductForVariations] = useState<Product | null>(null);
    const [showQrisModal, setShowQrisModal] = useState(false);


    const printer = useContext(PrinterContext);

    useEffect(() => {
        const nextOrderNumber = orders.length + 1;
        const newBonNumber = `${storeSettings.bonPrefix}${String(nextOrderNumber).padStart(6, '0')}`;
        setBonNumber(newBonNumber);
    }, [orders, storeSettings.bonPrefix]);

    useEffect(() => {
        setTaxPercent(storeSettings.defaultTaxPercent || 0);
    }, [storeSettings.defaultTaxPercent]);
    
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = category === 'Semua Kategori' || p.category === category;
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [category, searchTerm, products]);

    const addProductToCart = useCallback((product: Product, selectedVariations: SelectedVariation[] = []) => {
        if (product.stock <= 0) return;
        setCart(prevCart => {
            // A simple check; a more robust system might generate a unique ID based on product + variations
            const isVariationItem = selectedVariations.length > 0;
            const existingItem = prevCart.find(item => item.id === product.id && !item.isBundle && !isVariationItem);

            if (existingItem && !isVariationItem) { // Only merge non-variation items
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            let finalPrice = product.price;
            let discountAmount = 0;
            if (product.discount && product.discount.value > 0) {
                if (product.discount.type === 'fixed') {
                    finalPrice = product.price - product.discount.value;
                } else { // percentage
                    finalPrice = product.price * (1 - product.discount.value / 100);
                }
                discountAmount = product.price - finalPrice;
            }

            const newItem: CartItem = { 
                ...product, 
                quantity: 1,
                originalPrice: product.price,
                price: finalPrice,
                discountAmount: discountAmount,
                cartItemDiscount: { type: 'fixed', value: 0 },
                selectedVariations: selectedVariations,
            };

            return [...prevCart, newItem];
        });
    }, []);

    const handleAddToCartWithVariations = useCallback((product: Product, selectedVariations: SelectedVariation[]) => {
        addProductToCart(product, selectedVariations);
        setProductForVariations(null); // Close modal
    }, [addProductToCart]);


    const addBundleToCart = useCallback((bundle: Bundle) => {
        if (bundle.status === 'Non-Aktif') return;
        setCart(prevCart => {
            const existingBundle = prevCart.find(item => item.isBundle && item.bundleId === bundle.id);
            if (existingBundle) {
                return prevCart.map(item =>
                    item.id === existingBundle.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            const bundleProducts = bundle.products.map(bp => {
                const product = products.find(p => p.id === bp.productId);
                return { product: product!, quantity: bp.quantity };
            }).filter(bp => bp.product);

            if (bundleProducts.length !== bundle.products.length) {
                console.error("Some products in the bundle were not found.");
                return prevCart;
            }
            
            const originalPrice = bundleProducts.reduce((sum, bp) => sum + (bp.product.price * bp.quantity), 0);

            const newBundleItem: CartItem = {
                id: -bundle.id, // Use negative ID to avoid collision with products
                name: bundle.name,
                price: bundle.price,
                category: 'Bundling',
                stock: Infinity,
                imageUrl: bundle.imageUrl || DEFAULT_BUNDLE_IMAGE_URL,
                quantity: 1,
                originalPrice: originalPrice,
                discountAmount: 0,
                cartItemDiscount: { type: 'fixed', value: 0 },
                isBundle: true,
                bundleId: bundle.id,
                bundleProducts: bundleProducts,
            };
            return [...prevCart, newBundleItem];
        });
    }, [products]);

    const addToCart = useCallback((product: Product) => {
        if (product.stock <= 0) return;
        
        if (product.variations && product.variations.length > 0) {
            setProductForVariations(product);
            return;
        }
        
        const applicableBundles = bundles.filter(b => 
            b.status === 'Aktif' && 
            b.products.some(p => p.productId === product.id)
        );

        if (applicableBundles.length > 0) {
            setBundleSuggestion({ product, bundles: applicableBundles });
        } else {
            addProductToCart(product);
        }
    }, [bundles, addProductToCart]);


    const removeFromCart = useCallback((itemId: number) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    }, []);

    const updateCartItemQuantity = useCallback((itemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            setCart(prevCart =>
                prevCart.map(item =>
                    item.id === itemId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );
        }
    }, [removeFromCart]);

    const updateCartItemDiscount = useCallback((productId: number, discount: { type: 'percentage' | 'fixed', value: number }) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId
                    ? { ...item, cartItemDiscount: discount }
                    : item
            )
        );
    }, []);
    
    const clearCart = useCallback(() => {
        setCart([]);
        setDiscountPercent(0);
        setTaxPercent(storeSettings.defaultTaxPercent || 0);
        setDiscountRp(0);
        setCustomerName('');
        setPaymentMethod('Tunai');
        setAppliedVoucher(null);
        setVoucherCode('');
        setVoucherError(null);
        setWhatsAppNumber('');
        setEmailAddress('');
    }, [storeSettings.defaultTaxPercent]);

     // --- Calculation Engine ---
    const calculations = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
        const productDiscount = cart.reduce((sum, item) => item.isBundle ? sum : sum + item.discountAmount * item.quantity, 0);
        const variationTotal = cart.reduce((sum, item) => {
            const itemVariationTotal = item.selectedVariations?.reduce((vSum, v) => vSum + v.priceAdjustment, 0) || 0;
            return sum + (itemVariationTotal * item.quantity);
        }, 0);

        const { totalCartItemDiscount, subtotalAfterAllItemDiscounts } = cart.reduce(
            (acc, item) => {
                const itemBasePrice = item.isBundle ? item.price : item.price + (item.selectedVariations?.reduce((s, v) => s + v.priceAdjustment, 0) || 0);

                let manualDiscountValue = 0;
                if (item.cartItemDiscount.value > 0) {
                    if (item.cartItemDiscount.type === 'fixed') {
                        manualDiscountValue = item.cartItemDiscount.value;
                    } else { // percentage
                        manualDiscountValue = itemBasePrice * (item.cartItemDiscount.value / 100);
                    }
                }
                manualDiscountValue = Math.min(manualDiscountValue, itemBasePrice);

                const finalItemPrice = itemBasePrice - manualDiscountValue;

                acc.totalCartItemDiscount += manualDiscountValue * item.quantity;
                acc.subtotalAfterAllItemDiscounts += finalItemPrice * item.quantity;
                return acc;
            },
            { totalCartItemDiscount: 0, subtotalAfterAllItemDiscounts: 0 }
        );

        const subtotalAfterProductDiscount = subtotal - productDiscount;

        let voucherDiscount = 0;
        if (appliedVoucher) {
            const applicableItems = cart.filter(item => {
                if (item.isBundle) return false;
                if (appliedVoucher.applicableCategory) return item.category.toLowerCase() === appliedVoucher.applicableCategory.toLowerCase();
                if (appliedVoucher.applicableProductIds?.length) return appliedVoucher.applicableProductIds.includes(item.id);
                return true;
            });
            
            const applicableSubtotal = applicableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            if (!appliedVoucher.minSpend || (subtotalAfterProductDiscount + variationTotal) >= appliedVoucher.minSpend) {
                 if (appliedVoucher.type === 'fixed') {
                    voucherDiscount = Math.min(appliedVoucher.value, applicableSubtotal);
                } else {
                    voucherDiscount = applicableSubtotal * (appliedVoucher.value / 100);
                }
            }
        }
        
        let manualDiscount = 0;
        if (!appliedVoucher) {
            const percentDiscountValue = subtotalAfterAllItemDiscounts * (discountPercent / 100);
            manualDiscount = percentDiscountValue + discountRp;
        }

        const baseForTax = subtotalAfterAllItemDiscounts - voucherDiscount - manualDiscount;
        const taxAmount = baseForTax > 0 ? baseForTax * (taxPercent / 100) : 0;
        const grandTotal = baseForTax + taxAmount;
        
        return {
            subtotal,
            variationTotal,
            productDiscount,
            cartItemDiscount: totalCartItemDiscount,
            voucherDiscount,
            manualDiscount,
            taxAmount,
            grandTotal: grandTotal > 0 ? grandTotal : 0
        };
    }, [cart, appliedVoucher, discountPercent, discountRp, taxPercent]);

    const handleApplyVoucher = useCallback(() => {
        setVoucherError(null);
        const voucher = vouchers.find(v => v.code.toUpperCase() === voucherCode.toUpperCase() && v.status === 'Aktif');

        if (!voucher) {
            setVoucherError('Kode voucher tidak valid atau tidak aktif.');
            return;
        }
        
        const subtotalForVoucher = calculations.subtotal - calculations.productDiscount + calculations.variationTotal;
        if (voucher.minSpend && subtotalForVoucher < voucher.minSpend) {
            setVoucherError(`Minimal belanja ${formatRupiah(voucher.minSpend)} untuk menggunakan voucher ini.`);
            return;
        }
        
        const isApplicable = cart.some(item => {
            if (item.isBundle) return false;
            if (voucher.applicableCategory) return item.category.toLowerCase() === voucher.applicableCategory.toLowerCase();
            if (voucher.applicableProductIds?.length) return voucher.applicableProductIds.includes(item.id);
            return true;
        });

        if (!isApplicable) {
            setVoucherError('Tidak ada produk yang sesuai untuk voucher ini di keranjang Anda.');
            return;
        }


        setAppliedVoucher(voucher);
        setVoucherCode('');
        setDiscountPercent(0);
        setDiscountRp(0);

    }, [voucherCode, cart, vouchers, calculations]);
    
    const handleRemoveVoucher = useCallback(() => {
        setAppliedVoucher(null);
        setVoucherError(null);
    }, []);

    const groupedCart = useMemo(() => {
        const sorted = [...cart].sort((a, b) => {
            const categoryComparison = a.category.localeCompare(b.category);
            if (categoryComparison !== 0) return categoryComparison;
            return a.name.localeCompare(b.name);
        });

        return sorted.reduce((acc, item) => {
            const category = item.category || 'Lain-lain';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as { [key: string]: CartItem[] });
    }, [cart]);

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert('Keranjang kosong!');
            return;
        }
        setIsFinishing(true);

        const transactionData: ReceiptData = {
            items: cart,
            subtotal: calculations.subtotal,
            variationTotal: calculations.variationTotal,
            productDiscount: calculations.productDiscount,
            cartItemDiscount: calculations.cartItemDiscount,
            voucherCode: appliedVoucher?.code,
            voucherDiscount: calculations.voucherDiscount,
            manualDiscount: calculations.manualDiscount,
            taxPercent,
            taxAmount: calculations.taxAmount,
            grandTotal: calculations.grandTotal,
            bon: bonNumber,
            customer: customerName || 'Umum',
            date: new Date().toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':'),
            paymentMethod: paymentMethod,
            transactionNumber: orders.length + 1,
        };
        
        setLastTransactionForPrint(transactionData);

        if (paymentMethod === 'QRIS') {
            setShowQrisModal(true);
        } else {
            setShowPreview(true);
        }
    };
    
    const handleQrisPaymentSuccess = () => {
        setShowQrisModal(false);
        setShowPreview(true);
    };

    const handleQrisPaymentCancel = () => {
        setShowQrisModal(false);
        setLastTransactionForPrint(null); // Clear the pending transaction
        setIsFinishing(false);
    };
    
    const handlePrintReceipt = async () => {
        if (!lastTransactionForPrint) return;

        if (printer.isConnected) {
            try {
                const receiptBytes = generateReceiptBytes(lastTransactionForPrint, storeSettings);
                await printer.print(receiptBytes);
                alert('Struk berhasil dikirim ke printer!');
            } catch (error) {
                console.error('Gagal mencetak:', error);
                alert(`Gagal mencetak via ${printer.connectionType}. Silakan coba lagi atau gunakan metode cetak standar.`);
            }
        } else {
            setTimeout(() => window.print(), 100);
        }
    };
    
    const handleSendWhatsApp = () => {
        if (!lastTransactionForPrint) return;
        let phone = whatsAppNumber.trim().replace(/[^0-9]/g, '');

        if (phone.startsWith('0')) phone = '62' + phone.substring(1);
        else if (!phone.startsWith('62')) phone = '62' + phone;
        
        if (phone.length < 10) {
            alert('Nomor WhatsApp tidak valid.');
            return;
        }

        const message = generateReceiptText(lastTransactionForPrint, storeSettings);
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleSendEmail = () => {
        if (!lastTransactionForPrint) return;
        if (!emailAddress || !emailAddress.includes('@')) {
            alert('Alamat email tidak valid.');
            return;
        }
        const subject = `Struk Digital dari ${storeSettings.name} - No. ${lastTransactionForPrint.bon}`;
        const body = generateReceiptText(lastTransactionForPrint, storeSettings)
            .replace(/\*/g, '').replace(/_/g, '');

        const url = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
    };
    
    const completeAndReset = (transaction: ReceiptData) => {
        if (isFinishing) {
            addOrder(transaction);
        }
        setShowPreview(false);
        setActiveTab('Daftar Order');
        clearCart();
        setLastTransactionForPrint(null);
        setPendingTransaction(null);
        setIsFinishing(false);
    };

    const handleFinishTransaction = () => {
        if (!lastTransactionForPrint) return;

        // If not a new transaction, just close the preview.
        if (!isFinishing) {
            setShowPreview(false);
            setLastTransactionForPrint(null);
            return;
        }

        const customerName = lastTransactionForPrint.customer;
        const isExisting = customers.some(c => c.name.toLowerCase() === customerName.toLowerCase());
        const isPotentialNew = customerName && customerName.toLowerCase() !== 'umum' && !isExisting;

        if (isPotentialNew) {
            setPendingTransaction(lastTransactionForPrint);
            setNewCustomerName(customerName);
            setShowPreview(false);
            setShowNewCustomerPrompt(true);
        } else {
            if (isExisting) {
                handleCustomerTransaction(customerName, lastTransactionForPrint.grandTotal);
            }
            completeAndReset(lastTransactionForPrint);
        }
    };

    const handleConfirmAddCustomer = () => {
        setShowNewCustomerPrompt(false);
        setShowNewCustomerModal(true);
    };

    const handleDeclineAddCustomer = () => {
        if (pendingTransaction) completeAndReset(pendingTransaction);
        setShowNewCustomerPrompt(false);
    };
    
    const handleSaveNewCustomer = (customerData: Omit<Customer, 'id' | 'transactionCount' | 'totalSpend'>) => {
        if (pendingTransaction) {
            const newCustomer: Omit<Customer, 'id'> = {
                ...customerData,
                joinDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                transactionCount: 1,
                totalSpend: pendingTransaction.grandTotal
            };
            addCustomer(newCustomer);
            completeAndReset(pendingTransaction);
        }
        setShowNewCustomerModal(false);
    };

    const handleShowOrderDetail = (order: Order) => {
        setLastTransactionForPrint(order);
        setIsFinishing(false); // It's a view, not a new transaction
        setShowPreview(true);
    };

    const allCategories = useMemo(() => {
        const productCategories = [...new Set(products.map(p => p.category))];
        const categories = ['Semua Kategori'];
        if (bundles.some(b => b.status === 'Aktif')) categories.push('Bundling');
        categories.push(...productCategories);
        return categories;
    }, [products, bundles]);

    return (
        <>
            <div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="p-2 bg-slate-50 rounded-t-xl">
                        <nav className="flex space-x-2" aria-label="Tabs">
                            <button onClick={() => setActiveTab('Kasir')} className={`${activeTab === 'Kasir' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'} flex items-center gap-2 whitespace-nowrap py-2.5 px-4 rounded-lg font-semibold text-sm transition-all`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                Kasir
                            </button>
                            <button onClick={() => setActiveTab('Daftar Order')} className={`${activeTab === 'Daftar Order' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'} flex items-center gap-2 whitespace-nowrap py-2.5 px-4 rounded-lg font-semibold text-sm transition-all`}>
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                Daftar Order
                                {orders.length > 0 && <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-600 text-xs font-bold">{orders.length}</span>}
                            </button>
                        </nav>
                    </div>

                    <div>
                        {activeTab === 'Kasir' && (
                            <div className="pt-4 px-2 sm:px-4">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{alignItems: 'start'}}>
                                    <div className="lg:col-span-2">
                                        <ProductList products={filteredProducts} bundles={bundles.filter(b => b.status === 'Aktif')} onAddToCart={addToCart} onAddBundleToCart={addBundleToCart} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedCategory={category} setSelectedCategory={setCategory} categories={allCategories}/>
                                    </div>
                                    <div className="h-full">
                                        <Cart items={groupedCart} onRemoveFromCart={removeFromCart} onUpdateQuantity={updateCartItemQuantity} onUpdateCartItemDiscount={updateCartItemDiscount} onCheckout={handleCheckout} subtotal={calculations.subtotal} productDiscount={calculations.productDiscount} cartItemDiscount={calculations.cartItemDiscount} voucherDiscount={calculations.voucherDiscount} manualDiscount={calculations.manualDiscount} taxAmount={calculations.taxAmount} grandTotal={calculations.grandTotal} discountPercent={discountPercent} setDiscountPercent={setDiscountPercent} discountRp={discountRp} setDiscountRp={setDiscountRp} bonNumber={bonNumber} customerName={customerName} setCustomerName={setCustomerName} customers={customers} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} voucherCode={voucherCode} setVoucherCode={setVoucherCode} onApplyVoucher={handleApplyVoucher} onRemoveVoucher={handleRemoveVoucher} appliedVoucher={appliedVoucher ? { code: appliedVoucher.code, discount: calculations.voucherDiscount } : null} voucherError={voucherError} setVoucherError={setVoucherError}/>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'Daftar Order' && (
                             <div className="p-4">
                                {orders.length > 0 ? (
                                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                                        <table className="min-w-full bg-white text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">No. Bon</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Customer</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Tanggal</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Metode Bayar</th>
                                                    <th className="py-3 px-4 text-right font-semibold text-slate-600">Total</th>
                                                    <th className="py-3 px-4 text-center font-semibold text-slate-600">Status</th>
                                                    <th className="py-3 px-4 text-center font-semibold text-slate-600">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {orders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-slate-50">
                                                        <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">{order.bon}</td>
                                                        <td className="py-3 px-4 whitespace-nowrap text-slate-700">{order.customer}</td>
                                                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">{order.date}</td>
                                                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">{order.paymentMethod}</td>
                                                        <td className="py-3 px-4 whitespace-nowrap text-slate-800 text-right font-medium">{formatRupiah(order.grandTotal)}</td>
                                                        <td className="py-3 px-4 whitespace-nowrap text-center">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Lunas' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                                                        </td>
                                                        <td className="py-3 px-4 whitespace-nowrap text-center">
                                                            <button onClick={() => handleShowOrderDetail(order)} className="text-blue-600 hover:text-blue-800 font-medium text-xs inline-flex items-center gap-1 hover:underline">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                Detail
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                         <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                        <h3 className="text-lg font-semibold text-slate-700">Belum Ada Order</h3>
                                        <p className="text-slate-500 mt-1">Transaksi yang selesai akan muncul di sini.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="hidden"><Receipt data={lastTransactionForPrint} settings={storeSettings} /></div>

            {productForVariations && <VariationSelectionModal product={productForVariations} onClose={() => setProductForVariations(null)} onAddToCart={handleAddToCartWithVariations}/>}

            {bundleSuggestion && (
                <BundleSuggestionModal suggestion={bundleSuggestion} onAddBundle={(bundle) => { addBundleToCart(bundle); setBundleSuggestion(null); }} onAddProduct={(product) => { addProductToCart(product); setBundleSuggestion(null); }} onClose={() => setBundleSuggestion(null)}/>
            )}

            {showPreview && lastTransactionForPrint && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 animate-fade-in">
                    <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row gap-4 p-4 transform transition-all duration-300 scale-95 animate-scale-in">
                        <div className="w-full md:w-80 shrink-0 bg-gray-200 p-5 rounded-lg overflow-y-auto max-h-[80vh]"><Receipt data={lastTransactionForPrint} settings={storeSettings} /></div>
                        <div className="flex-1 bg-white rounded-lg p-6 flex flex-col">
                            <div className="text-center mb-6">
                                {isFinishing && (
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>
                                )}
                                <h2 className="text-2xl font-bold text-gray-800">{isFinishing ? 'Transaksi Berhasil!' : 'Detail Transaksi'}</h2>
                                <p className="text-gray-500 mt-1">{isFinishing ? 'Pilih cara mengirim struk ke pelanggan.' : 'Tinjau detail transaksi yang sudah selesai.'}</p>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg></div>
                                        <div className="ml-4 flex-grow"><h3 className="font-semibold text-gray-800">Cetak Struk Fisik</h3><p className="text-xs text-gray-500">Kirim ke printer termal atau cetak via browser.</p></div>
                                        <button onClick={handlePrintReceipt} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm active:bg-blue-800 shrink-0">Cetak</button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center mb-4">
                                         <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg></div>
                                        <div className="ml-4"><h3 className="font-semibold text-gray-800">Kirim Struk Digital</h3><p className="text-xs text-gray-500">Kirim salinan struk ke pelanggan.</p></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-grow"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52s-.67-.816-.923-1.107-.504-.249-.699-.249h-.597c-.249 0-.645.124-.82.371-.174.247-.644.782-.644 1.901 0 1.12.67 2.204.769 2.353.099.149 1.394 2.132 3.383 2.992.47.205.84.326 1.12.418.475.152.9.129 1.23.078.396-.053 1.255-.513 1.429-.988.174-.474.174-.883.125-1.004s-.174-.198-.372-.347zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></svg></div><input type="tel" value={whatsAppNumber} onChange={e => setWhatsAppNumber(e.target.value)} placeholder="Nomor WhatsApp (+62)" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                            <button onClick={handleSendWhatsApp} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-green-600 transition-colors shrink-0">Kirim</button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-grow"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div><input type="email" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} placeholder="Alamat Email" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                            <button onClick={handleSendEmail} className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-800 transition-colors shrink-0">Kirim</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto pt-6"><button onClick={handleFinishTransaction} className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors duration-200 text-lg shadow-lg active:bg-gray-900">{isFinishing ? 'Selesai & Transaksi Baru' : 'Tutup'}</button></div>
                        </div>
                    </div>
                </div>
            )}

            {showQrisModal && lastTransactionForPrint && (
                <QrisModal 
                    onConfirm={handleQrisPaymentSuccess}
                    onClose={handleQrisPaymentCancel}
                    amount={lastTransactionForPrint.grandTotal}
                    storeName={storeSettings.name}
                    bonNumber={lastTransactionForPrint.bon}
                />
            )}

            {showNewCustomerPrompt && pendingTransaction && (
                <NewCustomerPrompt customerName={pendingTransaction.customer} onConfirm={handleConfirmAddCustomer} onDecline={handleDeclineAddCustomer}/>
            )}
            {showNewCustomerModal && (
                <CustomerModal customer={{ name: newCustomerName, phone: '', address: '' }} onClose={() => { setShowNewCustomerModal(false); if (pendingTransaction) completeAndReset(pendingTransaction); }} onSave={handleSaveNewCustomer as any} />
            )}
        </>
    );
};

export default Kasir;