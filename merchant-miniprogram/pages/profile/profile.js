Page({
  data: {
    merchantInfo: {
      name: '',
      avatar: '',
      phone: '',
      address: '',
      businessHours: ''
    },
    menuItems: [
      {
        id: 1,
        icon: '📦',
        title: '商品管理',
        path: '/pages/goods/goods'
      },
      {
        id: 2,
        icon: '⭐',
        title: '用户评价',
        path: '/pages/profile/evaluation/evaluation'
      },
      {
        id: 3,
        icon: '🏪',
        title: '店铺设置',
        path: '/pages/profile/settings/settings'
      },
      {
        id: 4,
        icon: '⚙️',
        title: '系统设置',
        path: '/pages/profile/system/system'
      }
    ]
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadMerchantInfo()
  },
  onShow() {
    this.loadMerchantInfo()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadMerchantInfo() {
    const merchantId = getApp().getMerchantId()
    if (!merchantId) return
    this.callApi('getMerchantInfo', { merchantId }).then(result => {
      if (result.success && result.data && Object.keys(result.data).length) {
        const d = result.data
        this.setData({
          merchantInfo: {
            name: d.name || '',
            avatar: d.image || d.logo || '',
            phone: d.phone || '',
            address: d.address || '',
            businessHours: d.businessHours || ''
          }
        })
      }
    }).catch(() => {
      console.log('加载店铺信息失败')
    })
  },
  handleMenuItemTap(e) {
    const path = e.currentTarget.dataset.path
    wx.navigateTo({
      url: path
    })
  },
  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          getApp().setCurrentAccount(null)
          wx.showToast({ title: '已退出登录', icon: 'success' })
          setTimeout(() => {
            wx.redirectTo({ url: '/pages/login/login' })
          }, 1000)
        }
      }
    })
  }
})