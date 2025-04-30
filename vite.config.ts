import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Exclude the PDF.js worker from optimization to prevent issues
    exclude: ['pdfjs-dist/build/pdf.worker.min.mjs'],
  }
})
