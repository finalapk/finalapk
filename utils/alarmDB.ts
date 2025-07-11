// utils/alarmDB.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('alarms.db');

// ✅ Create table for alarms
export const initAlarmsTable = async (): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      machine_name TEXT,
      alarm_type TEXT,
      message TEXT,
      timestamp TEXT
    );
  `);
};

// ✅ Insert a single alarm into SQLite
export const insertAlarm = async (alarm: {
  machine_name: string;
  alarm_type: string;
  message: string;
  timestamp: string;
}): Promise<void> => {
  await db.runAsync(
    `INSERT INTO offline_alarms (machine_name, alarm_type, message, timestamp)
     VALUES (?, ?, ?, ?)`,
    [alarm.machine_name, alarm.alarm_type, alarm.message, alarm.timestamp]
  );
};

// ✅ Delete existing alarms for the given machine
export const clearMachineAlarms = async (machineName: string): Promise<void> => {
  await db.runAsync(
    `DELETE FROM offline_alarms WHERE machine_name = ?`,
    [machineName]
  );
};

// ✅ Fetch alarms for the given machine from SQLite
export const getAlarmsByMachine = async (
  machineName: string,
  setAlarms: (data: any[]) => void
): Promise<void> => {
  const result = await db.getAllAsync<any>(
    `SELECT * FROM offline_alarms WHERE machine_name = ? ORDER BY timestamp DESC`,
    [machineName]
  );
  setAlarms(result ?? []);
};
