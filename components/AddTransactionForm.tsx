import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { walletService } from '../services/walletService';
import { transactionService } from '../services/transactionService';
import { Wallet, Category } from '../types';
import {
  ArrowLeft,
  Check,
  Wallet as WalletIcon,
  Calendar,
  FileText,
  DollarSign,
  ChevronRight,
  X,
} from 'lucide-react-native';

interface AddTransactionFormProps {
  type: 'income' | 'expense';
  categories: Category[];
  title: string;
  gradientColors: [string, string];
  accentColor: string;
}

export default function AddTransactionForm({
  type,
  categories,
  title,
  gradientColors,
  accentColor,
}: AddTransactionFormProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [amount, setAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      loadWallets();
    }
  }, [user]);

  const loadWallets = async () => {
    if (!user) return;
    const walletsData = await walletService.getWallets(user.uid);
    setWallets(walletsData);
    if (walletsData.length > 0) {
      setSelectedWallet(walletsData[0].id);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!amount || !selectedWallet || !description) {
      Alert.alert('Error', 'Semua field harus diisi!');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Jumlah harus berupa angka positif!');
      return;
    }

    if (type === 'expense') {
      const wallet = wallets.find((w) => w.id === selectedWallet);
      if (wallet && wallet.balance < amountNum) {
        Alert.alert('Error', 'Saldo wallet tidak mencukupi!');
        return;
      }
    }

    setLoading(true);
    try {
      await transactionService.createTransaction(user.uid, {
        walletId: selectedWallet,
        type,
        amount: amountNum,
        category: selectedCategory,
        description,
        date: date.getTime(),
      });

      const successMessage =
        type === 'income'
          ? 'Pendapatan berhasil ditambahkan!'
          : 'Pengeluaran berhasil ditambahkan!';
      Alert.alert('Berhasil', successMessage, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', `Gagal menambahkan ${type === 'income' ? 'pendapatan' : 'pengeluaran'}!`);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    return cleaned;
  };

  const displayAmount = () => {
    if (!amount) return '0';
    return new Intl.NumberFormat('id-ID').format(parseFloat(amount));
  };

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);
  const selectedWalletData = wallets.find((w) => w.id === selectedWallet);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradientColors} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.amountSection}>
          <View style={styles.amountLabelContainer}>
            <DollarSign size={16} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.amountLabel}>Jumlah</Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>Rp</Text>
            <Text style={styles.amountDisplay}>{displayAmount()}</Text>
          </View>
          {selectedCategoryData && (
            <View style={styles.categoryBadge}>
              <View
                style={[styles.categoryDot, { backgroundColor: selectedCategoryData.color }]}
              />
              <Text style={styles.categoryBadgeText}>{selectedCategoryData.name}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <DollarSign size={20} color={accentColor} strokeWidth={2.5} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Masukkan Jumlah</Text>
              <TextInput
                style={[
                  styles.numberInput,
                  focusedInput === 'amount' && {
                    borderColor: accentColor,
                  },
                ]}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={amount}
                onChangeText={(text) => setAmount(formatNumber(text))}
                keyboardType="numeric"
                returnKeyType="done"
                onFocus={() => setFocusedInput('amount')}
                onBlur={() => setFocusedInput(null)}
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => setWalletModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <WalletIcon size={20} color={accentColor} strokeWidth={2.5} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Wallet</Text>
              {selectedWalletData ? (
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedText}>{selectedWalletData.name}</Text>
                  <Text style={styles.selectedSubtext}>
                    {formatCurrency(selectedWalletData.balance)}
                  </Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Pilih wallet</Text>
              )}
            </View>
            <ChevronRight size={20} color="#9ca3af" strokeWidth={2} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => setCategoryModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Text style={{ fontSize: 20 }}>🏷️</Text>
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Kategori</Text>
              {selectedCategoryData ? (
                <View style={styles.selectedInfo}>
                  <View style={styles.categoryIndicator}>
                    <View
                      style={[
                        styles.categoryDotLarge,
                        { backgroundColor: selectedCategoryData.color },
                      ]}
                    />
                    <Text style={styles.selectedText}>{selectedCategoryData.name}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Pilih kategori</Text>
              )}
            </View>
            <ChevronRight size={20} color="#9ca3af" strokeWidth={2} />
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <FileText size={20} color={accentColor} strokeWidth={2.5} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Deskripsi</Text>
              <TextInput
                style={[
                  styles.textArea,
                  focusedInput === 'description' && {
                    borderColor: accentColor,
                  },
                ]}
                placeholder={
                  type === 'income'
                    ? 'Contoh: Gaji bulan ini'
                    : 'Contoh: Makan siang di resto'
                }
                placeholderTextColor="#9ca3af"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
                returnKeyType="done"
                blurOnSubmit={true}
                onFocus={() => setFocusedInput('description')}
                onBlur={() => setFocusedInput(null)}
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient colors={gradientColors} style={styles.submitGradient}>
            <Check size={24} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.submitButtonText}>
              {loading ? 'Menyimpan...' : `Simpan ${type === 'income' ? 'Pendapatan' : 'Pengeluaran'}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal
        visible={walletModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWalletModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Wallet</Text>
              <TouchableOpacity onPress={() => setWalletModalVisible(false)}>
                <X size={24} color="#1f2937" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {wallets.map((wallet) => {
                const isSelected = selectedWallet === wallet.id;
                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[
                      styles.modalItem,
                      isSelected && { backgroundColor: `${accentColor}10` },
                    ]}
                    onPress={() => {
                      setSelectedWallet(wallet.id);
                      setWalletModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[wallet.color + '30', wallet.color + '15']}
                      style={styles.modalWalletIcon}
                    >
                      <Text style={styles.walletEmoji}>💳</Text>
                    </LinearGradient>
                    <View style={styles.modalItemContent}>
                      <Text style={styles.modalItemTitle}>{wallet.name}</Text>
                      <Text style={styles.modalItemSubtitle}>
                        {formatCurrency(wallet.balance)}
                      </Text>
                    </View>
                    {isSelected && (
                      <Check size={20} color={accentColor} strokeWidth={3} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kategori</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <X size={24} color="#1f2937" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.modalItem,
                      isSelected && { backgroundColor: `${category.color}10` },
                    ]}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      setCategoryModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.modalCategoryIcon,
                        { backgroundColor: `${category.color}20` },
                      ]}
                    >
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: category.color },
                        ]}
                      />
                    </View>
                    <View style={styles.modalItemContent}>
                      <Text style={styles.modalItemTitle}>{category.name}</Text>
                    </View>
                    {isSelected && (
                      <Check size={20} color={category.color} strokeWidth={3} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  amountSection: {
    alignItems: 'center',
  },
  amountLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
    opacity: 0.9,
  },
  amountDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  inputIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  numberInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  walletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    minWidth: 110,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  walletIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  walletEmoji: {
    fontSize: 28,
  },
  walletName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkmarkSmall: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  textArea: {
    fontSize: 15,
    color: '#1f2937',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  selectedInfo: {
    marginTop: 4,
  },
  selectedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  selectedSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  placeholderText: {
    fontSize: 15,
    color: '#9ca3af',
    marginTop: 4,
  },
  categoryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    maxHeight: '70%',
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
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalWalletIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCategoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalItemSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
});
