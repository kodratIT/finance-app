import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'expo-router';
import {
  User as UserIcon,
  Mail,
  Wallet,
  LogOut,
  ChevronRight,
  Settings,
  HelpCircle,
  Info,
  Palette,
  Check,
} from 'lucide-react-native';

export default function Profile() {
  const { user, logout } = useAuth();
  const { currentTheme, themeKey, setTheme, allThemes } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Yakin ingin keluar dari aplikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/welcome');
            } catch (error) {
              Alert.alert('Error', 'Gagal logout!');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: Settings,
      title: 'Pengaturan',
      subtitle: 'Kelola preferensi aplikasi',
      onPress: () => Alert.alert('Coming Soon', 'Fitur ini akan segera tersedia!'),
    },
    {
      icon: HelpCircle,
      title: 'Bantuan',
      subtitle: 'Dapatkan bantuan & FAQ',
      onPress: () => Alert.alert('Coming Soon', 'Fitur ini akan segera tersedia!'),
    },
    {
      icon: Info,
      title: 'Tentang Aplikasi',
      subtitle: 'Versi 1.0.0',
      onPress: () => Alert.alert(
        'MoneyTrack',
        'Aplikasi catatan keuangan pribadi yang mudah dan seru!\n\nVersi 1.0.0\n\n© 2024 MoneyTrack'
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[currentTheme.colors.primary, currentTheme.colors.secondary]} style={styles.header}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
          </View>

          <Text style={styles.userName}>{user?.displayName}</Text>
          <View style={styles.emailContainer}>
            <Mail size={16} color="#ffffff" strokeWidth={2} />
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Akun</Text>

          <View style={styles.menuCard}>
            <View style={styles.infoRow}>
              <LinearGradient
                colors={[currentTheme.colors.primary + '20', currentTheme.colors.primary + '10']}
                style={styles.infoIcon}
              >
                <UserIcon size={20} color={currentTheme.colors.primary} strokeWidth={2} />
              </LinearGradient>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nama Lengkap</Text>
                <Text style={styles.infoValue}>{user?.displayName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <LinearGradient
                colors={[currentTheme.colors.primary + '20', currentTheme.colors.primary + '10']}
                style={styles.infoIcon}
              >
                <Mail size={20} color={currentTheme.colors.primary} strokeWidth={2} />
              </LinearGradient>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tema Aplikasi</Text>

          <View style={styles.themesContainer}>
            {Object.entries(allThemes).map(([key, theme]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeCard,
                  themeKey === key && styles.themeCardActive,
                ]}
                onPress={() => setTheme(key)}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary, theme.colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.themeGradient}
                >
                  {themeKey === key && (
                    <View style={styles.themeCheck}>
                      <Check size={20} color="#ffffff" strokeWidth={3} />
                    </View>
                  )}
                </LinearGradient>
                <Text style={[
                  styles.themeName,
                  themeKey === key && styles.themeNameActive
                ]}>
                  {theme.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lainnya</Text>

          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <View style={styles.menuLeft}>
                    <LinearGradient
                      colors={[currentTheme.colors.primary + '20', currentTheme.colors.primary + '10']}
                      style={styles.menuIcon}
                    >
                      <item.icon size={20} color={currentTheme.colors.primary} strokeWidth={2} />
                    </LinearGradient>
                    <View>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9ca3af" strokeWidth={2} />
                </TouchableOpacity>
                {index < menuItems.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            style={styles.logoutGradient}
          >
            <LogOut size={20} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MoneyTrack v1.0.0</Text>
          <Text style={styles.footerSubtext}>Kelola keuangan dengan mudah & seru</Text>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileCard: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  userEmail: {
    fontSize: 14,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#d1d5db',
  },
  themesContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  themeCard: {
    flex: 1,
    minWidth: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  themeCardActive: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  themeGradient: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  themeCheck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 12,
  },
  themeNameActive: {
    color: '#667eea',
    fontWeight: 'bold',
  },
});
