import { useState, useEffect } from 'react';
import { walletService } from '../services/walletService';
import { cryptoService } from '../services/cryptoService';
import { Wallet } from '../types';
import { useCryptoPrices } from './useCryptoPrices';

export function useWalletBalance(wallets: Wallet[]) {
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get all unique crypto IDs from wallets
  const cryptoIds = wallets
    .filter((w) => w.type === 'crypto' && w.cryptoId)
    .map((w) => w.cryptoId!);

  const uniqueCryptoIds = [...new Set(cryptoIds)];

  // Fetch crypto prices
  const { prices, loading: pricesLoading } = useCryptoPrices(uniqueCryptoIds);

  useEffect(() => {
    const calculateTotal = async () => {
      setLoading(true);
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

      setTotalBalance(total);
      setLoading(false);
    };

    if (!pricesLoading) {
      calculateTotal();
    }
  }, [wallets, prices, pricesLoading]);

  return { totalBalance, loading };
}

export function useWalletValue(wallet: Wallet) {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const cryptoIds = wallet.type === 'crypto' && wallet.cryptoId ? [wallet.cryptoId] : [];
  const { prices, loading: pricesLoading } = useCryptoPrices(cryptoIds);

  useEffect(() => {
    const calculateValue = async () => {
      setLoading(true);

      if (wallet.type === 'crypto' && wallet.cryptoId) {
        const price = prices[wallet.cryptoId];
        if (price) {
          setValue(wallet.balance * price.priceInIDR);
        } else {
          setValue(0);
        }
      } else {
        setValue(wallet.balance);
      }

      setLoading(false);
    };

    if (!pricesLoading) {
      calculateValue();
    }
  }, [wallet, prices, pricesLoading]);

  return { value, loading };
}
