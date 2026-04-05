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
  logout() {
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    })
  }
})