// utils/authStatusDB.ts
import * as SQLite from 'expo-sqlite';

// 📦 Open or create the SQLite DB synchronously
const db = SQLite.openDatabaseSync('auth.db');

// ✅ Setup table for storing auth status (1 row only)
export const setupAuthStatusDB = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS auth_status (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      is_logged_in INTEGER,
      email TEXT,
      login_time TEXT
    );
  `);
};

// ✅ Save login status (overwrites row with ID 1)
export const saveAuthStatus = async (email: string) => {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO auth_status (id, is_logged_in, email, login_time)
     VALUES (1, 1, ?, ?)`,
    email,
    now
  );
};

// ✅ Get auth status (returns boolean)
export const isUserLoggedIn = async (): Promise<boolean> => {
  const result = await db.getFirstAsync<{ is_logged_in: number }>(
    `SELECT is_logged_in FROM auth_status WHERE id = 1`
  );
  return result?.is_logged_in === 1;
};

// ✅ Get current session info (email + login time)
export const getLoggedInUser = async (): Promise<{
  email: string;
  login_time: string;
} | null> => {
  const result = await db.getFirstAsync<{ email: string; login_time: string }>(
    `SELECT email, login_time FROM auth_status WHERE id = 1 AND is_logged_in = 1`
  );
  return result ?? null;
};

// ✅ Clear login session (used for logout)
export const clearAuthStatus = async () => {
  await db.runAsync(`DELETE FROM auth_status WHERE id = 1`);
};
