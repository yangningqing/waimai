Page({
  data: {
    systemInfo: {
      version: '1.0.0',
      updateTime: '2026-04-11',
      deviceInfo: '微信小程序'
    }
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
  },
  handleClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage()
          wx.showToast({ title: '缓存已清除', icon: 'success' })
        }
      }
    })
  },
  handleCheckUpdate() {
    wx.showToast({ title: '当前已是最新版本', icon: 'success' })
  },
  handleAbout() {
    wx.showModal({
      title: '关于',
      content: '商家端 v1.0.0\n© 2026 外卖平台',
      showCancel: false
    })
  },
  handleBack() {
    wx.navigateBack()
  }
})
