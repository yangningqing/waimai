Page({
  data: {
    currentTab: 0,
    tabList: ['全部', '待接单', '配送中', '已完成'],
    orderList: [
      {
        id: '20260406001',
        customerName: '张三',
        goodsInfo: '香辣鸡腿堡 x1，薯条 x1',
        orderTime: '10:30',
        price: 30,
        status: '待接单'
      },
      {
        id: '20260406002',
        customerName: '李四',
        goodsInfo: '曼玲粥套餐 x1',
        orderTime: '11:15',
        price: 25,
        status: '配送中'
      }
    ]
  },
  onLoad() {
    // 页面加载
  },
  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.index
    })
  },
  acceptOrder() {
    wx.showToast({
      title: '接单成功',
      icon: 'success'
    })
  },
  rejectOrder() {
    wx.showToast({
      title: '拒单功能开发中',
      icon: 'none'
    })
  },
  viewDetail() {
    wx.showToast({
      title: '查看详情功能开发中',
      icon: 'none'
    })
  }
})