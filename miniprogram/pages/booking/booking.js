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
    submitting: false
  },

  onInput(e) {
    const f = e.currentTarget.dataset.f;
    this.setData({ [`formData.${f}`]: e.detail.value });
  },

  tapGender(e) {
    this.setData({ 'formData.gender': e.currentTarget.dataset.v });
  },

  tapDirection(e) {
    this.setData({ 'formData.direction': e.currentTarget.dataset.v });
  },

  tapMode(e) {
    this.setData({ 'formData.mode': e.currentTarget.dataset.v });
  },

  onAgeChange(e) {
    const idx = e.detail.value;
    this.setData({
      'formData.age': this.data.ageOptions[idx],
      ageIndex: idx
    });
  },

  tapAgree() {
    this.setData({ agreed: !this.data.agreed });
  },

  readAgreement() {
    wx.showModal({ title: '咨询与预约协议', content: '协议内容将在后续版本中完善。', showCancel: false });
  },

  // 提交——始终可点击，内部逐字段校验提示
  async onSubmit() {
    const f = this.data.formData;

    // 逐字段检查
    if (!f.name.trim())      return wx.showToast({ title: '请输入姓名', icon: 'none' });
    if (!f.phone.trim())     return wx.showToast({ title: '请输入手机号', icon: 'none' });
    if (!/^1[3-9]\d{9}$/.test(f.phone)) return wx.showToast({ title: '手机号格式不正确', icon: 'none' });
    if (!f.wechat.trim())    return wx.showToast({ title: '请输入微信号', icon: 'none' });
    if (!f.gender)           return wx.showToast({ title: '请选择性别', icon: 'none' });
    if (!f.age)              return wx.showToast({ title: '请选择年龄', icon: 'none' });
    if (!f.direction)        return wx.showToast({ title: '请选择咨询方向', icon: 'none' });
    if (!f.description.trim()) return wx.showToast({ title: '请填写问题简述', icon: 'none' });
    if (!f.mode)             return wx.showToast({ title: '请选择咨询方式', icon: 'none' });
    if (!this.data.agreed)   return wx.showToast({ title: '请阅读并同意协议', icon: 'none' });
    if (this.data.submitting) return;

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...', mask: true });
    try {
      const res = await wx.cloud.callFunction({ name: 'createAppointment', data: f });
      wx.hideLoading();
      if (res.result.success) {
        wx.showToast({ title: '预约已提交', icon: 'success' });
        // 提示订阅消息
        wx.requestSubscribeMessage({
          tmplIds: ['TWLsZQ3vYBhWycHcN0xN5Vd3YM5yf_p7EMRldqn3dm0'],
          success: () => console.log('订阅提示已弹出'),
          complete: () => setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 1000)
        });
      } else {
        this.setData({ submitting: false });
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
