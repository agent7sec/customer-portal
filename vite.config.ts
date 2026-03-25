import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],

          // Ant Design UI library (largest dependency ~300KB)
          antd: ['antd'],

          // Ant Design icons (separate chunk for lazy loading)
          'antd-icons': ['@ant-design/icons'],

          // Refine core packages
          refine: [
            '@refinedev/core',
            '@refinedev/react-router-v6',
            '@refinedev/kbar',
          ],

          // Refine Ant Design integration
          'refine-antd': ['@refinedev/antd'],

          // Stripe payment processing (lazy loaded)
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],

          // React Query for data fetching
          'react-query': ['@tanstack/react-query'],

          // Auth0 authentication
          auth0: ['@auth0/auth0-spa-js'],

          // Utilities and helpers
          utils: ['axios', 'dompurify'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    // Enable source maps for production debugging
    sourcemap: false,
    // Minify with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
      mangle: {
        safari10: true, // Fix Safari 10+ issues
      },
    },
    // Target modern browsers for smaller bundle
    target: 'es2015',
    // Optimize CSS
    cssCodeSplit: true,
    // Asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
  },
  server: {
    port: 5173,
    open: false,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@refinedev/core',
      '@refinedev/antd',
      'antd',
      'classnames',
      'react-is',
    ],
    // Exclude large dependencies that should be lazy loaded
    exclude: ['@ant-design/icons'],
  },
  // Resolve configuration to handle dependency conflicts
  resolve: {
    dedupe: ['react-router', 'react-router-dom', 'react-is'],
  },
});
