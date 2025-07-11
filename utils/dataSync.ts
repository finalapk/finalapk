// utils/dataSync.ts
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import {
  saveMachineDataOffline,
  getMachineDataOffline,
  saveLastSyncTimeToDB,
} from './machineDB';

const BASE_URL = 'https://indxoapp.onrender.com';

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

      await saveMachineDataOffline(
        data.name,
        data.date,
        data.spindle_speed,
        data.rest_time,
        data.power_consumption,
        data.status
      );

      await saveLastSyncTimeToDB(data.name, data.date);

      return { ...data, source: 'online' };
    } catch (error) {
      console.warn('🟠 Server failed, loading from SQLite instead.');
      const offlineData = await getMachineDataOffline(machineName, date);
      return offlineData ? { ...offlineData, source: 'offline' } : null;
    }
  } else {
    const offlineData = await getMachineDataOffline(machineName, date);
    return offlineData ? { ...offlineData, source: 'offline' } : null;
  }
};
