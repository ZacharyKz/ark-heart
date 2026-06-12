// components/tab-bar/tab-bar.js
Component({
  properties: {
    current: {
      type: Number,
      value: 0
    }
  },

  data: {
    tabs: [
      { pagePath: '/pages/home/home', text: '首页' },
      { pagePath: '/pages/records/records', text: '预约记录' },
      { pagePath: '/pages/reports/reports', text: '我的报告' },
      { pagePath: '/pages/profile/profile', text: '我的' }
    ]
  },

  methods: {
    onTabTap(e) {
      const index = e.currentTarget.dataset.index;
      const tab = this.data.tabs[index];

      if (index === this.data.current) return;

      wx.switchTab({
        url: tab.pagePath,
        fail(err) {
          console.error('Tab 切换失败:', err);
        }
      });
    }
  }
});
