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
      id: 1,
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
    // 获取当前购物车数据
    let cartItems = wx.getStorageSync('cartItems') || []
    
    // 查找是否已经有该商家的商品
    const shopIndex = cartItems.findIndex(item => item.id === this.data.shop.id)
    
    if (shopIndex !== -1) {
      // 该商家已在购物车中，查找是否已有该商品
      const goodsIndex = cartItems[shopIndex].goods.findIndex(g => g.id === this.data.goods.id)
      
      if (goodsIndex !== -1) {
        // 商品已存在，增加数量
        cartItems[shopIndex].goods[goodsIndex].quantity += this.data.quantity
      } else {
        // 商品不存在，添加到该商家
        cartItems[shopIndex].goods.push({
          id: this.data.goods.id,
          name: this.data.goods.name,
          price: this.data.goods.price,
          quantity: this.data.quantity,
          image: this.data.goods.image
        })
      }
    } else {
      // 商家不在购物车中，添加新商家和商品
      cartItems.push({
        id: this.data.shop.id,
        shopName: this.data.shop.name,
        minOrder: this.data.shop.minPrice,
        goods: [
          {
            id: this.data.goods.id,
            name: this.data.goods.name,
            price: this.data.goods.price,
            quantity: this.data.quantity,
            image: this.data.goods.image
          }
        ]
      })
    }
    
    // 保存到本地存储
    wx.setStorageSync('cartItems', cartItems)
    
    wx.showToast({
      title: '已添加到购物车',
      icon: 'success'
    })
  },
  buyNow() {
    // 直接购买，先添加到购物车
    this.addToCart()
    
    // 延迟跳转到订单页面
    setTimeout(() => {
      wx.navigateTo({
        url: '../cart/cart'
      })
    }, 1000)
  }
})