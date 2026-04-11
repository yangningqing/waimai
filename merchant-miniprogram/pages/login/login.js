Page({
  data: {
    username: '',
    password: ''
  },
  onLoad() {
    // 检查是否已经登录
    if (getApp().isLoggedIn()) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },
  handleUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },
  handlePasswordInput(e) {
    this.setData({ password: e.detail.value })
  },
  callApi(action, data = {}) {
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data }
    }).then(res => (res && res.result) || {})
  },
  handleLogin() {
    const { username, password } = this.data
    if (!username.trim()) {
      return wx.showToast({ title: '请输入账号', icon: 'none' })
    }
    if (!password) {
      return wx.showToast({ title: '请输入密码', icon: 'none' })
    }
    wx.showLoading({ title: '登录中...' })
    this.callApi('loginUser', { username, password, role: 'merchant' }).then(result => {
      if (result.success) {
        getApp().setCurrentAccount(result.data)
        wx.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000)
      } else {
        wx.showToast({ title: result.message || '登录失败', icon: 'none' })
      }
    }).catch(() => {
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  navigateToRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  }
})