// app.js — 方舟之心 The Ark Heart
App({
  onLaunch() {
    // 初始化 CloudBase
    if (wx.cloud) {
      wx.cloud.init({
        env: 'the-ark-heart-d9g2v024t5583b8a6',
        traceUser: true
      });
    }
  },

  globalData: {
    envId: 'the-ark-heart-d9g2v024t5583b8a6',
    userInfo: null,
    openid: null
  }
});
