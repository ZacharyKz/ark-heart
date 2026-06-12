// pages/report-detail/report-detail.js
Page({
  data: {
    report: null
  },

  onLoad(options) {
    if (options.id) {
      this.loadReport(options.id);
    }
  },

  async loadReport(id) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('reports').doc(id).get();

      if (res.data) {
        const r = res.data;
        const dirMap = {
          love_marriage: '爱情婚姻', parent_child: '亲子互动',
          workplace: '职场人际', other: '其他'
        };

        const tagMap = {
          closed: { text: '已关闭', cls: 'gray' },
          ongoing: { text: '进行中', cls: 'green' },
          not_started: { text: '未开始', cls: 'green' }
        };
        const tag = tagMap[r.reportStatus] || { text: '未知', cls: 'gray' };

        this.setData({
          report: {
            ...r,
            tagText: tag.text,
            tagClass: tag.cls,
            dateText: r.createdAt ? this.fmt(r.createdAt) : '',
            directionText: dirMap[r.direction] || ''
          }
        });
      }
    } catch (err) {
      console.error('加载报告失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  fmt(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  onBack() { wx.navigateBack(); }
});
