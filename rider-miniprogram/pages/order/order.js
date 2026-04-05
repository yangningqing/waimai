Page({
  data: {
    orders: [
      {
        id: '20260406001',
        shopName: '塔斯汀',
        customerName: '张三',
        address: '北京城市学院顺义校区',
        status: '待取餐',
        remainingTime: '29:59'
      },
      {
        id: '20260406002',
        shopName: '曼玲粥店',
        customerName: '李四',
        address: '朝阳区望京SOHO',
        status: '配送中',
        remainingTime: '15:30'
      }
    ]
  },
  onLoad() {
    // 页面加载
  },
  onShow() {
    // 页面显示
  },
  navigateToShop() {
    wx.showToast({
      title: '导航功能开发中',
      icon: 'none'
    })
  },
  confirmPickup() {
    wx.showToast({
      title: '已确认取餐',
      icon: 'success'
    })
  },
  navigateToCustomer() {
    wx.showToast({
      title: '导航功能开发中',
      icon: 'none'
    })
  },
  completeDelivery() {
    wx.showToast({
      title: '配送完成',
      icon: 'success'
    })
  }
})