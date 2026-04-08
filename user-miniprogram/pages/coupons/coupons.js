Page({
  data: {
    activeTab: 0,
    coupons: [],
    currentCoupons: [],
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
      if (result.success && Array.isArray(result.data)) {
        this.setData({ coupons: result.data, hasLoadedCoupons: true })
        this.updateCoupons()
      } else {
        wx.showToast({ title: result.message || '获取优惠券失败', icon: 'none' })
      }
    }).catch(() => wx.showToast({ title: '网络错误', icon: 'none' }))
      .finally(() => this.setData({ loadingCoupons: false }))
  },
  updateCoupons() {
    const activeTab = this.data.activeTab
    const coupons = this.data.coupons
    let currentCoupons = []
    
    if (activeTab === 0) {
      currentCoupons = coupons.filter(coupon => coupon.status === 0)
    } else if (activeTab === 1) {
      currentCoupons = coupons.filter(coupon => coupon.status === 1)
    } else if (activeTab === 2) {
      currentCoupons = coupons.filter(coupon => coupon.status === 2)
    }
    
    this.setData({ currentCoupons })
  },
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ activeTab: index })
    this.updateCoupons()
  },
  useCoupon() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})