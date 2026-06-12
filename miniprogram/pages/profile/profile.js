// pages/profile/profile.js
const app = getApp();

Page({
  data: {
    isLogin: false,
    userInfo: { nickname: '', avatar: '' },
    services: [
      { type: 'records', icon: '/images/icon-svc-records.svg', label: '我的预约', desc: '查看我的记录' },
      { type: 'counsel', icon: '/images/icon-svc-counsel.svg', label: '我的咨询', desc: '查看咨询记录' },
      { type: 'favorites', icon: '/images/icon-svc-fav.svg', label: '我的收藏', desc: '收藏的帖子' },
      { type: 'reports', icon: '/images/icon-svc-reports.svg', label: '我的报告', desc: '查看报告内容' }
    ],
    menuItems: [
      { type: 'messages', icon: '/images/icon-menu-msg.svg', label: '我的消息' },
      { type: 'coupons', icon: '/images/icon-menu-coupon.svg', label: '优惠券' },
      { type: 'support', icon: '/images/icon-menu-support.svg', label: '联系客服' },
      { type: 'settings', icon: '/images/icon-menu-settings.svg', label: '设置' }
    ]
  },

  onShow() {
    this.checkLogin();
  },

  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ isLogin: true, userInfo });
    }
  },

  // 微信一键登录
  onWxLogin() {
    wx.getUserProfile({
      desc: '用于展示您的昵称和头像',
      success: (res) => {
        const userInfo = res.userInfo;
        this.setData({ isLogin: true, userInfo });
        wx.setStorageSync('userInfo', userInfo);
        app.globalData.userInfo = userInfo;

        wx.showToast({ title: '登录成功', icon: 'success' });
      },
      fail: (err) => {
        console.log('登录取消:', err);
      }
    });
  },

  onEditProfile() {
    wx.showToast({ title: '编辑资料功能开发中', icon: 'none' });
  },

  onSettingsTap() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' });
  },

  onTapService(e) {
    const type = e.currentTarget.dataset.type;
    switch (type) {
      case 'records':
        wx.switchTab({ url: '/pages/records/records' });
        break;
      case 'reports':
        wx.switchTab({ url: '/pages/reports/reports' });
        break;
      default:
        wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  onTapMenu(e) {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  }
});
