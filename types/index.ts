export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: number;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: 'bank' | 'cash' | 'ewallet';
  icon: string;
  balance: number;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: number;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
}

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Gaji', icon: 'briefcase', type: 'income', color: '#10b981' },
  { id: 'bonus', name: 'Bonus', icon: 'gift', type: 'income', color: '#8b5cf6' },
  { id: 'business', name: 'Bisnis', icon: 'trending-up', type: 'income', color: '#3b82f6' },
  { id: 'investment', name: 'Investasi', icon: 'line-chart', type: 'income', color: '#f59e0b' },
  { id: 'gift', name: 'Hadiah', icon: 'heart', type: 'income', color: '#ec4899' },
  { id: 'other', name: 'Lainnya', icon: 'more-horizontal', type: 'income', color: '#6366f1' },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Makanan', icon: 'utensils', type: 'expense', color: '#ef4444' },
  { id: 'transport', name: 'Transport', icon: 'car', type: 'expense', color: '#f97316' },
  { id: 'shopping', name: 'Belanja', icon: 'shopping-bag', type: 'expense', color: '#ec4899' },
  { id: 'bills', name: 'Tagihan', icon: 'file-text', type: 'expense', color: '#8b5cf6' },
  { id: 'entertainment', name: 'Hiburan', icon: 'music', type: 'expense', color: '#06b6d4' },
  { id: 'health', name: 'Kesehatan', icon: 'heart-pulse', type: 'expense', color: '#10b981' },
  { id: 'education', name: 'Pendidikan', icon: 'book', type: 'expense', color: '#3b82f6' },
  { id: 'other', name: 'Lainnya', icon: 'more-horizontal', type: 'expense', color: '#6366f1' },
];

export const WALLET_PRESETS = [
  { name: 'BCA', type: 'bank' as const, icon: 'bank', color: '#0047AB' },
  { name: 'BRI', type: 'bank' as const, icon: 'bank', color: '#003d7a' },
  { name: 'Mandiri', type: 'bank' as const, icon: 'bank', color: '#ffd700' },
  { name: 'BNI', type: 'bank' as const, icon: 'bank', color: '#ff6600' },
  { name: 'Cash', type: 'cash' as const, icon: 'wallet', color: '#10b981' },
  { name: 'GoPay', type: 'ewallet' as const, icon: 'smartphone', color: '#00AA13' },
  { name: 'OVO', type: 'ewallet' as const, icon: 'smartphone', color: '#4c3494' },
  { name: 'DANA', type: 'ewallet' as const, icon: 'smartphone', color: '#118EEA' },
];
