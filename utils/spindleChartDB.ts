import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('spindle_data.db');

// 1. Create the spindle_logs table
export const createSpindleTable = () => {
  db.execAsync(`
    CREATE TABLE IF NOT EXISTS spindle_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      machine TEXT,
      date TEXT,
      timestamp TEXT,
      speed REAL
    );
  `).catch((err) => {
    console.error('❌ Failed to create spindle_logs table:', err);
  });
};

// 2. Insert new logs (replace existing ones for the same machine/date)
export const insertSpindleLogs = async (machine: string, date: string, logs: any[]) => {
  try {
    await db.runAsync(`DELETE FROM spindle_logs WHERE machine = ? AND date = ?`, [machine, date]);

    const insertSQL = `INSERT INTO spindle_logs (machine, date, timestamp, speed) VALUES (?, ?, ?, ?)`;

    for (const log of logs) {
      await db.runAsync(insertSQL, [machine, date, log.timestamp, log.speed]);
    }
  } catch (err) {
    console.error('❌ Error inserting spindle logs:', err);
  }
};

// 3. Get logs for a specific machine and date
export const getSpindleLogs = async (machine: string, date: string): Promise<any[]> => {
  try {
    const result = await db.getAllAsync(
      `SELECT * FROM spindle_logs WHERE machine = ? AND date = ?`,
      [machine, date]
    );
    return result;
  } catch (err) {
    console.error('❌ Error fetching spindle logs:', err);
    return [];
  }
};
