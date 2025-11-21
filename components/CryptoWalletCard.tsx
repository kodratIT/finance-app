import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react-native';
import { Wallet } from '../types';
import { useWalletValue } from '../hooks/useWalletBalance';
import { cryptoService } from '../services/cryptoService';

interface Props {
  wallet: Wallet;
  onEdit: () => void;
  onDelete: () => void;
}

export function CryptoWalletCard({ wallet, onEdit, onDelete }: Props) {
  const { value, loading } = useWalletValue(wallet);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCryptoAmount = (amount: number) => {
    return cryptoService.formatCryptoAmount(amount);
  };

  return (
    <View style={styles.walletCard}>
      <LinearGradient
        colors={[wallet.color + 'E6', wallet.color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.walletCardGradient}
      >
        <View style={styles.walletCardHeader}>
          <View style={styles.walletIconContainer}>
            <Text style={styles.cryptoIcon}>{wallet.icon}</Text>
          </View>
          <View style={styles.walletActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Edit size={16} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.walletInfo}>
          <Text style={styles.walletType}>CRYPTO</Text>
          <Text style={styles.walletName}>{wallet.name}</Text>
        </View>

        <View style={styles.cryptoAmountContainer}>
          <Text style={styles.cryptoAmount}>
            {formatCryptoAmount(wallet.balance)} {wallet.cryptoSymbol}
          </Text>
        </View>

        <View style={styles.walletBalanceContainer}>
          <Text style={styles.walletBalance}>
            {loading ? 'Loading...' : formatCurrency(value)}
          </Text>
          <View style={styles.cryptoBadge}>
            <TrendingUp size={12} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.cryptoBadgeText}>Live</Text>
          </View>
        </View>

        <View style={styles.walletPattern} pointerEvents="none">
          <View style={[styles.patternDot, { opacity: 0.1 }]} />
          <View style={[styles.patternDot, { opacity: 0.15 }]} />
          <View style={[styles.patternDot, { opacity: 0.1 }]} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  walletCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  walletCardGradient: {
    padding: 20,
    minHeight: 200,
    position: 'relative',
  },
  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 10,
    position: 'relative',
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cryptoIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  walletActions: {
    flexDirection: 'row',
    gap: 8,
    zIndex: 20,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: {
    marginBottom: 12,
  },
  walletType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  walletName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cryptoAmountContainer: {
    marginBottom: 12,
  },
  cryptoAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.9,
  },
  walletBalanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cryptoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cryptoBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  walletPattern: {
    position: 'absolute',
    right: 20,
    top: 20,
    flexDirection: 'row',
    gap: 8,
    zIndex: 1,
  },
  patternDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
});
