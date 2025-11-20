import { ref, push, set, get, update, remove, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { Transaction } from '../types';
import { walletService } from './walletService';

export const transactionService = {
  async createTransaction(
    userId: string,
    transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) {
    const transactionsRef = ref(database, `transactions/${userId}`);
    const newTransactionRef = push(transactionsRef);

    const transaction: Transaction = {
      ...transactionData,
      id: newTransactionRef.key!,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await set(newTransactionRef, transaction);

    const walletsSnapshot = await get(ref(database, `wallets/${userId}/${transactionData.walletId}`));
    if (walletsSnapshot.exists()) {
      const wallet = walletsSnapshot.val();
      const newBalance =
        transactionData.type === 'income'
          ? wallet.balance + transactionData.amount
          : wallet.balance - transactionData.amount;

      await walletService.updateWalletBalance(userId, transactionData.walletId, newBalance);
    }

    return transaction;
  },

  async getTransactions(userId: string): Promise<Transaction[]> {
    const transactionsRef = ref(database, `transactions/${userId}`);
    const snapshot = await get(transactionsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const transactionsData = snapshot.val();
    const transactions = Object.values(transactionsData) as Transaction[];
    return transactions.sort((a, b) => b.date - a.date);
  },

  subscribeToTransactions(userId: string, callback: (transactions: Transaction[]) => void) {
    const transactionsRef = ref(database, `transactions/${userId}`);

    return onValue(transactionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const transactionsData = snapshot.val();
        const transactions = Object.values(transactionsData) as Transaction[];
        const sortedTransactions = transactions.sort((a, b) => b.date - a.date);
        callback(sortedTransactions);
      } else {
        callback([]);
      }
    });
  },

  async getRecentTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    const transactions = await this.getTransactions(userId);
    return transactions.slice(0, limit);
  },

  async updateTransaction(
    userId: string,
    transactionId: string,
    updates: Partial<Transaction>
  ) {
    const transactionRef = ref(database, `transactions/${userId}/${transactionId}`);
    await update(transactionRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async deleteTransaction(userId: string, transactionId: string) {
    const transactionRef = ref(database, `transactions/${userId}/${transactionId}`);
    await remove(transactionRef);
  },

  async getMonthlyStats(userId: string, month: number, year: number) {
    const transactions = await this.getTransactions(userId);

    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, total: income - expense };
  },
};
