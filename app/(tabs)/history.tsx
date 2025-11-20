import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { walletService } from '../../services/walletService';
import { transactionService } from '../../services/transactionService';
import { Wallet, Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES, Category } from '../../types';
import {
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  X,
  Check,
} from 'lucide-react-native';

type FilterType = 'all' | 'income' | 'expense';

export default function History() {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (user) {
      loadData();

      const unsubscribeWallets = walletService.subscribeToWallets(user.uid, (updatedWallets) => {
        setWallets(updatedWallets);
      });

      const unsubscribeTransactions = transactionService.subscribeToTransactions(
        user.uid,
        (updatedTransactions) => {
          setTransactions(updatedTransactions);
          applyFilter(updatedTransactions, filterType);
          calculateTotals(updatedTransactions);
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

      const transactionsData = await transactionService.getTransactions(user.uid);
      setTransactions(transactionsData);
      applyFilter(transactionsData, filterType);
      calculateTotals(transactionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateTotals = (allTransactions: Transaction[]) => {
    const income = allTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = allTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalIncome(income);
    setTotalExpense(expense);
  };

  const applyFilter = (allTransactions: Transaction[], type: FilterType) => {
    let filtered = allTransactions;

    if (type === 'income') {
      filtered = allTransactions.filter((t) => t.type === 'income');
    } else if (type === 'expense') {
      filtered = allTransactions.filter((t) => t.type === 'expense');
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type);
    applyFilter(transactions, type);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditAmount(transaction.amount.toString());
    setEditDescription(transaction.description);
    setEditModalVisible(true);
  };

  const handleEditTransaction = async () => {
    if (!user || !selectedTransaction) return;

    if (!editAmount || !editDescription) {
      Alert.alert('Error', 'Jumlah dan deskripsi harus diisi!');
      return;
    }

    const oldAmount = selectedTransaction.amount;
    const newAmount = parseFloat(editAmount);
    const amountDifference = newAmount - oldAmount;

    try {
      const wallet = wallets.find((w) => w.id === selectedTransaction.walletId);
      if (!wallet) {
        Alert.alert('Error', 'Wallet tidak ditemukan!');
        return;
      }

      let newBalance = wallet.balance;
      if (selectedTransaction.type === 'income') {
        newBalance = wallet.balance - oldAmount + newAmount;
      } else {
        newBalance = wallet.balance + oldAmount - newAmount;
      }

      await transactionService.updateTransaction(user.uid, selectedTransaction.id, {
        amount: newAmount,
        description: editDescription,
      });

      await walletService.updateWalletBalance(user.uid, wallet.id, newBalance);

      setEditModalVisible(false);
      setSelectedTransaction(null);
      Alert.alert('Berhasil', 'Transaksi berhasil diupdate!');
    } catch (error) {
      Alert.alert('Error', 'Gagal mengupdate transaksi!');
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Hapus Transaksi',
      `Yakin ingin menghapus transaksi ini?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              const wallet = wallets.find((w) => w.id === transaction.walletId);
              if (!wallet) {
                Alert.alert('Error', 'Wallet tidak ditemukan!');
                return;
              }

              let newBalance = wallet.balance;
              if (transaction.type === 'income') {
                newBalance = wallet.balance - transaction.amount;
              } else {
                newBalance = wallet.balance + transaction.amount;
              }

              await transactionService.deleteTransaction(user.uid, transaction.id);
              await walletService.updateWalletBalance(user.uid, wallet.id, newBalance);

              Alert.alert('Berhasil', 'Transaksi berhasil dihapus!');
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus transaksi!');
            }
          },
        },
      ]
    );
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
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getCategoryName = (categoryId: string, type: 'income' | 'expense') => {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: Transaction[] } = {};

    filteredTransactions.forEach((transaction) => {
      const dateKey = formatDate(transaction.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });

    return Object.entries(grouped).sort(([dateA], [dateB]) => {
      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();
      return timeB - timeA;
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[currentTheme.colors.primary, currentTheme.colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
              <TrendingUp size={20} color="#10b981" strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.statLabel}>Total Pendapatan</Text>
              <Text style={styles.statAmount}>{formatCurrency(totalIncome)}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}>
              <TrendingDown size={20} color="#ef4444" strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.statLabel}>Total Pengeluaran</Text>
              <Text style={styles.statAmount}>{formatCurrency(totalExpense)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
          onPress={() => handleFilterChange('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === 'all' && styles.filterButtonTextActive,
            ]}
          >
            Semua
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'income' && styles.filterButtonActiveIncome,
          ]}
          onPress={() => handleFilterChange('income')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === 'income' && styles.filterButtonTextActive,
            ]}
          >
            Pendapatan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'expense' && styles.filterButtonActiveExpense,
          ]}
          onPress={() => handleFilterChange('expense')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === 'expense' && styles.filterButtonTextActive,
            ]}
          >
            Pengeluaran
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Filter size={64} color="#d1d5db" strokeWidth={1.5} />
            <Text style={styles.emptyText}>Belum ada transaksi</Text>
            <Text style={styles.emptySubtext}>
              Transaksi yang kamu buat akan muncul di sini
            </Text>
          </View>
        ) : (
          groupTransactionsByDate().map(([date, dayTransactions]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>

              {dayTransactions.map((transaction) => {
                const wallet = wallets.find((w) => w.id === transaction.walletId);
                return (
                  <View key={transaction.id} style={styles.transactionCard}>
                    <View style={styles.transactionLeft}>
                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor:
                              transaction.type === 'income' ? '#dcfce7' : '#fee2e2',
                          },
                        ]}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpRight size={24} color="#10b981" strokeWidth={2.5} />
                        ) : (
                          <ArrowDownRight size={24} color="#ef4444" strokeWidth={2.5} />
                        )}
                      </View>
                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionTitle}>
                          {transaction.description}
                        </Text>
                        <Text style={styles.transactionSubtitle}>
                          {getCategoryName(transaction.category, transaction.type)}
                        </Text>
                        <Text style={styles.transactionWallet}>{wallet?.name}</Text>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
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
                      <View style={styles.transactionActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => openEditModal(transaction)}
                          activeOpacity={0.7}
                        >
                          <Edit size={16} color="#667eea" strokeWidth={2.5} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteTransaction(transaction)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={16} color="#ef4444" strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Transaksi</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color="#1f2937" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Jumlah</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencyPrefix}>Rp</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    value={editAmount}
                    onChangeText={(text) => setEditAmount(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Deskripsi</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Deskripsi transaksi"
                  placeholderTextColor="#9ca3af"
                  value={editDescription}
                  onChangeText={setEditDescription}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleEditTransaction}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.submitGradient}
                >
                  <Check size={20} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.submitButtonText}>Update Transaksi</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  statsContainer: {
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonActiveIncome: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonActiveExpense: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  dateGroup: {
    marginTop: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
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
    shadowOffset: { width: 0, height: 2 },
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  transactionWallet: {
    fontSize: 11,
    color: '#9ca3af',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 14,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1f2937',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
