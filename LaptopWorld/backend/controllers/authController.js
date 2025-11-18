const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Table in your SQL dump is `user` with columns: IdUser, HoTen, Email, MatKhau
    const [existing] = await db.query('SELECT IdUser FROM `user` WHERE Email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO `user` (HoTen, Email, MatKhau) VALUES (?, ?, ?)', [name || null, email, hash]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const [rows] = await db.query('SELECT IdUser, MatKhau, HoTen FROM `user` WHERE Email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.MatKhau);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.IdUser, name: user.HoTen, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { register, login };
