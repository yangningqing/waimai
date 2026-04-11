Page({
  data: {
    riders: [
      {
        id: 1,
        name: '张三',
        phone: '13800138000',
        status: '在线',
        rating: 4.8,
        completedOrders: 1234
      },
      {
        id: 2,
        name: '李四',
        phone: '13900139000',
        status: '离线',
        rating: 4.6,
        completedOrders: 892
      },
      {
        id: 3,
        name: '王五',
        phone: '13700137000',
        status: '在线',
        rating: 4.9,
        completedOrders: 1567
      }
    ],
    deliverySettings: {
      deliveryFee: 5,
      minOrder: 20,
      deliveryTime: '30分钟内',
      deliveryRange: '3公里'
    }
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadDeliveryData()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadDeliveryData() {
    // 这里可以调用API获取配送服务数据
    console.log('加载配送服务数据')
  },
  handleCallRider(e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  handleBack() {
    wx.navigateBack()
  }
})
