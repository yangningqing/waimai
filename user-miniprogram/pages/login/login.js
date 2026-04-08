Page({
  data: {
    username: '',
    password: ''
  },
  onUsernameInput(e) {
    this.setData({ username: String(e.detail.value || '').trim() })
  },
  onPasswordInput(e) {
    this.setData({ password: String(e.detail.value || '') })
  },
  handleLogin() {
    const username = this.data.username
    const password = this.data.password
    if (!username || !password) {
      wx.showToast({ title: '请输入账号和密码', icon: 'none' })
      return
    }
    wx.showLoading({ title: '登录中...' })
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'loginUser',
        data: { username, password }
      }
    }).then(res => {
      const result = (res && res.result) || {}
      if (!result.success) {
        wx.showToast({ title: result.message || '登录失败', icon: 'none' })
        return
      }
      const account = result.data || { username, nickname: username, status: 'normal' }
      getApp().setCurrentAccount(account)
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 300)
    }).catch(err => {
      console.error('登录失败:', err)
      wx.showToast({ title: '网络错误，请重试', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  navigateToRegister() {
    wx.navigateTo({ url: '../register/register' })
  }
})
