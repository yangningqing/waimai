Page({
  data: {
    todayIncome: 186,
    todayOrders: 12,
    incomeList: [
      {
        orderId: '20260406001',
        time: '10:30',
        amount: 15
      },
      {
        orderId: '20260406002',
        time: '11:15',
        amount: 18
      },
      {
        orderId: '20260406003',
        time: '12:00',
        amount: 16
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
  loadIncome() {
    if (!getApp().isLoggedIn()) {
      this.setData({ todayIncome: 0, todayOrders: 0, incomeList: [] })
      return
    }
    this.callApi('getRiderIncome').then(result => {
      if (!result.success || !result.data) return
      this.setData({
        todayIncome: result.data.today || 0,
        todayOrders: result.data.orders || 0,
        incomeList: result.data.details || []
      })
    }).catch(() => wx.showToast({ title: '加载失败', icon: 'none' }))
  }
})