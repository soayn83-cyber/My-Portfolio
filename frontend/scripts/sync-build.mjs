import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(frontendRoot, '..');
const sourceNextDir = path.join(frontendRoot, '.next');
const sourceStandaloneDir = path.join(sourceNextDir, 'standalone');
const sourcePublicDir = path.join(frontendRoot, 'public');
const sourceStaticDir = path.join(sourceNextDir, 'static');
const frontendDistDir = path.join(frontendRoot, 'dist');
const backendDistDir = path.join(repoRoot, 'backend', 'dist');

function removeDir(targetPath) {
  fs.rmSync(targetPath, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  });
}

function copyDir(sourcePath, targetPath) {
  fs.cpSync(sourcePath, targetPath, { recursive: true });
}

function forceStandaloneHost(standaloneDir) {
  const standaloneServerPath = path.join(standaloneDir, 'server.js');

  if (!fs.existsSync(standaloneServerPath)) {
    return;
  }

  const standaloneServerSource = fs.readFileSync(standaloneServerPath, 'utf8');
  const patchedStandaloneServerSource = standaloneServerSource.replace(
    "const hostname = process.env.HOSTNAME || '0.0.0.0'",
    "const hostname = '0.0.0.0'"
  );

  if (patchedStandaloneServerSource !== standaloneServerSource) {
    fs.writeFileSync(standaloneServerPath, patchedStandaloneServerSource);
  }
}

function ensureRuntimeAssets(standaloneDir) {
  const standaloneNextDir = path.join(standaloneDir, '.next');
  const staticTargetDir = path.join(standaloneNextDir, 'static');
  const publicTargetDir = path.join(standaloneDir, 'public');

  fs.mkdirSync(standaloneNextDir, { recursive: true });

  if (fs.existsSync(sourceStaticDir)) {
    removeDir(staticTargetDir);
    copyDir(sourceStaticDir, staticTargetDir);
  }

  if (fs.existsSync(sourcePublicDir)) {
    removeDir(publicTargetDir);
    copyDir(sourcePublicDir, publicTargetDir);
  }
}

removeDir(frontendDistDir);

if (!fs.existsSync(sourceNextDir)) {
  throw new Error('Cannot find frontend/.next. Run next build before syncing the output.');
}

if (!fs.existsSync(sourceStandaloneDir)) {
  throw new Error('Cannot find frontend/.next/standalone. Run next build before syncing the output.');
}

copyDir(sourceStandaloneDir, path.join(frontendDistDir, 'standalone'));
ensureRuntimeAssets(path.join(frontendDistDir, 'standalone'));
forceStandaloneHost(path.join(frontendDistDir, 'standalone'));
copyDir(frontendDistDir, backendDistDir);
forceStandaloneHost(path.join(backendDistDir, 'standalone'));

console.log('Frontend build output copied to frontend/dist and backend/dist');