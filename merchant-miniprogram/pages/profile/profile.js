Page({
  data: {
    name: '塔斯汀',
    phone: '138****0002',
    todayOrders: 568,
    rating: 4.8,
    goodRate: '96%'
  },
  onLoad() {
    this.ensureAuthAndLoad()
  },
  onShow() {
    this.ensureAuthAndLoad()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  ensureAuthAndLoad() {
    if (getApp().isLoggedIn()) {
      const account = getApp().globalData.currentAccount || {}
      this.setData({
        name: String(account.nickname || account.username || this.data.name)
      })
      this.loadSummary()
      return
    }
    this.promptAuth()
  },
  promptAuth() {
    wx.showActionSheet({
      itemList: ['登录商家账号', '注册商家账号'],
      success: (res) => {
        const isLogin = res.tapIndex === 0
        this.collectCredentialsAndSubmit(isLogin)
      }
    })
  },
  collectCredentialsAndSubmit(isLogin) {
    wx.showModal({
      title: isLogin ? '商家登录' : '商家注册',
      editable: true,
      placeholderText: '请输入账号',
      success: (uRes) => {
        if (!uRes.confirm) return
        const username = String(uRes.content || '').trim()
        if (!username) return
        wx.showModal({
          title: isLogin ? '输入密码' : '设置密码',
          editable: true,
          placeholderText: '请输入密码(6位以上)',
          success: (pRes) => {
            if (!pRes.confirm) return
            const password = String(pRes.content || '')
            if (!password) return
            const action = isLogin ? 'loginUser' : 'registerUser'
            const payload = { username, password, role: 'merchant', nickname: username }
            this.callApi(action, payload).then(result => {
              if (!result.success) {
                wx.showToast({ title: result.message || (isLogin ? '登录失败' : '注册失败'), icon: 'none' })
                return
              }
              const account = result.data || { username, nickname: username, role: 'merchant' }
              getApp().setCurrentAccount(account)
              this.setData({ name: account.nickname || account.username || username })
              wx.showToast({ title: isLogin ? '登录成功' : '注册成功', icon: 'success' })
              this.loadSummary()
            })
          }
        })
      }
    })
  },
  getMerchantName() {
    const account = getApp().globalData.currentAccount || {}
    return String(account.nickname || account.merchantName || '塔斯汀')
  },
  loadSummary() {
    this.callApi('getMerchantDashboard', { merchant: this.getMerchantName(), merchantId: 1 }).then(result => {
      if (!result.success || !result.data) return
      this.setData({
        todayOrders: result.data.todayOrders || 0
      })
    }).catch(() => {})
  },
  navigateToShopManagement() {
    wx.switchTab({ url: '/pages/goods/goods' })
  },
  navigateToFinance() {
    wx.switchTab({ url: '/pages/income/income' })
  },
  navigateToOrders() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },
  navigateToFeedback() {
    wx.showModal({
      title: '意见反馈',
      editable: true,
      placeholderText: '请输入反馈内容',
      success: (res) => {
        if (!res.confirm) return
        const content = String(res.content || '').trim()
        if (!content) return
        this.callApi('createServiceTicket', { role: 'merchant', content }).then(result => {
          wx.showToast({ title: result.success ? '提交成功' : (result.message || '提交失败'), icon: result.success ? 'success' : 'none' })
        })
      }
    })
  },
  navigateToSettings() {
    wx.showModal({
      title: '商家设置',
      editable: true,
      placeholderText: '请输入联系手机号',
      success: (res) => {
        if (!res.confirm) return
        const phone = String(res.content || '').trim()
        if (!phone) {
          wx.showToast({ title: '手机号不能为空', icon: 'none' })
          return
        }
        this.setData({ phone })
        wx.showToast({ title: '设置已保存', icon: 'success' })
      }
    })
  },
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出商家账号？',
      success: (res) => {
        if (!res.confirm) return
        getApp().setCurrentAccount(null)
        wx.showToast({
          title: '已退出登录',
          icon: 'success'
        })
        this.setData({ todayOrders: 0 })
      }
    })
  }
})