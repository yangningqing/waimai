Page({
  data: {
    cartItems: [],
    totalAmount: 0,
    selectedAddressText: ''
  },
  onLoad() {
    // 页面加载时的初始化逻辑
    this.loadCartItems()
  },
  onShow() {
    // 页面显示时的逻辑
    this.loadCartItems()
    this.syncSelectedAddress()
  },
  syncSelectedAddress() {
    const selectedAddress = wx.getStorageSync('selectedAddress') || null
    const shortText = String((selectedAddress && selectedAddress.shortAddress) || '').trim()
    this.setData({
      selectedAddressText: shortText || String((selectedAddress && selectedAddress.address) || '').trim()
    })
  },
  chooseAddress() {
    wx.navigateTo({ url: '../address/address?mode=select' })
  },
  loadCartItems() {
    const rawCartItems = wx.getStorageSync('cartItems') || []
    const cartItems = Array.isArray(rawCartItems) ? rawCartItems.slice(0, 1) : []
    this.setData({ cartItems })
    this.calculateTotal()
  },
  decreaseQuantity(e) {
    const shopIndex = e.currentTarget.dataset.shop
    const goodsIndex = e.currentTarget.dataset.goods
    const cartItems = this.data.cartItems
    const goods = cartItems[shopIndex].goods[goodsIndex]
    
    if (goods.quantity > 1) {
      goods.quantity--
      this.calculateTotal()
      this.setData({ cartItems })
      wx.setStorageSync('cartItems', cartItems)
    } else {
      // 如果数量为1，删除商品
      cartItems[shopIndex].goods.splice(goodsIndex, 1)
      // 如果该商店没有商品了，删除商店
      if (cartItems[shopIndex].goods.length === 0) {
        cartItems.splice(shopIndex, 1)
      }
      this.calculateTotal()
      this.setData({ cartItems })
      wx.setStorageSync('cartItems', cartItems)
    }
  },
  increaseQuantity(e) {
    const shopIndex = e.currentTarget.dataset.shop
    const goodsIndex = e.currentTarget.dataset.goods
    const cartItems = this.data.cartItems
    cartItems[shopIndex].goods[goodsIndex].quantity++
    this.calculateTotal()
    this.setData({ cartItems })
    wx.setStorageSync('cartItems', cartItems)
  },
  calculateTotal() {
    let total = 0
    this.data.cartItems.forEach(shop => {
      shop.goods.forEach(goods => {
        total += goods.price * goods.quantity
      })
    })
    this.setData({ totalAmount: total })
  },
  goToOrderTab() {
    const target = '/pages/order/order'
    wx.switchTab({
      url: target,
      fail: (err) => {
        console.error('首次跳转订单页失败:', err)
        setTimeout(() => {
          wx.switchTab({
            url: target,
            fail: (err2) => {
              console.error('二次跳转订单页失败，使用reLaunch兜底:', err2)
              wx.reLaunch({
                url: target,
                fail: (err3) => {
                  console.error('reLaunch订单页失败:', err3)
                  wx.showModal({
                    title: '跳转失败',
                    content: '下单成功，但跳转订单页失败。请手动点击底部“订单”查看。',
                    showCancel: false
                  })
                }
              })
            }
          })
        }, 120)
      }
    })
  },
  checkout() {
    const accountId = getApp().getAccountId()
    if (!accountId) {
      wx.showToast({ title: '请先登录账号', icon: 'none' })
      return
    }
    if (this.data.totalAmount === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      })
      return
    }

    const firstShop = this.data.cartItems[0] || {}
    wx.setStorageSync('checkout_payload', {
      source: 'cart',
      shopName: String(firstShop.shopName || '商家'),
      items: Array.isArray(firstShop.goods) ? firstShop.goods : [],
      goodsTotal: Number(this.data.totalAmount || 0),
      deliveryFee: 0,
      couponDeduct: 0
    })
    wx.navigateTo({ url: '../checkout/checkout' })
  }
})