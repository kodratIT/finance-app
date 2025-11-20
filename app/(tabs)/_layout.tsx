import { Tabs } from 'expo-router';
import { Home, Wallet, History, User, Plus } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

function FloatingAddButton() {
  const { currentTheme } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.fabContainer}>
      <TouchableOpacity
        style={styles.fabTouchable}
        onPress={() => router.push('/add-expense')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[currentTheme.colors.primary, currentTheme.colors.secondary]}
          style={styles.fabGradient}
        >
          <Plus size={28} color="#ffffff" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const { currentTheme } = useTheme();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            height: 65,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: currentTheme.colors.primary,
          tabBarInactiveTintColor: '#9ca3af',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <Home size={24} color={color} strokeWidth={2.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="wallets"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ size, color }) => (
              <Wallet size={24} color={color} strokeWidth={2.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ size, color }) => (
              <History size={24} color={color} strokeWidth={2.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <User size={24} color={color} strokeWidth={2.5} />
            ),
          }}
        />
      </Tabs>
      <FloatingAddButton />
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 80,
    right: 24,
    zIndex: 1000,
  },
  fabTouchable: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
