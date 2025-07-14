// import * as SQLite from 'expo-sqlite';

// const db = SQLite.openDatabaseSync('cnc_data.db');

// // ✅ Setup database tables
// export const setupMachineDB = async () => {
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS machines (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT,
//       date TEXT,
//       spindle_speed REAL,
//       rest_time INTEGER,
//       power_consumption REAL,
//       status TEXT,
//       updated_at TEXT
//     );

//     CREATE TABLE IF NOT EXISTS sync_log (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       machine_name TEXT,
//       date TEXT,
//       synced_at TEXT
//     );
//   `);
// };

// // ✅ Save or update machine data for offline use
// export const saveMachineDataOffline = async (
//   name: string,
//   date: string,
//   spindle: number,
//   rest: number,
//   power: number,
//   status: string,
//   updatedAt: string  // ⬅️ Use updatedAt from backend (timestamp)
// ): Promise<void> => {
//   await db.runAsync(
//     `INSERT OR REPLACE INTO machines (name, date, spindle_speed, rest_time, power_consumption, status, updated_at)
//      VALUES (?, ?, ?, ?, ?, ?, ?)`,
//     [name, date, spindle, rest, power, status, updatedAt]
//   );
// };

// // ✅ Get machine data (used in offline mode)
// export const getMachineDataOffline = async (
//   name: string,
//   date: string
// ): Promise<{
//   id: number;
//   name: string;
//   date: string;
//   spindle_speed: number;
//   rest_time: number;
//   power_consumption: number;
//   status: string;
//   updated_at: string;
// } | null> => {
//   const result = await db.getFirstAsync<any>(
//     `SELECT * FROM machines WHERE name = ? AND date = ?`,
//     [name, date]
//   );

//   if (
//     result &&
//     typeof result.id === 'number' &&
//     typeof result.name === 'string' &&
//     typeof result.date === 'string'
//   ) {
//     return result;
//   }

//   return null;
// };

// // ✅ Save last sync time
// export const saveLastSyncTimeToDB = async (
//   machine: string,
//   date: string
// ): Promise<void> => {
//   const now = new Date().toISOString();
//   await db.runAsync(
//     `INSERT OR REPLACE INTO sync_log (machine_name, date, synced_at)
//      VALUES (?, ?, ?)`,
//     [machine, date, now]
//   );
// };

// // ✅ Get last sync time
// export const getLastSyncTimeFromDB = async (
//   machine: string,
//   date: string
// ): Promise<string | null> => {
//   const result = await db.getFirstAsync<{ synced_at: string }>(
//     `SELECT synced_at FROM sync_log WHERE machine_name = ? AND date = ?`,
//     [machine, date]
//   );
//   return result?.synced_at ?? null;
// };





import * as SQLite from 'expo-sqlite';

// ✅ Open or create the SQLite database file
const db = SQLite.openDatabaseSync('cnc_data.db');

// ✅ Set up local DB with 2 tables: machines and sync_log
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

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      machine_name TEXT,
      date TEXT,
      synced_at TEXT
    );
  `);
};

// ✅ Save or update machine data (offline)
export const saveMachineDataOffline = async (
  name: string,
  date: string,
  spindle: number,
  rest: number,
  power: number,
  status: string,
  updatedAt: string
): Promise<void> => {
  await db.runAsync(
    `INSERT OR REPLACE INTO machines 
      (name, date, spindle_speed, rest_time, power_consumption, status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, date, spindle, rest, power, status, updatedAt]
  );
};

// ✅ Get saved machine data (offline mode)
export const getMachineDataOffline = async (
  name: string,
  date: string
): Promise<{
  id: number;
  name: string;
  date: string;
  spindle_speed: number;
  rest_time: number;
  power_consumption: number;
  status: string;
  updated_at: string;
} | null> => {
  const result = await db.getFirstAsync<any>(
    `SELECT * FROM machines WHERE name = ? AND date = ?`,
    [name, date]
  );

  if (
    result &&
    typeof result.id === 'number' &&
    typeof result.name === 'string' &&
    typeof result.date === 'string'
  ) {
    return result;
  }

  return null;
};

// ✅ Save latest sync time to local DB
export const saveLastSyncTimeToDB = async (
  machine: string,
  date: string
): Promise<void> => {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_log (machine_name, date, synced_at)
     VALUES (?, ?, ?)`,
    [machine, date, now]
  );
};

// ✅ Get latest sync time for a specific machine and date
export const getLastSyncTimeFromDB = async (
  machine: string,
  date: string
): Promise<string | null> => {
  const result = await db.getFirstAsync<{ synced_at: string }>(
    `SELECT synced_at FROM sync_log WHERE machine_name = ? AND date = ?`,
    [machine, date]
  );
  return result?.synced_at ?? null;
};
