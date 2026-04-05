Page({
  data: {
    quantity: 1,
    goods: {
      id: 101,
      name: '香辣鸡腿堡',
      price: 25,
      sales: 1234,
      description: '香辣可口的鸡腿堡，配以新鲜的蔬菜和特制酱料，是您的美味选择。',
      image: '../../images/ai_example1.png'
    },
    shop: {
      name: '塔斯汀',
      rating: 4.8,
      sales: 1234,
      distance: '1.2km',
      minPrice: 20
    }
  },
  onLoad(options) {
    // 页面加载时的初始化逻辑
    const goodsId = options.id
    // 根据商品ID获取商品详情
  },
  onShow() {
    // 页面显示时的逻辑
  },
  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      })
    }
  },
  increaseQuantity() {
    this.setData({
      quantity: this.data.quantity + 1
    })
  },
  addToCart() {
    wx.showToast({
      title: '已添加到购物车',
      icon: 'success'
    })
  },
  buyNow() {
    wx.navigateTo({
      url: '../order/order'
    })
  }
})