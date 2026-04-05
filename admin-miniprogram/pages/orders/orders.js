Page({
  data: {
    orders: [
      {
        id: 1,
        orderId: '20260406123456',
        status: '待处理',
        merchant: '塔斯汀',
        customer: '张三',
        amount: 33,
        time: '2026-04-06 12:00'
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
    // 切换订单标签
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
    wx.showModal({
      title: '订单详情',
      content: '订单详情页面',
      success: (res) => {
        if (res.confirm) {
          // 跳转到订单详情页
        }
      }
    })
  }
})