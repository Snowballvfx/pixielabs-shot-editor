import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native-video': path.resolve(__dirname, 'src/shims/react-native-video.tsx'),
      'react-native-reanimated': path.resolve(__dirname, 'src/shims/reanimated.tsx'),
      'react-native-gesture-handler': path.resolve(__dirname, 'src/shims/gesture-handler.tsx'),
      'react-native': 'react-native-web',
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'PixielabsShotEditor',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') return 'style.css';
          return assetInfo.name;
        },
      },
    },
  },
})