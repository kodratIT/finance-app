import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { walletService } from '../../services/walletService';
import { transactionService } from '../../services/transactionService';
import { Wallet, Transaction } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet as WalletIcon,
  PieChart,
  BarChart3,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface CategoryStat {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();

      const unsubscribeWallets = walletService.subscribeToWallets(user.uid, (updatedWallets) => {
        setWallets(updatedWallets);
        const total = updatedWallets.reduce((sum, w) => sum + w.balance, 0);
        setTotalBalance(total);
      });

      const unsubscribeTransactions = transactionService.subscribeToTransactions(
        user.uid,
        (updatedTransactions) => {
          setTransactions(updatedTransactions.slice(0, 5));
          calculateMonthlyStats(updatedTransactions);
          calculateCategoryStats(updatedTransactions);
        }
      );

      return () => {
        unsubscribeWallets();
        unsubscribeTransactions();
      };
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const walletsData = await walletService.getWallets(user.uid);
      setWallets(walletsData);

      const total = walletsData.reduce((sum, w) => sum + w.balance, 0);
      setTotalBalance(total);

      const transactionsData = await transactionService.getRecentTransactions(user.uid, 5);
      setTransactions(transactionsData);

      const allTransactions = await transactionService.getTransactions(user.uid);
      calculateMonthlyStats(allTransactions);
      calculateCategoryStats(allTransactions);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateMonthlyStats = (allTransactions: Transaction[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTransactions = allTransactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setMonthlyIncome(income);
    setMonthlyExpense(expense);
  };

  const calculateCategoryStats = (allTransactions: Transaction[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = allTransactions.filter((t) => {
      const date = new Date(t.date);
      return (
        t.type === 'expense' &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    const categoryMap: { [key: string]: number } = {};
    monthExpenses.forEach((t) => {
      const category = t.category || 'Lainnya';
      categoryMap[category] = (categoryMap[category] || 0) + t.amount;
    });

    const totalExpense = Object.values(categoryMap).reduce((sum, amount) => sum + amount, 0);

    const categoryColors: { [key: string]: string } = {
      Makanan: '#ef4444',
      Transport: '#f59e0b',
      Belanja: '#8b5cf6',
      Hiburan: '#ec4899',
      Tagihan: '#6366f1',
      Lainnya: '#6b7280',
    };

    const stats: CategoryStat[] = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        color: categoryColors[category] || '#6b7280',
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    setCategoryStats(stats);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hari ini';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const getSavingsRate = () => {
    if (monthlyIncome === 0) return 0;
    const savings = monthlyIncome - monthlyExpense;
    return (savings / monthlyIncome) * 100;
  };

  const savingsRate = getSavingsRate();
  const netBalance = monthlyIncome - monthlyExpense;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[currentTheme.colors.primary, currentTheme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Halo, {user?.displayName}! 👋</Text>
            <View style={styles.dateContainer}>
              <Calendar size={14} color="#ffffff" strokeWidth={2} />
              <Text style={styles.headerSubtitle}>
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Sparkles size={24} color={currentTheme.colors.sparkle} fill={currentTheme.colors.sparkle} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Saldo</Text>
            <View style={styles.balanceBadge}>
              <WalletIcon size={14} color="#ffffff" strokeWidth={2} />
              <Text style={styles.balanceBadgeText}>{wallets.length} Dompet</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <ArrowUpRight size={16} color="#10b981" strokeWidth={3} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Pendapatan</Text>
                <Text style={styles.statAmount}>{formatCurrency(monthlyIncome)}</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <ArrowDownRight size={16} color="#ef4444" strokeWidth={3} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Pengeluaran</Text>
                <Text style={styles.statAmount}>{formatCurrency(monthlyExpense)}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/add-income')}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.actionGradient}>
              <ArrowUpRight size={24} color="#ffffff" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={styles.actionText}>Tambah{'\n'}Pemasukan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/add-expense')}>
            <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.actionGradient}>
              <ArrowDownRight size={24} color="#ffffff" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={styles.actionText}>Tambah{'\n'}Pengeluaran</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/wallets')}>
            <LinearGradient
              colors={[currentTheme.colors.primary, currentTheme.colors.secondary]}
              style={styles.actionGradient}
            >
              <WalletIcon size={24} color="#ffffff" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={styles.actionText}>Kelola{'\n'}Dompet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/history')}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.actionGradient}>
              <BarChart3 size={24} color="#ffffff" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={styles.actionText}>Lihat{'\n'}Riwayat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.insightsCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIconContainer}>
              <PieChart size={20} color={currentTheme.colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.insightTitle}>Financial Insights</Text>
          </View>

          <View style={styles.insightContent}>
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Net Balance Bulan Ini</Text>
              <Text
                style={[
                  styles.insightValue,
                  { color: netBalance >= 0 ? '#10b981' : '#ef4444' },
                ]}
              >
                {netBalance >= 0 ? '+' : ''}
                {formatCurrency(netBalance)}
              </Text>
            </View>

            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Savings Rate</Text>
              <View style={styles.savingsRateContainer}>
                <Text
                  style={[
                    styles.insightValue,
                    {
                      color:
                        savingsRate >= 30
                          ? '#10b981'
                          : savingsRate >= 10
                          ? '#f59e0b'
                          : '#ef4444',
                    },
                  ]}
                >
                  {savingsRate.toFixed(1)}%
                </Text>
                {savingsRate >= 30 ? (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsBadgeText}>Excellent!</Text>
                  </View>
                ) : savingsRate >= 10 ? (
                  <View style={[styles.savingsBadge, { backgroundColor: '#fef3c7' }]}>
                    <Text style={[styles.savingsBadgeText, { color: '#d97706' }]}>Good</Text>
                  </View>
                ) : (
                  <View style={[styles.savingsBadge, { backgroundColor: '#fee2e2' }]}>
                    <Text style={[styles.savingsBadgeText, { color: '#dc2626' }]}>
                      Need Improvement
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {savingsRate < 20 && monthlyIncome > 0 && (
            <View style={styles.tipContainer}>
              <AlertCircle size={16} color="#f59e0b" strokeWidth={2} />
              <Text style={styles.tipText}>
                Coba kurangi pengeluaran 10% untuk meningkatkan savings rate!
              </Text>
            </View>
          )}
        </View>

        {categoryStats.length > 0 && (
          <View style={styles.categoryCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Spending Categories</Text>
              <Text style={styles.sectionSubtitle}>Bulan ini</Text>
            </View>

            {categoryStats.map((stat, index) => (
              <View key={stat.category} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryDot, { backgroundColor: stat.color }]} />
                  <Text style={styles.categoryName}>{stat.category}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>{formatCurrency(stat.amount)}</Text>
                  <View style={styles.categoryPercentage}>
                    <Text style={styles.categoryPercentageText}>
                      {stat.percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.categoryChart}>
              <View style={styles.categoryBar}>
                {categoryStats.map((stat, index) => (
                  <View
                    key={stat.category}
                    style={{
                      width: `${stat.percentage}%`,
                      height: 8,
                      backgroundColor: stat.color,
                      borderRadius: index === 0 ? 4 : 0,
                      borderTopLeftRadius: index === 0 ? 4 : 0,
                      borderBottomLeftRadius: index === 0 ? 4 : 0,
                      borderTopRightRadius: index === categoryStats.length - 1 ? 4 : 0,
                      borderBottomRightRadius: index === categoryStats.length - 1 ? 4 : 0,
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaksi Terakhir</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={[styles.seeAll, { color: currentTheme.colors.primary }]}>
                Lihat Semua
              </Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <WalletIcon size={48} color="#d1d5db" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyText}>Belum ada transaksi</Text>
              <Text style={styles.emptySubtext}>Mulai catat keuangan kamu sekarang!</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/add-expense')}
              >
                <LinearGradient
                  colors={[currentTheme.colors.primary, currentTheme.colors.secondary]}
                  style={styles.emptyButtonGradient}
                >
                  <Text style={styles.emptyButtonText}>Tambah Transaksi</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            transactions.map((transaction) => {
              const wallet = wallets.find((w) => w.id === transaction.walletId);
              return (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        {
                          backgroundColor:
                            transaction.type === 'income'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                        },
                      ]}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowUpRight size={20} color="#10b981" strokeWidth={2.5} />
                      ) : (
                        <ArrowDownRight size={20} color="#ef4444" strokeWidth={2.5} />
                      )}
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>{transaction.description}</Text>
                      <View style={styles.transactionMeta}>
                        <Text style={styles.transactionSubtitle}>{wallet?.name}</Text>
                        <View style={styles.metaDot} />
                        <Text style={styles.transactionSubtitle}>
                          {formatDate(transaction.date)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color: transaction.type === 'income' ? '#10b981' : '#ef4444',
                      },
                    ]}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  balanceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 14,
  },
  insightsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  insightContent: {
    gap: 16,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  savingsRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingsBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#d97706',
    lineHeight: 16,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryPercentage: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryPercentageText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryChart: {
    marginTop: 8,
  },
  categoryBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#d1d5db',
    marginHorizontal: 6,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
