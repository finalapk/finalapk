
// // utils/authDB.ts

// import * as SQLite from 'expo-sqlite';

// const db = SQLite.openDatabaseSync('auth.db');

// // ✅ Create both necessary tables if they don't exist
// export const setupAuthDB = async () => {
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       email TEXT UNIQUE,
//       password TEXT
//     );

//     CREATE TABLE IF NOT EXISTS auth_status (
//       id INTEGER PRIMARY KEY CHECK (id = 1),
//       is_logged_in INTEGER
//     );
//   `);
// };

// // ✅ Save login status (1 for logged in, 0 for logged out)
// export const setLoginStatus = async (loggedIn: boolean) => {
//   await db.runAsync(
//     'INSERT OR REPLACE INTO auth_status (id, is_logged_in) VALUES (1, ?)',
//     loggedIn ? 1 : 0
//   );
// };

// // ✅ Retrieve login status
// export const getLoginStatus = async (): Promise<boolean> => {
//   const result = await db.getFirstAsync<{ is_logged_in: number }>(
//     'SELECT is_logged_in FROM auth_status WHERE id = 1'
//   );
//   return result?.is_logged_in === 1;
// };

// // ✅ Save user credentials (for offline login)
// export const saveUserToSQLite = async (email: string, password: string) => {
//   await db.runAsync(
//     'INSERT OR REPLACE INTO users (email, password) VALUES (?, ?)',
//     email,
//     password
//   );
// };

// // ✅ Fetch user by email for offline login
// export const getUserFromSQLite = async (
//   email: string
// ): Promise<{ email: string; password: string } | null> => {
//   const result = await db.getFirstAsync<{ email: string; password: string }>(
//     'SELECT * FROM users WHERE email = ?',
//     email
//   );
//   return result ?? null;
// };

// // ✅ Logout function: clears login status
// export const logoutUser = async () => {
//   await db.runAsync('DELETE FROM auth_status WHERE id = 1');
// };




import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('auth.db');

// ✅ Setup DB: create tables if not exist (without deleting user data)
export const setupAuthDB = async () => {
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
};

// ✅ Save login session (only 1 row maintained)
export const setLoginStatus = async (email: string) => {
  const loginTime = new Date().toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO auth_status (id, is_logged_in, email, login_time)
     VALUES (1, 1, ?, ?)`,
    email,
    loginTime
  );
};

// ✅ Get session login status
export const getLoginStatus = async (): Promise<boolean> => {
  const result = await db.getFirstAsync<{ is_logged_in: number }>(
    `SELECT is_logged_in FROM auth_status WHERE id = 1`
  );
  return result?.is_logged_in === 1;
};

// ✅ Save user credentials locally
export const saveUserToSQLite = async (email: string, password: string) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO users (email, password)
     VALUES (?, ?)`,
    email,
    password
  );
};

// ✅ Get user by email from local DB
export const getUserFromSQLite = async (
  email: string
): Promise<{ email: string; password: string } | null> => {
  const result = await db.getFirstAsync<{ email: string; password: string }>(
    `SELECT * FROM users WHERE email = ?`,
    email
  );
  return result ?? null;
};

// ✅ Get current logged-in user session
export const getCurrentUser = async (): Promise<{
  email: string;
  password: string;
  login_time: string;
} | null> => {
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
};

// ✅ Logout: clear session only (keep saved user for offline login)
export const logoutUser = async () => {
  await db.runAsync(`DELETE FROM auth_status WHERE id = 1`);
};
