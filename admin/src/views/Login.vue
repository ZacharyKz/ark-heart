<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo-area">
        <div class="logo-icon">🛡️</div>
        <h1>方舟之心</h1>
        <p>管理员后台</p>
      </div>
      <form @submit.prevent="login">
        <input v-model="password" type="password" class="input" placeholder="请输入管理密码" autofocus />
        <button type="submit" class="btn" :disabled="loading">{{ loading ? '登录中...' : '登 录' }}</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { callAdminApi } from '../utils/cloudbase.js';

const router = useRouter();
const password = ref('');
const loading = ref(false);
const error = ref('');

async function login() {
  if (!password.value) return;
  loading.value = true;
  error.value = '';

  // Store password first
  localStorage.setItem('admin_password', password.value);

  const res = await callAdminApi('listAppointments', { pageSize: 1 });
  console.log('Login result:', res);

  if (res && res.success) {
    router.push('/dashboard');
  } else {
    error.value = (res && res.message) || '登录失败';
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
.login-card { background: #fff; border-radius: 16px; padding: 48px 40px; width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.logo-area { text-align: center; margin-bottom: 32px; }
.logo-icon { font-size: 48px; margin-bottom: 8px; }
.logo-area h1 { font-size: 24px; color: #2D2D2D; font-weight: 700; }
.logo-area p { font-size: 14px; color: #999; margin-top: 4px; }
.input { width: 100%; height: 48px; border: 1px solid #EDEDEB; border-radius: 10px; padding: 0 16px; font-size: 15px; outline: none; margin-bottom: 16px; transition: border-color 0.2s; }
.input:focus { border-color: #6B9E7D; }
.btn { width: 100%; height: 48px; background: #6B9E7D; color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn:hover { background: #5A8A6C; }
.btn:disabled { background: #ccc; cursor: not-allowed; }
.error { color: #991B1B; font-size: 13px; text-align: center; margin-top: 12px; word-break: break-all; }
</style>
