require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const cron = require('node-cron');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

// 🔁 Cron job every 30 minutes
cron.schedule('*/30 * * * * *', () => {
  console.log('[CRON] ⏳ Auto insert triggered');
  try {
    insertMachineData();
  } catch (err) {
    console.error('❌ Cron insert failed:', err.message);
  }
});

// 🔄 Prevent Render sleep every 5 min
setInterval(async () => {
  try {
    await fetch('https://cncofflinemode.onrender.com/');
    console.log('[PING] ✅ Self-ping sent');
  } catch (err) {
    console.error('[PING] ❌ Self-ping failed:', err.message);
  }
}, 5 * 60 * 1000);

// 📥 Dummy data insert
function insertMachineData() {
  const machines = ['Machine 01', 'Machine 02', 'Machine 03'];
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];

  machines.forEach((name) => {
    const statuses = ['Running', 'Idle', 'Error'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const spindleSpeed = Math.floor(Math.random() * 700) + 2500;

    let power = 1;
    let restTime = 1;

    if (status === 'Running') {
      power = parseFloat((Math.random() * 2 + 7).toFixed(1));
      restTime = Math.floor(Math.random() * 20) + 1;
    } else if (status === 'Idle') {
      power = parseFloat((Math.random() * 1.5 + 0.5).toFixed(1));
      restTime = Math.floor(Math.random() * 60) + 20;
    } else {
      power = 0.1;
      restTime = Math.floor(Math.random() * 120) + 30;
    }

   const insertMachineQuery = `
    INSERT INTO machines (name, status, spindle_speed, power_consumption, rest_time, date)
    VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(insertMachineQuery, [name, status, spindleSpeed, power, restTime, currentDate], (err) => {
      if (err) console.error(`❌ Insert failed for ${name}:`, err.message);
    });
  });

  machines.forEach((machine) => {
    for (let i = 0; i < 12; i++) {
      const time = new Date(now);
      time.setMinutes(time.getMinutes() - i * 5);

      const powerVal = parseFloat((Math.random() * 3 + 6.5).toFixed(2));
      db.query(
        `INSERT INTO power_logs (machine_name, power_value, timestamp) VALUES (?, ?, ?)`,
        [machine, powerVal, time],
        (err) => {
          if (err) console.error(`❌ Power log insert failed for ${machine}:`, err.message);
        }
      );

      const speed = Math.floor(Math.random() * 700) + 2500;
      db.query(
        `INSERT INTO spindle_logs (name, speed, timestamp) VALUES (?, ?, ?)`,
        [machine, speed, time],
        (err) => {
          if (err) console.error(`❌ Spindle log insert failed for ${machine}:`, err.message);
        }
      );
    }
  });

  const alarmTypes = [
    { type: 'Overheat', message: 'Overheat detected on spindle head' },
    { type: 'SpeedLimit', message: 'Spindle speed exceeded safety limit' },
    { type: 'UnexpectedStop', message: 'Machine stopped unexpectedly during operation' },
    { type: 'PowerSurge', message: 'Voltage fluctuation detected' },
  ];

  machines.forEach((machine) => {
    const count = Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const alarm = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];
      const time = new Date();
      db.query(
        `INSERT INTO alarm_logs (machine_name, alarm_type, message, timestamp) VALUES (?, ?, ?, ?)`,
        [machine, alarm.type, alarm.message, time],
        (err) => {
          if (err) console.error(`❌ Alarm insert failed for ${machine}:`, err.message);
        }
      );
    }
  });

  console.log(`✅ Dummy data inserted at ${now.toLocaleTimeString()} on ${currentDate}`);
}

// ✅ Manual trigger
app.get('/insert-now', (req, res) => {
  insertMachineData();
  res.send('🔁 Manual insert triggered');
});

// ✅ Health (for Render ping)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Indexo backend is healthy' });
});

app.get('/', (req, res) => {
  res.send('✅ Indexo backend is running');
});

// ✅ Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required' });

  const query = 'SELECT * FROM login WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });

    if (results.length > 0) {
      res.json({ success: true, message: 'Login successful', user: results[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// ✅ CNC endpoints
app.get('/machines', (req, res) => {
  const { name, date } = req.query;
  db.query(`SELECT * FROM machines WHERE name = ? AND date = ?`, [name, date], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

app.get('/machines/range', (req, res) => {
  const { name, from, to } = req.query;
  db.query(
    `SELECT * FROM machines WHERE name = ? AND date BETWEEN ? AND ? ORDER BY date ASC`,
    [name, from, to],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json(results);
    }
  );
});

app.get('/machines/latest', (req, res) => {
  const { name, date } = req.query;
  if (!name || !date) return res.status(400).json({ error: 'Missing name or date' });

  db.query(
    `SELECT * FROM machines WHERE name = ? AND date = ? ORDER BY timestamp DESC LIMIT 1`,
    [name, date],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json(results[0] || {});
    }
  );
});

app.get('/machines/latest-all', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Missing date' });

  const query = `
    SELECT m.*
    FROM machines m
    INNER JOIN (
      SELECT name, MAX(timestamp) AS max_time
      FROM machines
      WHERE date = ?
      GROUP BY name
    ) latest
    ON m.name = latest.name AND m.timestamp = latest.max_time
    ORDER BY m.name ASC
  `;

  db.query(query, [date], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

app.get('/spindle-data', (req, res) => {
  const { name, date } = req.query;
  db.query(
    `SELECT * FROM spindle_logs WHERE name = ? AND DATE(timestamp) = ? ORDER BY timestamp ASC`,
    [name, date],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      const cleaned = results.filter((entry) => typeof entry.speed === 'number' && isFinite(entry.speed));
      res.json(cleaned);
    }
  );
});

app.get('/power-data', (req, res) => {
  const { machine, date } = req.query;
  db.query(
    `SELECT * FROM power_logs WHERE machine_name = ? AND DATE(timestamp) = ? ORDER BY timestamp ASC`,
    [machine, date],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json(results);
    }
  );
});

app.get('/alarms', (req, res) => {
  const { machine, date } = req.query;
  let query = 'SELECT * FROM alarm_logs WHERE 1=1';
  const params = [];

  if (machine) {
    query += ' AND machine_name = ?';
    params.push(machine);
  }
  if (date) {
    query += ' AND DATE(timestamp) = ?';
    params.push(date);
  }

  query += ' ORDER BY timestamp DESC';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

app.get('/machine-details', (req, res) => {
  db.query(`SELECT * FROM machines ORDER BY date DESC`, (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
