Page({
  data: {
    stats: {
      todayOrders: 32,
      todayIncome: 1245,
      pendingOrders: 5,
      goodsCount: 45
    },
    recentOrders: [
      {
        id: 1,
        orderId: '20260406123456',
        status: '待处理',
        time: '2026-04-06 12:00',
        amount: 33
      },
      {
        id: 2,
        orderId: '20260406123455',
        status: '已完成',
        time: '2026-04-06 11:30',
        amount: 45
      }
    ],
    hotGoods: [
      {
        id: 1,
        name: '香辣鸡腿堡',
        price: 25,
        sales: 1234,
        image: '../../images/ai_example1.png'
      },
      {
        id: 2,
        name: '可乐',
        price: 8,
        sales: 892,
        image: '../../images/ai_example2.png'
      }
    ]
  },
  onLoad() {
    // 页面加载时的初始化逻辑
  },
  onShow() {
    // 页面显示时的逻辑
  },
  navigateToGoods() {
    wx.navigateTo({
      url: '../goods/goods'
    })
  },
  navigateToOrders() {
    wx.navigateTo({
      url: '../orders/orders'
    })
  },
  navigateToIncome() {
    wx.navigateTo({
      url: '../income/income'
    })
  },
  handleOrder(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '处理订单',
      content: '确定要处理这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '订单处理成功',
            icon: 'success'
          })
        }
      }
    })
  },
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../orders/orders?id=${orderId}`
    })
  }
})