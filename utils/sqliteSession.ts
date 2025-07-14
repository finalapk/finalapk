// import { openDatabaseSync } from 'expo-sqlite';

// const db = openDatabaseSync('user.db');

// // Run this once to create the session table (if not exists)
// db.execAsync(`
//   CREATE TABLE IF NOT EXISTS user_session (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     email TEXT,
//     token TEXT
// );
// `);

// export const clearUserSession = async (): Promise<void> => {
//   try {
//     await db.runAsync('DELETE FROM user_session');
//     console.log('User session cleared');
//   } catch (error) {
//     console.error('Error clearing session:', error);
//     throw error;
//   }
// };




// utils/sqliteSession.ts
import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('user.db');

// ✅ Create user_session table (run once)
export const setupUserSessionDB = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_session (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        token TEXT
      );
    `);
  } catch (error) {
    console.error('❌ Failed to create user_session table:', error);
  }
};

// ✅ Save user session (stores one record only)
export const saveUserSession = async (email: string, token: string): Promise<void> => {
  try {
    await setupUserSessionDB();
    await db.runAsync(
      `INSERT OR REPLACE INTO user_session (id, email, token) VALUES (1, ?, ?)`,
      [email, token]
    );
    console.log('✅ User session saved');
  } catch (error) {
    console.error('❌ Error saving session:', error);
    throw error;
  }
};

// ✅ Get saved session info
export const getUserSession = async (): Promise<{ email: string; token: string } | null> => {
  try {
    await setupUserSessionDB();
    const result = await db.getFirstAsync<{ email: string; token: string }>(
      `SELECT email, token FROM user_session WHERE id = 1`
    );
    return result ?? null;
  } catch (error) {
    console.error('❌ Error fetching session:', error);
    return null;
  }
};

// ✅ Clear session (used on logout)
export const clearUserSession = async (): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM user_session WHERE id = 1');
    console.log('✅ User session cleared');
  } catch (error) {
    console.error('❌ Error clearing session:', error);
    throw error;
  }
};
