

// import * as SQLite from 'expo-sqlite';

// const db = SQLite.openDatabaseSync('auth.db');

// // ✅ Setup DB: create tables if not exist (without deleting user data)
// export const setupAuthDB = async () => {
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       email TEXT UNIQUE,
//       password TEXT
//     );

//     CREATE TABLE IF NOT EXISTS auth_status (
//       id INTEGER PRIMARY KEY CHECK (id = 1),
//       is_logged_in INTEGER,
//       email TEXT,
//       login_time TEXT
//     );
//   `);
// };

// // ✅ Save login session (only 1 row maintained)
// export const setLoginStatus = async (email: string) => {
//   const loginTime = new Date().toISOString();
//   await db.runAsync(
//     `INSERT OR REPLACE INTO auth_status (id, is_logged_in, email, login_time)
//      VALUES (1, 1, ?, ?)`,
//     email,
//     loginTime
//   );
// };

// // ✅ Get session login status
// export const getLoginStatus = async (): Promise<boolean> => {
//   const result = await db.getFirstAsync<{ is_logged_in: number }>(
//     `SELECT is_logged_in FROM auth_status WHERE id = 1`
//   );
//   return result?.is_logged_in === 1;
// };

// // ✅ Save user credentials locally
// export const saveUserToSQLite = async (email: string, password: string) => {
//   await db.runAsync(
//     `INSERT OR REPLACE INTO users (email, password)
//      VALUES (?, ?)`,
//     email,
//     password
//   );
// };

// // ✅ Get user by email from local DB
// export const getUserFromSQLite = async (
//   email: string
// ): Promise<{ email: string; password: string } | null> => {
//   const result = await db.getFirstAsync<{ email: string; password: string }>(
//     `SELECT * FROM users WHERE email = ?`,
//     email
//   );
//   return result ?? null;
// };

// // ✅ Get current logged-in user session
// export const getCurrentUser = async (): Promise<{
//   email: string;
//   password: string;
//   login_time: string;
// } | null> => {
//   const session = await db.getFirstAsync<{ email: string; login_time: string }>(
//     `SELECT email, login_time FROM auth_status WHERE id = 1 AND is_logged_in = 1`
//   );

//   if (!session?.email) return null;

//   const user = await db.getFirstAsync<{ email: string; password: string }>(
//     `SELECT * FROM users WHERE email = ?`,
//     session.email
//   );

//   return user
//     ? {
//         ...user,
//         login_time: session.login_time,
//       }
//     : null;
// };

// // ✅ Logout: clear session only (keep saved user for offline login)
// export const logoutUser = async () => {
//   await db.runAsync(`DELETE FROM auth_status WHERE id = 1`);
// };




// utils/authDB.ts
import * as SQLite from 'expo-sqlite';

// ✅ Use new SQLite API for Expo SDK 53+
const db = SQLite.openDatabaseSync('auth.db');

// ✅ Ensure tables are created
export const setupAuthDB = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
      );

      CREATE TABLE IF NOT EXISTS auth_status (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        is_logged_in INTEGER,
        email TEXT,
        login_time TEXT
      );
    `);
    console.log('✅ authDB initialized');
  } catch (err) {
    console.error('❌ setupAuthDB error:', err);
  }
};

// ✅ Save login session (only one row allowed)
export const setLoginStatus = async (email: string) => {
  try {
    const loginTime = new Date().toISOString();
    await db.runAsync(
      `INSERT OR REPLACE INTO auth_status (id, is_logged_in, email, login_time)
       VALUES (1, 1, ?, ?)`,
      email,
      loginTime
    );
    console.log('✅ Login status saved');
  } catch (err) {
    console.error('❌ setLoginStatus error:', err);
  }
};

// ✅ Check login status
export const getLoginStatus = async (): Promise<boolean> => {
  try {
    const result = await db.getFirstAsync<{ is_logged_in: number }>(
      `SELECT is_logged_in FROM auth_status WHERE id = 1`
    );
    return result?.is_logged_in === 1;
  } catch (err) {
    console.error('❌ getLoginStatus error:', err);
    return false;
  }
};

// ✅ Save user locally
export const saveUserToSQLite = async (email: string, password: string) => {
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO users (email, password) VALUES (?, ?)`,
      email,
      password
    );
    console.log('✅ User saved to SQLite');
  } catch (err) {
    console.error('❌ saveUserToSQLite error:', err);
  }
};

// ✅ Get user by email
export const getUserFromSQLite = async (
  email: string
): Promise<{ email: string; password: string } | null> => {
  try {
    const result = await db.getFirstAsync<{ email: string; password: string }>(
      `SELECT * FROM users WHERE email = ?`,
      email
    );
    return result ?? null;
  } catch (err) {
    console.error('❌ getUserFromSQLite error:', err);
    return null;
  }
};

// ✅ Get currently logged-in user
export const getCurrentUser = async (): Promise<{
  email: string;
  password: string;
  login_time: string;
} | null> => {
  try {
    const session = await db.getFirstAsync<{ email: string; login_time: string }>(
      `SELECT email, login_time FROM auth_status WHERE id = 1 AND is_logged_in = 1`
    );

    if (!session?.email) return null;

    const user = await db.getFirstAsync<{ email: string; password: string }>(
      `SELECT * FROM users WHERE email = ?`,
      session.email
    );

    return user
      ? {
          ...user,
          login_time: session.login_time,
        }
      : null;
  } catch (err) {
    console.error('❌ getCurrentUser error:', err);
    return null;
  }
};

// ✅ Logout by clearing session row only
export const logoutUser = async () => {
  try {
    await db.runAsync(`DELETE FROM auth_status WHERE id = 1`);
    console.log('✅ User logged out');
  } catch (err) {
    console.error('❌ logoutUser error:', err);
  }
};
