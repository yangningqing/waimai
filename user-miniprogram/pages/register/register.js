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
  handleRegister() {
    const username = this.data.username
    const password = this.data.password
    if (!username || !password) {
      wx.showToast({ title: '注册需填写账号和密码', icon: 'none' })
      return
    }
    wx.showLoading({ title: '注册中...' })
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'registerUser',
        data: { username, password, nickname: username }
      }
    }).then(res => {
      const result = (res && res.result) || {}
      if (!result.success) {
        wx.showToast({ title: result.message || '注册失败', icon: 'none' })
        return
      }
      wx.showToast({ title: '注册成功，请登录', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 300)
    }).catch(err => {
      console.error('注册失败:', err)
      wx.showToast({ title: '网络错误，请重试', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  }
})
