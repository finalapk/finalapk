// // utils/alarmDB.ts
// import * as SQLite from 'expo-sqlite';

// const db = SQLite.openDatabaseSync('alarms.db');

// // ✅ Create table for alarms
// export const initAlarmsTable = async (): Promise<void> => {
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS offline_alarms (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       machine_name TEXT,
//       alarm_type TEXT,
//       message TEXT,
//       timestamp TEXT
//     );
//   `);
// };

// // ✅ Insert a single alarm into SQLite
// export const insertAlarm = async (alarm: {
//   machine_name: string;
//   alarm_type: string;
//   message: string;
//   timestamp: string;
// }): Promise<void> => {
//   await db.runAsync(
//     `INSERT INTO offline_alarms (machine_name, alarm_type, message, timestamp)
//      VALUES (?, ?, ?, ?)`,
//     [alarm.machine_name, alarm.alarm_type, alarm.message, alarm.timestamp]
//   );
// };

// // ✅ Delete existing alarms for the given machine
// export const clearMachineAlarms = async (machineName: string): Promise<void> => {
//   await db.runAsync(
//     `DELETE FROM offline_alarms WHERE machine_name = ?`,
//     [machineName]
//   );
// };

// // ✅ Fetch alarms for the given machine from SQLite
// export const getAlarmsByMachine = async (
//   machineName: string,
//   setAlarms: (data: any[]) => void
// ): Promise<void> => {
//   const result = await db.getAllAsync<any>(
//     `SELECT * FROM offline_alarms WHERE machine_name = ? ORDER BY timestamp DESC`,
//     [machineName]
//   );
//   setAlarms(result ?? []);
// };




// utils/alarmDB.ts
import * as SQLite from 'expo-sqlite';

// Open or create the alarms database
const db = SQLite.openDatabaseSync('alarms.db');

// ✅ 1. Initialize the alarms table
export const initAlarmsTable = async (): Promise<void> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_alarms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_name TEXT,
        alarm_type TEXT,
        message TEXT,
        timestamp TEXT
      );
    `);
  } catch (error) {
    console.error('❌ Failed to initialize alarm table:', error);
  }
};

// ✅ 2. Insert a new alarm
export const insertAlarm = async (alarm: {
  machine_name: string;
  alarm_type: string;
  message: string;
  timestamp: string;
}): Promise<void> => {
  try {
    await db.runAsync(
      `INSERT INTO offline_alarms (machine_name, alarm_type, message, timestamp)
       VALUES (?, ?, ?, ?)`,
      [alarm.machine_name, alarm.alarm_type, alarm.message, alarm.timestamp]
    );
  } catch (error) {
    console.error('❌ Failed to insert alarm:', error);
  }
};

// ✅ 3. Delete all alarms for a specific machine
export const clearMachineAlarms = async (machineName: string): Promise<void> => {
  try {
    await db.runAsync(
      `DELETE FROM offline_alarms WHERE machine_name = ?`,
      [machineName]
    );
  } catch (error) {
    console.error(`❌ Failed to delete alarms for ${machineName}:`, error);
  }
};

// ✅ 4. Get all alarms for a specific machine and update state
export const getAlarmsByMachine = async (
  machineName: string,
  setAlarms: (data: any[]) => void
): Promise<void> => {
  try {
    const result = await db.getAllAsync<any>(
      `SELECT * FROM offline_alarms WHERE machine_name = ? ORDER BY timestamp DESC`,
      [machineName]
    );
    setAlarms(result ?? []);
  } catch (error) {
    console.error(`❌ Failed to fetch alarms for ${machineName}:`, error);
    setAlarms([]);
  }
};
