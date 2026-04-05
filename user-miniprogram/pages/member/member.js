Page({
  data: {
    user: {
      name: '张三',
      status: '实名待认证',
      avatar: '../../images/avatar.png'
    },
    member: {
      level: '白银会员',
      stars: '★★★★☆',
      points: '714 / 2000'
    },
    wallet: {
      balance: 97,
      bill: 8,
      rewards: 12,
      unclaimed: 6
    },
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
  领取优惠券() {
    wx.showToast({
      title: '优惠券领取成功',
      icon: 'success'
    })
  },
  navigateToFeedback() {
    wx.navigateTo({
      url: '../feedback/feedback'
    })
  },
  navigateToOrders() {
    wx.navigateTo({
      url: '../order/order'
    })
  },
  navigateToCoupons() {
    wx.navigateTo({
      url: '../coupon/coupon'
    })
  }
})