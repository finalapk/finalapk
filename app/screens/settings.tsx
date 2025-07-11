import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Appearance,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomDrawer from '../../components/CustomDrawer';
import { clearUserSession } from '../../utils/sqliteSession';

export default function SettingsScreen() {
  const [theme, setTheme] = useState('dark'); // default to dark
  const [showContact, setShowContact] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const colorScheme = Appearance.getColorScheme();
    setTheme(colorScheme || 'dark');
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearUserSession();
              setDrawerOpen(false);
              setShowContact(false);
              router.replace('../SignIn');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Profile */}
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>👤 Profile</Text>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => router.push('/screens/profile')}
        >
          <Text style={styles.optionButtonText}>View</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Us */}
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>📞 Contact Us</Text>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setShowContact(true)}
        >
          <Text style={styles.optionButtonText}>View</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>🚪 Logout</Text>
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: '#ef4444' }]}
          onPress={handleLogout}
        >
          <Text style={styles.optionButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Modal */}
      {showContact && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📍 MAIN OFFICE</Text>
            <Text style={styles.modalText}>
              501, 5th Floor Brigade IRV, Whitefield, Nallurhalli,{'\n'}
              Bengaluru, Karnataka 560066{'\n'}
              +91 9035411000
            </Text>

            <Text style={styles.modalTitle}>🇺🇸 USA OFFICE</Text>
            <Text style={styles.modalText}>
              3700 Cole Ave #431,{'\n'}
              Dallas, Texas 75204
            </Text>

            <Text style={styles.modalTitle}>✉️ Contact</Text>
            <Text style={styles.modalText}>support@indxo.ai</Text>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: '#10B981', marginTop: 20 }]}
              onPress={() => setShowContact(false)}
            >
              <Text style={styles.optionButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Drawer Overlay */}
      {drawerOpen && (
        <View style={styles.drawerOverlay}>
          <CustomDrawer onClose={() => setDrawerOpen(false)} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 16,
    paddingTop: 30,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: { marginRight: 15 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#fff',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#38bdf8',
  },
  optionButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#38bdf8',
  },
  modalText: {
    fontSize: 14,
    color: '#f0f0f0',
    marginTop: 4,
    lineHeight: 20,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
