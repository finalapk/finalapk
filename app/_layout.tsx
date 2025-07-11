// // app/_layout.tsx

// import * as Notifications from 'expo-notifications';
// import NetInfo from '@react-native-community/netinfo';
// import { Slot, useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Alert, View } from 'react-native';
// import { getLoginStatus, setupAuthDB } from '../utils/authDB'; // ✅ SQLite only

// export default function Layout() {
//   const [loading, setLoading] = useState(true);
//   const [isOnline, setIsOnline] = useState(false);
//   const router = useRouter();

//   // ✅ Setup notification permission
//   useEffect(() => {
//     const setupNotifications = async () => {
//       try {
//         await Notifications.requestPermissionsAsync();
//       } catch (e) {
//         console.warn('🔔 Notification permission error:', e);
//       }
//     };
//     setupNotifications();
//   }, []);

//   // ✅ Init App on Mount
//   useEffect(() => {
//     const initApp = async () => {
//       try {
//         await setupAuthDB(); // ✅ Ensure tables are ready

//         const net = await NetInfo.fetch();
//         const connected = net?.isConnected ?? false;
//         setIsOnline(connected);

//         if (!connected) {
//           console.log('🔴 App is OFFLINE');
//           Alert.alert('Offline Mode', 'You are in offline mode.');
//         } else {
//           console.log('🟢 App is ONLINE');
//         }

//         const isLoggedIn = await getLoginStatus();
//         console.log('👤 Login Status:', isLoggedIn);

//         // ✅ Navigate to correct screen
//         router.replace(isLoggedIn ? '../screens/dashboard' : './signin');
//       } catch (err) {
//         console.error('❌ Error during app init:', err);
//         Alert.alert('Error', 'Something went wrong during app initialization.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     initApp();

//     const unsubscribe = NetInfo.addEventListener((state) => {
//       setIsOnline(state.isConnected ?? false);
//     });

//     return () => unsubscribe();
//   }, []);

//   // ✅ Loading screen
//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
//         <ActivityIndicator size="large" color="#00B0FF" />
//       </View>
//     );
//   }

//   return <Slot />;
// }

import { Slot } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import CustomDrawer from '../components/CustomDrawer';

export default function RootLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Slot renders all your pages/screens */}
      <Slot />

      {/* Drawer logic */}
      {drawerOpen && (
        <>
          <Pressable style={styles.overlay} onPress={() => setDrawerOpen(false)} />
          <CustomDrawer onClose={() => setDrawerOpen(false)} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 99,
  },
});
