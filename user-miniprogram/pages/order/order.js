Page({
  data: {
    activeTab: 0,
    orders: [
      {
        id: 1001,
        shop: '塔斯汀',
        status: '待收货',
        goods: [
          {
            id: 101,
            name: '香辣鸡腿堡',
            price: 25,
            quantity: 1,
            image: '../../images/ai_example1.png'
          }
        ],
        total: 25,
        time: '2026-04-06 12:30'
      },
      {
        id: 1002,
        shop: '曼玲粥店',
        status: '已完成',
        goods: [
          {
            id: 201,
            name: '皮蛋瘦肉粥',
            price: 15,
            quantity: 1,
            image: '../../images/ai_example2.png'
          }
        ],
        total: 15,
        time: '2026-04-05 18:00'
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
  contactRider() {
    // 联系骑手
    wx.showToast({
      title: '已联系骑手',
      icon: 'success'
    })
  },
  confirmReceipt() {
    // 确认收货
    wx.showToast({
      title: '确认收货成功',
      icon: 'success'
    })
  },
  buyAgain() {
    // 再次购买
    wx.navigateTo({
      url: '../index/index'
    })
  },
  evaluate() {
    // 评价
    wx.showToast({
      title: '评价功能开发中',
      icon: 'none'
    })
  }
})