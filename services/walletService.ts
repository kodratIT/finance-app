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

  async getTotalBalanceWithCrypto(userId: string): Promise<number> {
    const { cryptoService } = await import('./cryptoService');
    const wallets = await this.getWallets(userId);

    // Get all crypto wallet IDs
    const cryptoWallets = wallets.filter((w) => w.type === 'crypto' && w.cryptoId);
    const cryptoIds = [...new Set(cryptoWallets.map((w) => w.cryptoId!))];

    // Fetch prices for all crypto wallets at once
    const prices = cryptoIds.length > 0 ? await cryptoService.getPrices(cryptoIds) : {};

    // Calculate total
    let total = 0;
    for (const wallet of wallets) {
      if (wallet.type === 'crypto' && wallet.cryptoId) {
        const price = prices[wallet.cryptoId];
        if (price) {
          total += wallet.balance * price.priceInIDR;
        }
      } else {
        total += wallet.balance;
      }
    }

    return total;
  },

  async getWalletValue(wallet: Wallet): Promise<number> {
    if (wallet.type === 'crypto' && wallet.cryptoId) {
      const { cryptoService } = await import('./cryptoService');
      return await cryptoService.calculateCryptoValue(wallet.cryptoId, wallet.balance);
    }
    return wallet.balance;
  },
};
