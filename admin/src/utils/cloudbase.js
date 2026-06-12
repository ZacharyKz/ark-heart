import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
  env: 'the-ark-heart-d9g2v024t5583b8a6',
  region: 'ap-shanghai'
});

export const auth = app.auth({ persistence: 'local' });
export const db = app.database();

export async function callAdminApi(action, params = {}) {
  const password = localStorage.getItem('admin_password') || '';
  try {
    const res = await app.callFunction({
      name: 'adminApi',
      data: { action, password, ...params }
    });
    return res.result;
  } catch (err) {
    console.error('API error:', err);
    return { success: false, message: '网络异常' };
  }
}

export default app;
