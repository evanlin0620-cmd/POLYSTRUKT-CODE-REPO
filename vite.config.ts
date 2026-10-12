import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
        ws: false,
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-dom/client',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          'three',
          'three-csg-ts',
          'three/examples/jsm/exporters/STLExporter.js',
          'three/examples/jsm/exporters/OBJExporter.js',
          'three/examples/jsm/exporters/GLTFExporter.js',
          '@react-three/fiber',
          '@react-three/drei',
          '@react-three/postprocessing',
          '@studio-freight/react-lenis',
          'motion/react',
          'lucide-react',
          'zustand',
          'zustand/middleware',
          'clsx',
          'tailwind-merge',
          'class-variance-authority',
          'firebase/app',
          'firebase/auth',
          'firebase/firestore',
          'jspdf',
          'jsqr',
          'recharts',
          '@google/genai',
          'qrcode.react',
        ],
        holdUntilCrawlEnd: true,
      },
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
