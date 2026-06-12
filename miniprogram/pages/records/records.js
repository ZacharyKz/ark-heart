// pages/records/records.js
Page({
  data: {
    filters: [
      { label: '全部', value: 'all' },
      { label: '待确认', value: 'pending' },
      { label: '已确认', value: 'confirmed' },
      { label: '已完成', value: 'done' },
      { label: '已取消', value: 'cancelled' }
    ],
    currentFilter: 'all',
    records: [],
    filteredRecords: [],
    statusMap: {
      pending: '待确认',
      confirmed: '已确认',
      done: '已完成',
      cancelled: '已取消'
    }
  },

  onShow() {
    this.loadRecords();
  },

  async loadRecords() {
    wx.showLoading({ title: '加载中...' });
    try {
      const db = wx.cloud.database();
      const _ = db.command;
      const res = await db.collection('appointments')
        .orderBy('createdAt', 'desc')
        .get();

      const records = res.data.map(r => ({
        ...r,
        statusLabel: this.data.statusMap[r.status] || '未知',
        dateText: r.createdAt ? this.formatDate(r.createdAt) : '待定',
        location: r.mode === 'online' ? '腾讯会议' : r.mode === 'offline' ? '方舟之心工作室' : '待定',
        counselor: r.counselor || '待分配',
        title: this.getTitle(r),
        thumb: this.getThumb(r)
      }));

      this.setData({ records }, () => this.applyFilter());
    } catch (err) {
      console.error('加载失败:', err);
    } finally {
      wx.hideLoading();
    }
  },

  formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
  },

  getTitle(r) {
    const dirMap = {
      love_marriage: '亲密关系',
      parent_child: '亲子互动',
      workplace: '职场人际',
      other: '个人咨询'
    };
    const mode = r.mode === 'online' ? '线上咨询' : r.mode === 'offline' ? '线下咨询' : '咨询';
    return `${mode} · ${dirMap[r.direction] || ''}`;
  },

  getThumb(r) {
    const thumbMap = {
      love_marriage: '/images/thumb-love.svg',
      parent_child: '/images/thumb-family.svg',
      workplace: '/images/thumb-work.svg',
      other: '/images/thumb-other.svg'
    };
    return thumbMap[r.direction] || '/images/placeholder.svg';
  },

  onFilterChange(e) {
    this.setData({ currentFilter: e.currentTarget.dataset.value }, () => this.applyFilter());
  },

  applyFilter() {
    const { currentFilter, records } = this.data;
    if (currentFilter === 'all') {
      this.setData({ filteredRecords: records });
    } else {
      this.setData({
        filteredRecords: records.filter(r => r.status === currentFilter)
      });
    }
  },

  onTapRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/booking-detail/booking-detail?id=${id}`
    });
  },

  onMenuTap() {}
});
