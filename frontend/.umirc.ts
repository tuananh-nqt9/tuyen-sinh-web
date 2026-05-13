import { defineConfig } from '@umijs/max';
import routes from './src/routes';

export default defineConfig({
  routes: routes,
  npmClient: 'npm',
  mfsu: false,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
    '/uploads': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
});
