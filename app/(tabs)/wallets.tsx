import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { walletService } from '../../services/walletService';
import { Wallet, WALLET_PRESETS, CRYPTO_PRESETS } from '../../types';
import { cryptoService } from '../../services/cryptoService';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import { CryptoWalletCard } from '../../components/CryptoWalletCard';
import {
  Plus,
  Wallet as WalletIcon,
  X,
  Check,
  Edit,
  Trash2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react-native';

export default function Wallets() {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as 'bank' | 'cash' | 'ewallet' | 'crypto',
    icon: 'wallet',
    balance: '',
    color: '#667eea',
    cryptoId: '',
    cryptoSymbol: '',
  });
  const [showCryptoPresets, setShowCryptoPresets] = useState(false);
  
  const { totalBalance, loading: balanceLoading } = useWalletBalance(wallets);

  useEffect(() => {
    if (user) {
      const unsubscribe = walletService.subscribeToWallets(user.uid, (updatedWallets) => {
        setWallets(updatedWallets);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleCreateWallet = async () => {
    if (!user) return;

    if (!formData.name || !formData.balance) {
      Alert.alert('Error', 'Nama dan saldo harus diisi!');
      return;
    }

    if (formData.type === 'crypto' && !formData.cryptoId) {
      Alert.alert('Error', 'Pilih crypto terlebih dahulu!');
      return;
    }

    try {
      await walletService.createWallet(user.uid, {
        name: formData.name,
        type: formData.type,
        icon: formData.icon,
        balance: parseFloat(formData.balance),
        color: formData.color,
        cryptoId: formData.cryptoId || undefined,
        cryptoSymbol: formData.cryptoSymbol || undefined,
      });

      setModalVisible(false);
      resetForm();
      Alert.alert('Berhasil', 'Wallet berhasil ditambahkan!');
    } catch (error) {
      Alert.alert('Error', 'Gagal menambahkan wallet!');
    }
  };

  const handleUpdateWallet = async () => {
    if (!user || !selectedWallet) return;

    if (!formData.name || !formData.balance) {
      Alert.alert('Error', 'Nama dan saldo harus diisi!');
      return;
    }

    try {
      await walletService.updateWallet(user.uid, selectedWallet.id, {
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
        balance: parseFloat(formData.balance),
      });

      setEditModalVisible(false);
      setSelectedWallet(null);
      resetForm();
      Alert.alert('Berhasil', 'Wallet berhasil diupdate!');
    } catch (error) {
      Alert.alert('Error', 'Gagal mengupdate wallet!');
    }
  };

  const handleDeleteWallet = (wallet: Wallet) => {
    Alert.alert('Hapus Wallet', `Yakin ingin menghapus ${wallet.name}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          try {
            await walletService.deleteWallet(user.uid, wallet.id);
            Alert.alert('Berhasil', 'Wallet berhasil dihapus!');
          } catch (error) {
            Alert.alert('Error', 'Gagal menghapus wallet!');
          }
        },
      },
    ]);
  };

  const openEditModal = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setFormData({
      name: wallet.name,
      type: wallet.type,
      icon: wallet.icon,
      balance: wallet.balance.toString(),
      color: wallet.color,
      cryptoId: wallet.cryptoId || '',
      cryptoSymbol: wallet.cryptoSymbol || '',
    });
    setEditModalVisible(true);
  };

  const selectPreset = (preset: (typeof WALLET_PRESETS)[0]) => {
    setFormData({
      ...formData,
      name: preset.name,
      type: preset.type,
      icon: preset.icon,
      color: preset.color,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'bank',
      icon: 'wallet',
      balance: '',
      color: '#667eea',
      cryptoId: '',
      cryptoSymbol: '',
    });
    setShowCryptoPresets(false);
  };

  const selectCryptoPreset = (preset: typeof CRYPTO_PRESETS[0]) => {
    setFormData({
      ...formData,
      name: preset.name,
      type: 'crypto',
      icon: preset.icon,
      color: preset.color,
      cryptoId: preset.id,
      cryptoSymbol: preset.symbol,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalBalance = () => {
    return totalBalance;
  };

  const getWalletTypeLabel = (type: string) => {
    switch (type) {
      case 'bank':
        return 'Bank';
      case 'cash':
        return 'Tunai';
      case 'ewallet':
        return 'E-Wallet';
      case 'crypto':
        return 'Crypto';
      default:
        return type;
    }
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <CreditCard size={24} color="#ffffff" strokeWidth={2.5} />;
      case 'cash':
        return <Banknote size={24} color="#ffffff" strokeWidth={2.5} />;
      case 'ewallet':
        return <Smartphone size={24} color="#ffffff" strokeWidth={2.5} />;
      default:
        return <WalletIcon size={24} color="#ffffff" strokeWidth={2.5} />;
    }
  };

  const getWalletStats = (wallet: Wallet) => {
    const percentage = (wallet.balance / getTotalBalance()) * 100;
    return percentage.toFixed(1);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[currentTheme.colors.primary, currentTheme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerLabel}>Total Saldo</Text>
            <Text style={styles.totalBalance}>{formatCurrency(getTotalBalance())}</Text>
            <View style={styles.walletCount}>
              <WalletIcon size={14} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.walletCountText}>{wallets.length} Wallet</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addHeaderButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={24} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#f3f4f6', '#e5e7eb']}
              style={styles.emptyIconContainer}
            >
              <WalletIcon size={64} color="#9ca3af" strokeWidth={1.5} />
            </LinearGradient>
            <Text style={styles.emptyText}>Belum ada wallet</Text>
            <Text style={styles.emptySubtext}>
              Tambahkan wallet pertama untuk mulai mengelola keuangan!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[currentTheme.colors.primary, currentTheme.colors.secondary]}
                style={styles.emptyButtonGradient}
              >
                <Plus size={20} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.emptyButtonText}>Tambah Wallet</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.walletList}>
            {wallets.map((wallet) => (
              wallet.type === 'crypto' ? (
                <CryptoWalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onEdit={() => openEditModal(wallet)}
                  onDelete={() => handleDeleteWallet(wallet)}
                />
              ) : (
                <View
                  key={wallet.id}
                  style={styles.walletCard}
                >
                  <LinearGradient
                    colors={[wallet.color + 'E6', wallet.color]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.walletCardGradient}
                  >
                    <View style={styles.walletCardHeader}>
                      <View style={styles.walletIconContainer}>
                        {getWalletIcon(wallet.type)}
                      </View>
                      <View style={styles.walletActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => {
                            console.log('Edit clicked for:', wallet.name);
                            openEditModal(wallet);
                          }}
                          activeOpacity={0.7}
                        >
                          <Edit size={16} color="#ffffff" strokeWidth={2.5} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => {
                            console.log('Delete clicked for:', wallet.name);
                            handleDeleteWallet(wallet);
                          }}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={16} color="#ffffff" strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.walletInfo}>
                      <Text style={styles.walletType}>{getWalletTypeLabel(wallet.type)}</Text>
                      <Text style={styles.walletName}>{wallet.name}</Text>
                    </View>

                    <View style={styles.walletBalanceContainer}>
                      <Text style={styles.walletBalance}>{formatCurrency(wallet.balance)}</Text>
                      <View style={styles.walletPercentage}>
                        <TrendingUp size={12} color="#ffffff" strokeWidth={2.5} />
                        <Text style={styles.walletPercentageText}>
                          {getWalletStats(wallet)}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.walletPattern} pointerEvents="none">
                      <View style={[styles.patternDot, { opacity: 0.1 }]} />
                      <View style={[styles.patternDot, { opacity: 0.15 }]} />
                      <View style={[styles.patternDot, { opacity: 0.1 }]} />
                    </View>
                  </LinearGradient>
                </View>
              )
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Tambah Wallet Baru</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <X size={24} color="#6b7280" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
              <View style={styles.section}>
                <View style={styles.tabHeader}>
                  <TouchableOpacity
                    style={[styles.tab, !showCryptoPresets && styles.tabActive]}
                    onPress={() => setShowCryptoPresets(false)}
                  >
                    <Text style={[styles.tabText, !showCryptoPresets && styles.tabTextActive]}>
                      Fiat
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, showCryptoPresets && styles.tabActive]}
                    onPress={() => setShowCryptoPresets(true)}
                  >
                    <Text style={[styles.tabText, showCryptoPresets && styles.tabTextActive]}>
                      Crypto
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.presetRow}>
                    {!showCryptoPresets ? (
                      WALLET_PRESETS.map((preset) => {
                        const isSelected = formData.name === preset.name && formData.type !== 'crypto';
                        return (
                          <TouchableOpacity
                            key={preset.name}
                            style={[
                              styles.presetCard,
                              isSelected && {
                                borderColor: preset.color,
                                backgroundColor: preset.color + '15',
                              },
                            ]}
                            onPress={() => selectPreset(preset)}
                            activeOpacity={0.7}
                          >
                            {isSelected && (
                              <View
                                style={[styles.presetCheck, { backgroundColor: preset.color }]}
                              >
                                <Check size={12} color="#ffffff" strokeWidth={3} />
                              </View>
                            )}
                            <LinearGradient
                              colors={[preset.color + '30', preset.color + '15']}
                              style={styles.presetIcon}
                            >
                              <WalletIcon size={20} color={preset.color} strokeWidth={2.5} />
                            </LinearGradient>
                            <Text style={styles.presetName}>{preset.name}</Text>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      CRYPTO_PRESETS.map((preset) => {
                        const isSelected = formData.cryptoId === preset.id;
                        return (
                          <TouchableOpacity
                            key={preset.id}
                            style={[
                              styles.presetCard,
                              isSelected && {
                                borderColor: preset.color,
                                backgroundColor: preset.color + '15',
                              },
                            ]}
                            onPress={() => selectCryptoPreset(preset)}
                            activeOpacity={0.7}
                          >
                            {isSelected && (
                              <View
                                style={[styles.presetCheck, { backgroundColor: preset.color }]}
                              >
                                <Check size={12} color="#ffffff" strokeWidth={3} />
                              </View>
                            )}
                            <LinearGradient
                              colors={[preset.color + '30', preset.color + '15']}
                              style={styles.presetIcon}
                            >
                              <Text style={[styles.cryptoIcon, { color: preset.color }]}>
                                {preset.icon}
                              </Text>
                            </LinearGradient>
                            <Text style={styles.presetName}>{preset.symbol}</Text>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Nama Wallet</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: BCA, Cash, OVO"
                  placeholderTextColor="#9ca3af"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>
                  {formData.type === 'crypto' ? `Jumlah ${formData.cryptoSymbol || 'Coin'}` : 'Saldo Awal'}
                </Text>
                <View style={styles.currencyInput}>
                  {formData.type !== 'crypto' && (
                    <Text style={styles.currencyPrefix}>Rp</Text>
                  )}
                  <TextInput
                    style={styles.textInputAmount}
                    placeholder={formData.type === 'crypto' ? '0.00' : '0'}
                    placeholderTextColor="#9ca3af"
                    value={formData.balance}
                    onChangeText={(text) => {
                      if (formData.type === 'crypto') {
                        // Allow decimals for crypto, but only one dot
                        let cleaned = text.replace(/[^0-9.]/g, '');
                        // Prevent multiple dots
                        const parts = cleaned.split('.');
                        if (parts.length > 2) {
                          cleaned = parts[0] + '.' + parts.slice(1).join('');
                        }
                        // Prevent leading zeros (except 0. or 0)
                        if (cleaned.length > 1 && cleaned[0] === '0' && cleaned[1] !== '.') {
                          cleaned = cleaned.substring(1);
                        }
                        setFormData({ ...formData, balance: cleaned });
                      } else {
                        // For fiat, remove leading zeros
                        let cleaned = text.replace(/[^0-9]/g, '');
                        if (cleaned.length > 1 && cleaned[0] === '0') {
                          cleaned = cleaned.substring(1);
                        }
                        setFormData({ ...formData, balance: cleaned });
                      }
                    }}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  {formData.type === 'crypto' && formData.cryptoSymbol && (
                    <Text style={styles.currencyPrefix}>{formData.cryptoSymbol}</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateWallet}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[currentTheme.colors.primary, currentTheme.colors.secondary]}
                  style={styles.submitGradient}
                >
                  <Check size={20} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.submitButtonText}>Tambah Wallet</Text>
                </LinearGradient>
              </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Wallet</Text>
                  <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                    <X size={24} color="#6b7280" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
              <View style={styles.section}>
                <Text style={styles.label}>Nama Wallet</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nama wallet"
                  placeholderTextColor="#9ca3af"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>
                  {formData.type === 'crypto' ? `Jumlah ${formData.cryptoSymbol || 'Coin'}` : 'Saldo'}
                </Text>
                <View style={styles.currencyInput}>
                  {formData.type !== 'crypto' && (
                    <Text style={styles.currencyPrefix}>Rp</Text>
                  )}
                  <TextInput
                    style={styles.textInputAmount}
                    placeholder={formData.type === 'crypto' ? '0.00' : '0'}
                    placeholderTextColor="#9ca3af"
                    value={formData.balance}
                    onChangeText={(text) => {
                      if (formData.type === 'crypto') {
                        // Allow decimals for crypto, but only one dot
                        let cleaned = text.replace(/[^0-9.]/g, '');
                        // Prevent multiple dots
                        const parts = cleaned.split('.');
                        if (parts.length > 2) {
                          cleaned = parts[0] + '.' + parts.slice(1).join('');
                        }
                        // Prevent leading zeros (except 0. or 0)
                        if (cleaned.length > 1 && cleaned[0] === '0' && cleaned[1] !== '.') {
                          cleaned = cleaned.substring(1);
                        }
                        setFormData({ ...formData, balance: cleaned });
                      } else {
                        // For fiat, remove leading zeros
                        let cleaned = text.replace(/[^0-9]/g, '');
                        if (cleaned.length > 1 && cleaned[0] === '0') {
                          cleaned = cleaned.substring(1);
                        }
                        setFormData({ ...formData, balance: cleaned });
                      }
                    }}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  {formData.type === 'crypto' && formData.cryptoSymbol && (
                    <Text style={styles.currencyPrefix}>{formData.cryptoSymbol}</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpdateWallet}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[currentTheme.colors.primary, currentTheme.colors.secondary]}
                  style={styles.submitGradient}
                >
                  <Check size={20} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.submitButtonText}>Update Wallet</Text>
                </LinearGradient>
              </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  totalBalance: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  walletCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  walletCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  addHeaderButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 32,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  walletList: {
    gap: 16,
  },
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
    minHeight: 180,
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
    marginBottom: 20,
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
  walletPercentage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  walletPercentageText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  presetCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 90,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  presetCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  textInputAmount: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#1f2937',
  },
  cryptoIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
