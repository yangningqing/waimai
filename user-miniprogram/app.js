App({
  onLaunch() {
    console.log('小程序启动');
    
    // 初始化云开发
    wx.cloud.init({
      env: wx.cloud.DYNAMIC_CURRENT_ENV,
      traceUser: true
    })
    this.loadAccount()
  },
  onShow() {
    // 小程序显示时执行的逻辑
    console.log('小程序显示');
  },
  onHide() {
    // 小程序隐藏时执行的逻辑
    console.log('小程序隐藏');
  },
  loadAccount() {
    const account = wx.getStorageSync('currentAccount') || null
    this.globalData.currentAccount = account
    this.globalData.accountId = account && account.username ? String(account.username) : ''
  },
  setCurrentAccount(account) {
    if (account) {
      wx.setStorageSync('currentAccount', account)
    } else {
      wx.removeStorageSync('currentAccount')
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
    userInfo: null,
    baseUrl: 'https://api.example.com',
    currentAccount: null,
    accountId: ''
  }
})