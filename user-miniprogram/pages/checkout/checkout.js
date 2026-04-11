Page({
  data: {
    tab: '外卖配送',
    selectedAddress: null,
    selectedAddressShort: '',
    deliveryMode: 'immediate',
    reserveTime: '今天 19:00',
    shopName: '',
    items: [],
    goodsTotal: 0,
    deliveryFee: 0,
    couponDeduct: 0,
    remark: '',
    tableware: '不需要餐具',
    payment: 'wxpay',
    payable: 0
  },
  onLoad() {
    this.loadCheckoutPayload()
    this.syncAddress()
  },
  onShow() {
    this.syncAddress()
  },
  loadCheckoutPayload() {
    const payload = wx.getStorageSync('checkout_payload') || null
    if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
      wx.showToast({ title: '结算信息为空', icon: 'none' })
      setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/cart/cart' }) }), 200)
      return
    }
    const goodsTotal = Number(payload.goodsTotal || 0)
    const deliveryFee = Number(payload.deliveryFee || 0)
    const couponDeduct = Number(payload.couponDeduct || 0)
    const payable = Math.max(0, goodsTotal + deliveryFee - couponDeduct)
    this.setData({
      shopName: String(payload.shopName || '商家'),
      items: payload.items,
      goodsTotal,
      deliveryFee,
      couponDeduct,
      payable
    })
  },
  syncAddress() {
    const selectedAddress = wx.getStorageSync('selectedAddress') || null
    const shortText = String((selectedAddress && selectedAddress.shortAddress) || '').trim()
    const fullText = String((selectedAddress && selectedAddress.address) || '').trim()
    this.setData({
      selectedAddress,
      selectedAddressShort: shortText || fullText
    })
  },
  chooseAddress() {
    wx.navigateTo({ url: '../address/address?mode=select' })
  },
  switchDeliveryMode(e) {
    this.setData({ deliveryMode: String(e.currentTarget.dataset.mode || 'immediate') })
  },
  onRemarkInput(e) {
    this.setData({ remark: String(e.detail.value || '') })
  },
  chooseTableware(e) {
    this.setData({ tableware: String(e.currentTarget.dataset.value || '不需要餐具') })
  },
  choosePayment(e) {
    this.setData({ payment: String(e.currentTarget.dataset.value || 'wxpay') })
  },
  submitOrder() {
    const accountId = getApp().getAccountId()
    if (!accountId) {
      wx.showToast({ title: '请先登录账号', icon: 'none' })
      return
    }
    const selectedAddress = this.data.selectedAddress
    if (!selectedAddress || !selectedAddress.address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' })
      return
    }
    // 从购物车获取商家ID
    const cartItemsStorage = wx.getStorageSync('cartItems') || []
    const firstShop = cartItemsStorage[0] || {}
    const merchantId = firstShop.id || 1
    
    const cartItems = [{
      id: merchantId,
      shopName: this.data.shopName,
      minOrder: 0,
      goods: this.data.items.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
        image: item.image || ''
      }))
    }]
    wx.showLoading({ title: '提交中...' })
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'createOrder',
        data: {
          accountId,
          cartItems,
          totalAmount: this.data.goodsTotal,
          address: selectedAddress,
          remark: this.data.remark,
          tableware: this.data.tableware,
          deliveryMode: this.data.deliveryMode
        }
      }
    }).then(res => {
      const result = (res && res.result) || {}
      if (!result.success) {
        wx.showToast({ title: result.message || '下单失败', icon: 'none' })
        return
      }
      const orderId = String((result.data && result.data.orderId) || '')
      if (!orderId) {
        wx.showToast({ title: '下单成功', icon: 'success' })
        return
      }
      wx.cloud.callFunction({
        name: 'api',
        data: { action: 'payOrder', data: { orderId, accountId } }
      }).then(payRes => {
        const payResult = (payRes && payRes.result) || {}
        wx.showToast({
          title: payResult.success ? '支付成功' : '已下单，待付款',
          icon: payResult.success ? 'success' : 'none'
        })
      }).finally(() => {
        wx.removeStorageSync('checkout_payload')
        wx.removeStorageSync('cartItems')
        wx.switchTab({ url: '/pages/order/order' })
      })
    }).catch(() => {
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => wx.hideLoading())
  }
})
