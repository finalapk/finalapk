import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import NetInfo from '@react-native-community/netinfo';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import CustomDrawer from '../../components/CustomDrawer';
import { insertPowerLogs, getPowerLogs, createPowerTable } from '../../utils/powerchartdb';

const screenWidth = Dimensions.get('window').width;
const API_URL = 'https://cncofflinemode.onrender.com/power-data';
const machineList = ['Machine 01', 'Machine 02', 'Machine 03'];

export default function PowerChart() {
  const [selectedMachine, setSelectedMachine] = useState('Machine 01');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [powerData, setPowerData] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [landscape, setLandscape] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<'online' | 'offline'>('offline');

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const closeDrawer = () => setDrawerOpen(false);

  const averagePower = () => {
    if (powerData.length === 0) return 0;
    const sum = powerData.reduce((acc, item) => acc + item.power_value, 0);
    return +(sum / powerData.length).toFixed(2);
  };

  const fetchPowerData = async () => {
    const formattedDate = date.toISOString().split('T')[0];
    const net = await NetInfo.fetch();
    const isConnected = net.isConnected && net.isInternetReachable;

    if (isConnected) {
      try {
        const res = await fetch(`${API_URL}?machine=${selectedMachine}&date=${formattedDate}`);
        const data = await res.json();
        const logsWithMachine = data.map((item: any) => ({
          ...item,
          machine: selectedMachine,
        }));

        setPowerData(logsWithMachine);
        setLastUpdated(new Date());
        setDataSource('online');
        await insertPowerLogs(selectedMachine, formattedDate, logsWithMachine);
        ToastAndroid.show('🌐 Fetched from server', ToastAndroid.SHORT);
      } catch (err) {
        await showOfflineFallback(formattedDate);
      }
    } else {
      await showOfflineFallback(formattedDate);
    }
  };

  const showOfflineFallback = async (formattedDate: string) => {
    const localData = await getPowerLogs(selectedMachine, formattedDate);

    if (localData.length > 0) {
      setPowerData(localData);
      setDataSource('offline');
      ToastAndroid.show('📴 Loaded offline data', ToastAndroid.SHORT);
    } else {
      setPowerData([]);
      ToastAndroid.show('❌ No offline data found', ToastAndroid.SHORT);
    }
  };

  useEffect(() => {
    createPowerTable(); // ✅ Ensure table is created before doing anything

    let previousConnection: boolean | null = null;

    const fetchInitialData = async () => {
      await fetchPowerData();
    };

    fetchInitialData();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected && state.isInternetReachable;
      if (isConnected !== previousConnection) {
        previousConnection = isConnected;
        fetchPowerData();
      }
    });

    return () => unsubscribe();
  }, [selectedMachine, date]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPowerData();
    setRefreshing(false);
  };

  const toggleOrientation = async () => {
    const orientation = landscape
      ? ScreenOrientation.OrientationLock.PORTRAIT_UP
      : ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT;
    await ScreenOrientation.lockAsync(orientation);
    setLandscape(!landscape);
  };

  const timeLabels = powerData.map((item, index) => {
    const date = new Date(item.timestamp);
    return index % 10 === 0 ? `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}` : '';
  });

  const powerValues = powerData.map((item) => item.power_value);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWithMenu}>
        <TouchableOpacity onPress={toggleDrawer}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>🔌 Power Chart</Text>
        <TouchableOpacity onPress={toggleOrientation} style={{ paddingRight: 20 }}>
          <Ionicons name="phone-portrait-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.dropdownButton} onPress={() => setDropdownVisible(!dropdownVisible)}>
            <Text style={styles.dropdownText}>{selectedMachine}</Text>
            <Ionicons name="chevron-down" color="#fff" size={16} />
          </TouchableOpacity>
          {dropdownVisible && (
            <View style={styles.dropdownList}>
              {machineList.map((machine) => (
                <TouchableOpacity
                  key={machine}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedMachine(machine);
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{machine}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>{date.toDateString()}</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <View style={styles.utilizationContainer}>
          <AnimatedCircularProgress
            size={120}
            width={12}
            fill={Math.min((averagePower() / 10) * 100, 100)}
            tintColor="#00e0ff"
            backgroundColor="#3d5875"
          >
            {() => <Text style={styles.circularText}>{averagePower()} kW</Text>}
          </AnimatedCircularProgress>
          <Text style={styles.utilizationLabel}>Avg Power Usage</Text>
        </View>

        <Text style={styles.chartTitle}>Power Consumption Over Time</Text>
        {powerData.length > 0 ? (
          <ScrollView horizontal>
            <LineChart
              data={{ labels: timeLabels, datasets: [{ data: powerValues }] }}
              width={Math.max(powerValues.length * 20, screenWidth)}
              height={250}
              chartConfig={{
                backgroundColor: '#1F2937',
                backgroundGradientFrom: '#1F2937',
                backgroundGradientTo: '#111827',
                color: () => '#10B981',
                labelColor: () => '#ccc',
                decimalPlaces: 2,
                propsForDots: { r: '2', strokeWidth: '1', stroke: '#10B981' },
              }}
              withInnerLines
              bezier
              style={{ marginHorizontal: 20, borderRadius: 16 }}
            />
          </ScrollView>
        ) : (
          <Text style={{ color: '#ccc', textAlign: 'center', marginVertical: 20 }}>No data available</Text>
        )}

        <Text style={styles.metaText}>📡 Data Source: <Text style={{ color: '#22c55e' }}>{dataSource}</Text></Text>
        {lastUpdated && (
          <Text style={styles.metaText}>⏱️ Last Updated: {lastUpdated.toLocaleTimeString()}</Text>
        )}
      </ScrollView>

      {drawerOpen && (
        <Pressable style={styles.drawerOverlay} onPress={closeDrawer}>
          <CustomDrawer onClose={closeDrawer} />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  headerWithMenu: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 50 : 60, paddingHorizontal: 15, paddingBottom: 20,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 16 },
  dropdownButton: {
    backgroundColor: '#1F2937', borderRadius: 8, padding: 10, flexDirection: 'row', alignItems: 'center',
  },
  dropdownText: { color: '#fff', fontSize: 16 },
  dropdownList: { backgroundColor: '#1F2937', borderRadius: 8, marginTop: 4 },
  dropdownItem: { padding: 10 },
  dropdownItemText: { color: '#fff' },
  dateButton: { backgroundColor: '#1F2937', borderRadius: 8, padding: 10 },
  dateText: { color: '#fff' },
  utilizationContainer: { alignItems: 'center', marginBottom: 30 },
  circularText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  utilizationLabel: { color: '#ccc', marginTop: 6 },
  chartTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 20, marginBottom: 10 },
  metaText: { color: '#aaa', textAlign: 'center', marginTop: 6 },
  drawerOverlay: {
    position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1000,
  },
});
