const express = require('express');
const db = require('../config/db');
const authenticate = require('../middleware/auth');

const router = express.Router();

function generateShortCode() {
  return Math.random().toString(36).slice(2, 8);
}

router.post('/', authenticate, async (req, res) => {
  const { original_url, custom_alias, expires_at } = req.body;
  const user_id = req.user.id;

  try {
    let short_code = custom_alias || generateShortCode();

    const [existing] = await db.query(
      'SELECT id FROM links WHERE short_code = ? OR custom_alias = ?',
      [short_code, short_code]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Alias already taken' });
    }

    await db.query(
      'INSERT INTO links (user_id, original_url, short_code, custom_alias, expires_at) VALUES (?, ?, ?, ?, ?)',
      [user_id, original_url, short_code, custom_alias || null, expires_at || null]
    );

    res.json({ short_url: `http://localhost:5000/${short_code}`, short_code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  const user_id = req.user.id;
  try {
    const [links] = await db.query(
      'SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  const user_id = req.user.id;
  try {
    await db.query(
      'DELETE FROM links WHERE id = ? AND user_id = ?',
      [req.params.id, user_id]
    );
    res.json({ message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const [totalResult] = await db.query(
      'SELECT COUNT(*) as total FROM clicks WHERE link_id = ?',
      [req.params.id]
    );

    const [dailyResult] = await db.query(
      'SELECT DATE(clicked_at) as day, COUNT(*) as clicks FROM clicks WHERE link_id = ? GROUP BY DATE(clicked_at) ORDER BY day',
      [req.params.id]
    );

    res.json({
      total_clicks: totalResult[0].total,
      daily_clicks: dailyResult
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const QRCode = require('qrcode');

router.get('/:id/qr', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM links WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Link not found' });

    const short_url = `${process.env.BASE_URL || 'https://linksnap-production-20d7.up.railway.app'}/${rows[0].short_code}`;
    const qr = await QRCode.toDataURL(short_url);
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;