// components/CustomDrawer.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logoutUser } from '../utils/authDB';

type DrawerItem = {
  label: string;
  icon: string;
  path: string;
};

const drawerItems: DrawerItem[] = [
  { label: 'Dashboard', icon: '📊', path: '/screens/dashboard' },
  { label: 'Alarm', icon: '🚨', path: '/screens/alarm' },
  { label: 'Spindle Chart', icon: '🌀', path: '/screens/spindleChart' },
  { label: 'Power Chart', icon: '⚡', path: '/screens/powerChart' },
  { label: 'Machine Details', icon: '🛠️', path: '/screens/machinedetails' },
  { label: 'Settings', icon: '⚙️', path: '/screens/settings' }, // ✅ Added Settings
];

export default function CustomDrawer({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const navigateTo = (path: string) => {
    onClose();
    router.replace(path);
  };

  const handleSignOut = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutUser();
            onClose();
            router.replace('../SignIn'); // ✅ Correct path
          } catch (err) {
            console.error('❌ Error signing out:', err);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.drawer}>
      <Text style={styles.header}>📂 Menu</Text>

      {drawerItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          onPress={() => navigateTo(item.path)}
          style={styles.item}
        >
          <Text style={styles.text}>
            {item.icon} {item.label}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={handleSignOut} style={styles.item}>
        <Text style={styles.text}>🚪 Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 230,
    height: '100%',
    backgroundColor: '#222',
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 999,
  },
  header: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    paddingVertical: 12,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
