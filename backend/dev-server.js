const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Development server is running.',
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.listen(PORT, HOSTNAME, () => {
  console.log(`Dev server is running at http://${HOSTNAME}:${PORT}`);
});