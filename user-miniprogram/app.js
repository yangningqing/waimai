App({
  onLaunch() {
    console.log('小程序启动');
    
    // 初始化云开发
    wx.cloud.init({
      env: wx.cloud.DYNAMIC_CURRENT_ENV,
      traceUser: true
    })
    this.loadAccount()
    this._wentToBackground = false
  },
  onShow() {
    console.log('小程序显示');
    // 从后台回到前台（重新进入小程序），首页需要时可拉最新商家列表
    if (this._wentToBackground) {
      this.globalData.needsHomeMerchantsRefresh = true
      this.globalData.needsOrdersRefresh = true
      this.globalData.needsCategoryRefresh = true
    }
    this._wentToBackground = false
  },
  onHide() {
    console.log('小程序隐藏');
    this._wentToBackground = true
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
    accountId: '',
    homeCouponPopupShown: false,
    /** 小程序从后台回到前台后为 true，各页 onShow 消费后清掉 */
    needsHomeMerchantsRefresh: false,
    needsOrdersRefresh: false,
    needsCategoryRefresh: false
  }
})