Page({
  data: {
    activeTab: 0,
    coupons: [],
    loadingCoupons: false,
    hasLoadedCoupons: false
  },
  onLoad() {
    this.loadCoupons()
  },
  onShow() {
    if (!this.data.hasLoadedCoupons) {
      this.loadCoupons()
    }
  },
  loadCoupons() {
    if (this.data.loadingCoupons) return
    this.setData({ loadingCoupons: true })
    wx.cloud.callFunction({
      name: 'api',
      data: { action: 'getCoupons' }
    }).then(res => {
      const result = (res && res.result) || {}
      if (!result.success || !Array.isArray(result.data)) return
      const coupons = result.data.map(item => ({
        id: item.id,
        amount: item.value,
        condition: item.minSpend,
        title: item.name,
        expiry: item.expiryDate,
        status: item.status === 0 ? 'unused' : (item.status === 1 ? 'used' : 'expired')
      }))
      this.setData({ coupons, hasLoadedCoupons: true })
    }).catch(() => {})
      .finally(() => this.setData({ loadingCoupons: false }))
  },
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      activeTab: index
    })
  },
  useCoupon(e) {
    wx.switchTab({ url: '/pages/index/index' })
  }
})