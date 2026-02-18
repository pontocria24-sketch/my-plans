const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- SERVIR O FRONTEND ---
// Em containers Docker, os arquivos ficam na raiz do WORKDIR (/app)
app.use(express.static(path.join(__dirname)));

// --- API DE BANCO DE DADOS ---
const getPool = (creds) => {
  return new Pool({
    user: creds.user || process.env.DB_USER || 'postgres',
    host: creds.host || process.env.DB_HOST || 'localhost',
    database: creds.database || process.env.DB_NAME || 'postgres',
    password: creds.password || process.env.DB_PASSWORD,
    port: 5432,
  });
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', mode: 'PRODUCTION_VPS', timestamp: new Date() });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Login simplificado para VPS
  res.json({
    id: "vps_admin",
    name: "Usuário VPS",
    email: email,
    token: "vps_auth_" + Date.now()
  });
});

app.post('/api/sync/tasks', async (req, res) => {
  const { tasks, dbCredentials } = req.body;
  const pool = getPool(dbCredentials);

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT,
        status TEXT,
        category TEXT,
        responsible TEXT,
        progress INTEGER,
        start_date TEXT,
        end_date TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const task of tasks) {
      await pool.query(`
        INSERT INTO tasks (id, title, description, priority, status, category, responsible, progress, start_date, end_date, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          priority = EXCLUDED.priority,
          status = EXCLUDED.status,
          category = EXCLUDED.category,
          responsible = EXCLUDED.responsible,
          progress = EXCLUDED.progress,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          updated_at = NOW()
      `, [
        task.id, task.title, task.description, task.priority, 
        task.status, task.category, task.responsible, task.progress,
        task.startDate, task.endDate
      ]);
    }
    res.json({ success: true, count: tasks.length });
  } catch (err) {
    console.error("Erro no Banco de Dados:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await pool.end();
  }
});

// Fallback para Single Page Application (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 MyPlans rodando na VPS (Porta ${port})`);
});