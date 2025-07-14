

// import { Slot } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import { View, Pressable, StyleSheet } from 'react-native';
// import CustomDrawer from '../components/CustomDrawer';
// import { syncLatestMachineData, setupMachineDB } from '../utils/machinedetailsDB';

// export default function RootLayout() {
//   const [drawerOpen, setDrawerOpen] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       await setupMachineDB();         // ✅ Ensure DB is setup correctly
//       await syncLatestMachineData();  // ✅ Fetch and store data
//     };
//     init();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Slot />
//       {drawerOpen && (
//         <>
//           <Pressable style={styles.overlay} onPress={() => setDrawerOpen(false)} />
//           <CustomDrawer onClose={() => setDrawerOpen(false)} />
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   overlay: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     top: 0,
//     left: 0,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     zIndex: 99,
//   },
// });



// app/_layout.tsx
import { Slot } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import CustomDrawer from '../components/CustomDrawer';
import { setupMachineDB, syncLatestMachineData } from '../utils/machinedetailsDB';

export default function RootLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await setupMachineDB();         // ✅ Create SQLite tables if needed
        await syncLatestMachineData();  // ✅ Sync latest machine data from server
      } catch (error) {
        console.warn('⚠️ Machine DB init error:', error.message);
      }
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Slot />
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
  container: { flex: 1 },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 99,
  },
});
