// pages/home/home.js
const app = getApp();

Page({
  data: {
    flowSteps: [
      { icon: '/images/icon-step1.svg', label: '选择服务', isFinal: false },
      { icon: '/images/icon-step2.svg', label: '填写信息', isFinal: false },
      { icon: '/images/icon-step3.svg', label: '添加备注', isFinal: false },
      { icon: '/images/icon-step4.svg', label: '确认预约', isFinal: true }
    ]
  },

  onLoad() {
    // 获取系统信息用于状态栏高度
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight
    });
  },

  // 服务卡片点击
  onTapService(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/booking/booking?type=${type}`
    });
  },

  // 阅读协议
  onReadAgreement() {
    wx.showModal({
      title: '咨询与预约协议',
      content: '协议内容将在后续版本中完善。',
      showCancel: false
    });
  },

  // 立即预约
  onGoBooking() {
    wx.navigateTo({
      url: '/pages/booking/booking'
    });
  },

  // 菜单
  onMenuTap() {
    wx.showActionSheet({
      itemList: ['关于我们', '联系客服', '咨询协议'],
      success(res) {
        console.log('菜单选择:', res.tapIndex);
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '方舟之心 - 找到内心的秩序与滋养',
      path: '/pages/home/home'
    };
  }
});
