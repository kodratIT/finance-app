import React from 'react';
import AddTransactionForm from '../components/AddTransactionForm';
import { EXPENSE_CATEGORIES } from '../types';

export default function AddExpense() {
  return (
    <AddTransactionForm
      type="expense"
      categories={EXPENSE_CATEGORIES}
      title="Tambah Pengeluaran"
      gradientColors={['#ef4444', '#dc2626']}
      accentColor="#ef4444"
    />
  );
}
