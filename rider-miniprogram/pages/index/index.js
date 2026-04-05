Page({
  data: {
    currentTab: 0,
    orders: [
      {
        id: 1,
        deliveryTime: '04-03 15:44:09',
        distance: '3.08 km',
        tags: ['商家单', '帮我买', '抖音订单'],
        status: '待抢单'
      },
      {
        id: 2,
        deliveryTime: '04-03 15:50:00',
        distance: '2.1 km',
        waitTime: '立即送达（已等待7分钟）',
        tags: ['跑腿单', '帮我买'],
        status: '待抢单'
      }
    ]
  },

  onLoad() {
    // 页面加载
  },

  onShow() {
    // 页面显示
  },

  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.index
    });
  },

  acceptOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    // 模拟抢单
    wx.showToast({
      title: '抢单成功',
      icon: 'success'
    });
  },

  logout() {
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    });
  }
})