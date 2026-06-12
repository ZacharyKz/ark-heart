// pages/booking/booking.js
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
    ageOptions: ['18岁以下', '18-25岁', '26-35岁', '36-45岁', '46-55岁', '55岁以上'],
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
    canSubmit: false,
    submitting: false
  },

  // 任意字段变化后刷新 canSubmit
  refresh() {
    const f = this.data.formData;
    const ok = (
      f.name.trim() && f.phone.trim() && f.wechat.trim() &&
      f.gender && f.age && f.direction && f.description.trim() &&
      f.mode && this.data.agreed &&
      /^1[3-9]\d{9}$/.test(f.phone)
    );
    this.setData({ canSubmit: ok && !this.data.submitting });
  },

  onFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value }, () => this.refresh());
  },

  onGenderChange(e) {
    this.setData({ 'formData.gender': e.currentTarget.dataset.value }, () => this.refresh());
  },

  onAgeChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      'formData.age': this.data.ageOptions[idx],
      ageIndex: idx
    }, () => this.refresh());
  },

  onDirectionChange(e) {
    this.setData({ 'formData.direction': e.currentTarget.dataset.value }, () => this.refresh());
  },

  onModeChange(e) {
    this.setData({ 'formData.mode': e.currentTarget.dataset.value }, () => this.refresh());
  },

  onToggleAgreement() {
    this.setData({ agreed: !this.data.agreed }, () => this.refresh());
  },

  onReadAgreement() {
    wx.showModal({ title: '咨询与预约协议', content: '协议内容将在后续版本中完善。', showCancel: false });
  },

  // 不使用 canSubmit 做前置校验，直接在 onSubmit 里手动校验
  async onSubmit() {
    const f = this.data.formData;

    if (!f.name.trim()) return wx.showToast({ title: '请输入姓名', icon: 'none' });
    if (!f.phone.trim() || !/^1[3-9]\d{9}$/.test(f.phone)) return wx.showToast({ title: '手机号格式不正确', icon: 'none' });
    if (!f.wechat.trim()) return wx.showToast({ title: '请输入微信号', icon: 'none' });
    if (!f.gender) return wx.showToast({ title: '请选择性别', icon: 'none' });
    if (!f.age) return wx.showToast({ title: '请选择年龄', icon: 'none' });
    if (!f.direction) return wx.showToast({ title: '请选择咨询方向', icon: 'none' });
    if (!f.description.trim()) return wx.showToast({ title: '请填写问题简述', icon: 'none' });
    if (!f.mode) return wx.showToast({ title: '请选择咨询方式', icon: 'none' });
    if (!this.data.agreed) return wx.showToast({ title: '请阅读并同意协议', icon: 'none' });
    if (this.data.submitting) return;

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...', mask: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'createAppointment',
        data: f
      });
      wx.hideLoading();
      if (res.result.success) {
        wx.showToast({ title: '预约已提交', icon: 'success' });
        setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 1500);
      } else {
        this.setData({ submitting: false, canSubmit: true });
        wx.showToast({ title: res.result.message || '提交失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      this.setData({ submitting: false });
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    }
  },

  onBack() { wx.navigateBack(); }
});
