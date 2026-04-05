Page({
  data: {
    categories: [
      { id: 1, name: '鲜花' },
      { id: 2, name: '餐饮' },
      { id: 3, name: '水果' },
      { id: 4, name: '超市' },
      { id: 5, name: '药品' },
      { id: 6, name: '蛋糕' },
      { id: 7, name: '饮品' },
      { id: 8, name: '其他' }
    ],
    activeCategory: 1,
    goods: {
      1: [
        { id: 101, name: '玫瑰花', price: 99, image: '../../images/ai_example1.png' },
        { id: 102, name: '栀子花', price: 49, image: '../../images/ai_example2.png' },
        { id: 103, name: '向日葵', price: 69, image: '../../images/ai_example1.png' },
        { id: 104, name: '百合花', price: 79, image: '../../images/ai_example2.png' },
        { id: 105, name: '康乃馨', price: 59, image: '../../images/ai_example1.png' },
        { id: 106, name: '郁金香', price: 89, image: '../../images/ai_example2.png' }
      ],
      2: [
        { id: 201, name: '汉堡', price: 25, image: '../../images/ai_example1.png' },
        { id: 202, name: '披萨', price: 45, image: '../../images/ai_example2.png' },
        { id: 203, name: '炸鸡', price: 35, image: '../../images/ai_example1.png' }
      ],
      3: [
        { id: 301, name: '苹果', price: 15, image: '../../images/ai_example1.png' },
        { id: 302, name: '香蕉', price: 10, image: '../../images/ai_example2.png' },
        { id: 303, name: '橙子', price: 12, image: '../../images/ai_example1.png' }
      ]
    }
  },
  onLoad() {
    // 页面加载时的初始化逻辑
  },
  switchCategory(e) {
    const categoryId = parseInt(e.currentTarget.dataset.id)
    this.setData({
      activeCategory: categoryId
    })
  },
  addToCart(e) {
    const goodsId = e.currentTarget.dataset.id
    wx.showToast({
      title: '已添加到购物车',
      icon: 'success'
    })
  },
  navigateToGoodsDetail(e) {
    const goodsId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../goods/goods?id=${goodsId}`
    })
  }
})