import { writeFileSync } from 'fs';
import { join } from 'path';

export default function vitePluginSW() {
  return {
    name: 'vite-plugin-sw',
    apply: 'build',
    closeBundle() {
      // Copy service worker to dist directory
      const swSource = join(__dirname, 'public', 'service-worker.js');
      const swDest = join(__dirname, 'dist', 'service-worker.js');
      
      // This ensures the service worker is copied as-is without hashing
      this.emitFile({
        type: 'asset',
        fileName: 'service-worker.js',
        source: require('fs').readFileSync(swSource, 'utf-8'),
      });
      
      console.log('Service worker copied to dist directory');
    }
  };
}
