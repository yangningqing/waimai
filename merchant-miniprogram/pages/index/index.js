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
    ]
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadDashboard()
  },
  onShow() {
    this.loadDashboard()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  getMerchantName() {
    return getApp().getMerchantDisplayName()
  },
  getMerchantId() {
    return getApp().getMerchantId()
  },
  loadDashboard() {
    const merchant = this.getMerchantName()
    const merchantId = this.getMerchantId()
    Promise.all([
      this.callApi('getMerchantDashboard', { merchant, merchantId }),
      this.callApi('getMerchantOrders', { merchant, merchantId })
    ]).then(([dashboard, orders]) => {
      if (dashboard.success && dashboard.data) {
        this.setData({ stats: dashboard.data })
      }
      if (orders.success && Array.isArray(orders.data)) {
        this.setData({ recentOrders: orders.data.slice(0, 5) })
      }
    }).catch(() => {
      console.log('加载失败，使用默认数据')
    })
  },
  navigateToGoods() {
    wx.switchTab({ url: '/pages/goods/goods' })
  },
  navigateToOrders() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },
  navigateToIncome() {
    wx.navigateTo({ url: '/pages/income/income' })
  },
  navigateToDelivery() {
    wx.navigateTo({ url: '/pages/profile/delivery/delivery' })
  },
  handleOrder(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '处理订单',
      content: '确定要处理这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '处理中...',
            icon: 'none'
          })
          this.callApi('updateMerchantOrderStatus', { orderId, status: '配送中' }).then(result => {
            wx.showToast({ title: result.success ? '订单处理成功' : (result.message || '处理失败'), icon: result.success ? 'success' : 'none' })
            if (result.success) this.loadDashboard()
          })
        }
      }
    })
  },
  handleOrderAction(e) {
    const status = String(e.currentTarget.dataset.status || '')
    if (status === '待处理' || status === '待接单') {
      this.handleOrder(e)
      return
    }
    this.viewOrderDetail(e)
  },
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../orders/orders?id=${orderId}`
    })
  }
})