
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

// Servir arquivos estáticos do Frontend (a própria raiz do projeto)
// Isso permite que o index.html seja acessado diretamente
app.use(express.static(path.join(__dirname)));

// Função para criar conexão dinâmica com o banco
const getPool = (creds) => {
  return new Pool({
    user: creds.user || process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: creds.database || process.env.DB_NAME || 'myplans',
    password: creds.password || process.env.DB_PASSWORD,
    port: 5432,
  });
};

// API: Saúde
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'online', message: 'Ecossistema MyPlans Ativo!' });
});

// API: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      id: "usr_vps_1",
      name: "Admin VPS",
      email: email,
      token: "vps_secure_token_" + Date.now()
    });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// API: Sincronização
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
    console.error(err);
    res.status(500).json({ error: 'Erro no banco', details: err.message });
  } finally {
    await pool.end();
  }
});

// Rota curinga para garantir que o SPA funcione (sempre serve o index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Ecossistema MyPlans Online na porta ${port}`);
});
