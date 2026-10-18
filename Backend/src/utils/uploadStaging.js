// Upload staging directory.
//
// Uploaded files are only _staged_ locally: every controller immediately uploads
// them to Cloudinary and unlinks the local copy (see utils/cloudinaryUpload.js),
// so the directory never needs to outlive a single request.
//
// Serverless platforms (Vercel, AWS Lambda, …) mount the project read-only at
// /var/task, so mkdirSync('Backend/uploads') crashes the entire app at cold start
// — before a single route can answer. When the project-local directory isn't
// writable we transparently fall back to the OS temp dir (the only writable
// location on those platforms). Behavior on normal hosts is unchanged.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));

function makeDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.accessSync(dir, fs.constants.W_OK); // writable, not merely creatable
  return dir;
}

let uploadsDir;
try {
  uploadsDir = makeDir(path.join(here, '../../uploads'));
} catch {
  uploadsDir = makeDir(path.join(os.tmpdir(), 'kaamsetu-uploads'));
  console.log('⚠️  Project filesystem is read-only — staging uploads in', uploadsDir);
}

export { uploadsDir };
