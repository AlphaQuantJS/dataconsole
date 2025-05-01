/**
 * Vite configuration for DataConsole
 */

export default {
  root: '.',
  server: {
    port: 3000,
    open: true, // Automatically open browser
    hmr: true, // Enable Hot Module Replacement
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
};
