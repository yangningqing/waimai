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
    const account = getApp().globalData.currentAccount || {}
    return String(account.nickname || account.merchantName || '塔斯汀')
  },
  loadDashboard() {
    if (!getApp().isLoggedIn()) {
      this.setData({ recentOrders: [], stats: { ...this.data.stats, todayOrders: 0, pendingOrders: 0, todayIncome: 0 } })
      return
    }
    const merchant = this.getMerchantName()
    Promise.all([
      this.callApi('getMerchantDashboard', { merchant, merchantId: 1 }),
      this.callApi('getMerchantOrders', { merchant }),
      this.callApi('getMerchantGoods', { merchantId: 1 })
    ]).then(([dashboard, orders, goods]) => {
      if (dashboard.success && dashboard.data) {
        this.setData({ stats: dashboard.data })
      }
      if (orders.success && Array.isArray(orders.data)) {
        this.setData({ recentOrders: orders.data.slice(0, 5) })
      }
      if (goods.success && Array.isArray(goods.data)) {
        this.setData({ hotGoods: goods.data.slice(0, 5) })
      }
    }).catch(() => wx.showToast({ title: '加载失败', icon: 'none' }))
  },
  navigateToGoods() {
    wx.switchTab({ url: '/pages/goods/goods' })
  },
  navigateToOrders() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },
  navigateToIncome() {
    wx.switchTab({ url: '/pages/income/income' })
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