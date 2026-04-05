Page({
  data: {
    cartItems: [],
    totalAmount: 0
  },
  onLoad() {
    // 页面加载时的初始化逻辑
    this.loadCartItems()
  },
  onShow() {
    // 页面显示时的逻辑
    this.loadCartItems()
  },
  loadCartItems() {
    const cartItems = wx.getStorageSync('cartItems') || [
      {
        id: 1,
        shopName: '塔斯汀',
        minOrder: 20,
        goods: [
          {
            id: 101,
            name: '香辣鸡腿堡',
            price: 25,
            quantity: 1,
            image: '../../images/ai_example1.png'
          }
        ]
      },
      {
        id: 2,
        shopName: '曼玲粥店',
        minOrder: 15,
        goods: [
          {
            id: 201,
            name: '皮蛋瘦肉粥',
            price: 15,
            quantity: 1,
            image: '../../images/ai_example2.png'
          }
        ]
      }
    ]
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
  checkout() {
    if (this.data.totalAmount === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '../order/order'
    })
  }
})