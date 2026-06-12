// app.js — 方舟之心 The Ark Heart
App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: 'the-ark-heart-d9g2v024t5583b8a6',
        traceUser: true
      });
    }
  },

  globalData: {
    envId: 'the-ark-heart-d9g2v024t5583b8a6',
    cdnBase: 'https://7468-the-ark-heart-d9g2v024t5583b8a6-1442771109.tcb.qcloud.la/images',
    userInfo: null,
    openid: null
  },

  // 获取 CDN 图片地址
  cdn(path) {
    return this.globalData.cdnBase + '/' + path;
  }
});
