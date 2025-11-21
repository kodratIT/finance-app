import AsyncStorage from '@react-native-async-storage/async-storage';
import { CryptoPrice, CryptoCoin } from '../types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const CACHE_KEY = 'crypto_prices';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const TOP_COINS_KEY = 'top_100_coins';

export const cryptoService = {
  /**
   * Fetch top 100 cryptocurrencies list
   */
  async getTop100Coins(): Promise<CryptoCoin[]> {
    try {
      // Check cache first
      const cached = await AsyncStorage.getItem(TOP_COINS_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache coins list for 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }

      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=idr&order=market_cap_desc&per_page=100&page=1&sparkline=false`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch coins list');
      }

      const data = await response.json();
      const coins: CryptoCoin[] = data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
      }));

      // Cache the list
      await AsyncStorage.setItem(
        TOP_COINS_KEY,
        JSON.stringify({ data: coins, timestamp: Date.now() })
      );

      return coins;
    } catch (error) {
      console.error('Error fetching top 100 coins:', error);
      // Return cached data if available, even if expired
      const cached = await AsyncStorage.getItem(TOP_COINS_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        return data;
      }
      return [];
    }
  },

  /**
   * Fetch current prices for specific crypto IDs
   */
  async getPrices(coinIds: string[]): Promise<Record<string, CryptoPrice>> {
    if (coinIds.length === 0) {
      return {};
    }

    try {
      // Check cache first
      const cached = await this.getCachedPrices();
      const now = Date.now();

      // Filter out coins that are still fresh in cache
      const needUpdate = coinIds.filter((id) => {
        const cachedPrice = cached[id];
        return !cachedPrice || now - cachedPrice.lastUpdated > CACHE_DURATION;
      });

      // If all prices are fresh, return cached
      if (needUpdate.length === 0) {
        return cached;
      }

      // Fetch updated prices
      const idsParam = needUpdate.join(',');
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=${idsParam}&vs_currencies=idr&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }

      const data = await response.json();

      // Transform to our format
      const prices: Record<string, CryptoPrice> = { ...cached };

      for (const coinId of needUpdate) {
        if (data[coinId]) {
          prices[coinId] = {
            id: coinId,
            symbol: coinId.toUpperCase(),
            name: coinId,
            priceInIDR: data[coinId].idr || 0,
            priceChangePercentage24h: data[coinId].idr_24h_change || 0,
            lastUpdated: now,
          };
        }
      }

      // Cache the updated prices
      await this.cachePrices(prices);

      return prices;
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      // Return cached prices if fetch fails
      return await this.getCachedPrices();
    }
  },

  /**
   * Get single crypto price
   */
  async getPrice(coinId: string): Promise<CryptoPrice | null> {
    const prices = await this.getPrices([coinId]);
    return prices[coinId] || null;
  },

  /**
   * Search coins by name or symbol
   */
  async searchCoins(query: string): Promise<CryptoCoin[]> {
    const allCoins = await this.getTop100Coins();
    const lowerQuery = query.toLowerCase();

    return allCoins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(lowerQuery) ||
        coin.symbol.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Calculate crypto wallet value in IDR
   */
  async calculateCryptoValue(coinId: string, amount: number): Promise<number> {
    const price = await this.getPrice(coinId);
    if (!price) return 0;
    return price.priceInIDR * amount;
  },

  /**
   * Get cached prices from AsyncStorage
   */
  async getCachedPrices(): Promise<Record<string, CryptoPrice>> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error reading cached prices:', error);
    }
    return {};
  },

  /**
   * Cache prices to AsyncStorage
   */
  async cachePrices(prices: Record<string, CryptoPrice>): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(prices));
    } catch (error) {
      console.error('Error caching prices:', error);
    }
  },

  /**
   * Clear price cache
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await AsyncStorage.removeItem(TOP_COINS_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  /**
   * Format price to IDR
   */
  formatIDR(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Format crypto amount
   */
  formatCryptoAmount(amount: number, maxDecimals: number = 8): string {
    if (amount === 0) return '0';
    if (amount >= 1) {
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    // For small amounts, show more decimals
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: maxDecimals,
    });
  },
};
