import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as authDB from '../../utils/authDB';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const user = await authDB.getCurrentUser();
      if (user) {
        setEmail(user.email);
        setPassword(user.password);
      }
    };
    loadUser();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileBox}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          editable={false}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            secureTextEntry={!showPassword}
            value={password}
            editable={false}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color="#ccc"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBox: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#334155',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  eyeIcon: {
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 30,
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
