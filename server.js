
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Inicializa o "banco de dados" se não existir
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], storage: {} }, null, 2));
}

// API: Sincronização de Dados (Tasks, Goals, Ideas, etc)
app.post('/api/sync/:userId/:key', (req, res) => {
  const { userId, key } = req.params;
  const { data } = req.body;
  
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!db.storage[userId]) db.storage[userId] = {};
    db.storage[userId][key] = data;
    
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sync/:userId/:key', (req, res) => {
  const { userId, key } = req.params;
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const data = db.storage[userId]?.[key] || null;
    res.json({ data });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// API: Autenticação Simples
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Usuário já existe' });
  }
  
  const newUser = { 
    id: Date.now().toString(), 
    name, email, password, 
    role: 'User', status: 'Active', 
    createdAt: new Date().toISOString() 
  };
  
  db.users.push(newUser);
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  res.json({ success: true, user: newUser });
});

// Serve os arquivos estáticos do Frontend
app.use(express.static(__dirname));

// Rota coringa para o SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[MYPLANS SERVER] Rodando na porta ${PORT}`);
  console.log(`[MYPLANS DB] Armazenando em: ${DB_FILE}`);
});
