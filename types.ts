
export enum Language {
  AR = 'ar',
  FR = 'fr'
}

export enum StockStatus {
  OK = 'OK',
  LOW = 'LOW',
  CRITICAL = 'CRITICAL'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

export interface RawMaterial {
  id: string;
  nameAr: string;
  nameFr: string;
  quantity: number;
  maxQuantity: number; // For percentage calculation
  unit: 'kg' | 'l' | 'watt' | 'pcs' | 'roll' | 'm';
  minLevel: number;
  supplier: string;
  price?: number; // Added to track cost/price
}

export interface Product {
  id: string;
  nameAr: string;
  nameFr: string;
  quantity: number;
  maxQuantity: number; // New field
  unit: 'kg' | 'l' | 'watt' | 'pcs' | 'roll' | 'm' | 'carton' | 'plate'; // New field
  price: number;
}

export interface ProductionLog {
  id: string;
  date: string;
  productId: string;
  quantityProduced: number;
  wasteAmount: number; // in kg
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerId: string;
  date: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Staff {
  id: string;
  name: string;
  roleAr: string;
  roleFr: string;
  salary: number;
  lastPaymentDate: string;
  advanceTaken: number; // New field for advance salary
  password?: string; // Added password field
}

export interface Expense {
  id: string;
  type: 'income' | 'expense';
  category: 'Utility' | 'Maintenance' | 'RawMaterial' | 'Salary' | 'Sales' | 'Other';
  description: string;
  amount: number;
  date: string;
  isRecurring?: boolean;
}

export interface TranslationDictionary {
  [key: string]: {
    ar: string;
    fr: string;
  };
}