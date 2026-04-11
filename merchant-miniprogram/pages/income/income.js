Page({
  data: {
    todayIncome: 1245,
    todayOrders: 32,
    incomeList: [
      {
        date: '2026-04-06',
        income: 1245,
        orders: 32
      },
      {
        date: '2026-04-05',
        income: 980,
        orders: 28
      },
      {
        date: '2026-04-04',
        income: 1120,
        orders: 30
      },
      {
        date: '2026-04-03',
        income: 850,
        orders: 25
      }
    ]
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadIncome()
  },
  onShow() {
    this.loadIncome()
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
  loadIncome() {
    const merchant = this.getMerchantName()
    const merchantId = getApp().getMerchantId()
    this.callApi('getMerchantIncome', { merchant, merchantId }).then(result => {
      if (result.success && result.data) {
        this.setData({
          todayIncome: result.data.today || 0,
          todayOrders: result.data.orders || 0,
          incomeList: result.data.details || []
        })
      }
    }).catch(() => {
      console.log('加载失败，使用默认数据')
    })
  },
  handleRefresh() {
    wx.showToast({ title: '刷新中...', icon: 'none' })
    this.loadIncome()
    setTimeout(() => {
      wx.showToast({ title: '刷新成功', icon: 'success' })
    }, 1000)
  }
})