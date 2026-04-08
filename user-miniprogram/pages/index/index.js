Page({
  data: {
    merchants: [],
    address: '北京城市学院（顺义校区）',
    searchText: '',
    coupons: [
      { id: 1, value: 13, minSpend: 30, name: '外卖大额神券' },
      { id: 2, value: 40, minSpend: 100, name: '踏青美食神券' },
      { id: 3, value: 10, minSpend: 20, name: '外卖大额神券' },
      { id: 4, value: 11, minSpend: 25, name: '休闲玩乐神券' }
    ],
    loading: true,
    lastMerchantsFetchAt: 0,
    fetchingMerchants: false
  },
  onLoad() {
    this.loadMerchantsCache()
    if (!Array.isArray(this.data.merchants) || this.data.merchants.length === 0) {
      this.getMerchants()
    }
  },
  onShow() {
    this.tryShowCouponPopup()
    if (!Array.isArray(this.data.merchants) || this.data.merchants.length === 0) {
      this.getMerchants()
    }
  },
  onPullDownRefresh() {
    const app = getApp()
    app.globalData.homeCouponPopupShown = false
    this.tryShowCouponPopup()
    this.getMerchants()
  },
  tryShowCouponPopup() {
    const app = getApp()
    if (app.globalData.homeCouponPopupShown) return
    app.globalData.homeCouponPopupShown = true
    wx.showModal({
      title: '新人优惠券',
      content: '恭喜获得外卖优惠券，是否立即领取？',
      confirmText: '立即领取',
      cancelText: '暂不领取',
      success: (res) => {
        if (res.confirm) {
          this.claimCoupons()
        }
      }
    })
  },
  loadMerchantsCache() {
    try {
      const cached = wx.getStorageSync('user_merchants_cache')
      if (cached && Array.isArray(cached.merchants)) {
        this.setData({
          merchants: cached.merchants,
          loading: false,
          lastMerchantsFetchAt: Number(cached.updatedAt || 0)
        })
      }
    } catch (err) {
      console.warn('读取商家缓存失败:', err)
    }
  },
  saveMerchantsCache(merchants) {
    try {
      wx.setStorageSync('user_merchants_cache', {
        updatedAt: Date.now(),
        merchants: Array.isArray(merchants) ? merchants : []
      })
    } catch (err) {
      console.warn('保存商家缓存失败:', err)
    }
  },
  getMerchants() {
    if (this.data.fetchingMerchants) return
    this.setData({ fetchingMerchants: true })
    wx.showLoading({
      title: '加载中...'
    })
    
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'getMerchants'
      }
    }).then(res => {
      if (res.result.success) {
        const merchants = res.result.data
        this.setData({
          merchants,
          lastMerchantsFetchAt: Date.now()
        })
        this.saveMerchantsCache(merchants)
      } else {
        wx.showToast({
          title: '获取商家失败',
          icon: 'none'
        })
      }
      wx.hideLoading()
      this.setData({ loading: false, fetchingMerchants: false })
    }).catch(err => {
      console.error('调用云函数失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
      wx.hideLoading()
      this.setData({ loading: false, fetchingMerchants: false })
    })
  },
  navigateToMerchant(e) {
    const merchantId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../goods/goods?id=${merchantId}`
    })
  },

  navigateToOrder() {
    wx.switchTab({ url: '/pages/order/order' })
  },
  navigateToMember() {
    wx.switchTab({ url: '/pages/member/member' })
  },
  claimCoupons() {
    wx.showLoading({ title: '领取中...' })
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'claimCoupons'
      }
    }).then(res => {
      const result = (res && res.result) || {}
      wx.showToast({
        title: result.success ? '优惠券领取成功' : (result.message || '领取失败'),
        icon: result.success ? 'success' : 'none'
      })
    }).catch(err => {
      console.error('领取优惠券失败:', err)
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  navigateToCategory() {
    wx.switchTab({ url: '/pages/category/category' })
  },
  search() {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  chooseLocation() {
    wx.chooseLocation({
      success: () => {
        wx.showToast({
          title: '地址选择成功',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '地址选择失败',
          icon: 'none'
        })
      }
    })
  }
})