// pages/report-detail/report-detail.js
Page({
  data: { report: null },

  onLoad(options) {
    if (options.id) this.loadReport(options.id);
  },

  async loadReport(id) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('reports').doc(id).get();
      if (res.data) {
        const r = res.data;
        this.setData({
          report: {
            ...r,
            dateText: r.createdAt ? this.fmt(r.createdAt) : '',
            reportNo: r.reportNo || '-'
          }
        });
      }
    } catch (err) {
      console.error('加载报告失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 图片预览
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const urls = this.data.report?.images || [];
    wx.previewImage({ current: url, urls });
  },

  fmt(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  onBack() { wx.navigateBack(); }
});
