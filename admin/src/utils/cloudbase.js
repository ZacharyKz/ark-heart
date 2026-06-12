import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
  env: 'the-ark-heart-d9g2v024t5583b8a6',
  region: 'ap-shanghai'
});

// 保证匿名登录
let authReady = null;
function ensureAuth() {
  if (!authReady) {
    const auth = app.auth({ persistence: 'local' });
    authReady = auth.signInAnonymously().catch(err => {
      console.warn('匿名登录失败:', err);
      // 即使失败也继续尝试调用（SDK 可能已内置处理）
    });
  }
  return authReady;
}

export async function callAdminApi(action, params = {}) {
  const password = localStorage.getItem('admin_password') || '';
  try {
    await ensureAuth();
    const res = await app.callFunction({
      name: 'adminApi',
      data: { action, password, ...params }
    });
    return res.result;
  } catch (err) {
    console.error('API error:', err);
    const msg = typeof err === 'string' ? err : (err.message || err.code || JSON.stringify(err));
    return { success: false, message: '请求失败: ' + msg };
  }
}
