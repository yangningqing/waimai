Page({
  data: {
    todayIncome: 568,
    todayOrders: 24,
    incomeList: [
      {
        orderId: '20260406001',
        time: '10:30',
        amount: 30
      },
      {
        orderId: '20260406002',
        time: '11:15',
        amount: 25
      },
      {
        orderId: '20260406003',
        time: '12:00',
        amount: 45
      }
    ]
  },
  onLoad() {
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
    const account = getApp().globalData.currentAccount || {}
    return String(account.nickname || account.merchantName || '塔斯汀')
  },
  loadIncome() {
    if (!getApp().isLoggedIn()) {
      this.setData({ todayIncome: 0, todayOrders: 0, incomeList: [] })
      return
    }
    this.callApi('getMerchantIncome', { merchant: this.getMerchantName() }).then(result => {
      if (!result.success || !result.data) return
      this.setData({
        todayIncome: result.data.today || 0,
        todayOrders: result.data.orders || 0,
        incomeList: result.data.details || []
      })
    }).catch(() => wx.showToast({ title: '加载失败', icon: 'none' }))
  }
})