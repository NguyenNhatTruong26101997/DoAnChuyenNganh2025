const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('cors')());

// Serve static frontend (renamed to `frontend`)
app.use(express.static(path.join(__dirname, 'frontend')));

// Routes (renamed to backend folder)
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api', require('./backend/routes/api'));

// Fallback to index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Laptop World server running on port ${port}`);
});
