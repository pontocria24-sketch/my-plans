
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
const { transform } = require('sucrase');

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- MIDDLEWARE DE TRANSPILAÇÃO ---
app.get(/\.(ts|tsx)$/, (req, res, next) => {
  const filePath = path.join(__dirname, req.path);
  if (fs.existsSync(filePath)) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const result = transform(code, {
        transforms: ['typescript', 'jsx'],
        production: true,
        jsxRuntime: 'classic'
      });
      res.set('Content-Type', 'application/javascript');
      return res.send(result.code);
    } catch (err) {
      return res.status(500).send('Erro na transpilação.');
    }
  }
  next();
});

// --- LÓGICA DE BANCO DE DADOS (CORREÇÃO SSL) ---
let pool = null;
if (DATABASE_URL) {
  console.log('[MYPLANS] Iniciando conexão com o banco de dados...');
  
  const poolConfig = {
    connectionString: DATABASE_URL,
    connectionTimeoutMillis: 5000
  };

  // Lógica de SSL: Desativa por padrão para VPS, ativa apenas se solicitado na URL
  const needsSSL = DATABASE_URL.includes('sslmode=require') || DATABASE_URL.includes('ssl=true');
  
  if (needsSSL) {
    poolConfig.ssl = { rejectUnauthorized: false };
    console.log('[MYPLANS] SSL Ativado para a conexão.');
  } else {
    poolConfig.ssl = false;
    console.log('[MYPLANS] Conectando sem SSL (Padrão VPS).');
  }

  pool = new Pool(poolConfig);
  
  const initDb = async () => {
    try {
      // Testa a conexão antes de criar as tabelas
      const client = await pool.connect();
      console.log('[MYPLANS] Conexão física estabelecida com sucesso.');
      client.release();

      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, data JSONB DEFAULT '{}');
        CREATE TABLE IF NOT EXISTS storage (user_id TEXT, key TEXT, data JSONB, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, key));
      `);
      console.log('[MYPLANS] Tabelas verificadas/criadas no PostgreSQL.');
    } catch (err) {
      console.error('[MYPLANS] ERRO AO CONECTAR NO BANCO:', err.message);
    }
  };
  initDb();
}

// --- API ---
app.post('/api/sync/:userId/:key', async (req, res) => {
  const { userId, key } = req.params;
  const { data } = req.body;
  try {
    if (!pool) throw new Error("Banco de dados não configurado");
    await pool.query('INSERT INTO storage (user_id, key, data, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (user_id, key) DO UPDATE SET data = $3, updated_at = NOW()', [userId, key, JSON.stringify(data)]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.get('/api/sync/:userId/:key', async (req, res) => {
  const { userId, key } = req.params;
  try {
    if (!pool) throw new Error("Banco de dados não configurado");
    const result = await pool.query('SELECT data FROM storage WHERE user_id = $1 AND key = $2', [userId, key]);
    res.json({ data: result.rows[0]?.data || null });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!pool) throw new Error("Servidor sem banco de dados configurado");
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) return res.json({ success: true, user: result.rows[0] });
    res.status(401).json({ success: false, message: 'E-mail ou senha incorretos' });
  } catch (error) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const userId = Date.now().toString();
  try {
    if (!pool) throw new Error("Servidor sem banco de dados configurado");
    await pool.query('INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)', [userId, name, email, password]);
    res.json({ success: true, user: { id: userId, name, email } });
  } catch (error) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

app.use(express.static(__dirname));
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

app.listen(PORT, () => console.log(`[MYPLANS] Servidor rodando na porta ${PORT}`));
