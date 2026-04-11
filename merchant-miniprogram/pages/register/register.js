Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    merchantName: ''
  },
  handleUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },
  handlePasswordInput(e) {
    this.setData({ password: e.detail.value })
  },
  handleConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value })
  },
  handleMerchantNameInput(e) {
    this.setData({ merchantName: e.detail.value })
  },
  callApi(action, data = {}) {
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data }
    }).then(res => (res && res.result) || {})
  },
  handleRegister() {
    const { username, password, confirmPassword, merchantName } = this.data
    if (!username.trim()) {
      return wx.showToast({ title: '请输入账号', icon: 'none' })
    }
    if (!password) {
      return wx.showToast({ title: '请输入密码', icon: 'none' })
    }
    if (password !== confirmPassword) {
      return wx.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    }
    if (!merchantName.trim()) {
      return wx.showToast({ title: '请输入商家名称', icon: 'none' })
    }
    wx.showLoading({ title: '注册中...' })
    this.callApi('registerUser', { 
      username, 
      password, 
      nickname: merchantName,
      role: 'merchant'
    }).then(result => {
      if (result.success) {
        getApp().setCurrentAccount(result.data)
        wx.showToast({ title: '注册成功', icon: 'success' })
        setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000)
      } else {
        wx.showToast({ title: result.message || '注册失败', icon: 'none' })
      }
    }).catch(() => {
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  navigateToLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  }
})