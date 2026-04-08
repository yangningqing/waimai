App({
  onLaunch() {
    console.log('后台管理端小程序启动')
    if (wx.cloud) {
      wx.cloud.init({
        env: wx.cloud.DYNAMIC_CURRENT_ENV,
        traceUser: true
      })
    }
    this.loadAccount()
  },
  onShow() {
    console.log('后台管理端小程序显示')
  },
  onHide() {
    console.log('后台管理端小程序隐藏')
  },
  loadAccount() {
    const account = wx.getStorageSync('currentAccount_admin') || null
    this.globalData.currentAccount = account
    this.globalData.accountId = account && account.username ? String(account.username) : ''
  },
  setCurrentAccount(account) {
    if (account) {
      wx.setStorageSync('currentAccount_admin', account)
    } else {
      wx.removeStorageSync('currentAccount_admin')
    }
    this.loadAccount()
  },
  getAccountId() {
    return String(this.globalData.accountId || '')
  },
  isLoggedIn() {
    return !!this.getAccountId()
  },
  globalData: {
    adminInfo: null,
    baseUrl: 'https://api.example.com',
    currentAccount: null,
    accountId: ''
  }
})