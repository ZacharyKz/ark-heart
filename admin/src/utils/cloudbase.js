// CloudBase Web SDK（从 CDN 加载，全局变量 cloudbase）
const app = cloudbase.init({
  env: 'the-ark-heart-d9g2v024t5583b8a6',
  region: 'ap-shanghai'
});

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
    return { success: false, message: '网络异常: ' + err.message };
  }
}
