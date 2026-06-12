// pages/reports/reports.js
Page({
  data: {
    stats: [
      { icon: '/images/icon-report-total.svg', num: 0, label: '咨询总数' },
      { icon: '/images/icon-report-done.svg', num: 0, label: '已完成' },
      { icon: '/images/icon-report-ongoing.svg', num: 0, label: '进行中' },
      { icon: '/images/icon-report-review.svg', num: 0, label: '待评价' }
    ],
    reports: [],
    tagMap: {
      closed: { text: '已关闭', cls: 'gray' },
      ongoing: { text: '进行中', cls: 'green' },
      not_started: { text: '未开始', cls: 'green' }
    }
  },

  onShow() {
    this.loadReports();
  },

  async loadReports() {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('reports')
        .orderBy('createdAt', 'desc')
        .get();

      const reports = res.data.map(r => {
        const tag = this.data.tagMap[r.reportStatus] || { text: '未知', cls: 'gray' };
        return {
          ...r,
          tagText: tag.text,
          tagClass: tag.cls,
          dateText: r.createdAt ? this.formatDate(r.createdAt) : '',
          thumb: r.thumb || '/images/placeholder.svg'
        };
      });

      // 更新统计
      const done = reports.filter(r => r.reportStatus === 'closed').length;
      const ongoing = reports.filter(r => r.reportStatus === 'ongoing').length;

      this.setData({
        reports,
        'stats[0].num': reports.length,
        'stats[1].num': done,
        'stats[2].num': ongoing
      });
    } catch (err) {
      console.error('加载报告失败:', err);
    }
  },

  formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  onTapReport(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: '报告详情开发中', icon: 'none' });
  },

  onFilterTap() {
    wx.showToast({ title: '筛选功能开发中', icon: 'none' });
  },

  onMenuTap() {}
});
