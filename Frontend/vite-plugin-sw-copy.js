import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export default function vitePluginSWCopy() {
  return {
    name: 'vite-plugin-sw-copy',
    apply: 'build',
    writeBundle() {
      const swSource = join(__dirname, 'public', 'service-worker.js');
      const swDest = join(__dirname, 'dist', 'service-worker.js');
      
      try {
        const content = readFileSync(swSource, 'utf-8');
        writeFileSync(swDest, content, 'utf-8');
        console.log('Service worker copied to dist directory');
      } catch (err) {
        console.error('Error copying service worker:', err);
      }
    }
  };
}
