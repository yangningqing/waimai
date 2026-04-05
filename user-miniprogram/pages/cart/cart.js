Page({
  data: {
    cartItems: [
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
    ],
    totalAmount: 40
  },
  onLoad() {
    // 页面加载时的初始化逻辑
  },
  onShow() {
    // 页面显示时的逻辑
  },
  decreaseQuantity(e) {
    // 减少商品数量
  },
  increaseQuantity(e) {
    // 增加商品数量
  },
  checkout() {
    wx.navigateTo({
      url: '../order/order'
    })
  }
})