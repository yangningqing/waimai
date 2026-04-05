Page({
  data: {
    name: '张师傅',
    phone: '138****0001',
    completedOrders: 156,
    onTimeRate: '98.5%',
    rating: 4.8
  },
  onLoad() {
    // 页面加载
  },
  onShow() {
    // 页面显示
  },
  navigateToWallet() {
    wx.showToast({
      title: '钱包功能开发中',
      icon: 'none'
    })
  },
  navigateToOrders() {
    wx.navigateTo({
      url: '../index/index'
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