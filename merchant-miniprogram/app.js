App({
  onLaunch() {
    console.log('商家端小程序启动')
    if (wx.cloud) {
      wx.cloud.init({
        env: wx.cloud.DYNAMIC_CURRENT_ENV,
        traceUser: true
      })
    }
    this.loadAccount()
  },
  onShow() {
    console.log('商家端小程序显示')
  },
  onHide() {
    console.log('商家端小程序隐藏')
  },
  loadAccount() {
    const account = wx.getStorageSync('currentAccount_merchant') || null
    this.globalData.currentAccount = account
    this.globalData.accountId = account && account.username ? String(account.username) : ''
  },
  setCurrentAccount(account) {
    if (account) {
      wx.setStorageSync('currentAccount_merchant', account)
    } else {
      wx.removeStorageSync('currentAccount_merchant')
    }
    this.loadAccount()
  },
  getAccountId() {
    return String(this.globalData.accountId || '')
  },
  /** 与云库一致：保持 number，勿统一转成字符串（否则 where 匹配失败） */
  getMerchantId() {
    const account = this.globalData.currentAccount
    if (!account || account.merchantId == null || account.merchantId === '') return ''
    return account.merchantId
  },
  getMerchantDisplayName() {
    const account = this.globalData.currentAccount || {}
    return String(account.nickname || account.merchantName || '我的店铺')
  },
  isLoggedIn() {
    return !!this.getAccountId()
  },
  globalData: {
    merchantInfo: null,
    baseUrl: 'https://api.example.com',
    currentAccount: null,
    accountId: ''
  }
})