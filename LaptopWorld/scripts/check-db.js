#!/usr/bin/env node
// Simple DB connectivity check using backend/db.js
const path = require('path');
const db = require(path.join(__dirname, '..', 'backend', 'db'));

async function check() {
  try {
    const [rows] = await db.query('SELECT 1 as ok');
    console.log('DB connection OK:', rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('DB connection failed:', err.message || err);
    process.exit(2);
  }
}

check();
