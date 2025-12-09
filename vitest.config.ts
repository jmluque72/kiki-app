import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    target: 'node18',
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    testMatch: [
      '**/__tests__/**/*.(ts|tsx|js)',
      '**/*.(test|spec).(ts|tsx|js)'
    ],
    exclude: [
      '**/node_modules/**',
      '**/e2e/**',
      '**/android/**',
      '**/ios/**',
      '**/.git/**',
      '**/dist/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'e2e/',
        '**/*.d.ts',
        '**/types/**',
        '**/config/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx,js}',
        '**/*.spec.{ts,tsx,js}'
      ],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-native': 'react-native'
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  // Configuración para ignorar transformaciones de ciertos módulos
  optimizeDeps: {
    exclude: ['react-native', '@react-native']
  },
  // Configuración para manejar módulos de React Native
  define: {
    'process.env.NODE_ENV': '"test"'
  }
});
