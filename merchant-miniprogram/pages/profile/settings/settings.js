Page({
  data: {
    merchantInfo: {
      name: '',
      phone: '',
      address: '',
      businessHours: '',
      image: ''
    },
    uploadingPhoto: false
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadMerchantInfo()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  onFieldInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    if (!field) return
    this.setData({ [`merchantInfo.${field}`]: value })
  },
  loadMerchantInfo() {
    const merchantId = getApp().getMerchantId()
    if (!merchantId) return
    this.callApi('getMerchantInfo', { merchantId }).then(result => {
      if (result.success && result.data) {
        const d = result.data
        this.setData({
          merchantInfo: {
            name: d.name || '',
            phone: d.phone || '',
            address: d.address || '',
            businessHours: d.businessHours || '',
            image: d.image || d.logo || d.cover || ''
          }
        })
      }
    }).catch(() => {
      console.log('加载失败')
    })
  },
  handleSave() {
    const { merchantInfo } = this.data
    const merchantId = getApp().getMerchantId()
    if (!merchantId) {
      return wx.showToast({ title: '未获取到店铺ID', icon: 'none' })
    }
    wx.showLoading({ title: '保存中...' })
    this.callApi('updateMerchantInfo', {
      merchantId,
      name: merchantInfo.name,
      phone: merchantInfo.phone,
      address: merchantInfo.address,
      businessHours: merchantInfo.businessHours,
      image: merchantInfo.image
    }).then(result => {
      if (result.success) {
        wx.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      } else {
        wx.showToast({ title: result.message || '保存失败', icon: 'none' })
      }
    }).catch(() => {
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  handleCancel() {
    wx.navigateBack()
  },
  chooseShopPhoto() {
    const merchantId = getApp().getMerchantId()
    if (!merchantId) {
      wx.showToast({ title: '未获取到店铺ID', icon: 'none' })
      return
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths && res.tempFilePaths[0]
        if (!filePath) return
        const m = filePath.match(/\.(\w+)(?:\?|$)/)
        const ext = (m && m[1]) ? m[1].toLowerCase() : 'jpg'
        const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg'
        const cloudPath = `merchant/${String(merchantId)}/shop_${Date.now()}.${safeExt}`
        this.setData({ uploadingPhoto: true })
        wx.showLoading({ title: '上传中...' })
        wx.cloud.uploadFile({ cloudPath, filePath }).then((up) => {
          this.setData({
            'merchantInfo.image': up.fileID || '',
            uploadingPhoto: false
          })
          wx.showToast({ title: '已更新预览，请保存', icon: 'none' })
        }).catch(() => {
          this.setData({ uploadingPhoto: false })
          wx.showToast({ title: '上传失败', icon: 'none' })
        }).finally(() => {
          wx.hideLoading()
        })
      }
    })
  },
  clearShopPhoto() {
    this.setData({ 'merchantInfo.image': '' })
  }
})
