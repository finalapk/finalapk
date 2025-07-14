// // utils/dataSync.ts
// import NetInfo from '@react-native-community/netinfo';
// import axios from 'axios';
// import {
//   saveMachineDataOffline,
//   getMachineDataOffline,
//   saveLastSyncTimeToDB,
// } from './machineDB';

// const BASE_URL = 'https://finalapk.onrender.com';

// export const fetchAndCacheMachineData = async (
//   machineName: string,
//   date: string
// ): Promise<any> => {
//   const netInfo = await NetInfo.fetch();

//   if (netInfo.isConnected) {
//     try {
//       const response = await axios.get(`${BASE_URL}/machine-data`, {
//         params: { name: machineName, date },
//       });

//       const data = response.data;

//       await saveMachineDataOffline(
//         data.name,
//         data.date,
//         data.spindle_speed,
//         data.rest_time,
//         data.power_consumption,
//         data.status,
//          data.timestamp || new Date().toISOString()
//       );

//       await saveLastSyncTimeToDB(data.name, data.date);

//       return { ...data, source: 'online' };
//     } catch (error) {
//       console.warn('🟠 Server failed, loading from SQLite instead.');
//       const offlineData = await getMachineDataOffline(machineName, date);
//       return offlineData ? { ...offlineData, source: 'offline' } : null;
//     }
//   } else {
//     const offlineData = await getMachineDataOffline(machineName, date);
//     return offlineData ? { ...offlineData, source: 'offline' } : null;
//   }
// };


import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import {
  saveMachineDataOffline,
  getMachineDataOffline,
  saveLastSyncTimeToDB,
} from './machineDB';

// ✅ Use your deployed backend API
const BASE_URL = 'https://finalapk.onrender.com';

/**
 * Fetches machine data from server and caches it to local SQLite storage.
 * Falls back to offline data if offline or server fails.
 */
export const fetchAndCacheMachineData = async (
  machineName: string,
  date: string
): Promise<any> => {
  const netInfo = await NetInfo.fetch();

  if (netInfo.isConnected) {
    try {
      const response = await axios.get(`${BASE_URL}/machine-data`, {
        params: { name: machineName, date },
      });

      const data = response.data;

      // ✅ Save to SQLite with all required fields
      await saveMachineDataOffline(
        data.name,
        data.date,
        data.spindle_speed,
        data.rest_time,
        data.power_consumption,
        data.status,
        data.timestamp || new Date().toISOString()
      );

      // ✅ Record last sync time (optional feature)
      await saveLastSyncTimeToDB(data.name, data.date);

      return { ...data, source: 'online' };
    } catch (error) {
      console.warn('🟠 API error, loading offline data:', error?.message);
      const offlineData = await getMachineDataOffline(machineName, date);
      return offlineData ? { ...offlineData, source: 'offline' } : null;
    }
  } else {
    console.warn('🔌 Offline detected. Using SQLite fallback.');
    const offlineData = await getMachineDataOffline(machineName, date);
    return offlineData ? { ...offlineData, source: 'offline' } : null;
  }
};
