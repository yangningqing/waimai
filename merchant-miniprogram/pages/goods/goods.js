Page({
  data: {
    categoryList: ['全部商品', '热销商品', '新品上架'],
    currentCategory: 0,
    goodsList: [
      {
        id: 1,
        name: '香辣鸡腿堡',
        price: 18,
        status: '上架中',
        icon: '🍔'
      },
      {
        id: 2,
        name: '薯条（大）',
        price: 12,
        status: '上架中',
        icon: '🍟'
      }
    ]
  },
  onLoad() {
    // 页面加载
  },
  switchCategory(e) {
    this.setData({
      currentCategory: e.currentTarget.dataset.index
    })
  },
  editGoods() {
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    })
  },
  offGoods() {
    wx.showToast({
      title: '下架功能开发中',
      icon: 'none'
    })
  },
  addGoods() {
    wx.showToast({
      title: '添加商品功能开发中',
      icon: 'none'
    })
  }
})