// utils/machineDB.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cnc_data.db');

// ✅ Create tables if not exist
export const setupMachineDB = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS machines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      date TEXT,
      spindle_speed REAL,
      rest_time INTEGER,
      power_consumption REAL,
      status TEXT,
      updated_at TEXT
    );
  `);
};

// ✅ Save range of machine data for offline
export const saveMachineRangeOffline = async (data: any[]) => {
  const updatedAt = new Date().toISOString();
  for (const item of data) {
    await db.runAsync(`
      INSERT OR REPLACE INTO machines 
      (name, date, spindle_speed, rest_time, power_consumption, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        item.name,
        item.date,
        item.spindle_speed,
        item.rest_time,
        item.power_consumption,
        item.status,
        updatedAt
      ]
    );
  }
};

// ✅ Get data from SQLite for a range
export const getMachineRangeOffline = async (
  name: string,
  from: string,
  to: string
): Promise<any[]> => {
  const rows = await db.getAllAsync<any[]>(
    `SELECT * FROM machines WHERE name = ? AND date BETWEEN ? AND ? ORDER BY date ASC`,
    [name, from, to]
  );
  return rows || [];
};
