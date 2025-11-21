import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { cryptoService } from '../services/cryptoService';
import { CryptoPrice } from '../types';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useCryptoPrices(coinIds: string[]) {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    if (coinIds.length === 0) {
      setPrices({});
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const fetchedPrices = await cryptoService.getPrices(coinIds);
      setPrices(fetchedPrices);
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError('Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  }, [coinIds.join(',')]);

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPrices();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Refresh when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        fetchPrices();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchPrices]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchPrices();
  }, [fetchPrices]);

  return { prices, loading, error, refresh };
}
