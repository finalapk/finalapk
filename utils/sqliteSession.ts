import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('user.db');

// Run this once to create the session table (if not exists)
db.execAsync(`
  CREATE TABLE IF NOT EXISTS user_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    token TEXT
);
`);

export const clearUserSession = async (): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM user_session');
    console.log('User session cleared');
  } catch (error) {
    console.error('Error clearing session:', error);
    throw error;
  }
};
