const express = require('express');
const router = express.Router();
const db = require('../db');
const { askAI } = require('../ai');

// Search products (uses `SanPham` table from ChuyenNganh.sql)
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const [rows] = await db.query(
      'SELECT IdSanPham, TenSanPham, MoTaSanPham, GiaSanPham, SoLuongSanPham FROM SanPham WHERE TenSanPham LIKE ? LIMIT 50',
      ['%' + q + '%']
    );
    res.json({ results: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Contact form -> inserts into `LienHe` (TieuDe, NoiDung)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const tieuDe = `Liên hệ - ${name || 'Khách'}`;
    const noiDung = `${message || ''}\n\nEmail: ${email || ''}`;
    await db.query('INSERT INTO LienHe (UserId, TieuDe, NoiDung) VALUES (?, ?, ?)', [null, tieuDe, noiDung]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Contact failed' });
  }
});

// Feedback -> inserts into `DanhGia` (UserId, BinhLuan, XepLoai)
router.post('/feedback', async (req, res) => {
  try {
    const { userId, message, rating, productId } = req.body;
    await db.query('INSERT INTO DanhGia (UserId, SanPhamId, XepLoai, BinhLuan) VALUES (?, ?, ?, ?)', [
      userId || null,
      productId || null,
      rating || null,
      message || null,
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Feedback failed' });
  }
});

// Create order (maps to `DonHang` and `ChiTietDonHang`)
router.post('/orders', async (req, res) => {
  try {
    const { userId, items, total, address } = req.body;
    const maDonHang = `DH-${Date.now()}`;
    const [r] = await db.query('INSERT INTO DonHang (UserId, MaDonHang, TongTien, DiaChiGiao) VALUES (?, ?, ?, ?)', [
      userId || null,
      maDonHang,
      total || 0,
      address || null,
    ]);
    const orderId = r.insertId;
    if (Array.isArray(items) && items.length) {
      const values = items.map(it => [orderId, it.productId, it.quantity, it.price]);
      await db.query('INSERT INTO ChiTietDonHang (DonHangId, SanPhamId, SoLuong, GiaBan) VALUES ?', [values]);
    }
    res.json({ ok: true, orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Order failed' });
  }
});

// Generate a simple invoice (returns JSON) using `DonHang` and `ChiTietDonHang`
router.get('/invoice/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const [orderRows] = await db.query('SELECT * FROM DonHang WHERE IdDonHang = ?', [orderId]);
    if (!orderRows.length) return res.status(404).json({ error: 'Order not found' });
    const order = orderRows[0];
    const [items] = await db.query('SELECT * FROM ChiTietDonHang WHERE DonHangId = ?', [orderId]);
    res.json({ order, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Invoice failed' });
  }
});

// Admin: list users (uses `user` table)
router.get('/admin/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT IdUser, HoTen, Email, ThoiDiemTao FROM `user` LIMIT 100');
    res.json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Admin fetch failed' });
  }
});

// AI helper endpoint (demo)
router.post('/ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    const reply = await askAI(prompt || '');
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'AI call failed' });
  }
});

module.exports = router;
