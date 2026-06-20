const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const linkRoutes = require('./routes/links');
app.use('/api/links', linkRoutes);

app.get('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM links WHERE short_code = ? OR custom_alias = ?',
      [code, code]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Link not found' });
    
    const link = rows[0];
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Link expired' });
    }

    await db.query(
      'INSERT INTO clicks (link_id, ip_address) VALUES (?, ?)',
      [link.id, req.ip]
    );

    res.redirect(link.original_url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ message: 'LinkSnap API is running and DB is connected' });
  } catch (err) {
    res.status(500).json({ error: 'DB connection failed', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});