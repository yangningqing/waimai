Page({
  data: {
    name: '塔斯汀',
    phone: '138****0002',
    todayOrders: 568,
    rating: 4.8,
    goodRate: '96%'
  },
  onLoad() {
    // 页面加载
  },
  onShow() {
    // 页面显示
  },
  logout() {
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    })
  }
})