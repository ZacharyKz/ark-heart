// pages/booking/booking.js
Page({
  data: {
    formData: {
      name: '',
      phone: '',
      wechat: '',
      gender: '',
      age: '',
      direction: '',
      description: '',
      mode: ''
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
    canSubmit: false
  },

  onLoad(options) {
    // 如果从首页服务卡片跳转，预填方向
    if (options && options.type) {
      const typeMap = {
        counsel: '',
        direction: '',
        process: ''
      };
    }
  },

  // 文本字段变化
  onFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    }, () => this.checkCanSubmit());
  },

  // 性别选择
  onGenderChange(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      'formData.gender': value
    }, () => this.checkCanSubmit());
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
    const value = e.currentTarget.dataset.value;
    this.setData({
      'formData.direction': value
    }, () => this.checkCanSubmit());
  },

  // 咨询方式选择
  onModeChange(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      'formData.mode': value
    }, () => this.checkCanSubmit());
  },

  // 协议勾选
  onToggleAgreement() {
    this.setData({
      agreed: !this.data.agreed
    }, () => this.checkCanSubmit());
  },

  // 阅读协议
  onReadAgreement(e) {
    // 阻止冒泡
    if (e) e.stopPropagation();
    wx.showModal({
      title: '咨询与预约协议',
      content: '协议内容将在后续版本中完善。',
      showCancel: false
    });
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { name, phone, wechat, gender, age, direction, description } = this.data.formData;
    const canSubmit = !!(name && phone && wechat && gender && age && direction && description && this.data.agreed);
    this.setData({ canSubmit });

    // 手机号格式校验
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      this.setData({ canSubmit: false });
    }
  },

  // 提交
  async onSubmit() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先阅读并同意协议', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });

    try {
      const db = wx.cloud.database();
      const formData = this.data.formData;

      await db.collection('appointments').add({
        data: {
          ...formData,
          status: 'pending', // 待确认
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      });

      wx.hideLoading();
      wx.showToast({
        title: '预约已提交',
        icon: 'success',
        duration: 2000
      });

      // 返回首页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' });
      }, 2000);

    } catch (err) {
      wx.hideLoading();
      console.error('提交失败:', err);
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      });
    }
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});
