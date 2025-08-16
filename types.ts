// Minimal Web Bluetooth & Web USB API type definitions to satisfy TypeScript
// in environments where full DOM types are not available.
declare global {
    // Web Bluetooth
    type BluetoothServiceUUID = number | string;

    interface RequestDeviceOptions {
        acceptAllDevices?: boolean;
        optionalServices?: BluetoothServiceUUID[];
        filters?: {
            services?: BluetoothServiceUUID[];
            name?: string;
            namePrefix?: string;
        }[];
    }

    interface BluetoothDevice {
        name?: string;
        gatt?: BluetoothRemoteGATTServer;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    }

    interface BluetoothRemoteGATTServer {
        connected: boolean;
        connect(): Promise<BluetoothRemoteGATTServer>;
        disconnect(): void;
        getPrimaryServices(): Promise<BluetoothRemoteGATTService[]>;
    }

    interface BluetoothRemoteGATTService {
        getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>;
    }

    interface BluetoothCharacteristicProperties {
        write: boolean;
        writeWithoutResponse: boolean;
    }
    
    interface BluetoothRemoteGATTCharacteristic {
        properties: BluetoothCharacteristicProperties;
        writeValueWithoutResponse(value: BufferSource): Promise<void>;
    }

    // Web USB
    interface USBEndpoint {
        endpointNumber: number;
        direction: 'in' | 'out';
    }

    interface USBAlternateInterface {
        endpoints: USBEndpoint[];
    }

    interface USBInterface {
        alternate: USBAlternateInterface;
    }

    interface USBConfiguration {
        interfaces: USBInterface[];
    }

    interface USBDevice {
        productName?: string;
        manufacturerName?: string;
        configuration: USBConfiguration | null;
        open(): Promise<void>;
        close(): Promise<void>;
        selectConfiguration(configurationValue: number): Promise<void>;
        claimInterface(interfaceNumber: number): Promise<void>;
        transferOut(endpointNumber: number, data: BufferSource): Promise<any>;
    }

    interface Navigator {
        bluetooth: {
            requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
        };
        usb: {
            requestDevice(options?: { filters: any[] }): Promise<USBDevice>;
        };
    }
}


export interface ProductVariationOption {
    name: string;
    priceAdjustment: number; // Can be positive or negative
}

export interface ProductVariation {
    name: string; // e.g., "Ukuran", "Topping"
    options: ProductVariationOption[];
    selectionType: 'single' | 'multiple';
    required: boolean;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    stock: number;
    imageUrl: string;
    unit?: string;
    description?: string;
    variations?: ProductVariation[];
    discount?: {
        type: 'percentage' | 'fixed';
        value: number;
    };
}

export interface SelectedVariation { // To be stored in CartItem
    variationName: string;
    optionName: string;
    priceAdjustment: number;
}

export interface CartItem extends Product {
    quantity: number;
    originalPrice: number;
    discountAmount: number; // Per-item discount from product-level promo
    cartItemDiscount: { // Manually added in cart
        type: 'percentage' | 'fixed';
        value: number;
    };
     // Bundle-specific properties
    isBundle?: boolean;
    bundleId?: number;
    bundleProducts?: { product: Product; quantity: number }[];
    selectedVariations?: SelectedVariation[];
}

export interface ReceiptData {
    items: CartItem[];
    subtotal: number; // Sum of original prices
    variationTotal: number; // Sum of all variation price adjustments
    productDiscount: number; // Sum of all product-level discounts
    cartItemDiscount: number; // Sum of all manual per-item discounts
    voucherCode?: string;
    voucherDiscount?: number;
    manualDiscount: number;
    taxPercent: number;
    taxAmount: number;
    grandTotal: number;
    bon: string;
    customer: string;
    date: string;
    paymentMethod: string;
    transactionNumber: number;
}

export interface StoreSettings {
    name: string;
    address: string;
    phone: string;
    bonPrefix: string;
    defaultTaxPercent: number;
    receiptFooter?: string;
    logoUrl?: string;
    receiptTemplate?: 'modern' | 'simple';
}

// Represents a completed transaction/order
export interface Order extends ReceiptData {
    id: string; // Using bon number as the unique ID
    status: 'Lunas' | 'Belum Lunas';
}

export interface Customer {
    id: number;
    name: string;
    phone: string;
    address?: string;
    joinDate: string; 
    transactionCount: number;
    totalSpend: number;
}

export interface Employee {
    id: number;
    name: string;
    role: 'Admin' | 'Kasir';
    status: 'Aktif' | 'Non-Aktif';
}

export interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: 'Operasional' | 'Bahan Baku' | 'Gaji';
}

export interface Income {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: 'Modal Awal' | 'Lain-lain';
}

export interface Notification {
    id: number;
    type: 'stok' | 'laporan' | 'sistem' | 'promo';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface User {
    name: string;
    email: string;
    phone: string;
    role: string;
    avatarUrl: string | null;
}

export interface Voucher {
    id: number;
    code: string;
    type: 'fixed' | 'percentage';
    value: number;
    minSpend?: number;
    status: 'Aktif' | 'Non-Aktif';
    applicableProductIds?: number[];
    applicableCategory?: string;
}

// --- NEW BUNDLE TYPES ---
export interface BundleProduct {
    productId: number;
    quantity: number;
}

export interface Bundle {
    id: number;
    name: string;
    price: number;
    products: BundleProduct[];
    status: 'Aktif' | 'Non-Aktif';
    imageUrl?: string;
}


// Types for a unified Printer Context (Bluetooth or USB)
export interface PrinterState {
    isConnected: boolean;
    connectionType: 'none' | 'bluetooth' | 'usb';
    device: BluetoothDevice | USBDevice | null;
    statusMessage: string;
}

export interface PrinterContextType extends PrinterState {
    connectBluetooth: () => Promise<void>;
    connectUSB: () => Promise<void>;
    disconnect: () => void;
    print: (data: Uint8Array) => Promise<void>;
}

// --- NEW PAYMENT SETTINGS TYPES ---
export interface BankAccount {
    id: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
}

export interface PaymentSettings {
    activeMethods: string[];
    qris: {
        merchantName: string;
        enabled: boolean;
    };
    bankAccounts: BankAccount[];
}