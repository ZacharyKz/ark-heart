import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';

const routes = [
  { path: '/', name: 'login', component: Login },
  { path: '/dashboard', name: 'dashboard', component: Dashboard }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
