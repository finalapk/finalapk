

// require('dotenv').config();
// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');
// const cron = require('node-cron');
// const https = require('https');

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());

// // ✅ MySQL connection
// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
// });

// db.connect((err) => {
//   if (err) {
//     console.error('❌ Database connection failed:', err.message);
//   } else {
//     console.log('✅ Connected to MySQL database');
//   }
// });

// // ⏱ Convert to IST
// function getISTDate() {
//   const now = new Date();
//   const offset = 5.5 * 60 * 60 * 1000; // IST = UTC+5:30
//   return new Date(now.getTime() + offset);
// }

// // 🔁 Cron job every 30 seconds
// cron.schedule('*/30 * * * * *', () => {
//   console.log('[CRON] ⏳ Auto insert triggered');
//   try {
//     insertMachineData();
//   } catch (err) {
//     console.error('❌ Cron insert failed:', err.message);
//   }
// });

// // 🔄 Self-ping to prevent sleep (every 5 mins)
// setInterval(() => {
//   const url = 'https://finalapk.onrender.com/';
//   https.get(url, (res) => {
//     console.log(`[PING] ✅ Self-ping sent. Status: ${res.statusCode}`);
//   }).on('error', (err) => {
//     console.error('[PING] ❌ Self-ping failed:', err.message);
//   });
// }, 5 * 60 * 1000);

// // 📥 Dummy data insert
// function insertMachineData() {
//   const machines = ['Machine 01', 'Machine 02', 'Machine 03'];
//   const now = getISTDate();
//   const currentDate = now.toISOString().split('T')[0];

//   machines.forEach((name) => {
//     const statuses = ['Running', 'Idle', 'Error'];
//     const status = statuses[Math.floor(Math.random() * statuses.length)];
//     const spindleSpeed = Math.floor(Math.random() * 700) + 2500;

//     let power = 1;
//     let restTime = 1;

//     if (status === 'Running') {
//       power = parseFloat((Math.random() * 2 + 7).toFixed(1));
//       restTime = Math.floor(Math.random() * 20) + 1;
//     } else if (status === 'Idle') {
//       power = parseFloat((Math.random() * 1.5 + 0.5).toFixed(1));
//       restTime = Math.floor(Math.random() * 60) + 20;
//     } else {
//       power = 0.1;
//       restTime = Math.floor(Math.random() * 120) + 30;
//     }

//     const insertMachineQuery = `
//       INSERT INTO machines (name, status, spindle_speed, power_consumption, rest_time, date, timestamp)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.query(insertMachineQuery, [name, status, spindleSpeed, power, restTime, currentDate, now], (err) => {
//       if (err) console.error(`❌ Insert failed for ${name}:`, err.message);
//     });
//   });

//   machines.forEach((machine) => {
//     for (let i = 0; i < 12; i++) {
//       const time = new Date(now);
//       time.setMinutes(time.getMinutes() - i * 5);

//       const powerVal = parseFloat((Math.random() * 3 + 6.5).toFixed(2));
//       db.query(
//         `INSERT INTO power_logs (machine_name, power_value, timestamp) VALUES (?, ?, ?)`,
//         [machine, powerVal, time],
//         (err) => {
//           if (err) console.error(`❌ Power log insert failed for ${machine}:`, err.message);
//         }
//       );

//       const speed = Math.floor(Math.random() * 700) + 2500;
//       db.query(
//         `INSERT INTO spindle_logs (name, speed, timestamp) VALUES (?, ?, ?)`,
//         [machine, speed, time],
//         (err) => {
//           if (err) console.error(`❌ Spindle log insert failed for ${machine}:`, err.message);
//         }
//       );
//     }
//   });

//   const alarmTypes = [
//     { type: 'Overheat', message: 'Overheat detected on spindle head' },
//     { type: 'SpeedLimit', message: 'Spindle speed exceeded safety limit' },
//     { type: 'UnexpectedStop', message: 'Machine stopped unexpectedly during operation' },
//     { type: 'PowerSurge', message: 'Voltage fluctuation detected' },
//   ];

//   machines.forEach((machine) => {
//     const count = Math.floor(Math.random() * 3);
//     for (let i = 0; i < count; i++) {
//       const alarm = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];
//       db.query(
//         `INSERT INTO alarm_logs (machine_name, alarm_type, message, timestamp) VALUES (?, ?, ?, ?)`,
//         [machine, alarm.type, alarm.message, now],
//         (err) => {
//           if (err) console.error(`❌ Alarm insert failed for ${machine}:`, err.message);
//         }
//       );
//     }
//   });

//   console.log(`✅ Dummy data inserted at ${now.toLocaleTimeString()} on ${currentDate}`);
// }

// // ✅ Manual trigger
// app.get('/insert-now', (req, res) => {
//   insertMachineData();
//   res.send('🔁 Manual insert triggered');
// });

// // ✅ Health
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Indexo backend is healthy' });
// });

// app.get('/', (req, res) => {
//   res.send('✅ Indexo backend is running');
// });

// // ✅ Login
// app.post('/login', (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password)
//     return res.status(400).json({ success: false, message: 'Email and password are required' });

//   const query = 'SELECT * FROM login WHERE email = ? AND password = ?';
//   db.query(query, [email, password], (err, results) => {
//     if (err) return res.status(500).json({ success: false, message: 'Server error' });

//     if (results.length > 0) {
//       res.json({ success: true, message: 'Login successful', user: results[0] });
//     } else {
//       res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }
//   });
// });

// // ✅ CNC endpoints
// app.get('/machines', (req, res) => {
//   const { name, date } = req.query;
//   db.query(`SELECT * FROM machines WHERE name = ? AND date = ?`, [name, date], (err, results) => {
//     if (err) return res.status(500).json({ error: 'Server error' });
//     res.json(results);
//   });
// });

// app.get('/machines/range', (req, res) => {
//   const { name, from, to } = req.query;
//   db.query(
//     `SELECT * FROM machines WHERE name = ? AND date BETWEEN ? AND ? ORDER BY date ASC`,
//     [name, from, to],
//     (err, results) => {
//       if (err) return res.status(500).json({ error: 'Server error' });
//       res.json(results);
//     }
//   );
// });

// app.get('/machines/latest', (req, res) => {
//   const { name, date } = req.query;
//   if (!name || !date) return res.status(400).json({ error: 'Missing name or date' });

//   db.query(
//     `SELECT * FROM machines WHERE name = ? AND date = ? ORDER BY timestamp DESC LIMIT 1`,
//     [name, date],
//     (err, results) => {
//       if (err) return res.status(500).json({ error: 'Server error' });
//       res.json(results[0] || {});
//     }
//   );
// });

// app.get('/machines/latest-all', (req, res) => {
//   const { date } = req.query;
//   if (!date) return res.status(400).json({ error: 'Missing date' });

//   const query = `
//     SELECT m.*
//     FROM machines m
//     INNER JOIN (
//       SELECT name, MAX(timestamp) AS max_time
//       FROM machines
//       WHERE date = ?
//       GROUP BY name
//     ) latest
//     ON m.name = latest.name AND m.timestamp = latest.max_time
//     ORDER BY m.name ASC
//   `;

//   db.query(query, [date], (err, results) => {
//     if (err) return res.status(500).json({ error: 'Server error' });
//     res.json(results);
//   });
// });

// app.get('/spindle-data', (req, res) => {
//   const { name, date } = req.query;
//   db.query(
//     `SELECT * FROM spindle_logs WHERE name = ? AND DATE(timestamp) = ? ORDER BY timestamp ASC`,
//     [name, date],
//     (err, results) => {
//       if (err) return res.status(500).json({ error: 'Server error' });
//       const cleaned = results.filter((entry) => typeof entry.speed === 'number' && isFinite(entry.speed));
//       res.json(cleaned);
//     }
//   );
// });

// app.get('/power-data', (req, res) => {
//   const { machine, date } = req.query;
//   db.query(
//     `SELECT * FROM power_logs WHERE machine_name = ? AND DATE(timestamp) = ? ORDER BY timestamp ASC`,
//     [machine, date],
//     (err, results) => {
//       if (err) return res.status(500).json({ error: 'Server error' });
//       res.json(results);
//     }
//   );
// });

// app.get('/alarms', (req, res) => {
//   const { machine, date } = req.query;
//   let query = 'SELECT * FROM alarm_logs WHERE 1=1';
//   const params = [];

//   if (machine) {
//     query += ' AND machine_name = ?';
//     params.push(machine);
//   }
//   if (date) {
//     query += ' AND DATE(timestamp) = ?';
//     params.push(date);
//   }

//   query += ' ORDER BY timestamp DESC';

//   db.query(query, params, (err, results) => {
//     if (err) return res.status(500).json({ error: 'Server error' });
//     res.json(results);
//   });
// });

// app.get('/machine-details', (req, res) => {
//   db.query(`SELECT * FROM machines ORDER BY date DESC`, (err, results) => {
//     if (err) return res.status(500).json({ error: 'Server error' });
//     res.json(results);
//   });
// });

// // ✅ Start server
// app.listen(port, () => {
//   console.log(`🚀 Server running on http://localhost:${port}`);
// });

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const app = express();

// ✅ Hardcoded values
const PORT = 10000;
const RENDER_EXTERNAL_URL = 'finalapk.onrender.com';

const {
  MYSQLHOST,
  MYSQLPORT,
  MYSQLUSER,
  MYSQLPASSWORD,
  MYSQLDATABASE,
} = process.env;

// ✅ MySQL connection pool
const pool = mysql.createPool({
  host: MYSQLHOST,
  port: MYSQLPORT,
  user: MYSQLUSER,
  password: MYSQLPASSWORD,
  database: MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Generic API: get latest record from allowed table
app.get('/latest/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { name, date } = req.query;

    if (!table || !name || !date) {
      return res.status(400).json({ error: 'Missing table, name, or date' });
    }

    const allowedTables = ['machines', 'spindle_logs', 'power_logs', 'alarms'];
    if (!allowedTables.includes(table)) {
      return res.status(403).json({ error: 'Table access forbidden' });
    }

    const [rows] = await pool.execute(
      `SELECT * FROM \`${table}\` WHERE name = ? AND date = ? ORDER BY timestamp DESC LIMIT 1`,
      [name, date]
    );

    res.json(rows[0] || {});
  } catch (err) {
    console.error('❌ Error fetching data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ CRON: Insert dummy data into `machines` every 30 seconds
cron.schedule('*/30 * * * * *', async () => {
  try {
    const now = new Date();
    const nameList = ['Machine 01', 'Machine 02', 'Machine 03'];
    const statusList = ['Running', 'Idle', 'Error'];

    const name = nameList[Math.floor(Math.random() * nameList.length)];
    const status = statusList[Math.floor(Math.random() * statusList.length)];
    const spindle = status === 'Running' ? Math.floor(2500 + Math.random() * 1000) : 0;
    const power = status === 'Running' ? parseFloat((7 + Math.random() * 3).toFixed(1)) : 0.1;
    const rest = status === 'Idle' ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 10);
    const dateStr = now.toISOString().split('T')[0];
    const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

    await pool.execute(
      'INSERT INTO machines (name, status, spindle_speed, power_consumption, rest_time, date, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, status, spindle, power, rest, dateStr, timestamp]
    );

    console.log(`[CRON] ✅ Inserted dummy data for ${name} at ${now.toLocaleTimeString()}`);
  } catch (err) {
    console.error('[CRON] ❌ Insert failed:', err.message);
  }
});

// ✅ CRON: Self-ping every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  try {
    const res = await fetch(`https://${RENDER_EXTERNAL_URL}`);
    console.log(`[PING] ✅ Self-ping success: ${res.status}`);
  } catch (err) {
    console.error('[PING] ❌ Self-ping failed:', err.message);
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Connected to MySQL at ${MYSQLHOST}:${MYSQLPORT} with database "${MYSQLDATABASE}"`);
});
