Page({
  data: {
    contactInfo: {
      phone: '400-123-4567',
      email: 'service@example.com',
      workingHours: '9:00 - 22:00',
      qq: '123456789',
      wechat: 'service_account'
    }
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
  },
  handleCallPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.contactInfo.phone
    })
  },
  handleSendEmail() {
    wx.showToast({ title: '邮箱功能暂未开放', icon: 'none' })
  },
  handleCopyQQ() {
    wx.setClipboardData({
      data: this.data.contactInfo.qq,
      success: () => {
        wx.showToast({ title: 'QQ号已复制', icon: 'success' })
      }
    })
  },
  handleCopyWechat() {
    wx.setClipboardData({
      data: this.data.contactInfo.wechat,
      success: () => {
        wx.showToast({ title: '微信号已复制', icon: 'success' })
      }
    })
  },
  handleBack() {
    wx.navigateBack()
  }
})
