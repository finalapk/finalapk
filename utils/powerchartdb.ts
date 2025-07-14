// import * as SQLite from 'expo-sqlite';

// // Open (or create) the SQLite DB
// const db = SQLite.openDatabaseSync('power_data.db');

// // ✅ 1. Create the power_logs table if it doesn't exist
// export const createPowerTable = () => {
//   db.execAsync(`
//     CREATE TABLE IF NOT EXISTS power_logs (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       machine TEXT,
//       date TEXT,
//       timestamp TEXT,
//       power_value REAL
//     );
//   `).catch((err) => {
//     console.error('❌ Failed to create power_logs table:', err);
//   });
// };

// // ✅ 2. Insert logs (replacing previous entries for same machine/date)
// export const insertPowerLogs = async (machine: string, date: string, logs: any[]) => {
//   try {
//     await createPowerTable(); // ensure table exists before inserting

//     await db.runAsync(`DELETE FROM power_logs WHERE machine = ? AND date = ?`, [machine, date]);

//     const insertSQL = `INSERT INTO power_logs (machine, date, timestamp, power_value) VALUES (?, ?, ?, ?)`;

//     for (const log of logs) {
//       await db.runAsync(insertSQL, [machine, date, log.timestamp, log.power_value]);
//     }
//   } catch (err) {
//     console.error('❌ Error inserting power logs:', err);
//   }
// };

// // ✅ 3. Get logs for specific machine and date
// export const getPowerLogs = async (machine: string, date: string): Promise<any[]> => {
//   try {
//     await createPowerTable(); // ensure table exists before fetching

//     const result = await db.getAllAsync(
//       `SELECT * FROM power_logs WHERE machine = ? AND date = ?`,
//       [machine, date]
//     );
//     return result;
//   } catch (err) {
//     console.error('❌ Error fetching power logs:', err);
//     return [];
//   }
// };




import * as SQLite from 'expo-sqlite';

// 📁 Open or create power_data.db
const db = SQLite.openDatabaseSync('power_data.db');

// ✅ 1. Create table for storing power logs
export const createPowerTable = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS power_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine TEXT,
        date TEXT,
        timestamp TEXT,
        power_value REAL
      );
    `);
  } catch (err) {
    console.error('❌ Failed to create power_logs table:', err);
  }
};

// ✅ 2. Insert logs after deleting existing ones for that machine and date
export const insertPowerLogs = async (machine: string, date: string, logs: { timestamp: string; power_value: number }[]) => {
  try {
    await createPowerTable(); // ensure table exists

    // Clear old logs for that machine and date
    await db.runAsync(`DELETE FROM power_logs WHERE machine = ? AND date = ?`, [machine, date]);

    // Insert new logs
    const insertSQL = `INSERT INTO power_logs (machine, date, timestamp, power_value) VALUES (?, ?, ?, ?)`;

    for (const log of logs) {
      await db.runAsync(insertSQL, [machine, date, log.timestamp, log.power_value]);
    }

    console.log(`✅ Inserted ${logs.length} power logs for ${machine} on ${date}`);
  } catch (err) {
    console.error('❌ Error inserting power logs:', err);
  }
};

// ✅ 3. Fetch logs for a given machine and date
export const getPowerLogs = async (
  machine: string,
  date: string
): Promise<{ timestamp: string; power_value: number }[]> => {
  try {
    await createPowerTable(); // ensure table exists

    const result = await db.getAllAsync<{ timestamp: string; power_value: number }>(
      `SELECT timestamp, power_value FROM power_logs WHERE machine = ? AND date = ? ORDER BY timestamp ASC`,
      [machine, date]
    );

    return result;
  } catch (err) {
    console.error('❌ Error fetching power logs:', err);
    return [];
  }
};
