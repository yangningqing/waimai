Page({
  data: {
    activeTab: 0,
    coupons: [
      {
        id: 1,
        amount: 13,
        condition: 30,
        title: '外卖大额神券',
        expiry: '2026-05-06',
        status: 'unused'
      },
      {
        id: 2,
        amount: 40,
        condition: 100,
        title: '踏青美食神券',
        expiry: '2026-05-15',
        status: 'unused'
      },
      {
        id: 3,
        amount: 10,
        condition: 25,
        title: '外卖大额神券',
        expiry: '2026-04-30',
        status: 'unused'
      }
    ]
  },
  onLoad() {
    // 页面加载时的初始化逻辑
  },
  onShow() {
    // 页面显示时的逻辑
  },
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      activeTab: index
    })
  },
  useCoupon(e) {
    // 立即使用优惠券
    wx.navigateTo({
      url: '../index/index'
    })
  }
})