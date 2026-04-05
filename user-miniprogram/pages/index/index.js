Page({
  data: {
    merchants: [
      {
        id: 1,
        name: '塔斯汀',
        description: '汉堡 • 西式快餐',
        rating: 4.8,
        sales: 1234,
        distance: '1.2km',
        minPrice: 20,
        image: '../../images/ai_example1.png'
      },
      {
        id: 2,
        name: '曼玲粥店',
        description: '粥类 • 早餐',
        rating: 4.6,
        sales: 892,
        distance: '0.8km',
        minPrice: 15,
        image: '../../images/ai_example2.png'
      }
    ],
    coupons: [
      { amount: 13, description: '外卖大额神券' },
      { amount: 40, description: '踏青美食神券' },
      { amount: 10, description: '外卖大额神券' },
      { amount: 11, description: '休闲玩乐神券' }
    ]
  },
  onLoad() {
    // 页面加载时的初始化逻辑
  },
  onShow() {
    // 页面显示时的逻辑
  },
  navigateToMerchant(e) {
    const merchantId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../goods/goods?id=${merchantId}`
    })
  },
  navigateToCart() {
    wx.navigateTo({
      url: '../cart/cart'
    })
  },
  navigateToOrder() {
    wx.navigateTo({
      url: '../order/order'
    })
  },
  navigateToMember() {
    wx.navigateTo({
      url: '../member/member'
    })
  },
  claimCoupons() {
    wx.showToast({
      title: '优惠券领取成功',
      icon: 'success'
    })
  },
  navigateToCategory() {
    wx.navigateTo({
      url: '../category/category'
    })
  },
  search() {
    wx.showToast({
      title: '搜索功能开发中',
      icon: 'none'
    })
  }
})