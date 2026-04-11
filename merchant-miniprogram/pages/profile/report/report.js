Page({
  data: {
    todayIncome: 1234.56,
    weekIncome: 5678.90,
    monthIncome: 23456.78,
    orderCount: 123,
    salesData: [
      { date: '4-1', sales: 1200 },
      { date: '4-2', sales: 1500 },
      { date: '4-3', sales: 1800 },
      { date: '4-4', sales: 1300 },
      { date: '4-5', sales: 1600 },
      { date: '4-6', sales: 1900 },
      { date: '4-7', sales: 2100 }
    ]
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadReportData()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadReportData() {
    const merchantId = getApp().getMerchantId()
    const merchant = getApp().getMerchantDisplayName()
    this.callApi('getMerchantIncome', { merchantId, merchant }).then(result => {
      if (result.success && result.data) {
        this.setData({ 
          todayIncome: result.data.todayIncome || 0,
          weekIncome: result.data.weekIncome || 0,
          monthIncome: result.data.monthIncome || 0,
          orderCount: result.data.orderCount || 0
        })
      }
    }).catch(() => {
      console.log('加载失败，使用默认数据')
    })
  },
  handleBack() {
    wx.navigateBack()
  }
})
