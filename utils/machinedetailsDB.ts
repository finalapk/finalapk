// // utils/machineDB.ts
// import * as SQLite from 'expo-sqlite';

// const db = SQLite.openDatabaseSync('cnc_data.db');

// // ✅ Create tables if not exist
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
//   `);
// };

// // ✅ Save range of machine data for offline
// export const saveMachineRangeOffline = async (data: any[]) => {
//   const updatedAt = new Date().toISOString();
//   for (const item of data) {
//     await db.runAsync(`
//       INSERT OR REPLACE INTO machines 
//       (name, date, spindle_speed, rest_time, power_consumption, status, updated_at)
//       VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         item.name,
//         item.date,
//         item.spindle_speed,
//         item.rest_time,
//         item.power_consumption,
//         item.status,
//         updatedAt
//       ]
//     );
//   }
// };

// // ✅ Get data from SQLite for a range
// export const getMachineRangeOffline = async (
//   name: string,
//   from: string,
//   to: string
// ): Promise<any[]> => {
//   const rows = await db.getAllAsync<any[]>(
//     `SELECT * FROM machines WHERE name = ? AND date BETWEEN ? AND ? ORDER BY date ASC`,
//     [name, from, to]
//   );
//   return rows || [];
// };



import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cnc_data.db');

// ✅ Create table with proper UNIQUE constraint
export const setupMachineDB = async () => {
  // await db.execAsync(`
  //   DROP TABLE IF EXISTS machines;
  // `); // only for development; remove in production

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS machines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      date TEXT,
      spindle_speed REAL,
      rest_time INTEGER,
      power_consumption REAL,
      status TEXT,
      updated_at TEXT,
      UNIQUE(name, date)
    );
  `);
};

// ✅ Save or update based on (name, date)
export const saveMachineRangeOffline = async (data: any[]) => {
  const updatedAt = new Date().toISOString();
  for (const item of data) {
    try {
      await db.runAsync(
        `
        INSERT INTO machines (name, date, spindle_speed, rest_time, power_consumption, status, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(name, date) DO UPDATE SET
          spindle_speed=excluded.spindle_speed,
          rest_time=excluded.rest_time,
          power_consumption=excluded.power_consumption,
          status=excluded.status,
          updated_at=excluded.updated_at;
        `,
        [
          item.name,
          item.date,
          item.spindle_speed,
          item.rest_time,
          item.power_consumption,
          item.status,
          updatedAt,
        ]
      );
    } catch (err: any) {
      console.error(`❌ Error saving offline data for ${item.name} - ${item.date}:`, err.message);
    }
  }
};

// ✅ Fetch range of offline data
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

// ✅ Auto-sync latest 5 days of data
export const syncLatestMachineData = async () => {
  const machines = ['Machine 01', 'Machine 02', 'Machine 03'];
  const today = new Date();

  for (const machine of machines) {
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      try {
        const res = await fetch(`https://finalapk.onrender.com/machines?name=${machine}&date=${dateStr}`);
        const json = await res.json();
        if (json?.length > 0) {
          await saveMachineRangeOffline(json);
          console.log(`✅ Synced ${machine} - ${dateStr}`);
        }
      } catch (err: any) {
        console.error(`❌ Failed sync for ${machine} - ${dateStr}`, err.message);
      }
    }
  }
};
