// pages/booking-detail/booking-detail.js
Page({
  data: {
    detail: {
      status: 'pending',
      statusLabel: '待确认'
    },
    detailFields: []
  },

  onLoad(options) {
    if (options.id) {
      this.loadDetail(options.id);
    }
  },

  async loadDetail(id) {
    wx.showLoading({ title: '加载中...' });
    try {
      const db = wx.cloud.database();
      const res = await db.collection('appointments').doc(id).get();

      if (res.data) {
        const d = res.data;
        const dirMap = {
          love_marriage: '爱情婚姻', parent_child: '亲子互动',
          workplace: '职场人际', other: '其他'
        };
        const modeMap = { online: '线上', offline: '线下', both: '均可' };
        const genderMap = { male: '男', female: '女', other: '不便透露' };
        const statusMap = { pending: '待确认', confirmed: '已确认', done: '已完成', cancelled: '已取消' };

        this.setData({
          detail: {
            ...d,
            statusLabel: statusMap[d.status] || '未知'
          },
          detailFields: [
            { label: '姓名', value: d.name },
            { label: '手机号', value: d.phone },
            { label: '微信号', value: d.wechat },
            { label: '性别', value: genderMap[d.gender] },
            { label: '年龄', value: d.age },
            { label: '咨询方向', value: dirMap[d.direction] },
            { label: '咨询方式', value: modeMap[d.mode] },
            { label: '问题简述', value: d.description },
            { label: '提交时间', value: d.createdAt ? this.formatFullDate(d.createdAt) : '' }
          ]
        });
      }
    } catch (err) {
      console.error('加载详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  formatFullDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  },

  async onCancel() {
    const res = await wx.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      confirmColor: '#991B1B'
    });

    if (!res.confirm) return;

    wx.showLoading({ title: '取消中...' });
    try {
      const db = wx.cloud.database();
      await db.collection('appointments').doc(this.data.detail._id).update({
        data: {
          status: 'cancelled',
          updatedAt: db.serverDate()
        }
      });

      wx.hideLoading();
      wx.showToast({ title: '已取消', icon: 'success' });
      this.setData({
        'detail.status': 'cancelled',
        'detail.statusLabel': '已取消'
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '取消失败', icon: 'none' });
    }
  },

  onBack() {
    wx.navigateBack();
  }
});
