const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

try {
  require('dotenv').config();
} catch {
  // Production Render deployments do not need .env loading at startup.
}

const distStandaloneServers = [
  path.join(__dirname, 'dist', 'standalone', 'server.js'),
  path.join(__dirname, '..', 'frontend', 'dist', 'standalone', 'server.js'),
];
const bindHost = '0.0.0.0';

function forceStandaloneHost(serverPath) {
  if (!fs.existsSync(serverPath)) {
    return;
  }

  const standaloneSource = fs.readFileSync(serverPath, 'utf8');
  const patchedSource = standaloneSource
    .replace("const hostname = process.env.HOSTNAME || '0.0.0.0'", "const hostname = '0.0.0.0'")
    .replace('const hostname = process.env.HOSTNAME || "0.0.0.0"', "const hostname = '0.0.0.0'")
    .replace(/const hostname = process\.env\.HOSTNAME \|\| .*$/m, "const hostname = '0.0.0.0'");

  if (patchedSource !== standaloneSource) {
    fs.writeFileSync(serverPath, patchedSource);
  }
}

process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = bindHost;
process.env.PUBLIC_ORIGIN =
  process.env.PUBLIC_ORIGIN ||
  process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, '') ||
  `http://${bindHost}:${process.env.PORT}`;

const distStandaloneServer = distStandaloneServers.find((serverPath) => fs.existsSync(serverPath));

if (!distStandaloneServer) {
  try {
    console.log('Standalone output missing; running frontend build as a fallback');
    execFileSync('npm', ['--prefix', 'frontend', 'install', '--include=dev'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
    execFileSync('npm', ['--prefix', 'frontend', 'run', 'build'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Frontend fallback build failed');
    console.error(error);
    throw error;
  }
}

const resolvedStandaloneServer = distStandaloneServers.find((serverPath) => fs.existsSync(serverPath));

if (!resolvedStandaloneServer) {
  throw new Error(
    'Missing standalone server output after fallback build. Check Render build logs for the frontend build step.'
  );
}

forceStandaloneHost(resolvedStandaloneServer);

console.log(`Loading standalone server from ${resolvedStandaloneServer}`);
process.chdir(path.dirname(resolvedStandaloneServer));
require(resolvedStandaloneServer);
