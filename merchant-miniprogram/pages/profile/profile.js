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
  navigateToShopManagement() {
    wx.showToast({
      title: '店铺管理功能开发中',
      icon: 'none'
    })
  },
  navigateToFinance() {
    wx.showToast({
      title: '财务管理功能开发中',
      icon: 'none'
    })
  },
  navigateToOrders() {
    wx.navigateTo({
      url: '../orders/orders'
    })
  },
  navigateToFeedback() {
    wx.showToast({
      title: '意见反馈功能开发中',
      icon: 'none'
    })
  },
  navigateToSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    })
  },
  logout() {
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    })
  }
})