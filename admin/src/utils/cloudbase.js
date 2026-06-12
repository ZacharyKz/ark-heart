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

// 上传图片到云存储，返回 fileID 和临时 URL
export async function uploadImage(file) {
  await ensureAuth();
  const ext = file.name.split('.').pop() || 'png';
  const cloudPath = `reports/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  let res;
  // 尝试新 SDK API: app.storage.uploadFile({ cloudPath, file })
  if (app.storage && app.storage.uploadFile) {
    res = await app.storage.uploadFile({ cloudPath, file });
    console.log('storage.uploadFile result:', res);
  } else if (app.uploadFile) {
    // 旧 SDK API: app.uploadFile({ cloudPath, filePath })
    res = await app.uploadFile({ cloudPath, filePath: file });
    console.log('uploadFile result:', res);
  } else {
    throw new Error('CloudBase SDK 不支持文件上传');
  }

  // 提取 fileID
  const fileID = res?.fileID || res?.data?.fileID;
  if (!fileID) throw new Error('上传成功但未获取到 fileID');

  // 获取临时下载链接
  let url;
  if (app.getTempFileURL) {
    const urlRes = await app.getTempFileURL({ fileList: [fileID] });
    url = urlRes.fileList?.[0]?.tempFileURL;
  } else if (app.storage && app.storage.getTempFileURL) {
    const urlRes = await app.storage.getTempFileURL({ fileList: [fileID] });
    url = urlRes.fileList?.[0]?.tempFileURL || urlRes?.data?.fileList?.[0]?.tempFileURL;
  }

  // 返回 { fileID, url } 对象
  return { fileID, url: url || fileID };
}
