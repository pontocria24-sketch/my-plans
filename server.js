
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');
const DATABASE_URL = process.env.DATABASE_URL;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- CORREÇÃO DE MIME TYPES PARA .TS e .TSX ---
// Isso impede a tela preta pois o navegador passa a aceitar os arquivos como scripts
express.static.mime.define({'application/javascript': ['ts', 'tsx']});

// --- LÓGICA DE PERSISTÊNCIA (POSTGRES OU JSON) ---
let pool = null;
if (DATABASE_URL) {
  console.log('[MYPLANS] Conectando ao PostgreSQL do Coolify...');
  pool = new Pool({ 
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('sslmode=disable') ? false : { rejectUnauthorized: false }
  });
  
  const initDb = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT UNIQUE,
          password TEXT,
          data JSONB DEFAULT '{}'
        );
        CREATE TABLE IF NOT EXISTS storage (
          user_id TEXT,
          key TEXT,
          data JSONB,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, key)
        );
      `);
      console.log('[MYPLANS] Tabelas PostgreSQL verificadas/criadas.');
    } catch (err) {
      console.error('[MYPLANS] Erro ao iniciar PostgreSQL:', err.message);
    }
  };
  initDb();
} else {
  console.log('[MYPLANS] Usando armazenamento em arquivo JSON local.');
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], storage: {} }, null, 2));
  }
}

// --- API: Sincronização de Dados ---
app.post('/api/sync/:userId/:key', async (req, res) => {
  const { userId, key } = req.params;
  const { data } = req.body;
  try {
    if (pool) {
      await pool.query(
        'INSERT INTO storage (user_id, key, data, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (user_id, key) DO UPDATE SET data = $3, updated_at = NOW()',
        [userId, key, JSON.stringify(data)]
      );
    } else {
      const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!db.storage[userId]) db.storage[userId] = {};
      db.storage[userId][key] = data;
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sync/:userId/:key', async (req, res) => {
  const { userId, key } = req.params;
  try {
    if (pool) {
      const result = await pool.query('SELECT data FROM storage WHERE user_id = $1 AND key = $2', [userId, key]);
      res.json({ data: result.rows[0]?.data || null });
    } else {
      const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      res.json({ data: db.storage[userId]?.[key] || null });
    }
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (pool) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
      if (result.rows.length > 0) return res.json({ success: true, user: result.rows[0] });
    } else {
      const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      const user = db.users.find(u => u.email === email && u.password === password);
      if (user) return res.json({ success: true, user });
    }
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const userId = Date.now().toString();
  try {
    if (pool) {
      await pool.query('INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)', [userId, name, email, password]);
      res.json({ success: true, user: { id: userId, name, email } });
    } else {
      const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (db.users.find(u => u.email === email)) return res.status(400).json({ success: false, message: 'Usuário já existe' });
      const newUser = { id: userId, name, email, password, role: 'User', status: 'Active', createdAt: new Date().toISOString() };
      db.users.push(newUser);
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
      res.json({ success: true, user: newUser });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Servir arquivos estáticos (com MIME type corrigido acima)
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[MYPLANS SERVER] Rodando na porta ${PORT}`);
});
