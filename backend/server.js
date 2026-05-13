const fs = require('fs');
const path = require('path');
require('dotenv').config();

const distStandaloneServerCandidates = [
  path.join(__dirname, 'dist', 'standalone', 'server.js'),
  path.join(__dirname, '..', 'frontend', 'dist', 'standalone', 'server.js'),
];

const distStandaloneServer = distStandaloneServerCandidates.find((candidate) => fs.existsSync(candidate));

process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
process.env.PUBLIC_ORIGIN =
  process.env.PUBLIC_ORIGIN ||
  process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, '') ||
  `http://${process.env.HOSTNAME}:${process.env.PORT}`;

if (!distStandaloneServer) {
  throw new Error('Missing dist/standalone/server.js in backend/dist or frontend/dist. Run npm run build before starting in production.');
}

process.chdir(path.dirname(distStandaloneServer));
require(distStandaloneServer);
