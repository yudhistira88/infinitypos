import { Product, Customer, Employee, Expense, Income, Notification, Voucher, Bundle, PaymentSettings } from './types';

export const MOCK_VOUCHERS: Voucher[] = [];

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_CUSTOMERS: Customer[] = [];

export const MOCK_EMPLOYEES: Employee[] = [];

export const MOCK_EXPENSES: Expense[] = [];

export const MOCK_INCOMES: Income[] = [];

export const MOCK_NOTIFICATIONS: Notification[] = [];

export const DEFAULT_BUNDLE_IMAGE_URL = 'https://images.unsplash.com/photo-1555243896-c709b02b2790?q=80&w=400';

export const MOCK_BUNDLES: Bundle[] = [];

export const MOCK_PAYMENT_SETTINGS: PaymentSettings = {
  activeMethods: ['Tunai', 'QRIS', 'Kartu Debit'],
  qris: {
    merchantName: '',
    enabled: false,
  },
  bankAccounts: []
};