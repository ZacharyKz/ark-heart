// 通过 HTTP 网关调用 CloudBase 云函数
const API_URL = 'https://the-ark-heart-d9g2v024t5583b8a6.service.tcloudbase.com/api/admin';

export async function callAdminApi(action, params = {}) {
  const password = localStorage.getItem('admin_password') || '';
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, password, ...params })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('API error:', err);
    return { success: false, message: '网络异常: ' + err.message };
  }
}
