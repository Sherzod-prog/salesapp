export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export interface Stock {
  productId: string;
  quantity: string;
  avgCost: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  sellPrice: string;
  minStock: string;
  isActive: boolean;
  categoryId: string | null;
  category: Category | null;
  stock: Stock | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockInItem {
  id: string;
  stockInId: string;
  productId: string;
  quantity: string;
  costPrice: string;
  product?: Product;
}

export interface StockIn {
  id: string;
  supplierId: string | null;
  userId: string;
  note: string | null;
  totalCost: string;
  createdAt: string;
  items: StockInItem[];
  supplier: Supplier | null;
  user?: { fullName: string };
}

export interface InventoryItem {
  productId: string;
  name: string;
  sku: string | null;
  unit: string;
  category: string | null;
  quantity: number;
  avgCost: number;
  sellPrice: number;
  minStock: number;
  isLow: boolean;
}

export type PaymentMethod = "CASH" | "CARD";

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: string;
  sellPrice: string;
  costPrice: string;
  product: Product;
}

export interface Sale {
  id: string;
  userId: string;
  paymentMethod: PaymentMethod;
  totalAmount: string;
  totalProfit: string;
  createdAt: string;
  items: SaleItem[];
  user?: { fullName: string };
}

export interface ReportSummary {
  from: string;
  to: string;
  revenue: number;
  profit: number;
  salesCount: number;
}

export interface DailyReport {
  date: string;
  revenue: number;
  profit: number;
  salesCount: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
  profit: number;
}
