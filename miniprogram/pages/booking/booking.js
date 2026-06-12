// pages/booking/booking.js
const app = getApp();

Page({
  data: {
    formData: {
      name: '', phone: '', wechat: '', gender: '', age: '',
      direction: '', description: '', mode: ''
    },
    ageIndex: -1,
    genderOptions: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ],
    ageOptions: [
      '18岁以下', '18-25岁', '26-35岁', '36-45岁', '46-55岁', '55岁以上'
    ],
    directionOptions: [
      { label: '爱情婚姻', value: 'love_marriage' },
      { label: '亲子互动', value: 'parent_child' },
      { label: '职场人际', value: 'workplace' }
    ],
    modeOptions: [
      { label: '线上', value: 'online' },
      { label: '线下', value: 'offline' }
    ],
    agreed: false,
    submitting: false,
    canSubmit: false
  },

  onLoad() { },

  onFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value });
    this.checkCanSubmit();
  },

  onGenderChange(e) {
    this.setData({ 'formData.gender': e.currentTarget.dataset.value });
    this.checkCanSubmit();
  },

  onAgeChange(e) {
    this.setData({
      'formData.age': this.data.ageOptions[e.detail.value],
      ageIndex: e.detail.value
    });
    this.checkCanSubmit();
  },

  onDirectionChange(e) {
    this.setData({ 'formData.direction': e.currentTarget.dataset.value });
    this.checkCanSubmit();
  },

  onModeChange(e) {
    this.setData({ 'formData.mode': e.currentTarget.dataset.value });
    this.checkCanSubmit();
  },

  onToggleAgreement() {
    this.setData({ agreed: !this.data.agreed });
    this.checkCanSubmit();
  },

  onReadAgreement(e) {
    if (e) e.stopPropagation();
    wx.showModal({ title: '咨询与预约协议', content: '协议内容将在后续版本中完善。', showCancel: false });
  },

  checkCanSubmit() {
    // 延迟一帧确保 setData 已生效
    setTimeout(() => {
      const fd = this.data.formData;
      const ok = fd.name.trim() && fd.phone.trim() && fd.wechat.trim()
        && fd.gender && fd.age && fd.direction && fd.description.trim()
        && fd.mode && this.data.agreed
        && /^1[3-9]\d{9}$/.test(fd.phone);
      this.setData({ canSubmit: ok && !this.data.submitting });
    }, 50);
  },

  async onSubmit() {
    if (!this.data.canSubmit) return;
    if (this.data.submitting) return;

    this.setData({ submitting: true, canSubmit: false });
    wx.showLoading({ title: '提交中...', mask: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'createAppointment',
        data: this.data.formData
      });

      wx.hideLoading();
      this.setData({ submitting: false });
      this.checkCanSubmit();

      if (res.result.success) {
        wx.showToast({ title: '预约已提交', icon: 'success', duration: 2000 });
        setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 2000);
      } else {
        wx.showToast({ title: res.result.message || '提交失败', icon: 'none', duration: 3000 });
      }
    } catch (err) {
      wx.hideLoading();
      this.setData({ submitting: false });
      this.checkCanSubmit();
      console.error('提交失败:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    }
  },

  onBack() { wx.navigateBack(); }
});
