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
      { label: '女', value: 'female' },
      { label: '不便透露', value: 'other' }
    ],
    ageOptions: [
      '18岁以下', '18-25岁', '26-35岁', '36-45岁', '46-55岁', '55岁以上'
    ],
    directionOptions: [
      { label: '爱情婚姻', value: 'love_marriage', desc: '恋爱、婚姻关系困扰' },
      { label: '亲子互动', value: 'parent_child', desc: '与孩子的沟通、教育困扰' },
      { label: '职场人际', value: 'workplace', desc: '工作压力、人际关系困扰' },
      { label: '其他', value: 'other', desc: '其他方面的困扰' }
    ],
    modeOptions: [
      { label: '均可', value: 'both' },
      { label: '线上', value: 'online' },
      { label: '线下', value: 'offline' }
    ],
    agreed: false,
    submitting: false,
    canSubmit: false
  },

  onLoad(options) { },

  // 文本字段变化
  onFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value }, () => this.checkCanSubmit());
  },

  // 性别选择
  onGenderChange(e) {
    this.setData({ 'formData.gender': e.currentTarget.dataset.value }, () => this.checkCanSubmit());
  },

  // 年龄选择
  onAgeChange(e) {
    const index = e.detail.value;
    this.setData({
      'formData.age': this.data.ageOptions[index],
      ageIndex: index
    }, () => this.checkCanSubmit());
  },

  // 咨询方向选择
  onDirectionChange(e) {
    this.setData({ 'formData.direction': e.currentTarget.dataset.value }, () => this.checkCanSubmit());
  },

  // 咨询方式选择
  onModeChange(e) {
    this.setData({ 'formData.mode': e.currentTarget.dataset.value }, () => this.checkCanSubmit());
  },

  // 协议勾选
  onToggleAgreement() {
    this.setData({ agreed: !this.data.agreed }, () => this.checkCanSubmit());
  },

  // 阅读协议
  onReadAgreement(e) {
    if (e) e.stopPropagation();
    wx.showModal({ title: '咨询与预约协议', content: '协议内容将在后续版本中完善。', showCancel: false });
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { name, phone, wechat, gender, age, direction, description } = this.data.formData;
    let can = !!(name && phone && wechat && gender && age && direction && description && this.data.agreed);
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) can = false;
    this.setData({ canSubmit: can && !this.data.submitting });
  },

  // 提交 → 调用云函数
  async onSubmit() {
    if (!this.data.agreed) { wx.showToast({ title: '请先阅读并同意协议', icon: 'none' }); return; }
    if (this.data.submitting) return;

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...', mask: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'createAppointment',
        data: this.data.formData
      });

      wx.hideLoading();
      this.setData({ submitting: false });

      if (res.result.success) {
        wx.showToast({ title: '预约已提交', icon: 'success', duration: 2000 });
        setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 2000);
      } else {
        wx.showToast({ title: res.result.message || '提交失败', icon: 'none', duration: 3000 });
      }
    } catch (err) {
      wx.hideLoading();
      this.setData({ submitting: false });
      console.error('提交失败:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    }
  },

  onBack() { wx.navigateBack(); }
});
