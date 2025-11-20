import React from 'react';
import AddTransactionForm from '../components/AddTransactionForm';
import { INCOME_CATEGORIES } from '../types';

export default function AddIncome() {
  return (
    <AddTransactionForm
      type="income"
      categories={INCOME_CATEGORIES}
      title="Tambah Pendapatan"
      gradientColors={['#10b981', '#059669']}
      accentColor="#10b981"
    />
  );
}
