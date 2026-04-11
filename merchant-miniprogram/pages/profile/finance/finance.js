Page({
  data: {
    balance: 12345.67,
    withdrawals: [
      {
        id: 1,
        amount: 1000,
        time: '2026-04-10 10:30',
        status: '已完成'
      },
      {
        id: 2,
        amount: 2000,
        time: '2026-04-01 14:45',
        status: '已完成'
      }
    ],
    transactions: [
      {
        id: 1,
        type: '收入',
        amount: 123.45,
        time: '2026-04-11 12:30',
        orderId: '20260411123456'
      },
      {
        id: 2,
        type: '支出',
        amount: 10.00,
        time: '2026-04-11 10:15',
        orderId: '平台服务费'
      }
    ]
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadFinanceData()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadFinanceData() {
    // 这里可以调用API获取财务数据
    console.log('加载财务数据')
  },
  handleWithdraw() {
    wx.showModal({
      title: '提现',
      content: '确定要提现吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '提现申请已提交', icon: 'success' })
        }
      }
    })
  },
  handleBack() {
    wx.navigateBack()
  }
})
