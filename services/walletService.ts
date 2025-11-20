import { ref, push, set, get, update, remove, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { Wallet } from '../types';

export const walletService = {
  async createWallet(userId: string, walletData: Omit<Wallet, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const walletsRef = ref(database, `wallets/${userId}`);
    const newWalletRef = push(walletsRef);

    const wallet: Wallet = {
      ...walletData,
      id: newWalletRef.key!,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await set(newWalletRef, wallet);
    return wallet;
  },

  async getWallets(userId: string): Promise<Wallet[]> {
    const walletsRef = ref(database, `wallets/${userId}`);
    const snapshot = await get(walletsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const walletsData = snapshot.val();
    return Object.values(walletsData) as Wallet[];
  },

  subscribeToWallets(userId: string, callback: (wallets: Wallet[]) => void) {
    const walletsRef = ref(database, `wallets/${userId}`);

    return onValue(walletsRef, (snapshot) => {
      if (snapshot.exists()) {
        const walletsData = snapshot.val();
        const wallets = Object.values(walletsData) as Wallet[];
        callback(wallets);
      } else {
        callback([]);
      }
    });
  },

  async updateWallet(userId: string, walletId: string, updates: Partial<Wallet>) {
    const walletRef = ref(database, `wallets/${userId}/${walletId}`);
    await update(walletRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async updateWalletBalance(userId: string, walletId: string, newBalance: number) {
    const walletRef = ref(database, `wallets/${userId}/${walletId}`);
    await update(walletRef, {
      balance: newBalance,
      updatedAt: Date.now(),
    });
  },

  async deleteWallet(userId: string, walletId: string) {
    const walletRef = ref(database, `wallets/${userId}/${walletId}`);
    await remove(walletRef);
  },

  async getTotalBalance(userId: string): Promise<number> {
    const wallets = await this.getWallets(userId);
    return wallets.reduce((total, wallet) => total + wallet.balance, 0);
  },
};
