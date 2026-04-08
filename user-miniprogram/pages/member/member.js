Page({
  data: {
    isLoggedIn: false,
    accountName: '',
    user: {
      name: '未登录',
      status: '请先登录账号',
      avatar: '../../images/avatar.png'
    },
    member: {
      level: '白银会员',
      stars: '★★★★☆',
      points: '714 / 2000'
    },
    wallet: {
      balance: 97,
      bill: 8,
      rewards: 12,
      unclaimed: 6
    },
    coupons: [
      { amount: 13, description: '外卖大额神券' },
      { amount: 40, description: '踏青美食神券' },
      { amount: 10, description: '外卖大额神券' },
      { amount: 11, description: '休闲玩乐神券' }
    ],
    loadingProfile: false,
    hasLoadedProfile: false
  },
  onLoad() {
    this.syncAccountState()
    this.loadProfile()
  },
  onShow() {
    this.syncAccountState()
    if (!this.data.hasLoadedProfile) {
      this.loadProfile()
    }
  },
  syncAccountState() {
    const app = getApp()
    const account = app.globalData.currentAccount || wx.getStorageSync('currentAccount') || null
    const isLoggedIn = !!(account && account.username)
    this.setData({
      isLoggedIn,
      accountName: isLoggedIn ? account.username : '',
      user: {
        ...this.data.user,
        name: isLoggedIn ? (account.nickname || account.username) : '未登录',
        status: isLoggedIn ? '已登录' : '请先登录账号'
      }
    })
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, accountId } }
    }).then(res => (res && res.result) || {})
  },
  loadProfile() {
    if (!this.data.isLoggedIn) return
    if (this.data.loadingProfile) return
    this.setData({ loadingProfile: true })
    Promise.all([
      this.callApi('getUserProfile'),
      this.callApi('getCoins')
    ]).then(([profileRes, coinRes]) => {
      if (profileRes.success && profileRes.data) {
        const p = profileRes.data
        this.setData({
          user: {
            ...this.data.user,
            name: p.nickname || this.data.user.name,
            avatar: p.avatar || this.data.user.avatar
          },
          member: {
            ...this.data.member,
            level: p.level || this.data.member.level,
            points: `${p.points || 0} / 2000`
          }
        })
      }
      if (coinRes.success && coinRes.data) {
        this.setData({
          wallet: {
            ...this.data.wallet,
            rewards: coinRes.data.coinBalance || 0
          }
        })
      }
    }).catch(err => {
      console.error('加载会员信息失败:', err)
    }).finally(() => {
      this.setData({
        loadingProfile: false,
        hasLoadedProfile: true
      })
    })
  },
  handleAccountAction() {
    if (this.data.isLoggedIn) {
      wx.showActionSheet({
        itemList: ['切换账号', '退出登录'],
        success: res => {
          if (res.tapIndex === 0) {
            wx.navigateTo({ url: '../login/login' })
          }
          if (res.tapIndex === 1) this.logout()
        }
      })
      return
    }
    wx.navigateTo({ url: '../login/login' })
  },
  logout() {
    getApp().setCurrentAccount(null)
    this.syncAccountState()
    this.setData({
      hasLoadedProfile: false,
      user: {
        ...this.data.user,
        name: '未登录',
        status: '请先登录账号'
      }
    })
    wx.showToast({ title: '已退出', icon: 'success' })
  },
  ensureLoggedIn() {
    if (this.data.isLoggedIn) return true
    wx.showToast({ title: '请先登录账号', icon: 'none' })
    return false
  },
  claimCoupons() {
    if (!this.ensureLoggedIn()) return
    this.callApi('claimCoupons').then(result => {
      wx.showToast({
        title: result.success ? '领取成功' : (result.message || '领取失败'),
        icon: result.success ? 'success' : 'none'
      })
    }).catch(() => {
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },
  navigateToFeedback() {
    if (!this.ensureLoggedIn()) return
    wx.navigateTo({
      url: '../feedback/feedback'
    })
  },
  navigateToCoupons() {
    if (!this.ensureLoggedIn()) return
    wx.navigateTo({
      url: '../coupon/coupon'
    })
  },
  navigateToCustomerService() {
    if (!this.ensureLoggedIn()) return
    wx.showModal({
      title: '联系客服',
      editable: true,
      placeholderText: '请输入你遇到的问题',
      success: (res) => {
        if (!res.confirm) return
        const content = String(res.content || '').trim()
        if (!content) {
          wx.showToast({ title: '请输入问题内容', icon: 'none' })
          return
        }
        this.callApi('createServiceTicket', { content, role: 'user' }).then(result => {
          wx.showToast({ title: result.success ? '已提交工单' : (result.message || '提交失败'), icon: result.success ? 'success' : 'none' })
        }).catch(() => wx.showToast({ title: '网络错误', icon: 'none' }))
      }
    })
  },
  navigateToSettings() {
    if (!this.ensureLoggedIn()) return
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: (res) => {
        if (!res.confirm) return
        const nickname = String(res.content || '').trim()
        if (!nickname) {
          wx.showToast({ title: '昵称不能为空', icon: 'none' })
          return
        }
        this.callApi('updateUserProfile', { nickname }).then(result => {
          wx.showToast({ title: result.success ? '设置成功' : (result.message || '设置失败'), icon: result.success ? 'success' : 'none' })
          if (result.success) this.loadProfile()
        }).catch(() => wx.showToast({ title: '网络错误', icon: 'none' }))
      }
    })
  },
  navigateToFavorites() {
    if (!this.ensureLoggedIn()) return
    this.callApi('getFavorites').then(result => {
      const count = result.success && Array.isArray(result.data) ? result.data.length : 0
      wx.showToast({ title: `已收藏${count}个商家`, icon: 'none' })
    }).catch(() => wx.showToast({ title: '网络错误', icon: 'none' }))
  },
  navigateToAddress() {
    if (!this.ensureLoggedIn()) return
    wx.navigateTo({ url: '../address/address' })
  },
  navigateToHistory() {
    if (!this.ensureLoggedIn()) return
    wx.navigateTo({ url: '../search/search' })
  },
  navigateToCoins() {
    if (!this.ensureLoggedIn()) return
    this.callApi('getCoins').then(result => {
      const balance = result.success && result.data ? result.data.coinBalance : 0
      wx.showToast({ title: `当前金币：${balance}`, icon: 'none' })
    }).catch(() => wx.showToast({ title: '网络错误', icon: 'none' }))
  }
})