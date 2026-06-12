import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
  env: 'the-ark-heart-d9g2v024t5583b8a6',
  region: 'ap-shanghai'
});

let authReady = null;
function ensureAuth() {
  if (!authReady) {
    const auth = app.auth({ persistence: 'local' });
    authReady = auth.signInAnonymously().catch(err => {
      console.warn('匿名登录失败:', err);
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
    return res?.result || res;
  } catch (err) {
    console.error('API error:', err);
    const msg = typeof err === 'string' ? err : (err.message || err.code || JSON.stringify(err));
    return { success: false, message: '请求失败: ' + msg };
  }
}

// 上传图片到云存储
export async function uploadImage(file) {
  await ensureAuth();
  const ext = file.name.split('.').pop() || 'png';
  const cloudPath = `reports/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  // 兼容新旧 SDK
  const uploadFn = app.uploadFile || (app.storage && app.storage.uploadFile);
  if (!uploadFn) throw new Error('CloudBase SDK 不支持文件上传');
  const res = await uploadFn.call(app.storage || app, { cloudPath, filePath: file });
  const fileID = res.fileID || (res.data && res.data.fileID);
  if (fileID) {
    const getUrl = app.getTempFileURL || (app.storage && app.storage.getTempFileURL);
    if (getUrl) {
      const urlRes = await getUrl.call(app.storage || app, { fileList: [fileID] });
      const list = urlRes.fileList || (urlRes.data && urlRes.data.fileList) || [];
      return list[0]?.tempFileURL || fileID;
    }
    return fileID;
  }
  return fileID || res;
}
