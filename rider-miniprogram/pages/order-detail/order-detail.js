Page({
  data: {
    order: {
      id: 3,
      orderId: '20260406123455',
      orderTime: '2026-04-06 12:00',
      expectedTime: '2026-04-06 12:30',
      remainingTime: 15, // 15秒
      merchant: {
        name: '肯德基',
        address: '北京市顺义区北京城市学院顺义校区',
        latitude: 40.123456,
        longitude: 116.123456
      },
      customer: {
        name: '张三',
        phone: '138****1234',
        address: '北京市顺义区北京城市学院顺义校区',
        latitude: 40.123456,
        longitude: 116.123456,
        image: '../../images/ai_example1.png'
      },
      goods: [
        { name: '奥尔良烤翅', quantity: 2, price: 15 },
        { name: '可乐', quantity: 1, price: 8 }
      ],
      totalAmount: 45,
      expectedIncome: 5.5
    }
  },
  onLoad(options) {
    // 页面加载时的初始化逻辑
    const orderId = options.id
    this.startCountdown()
  },
  onShow() {
    // 页面显示时的逻辑
  },
  startCountdown() {
    // 启动倒计时
    setInterval(() => {
      if (this.data.order.remainingTime > 0) {
        this.setData({
          'order.remainingTime': this.data.order.remainingTime - 1
        })
        // 订单超时预警
        if (this.data.order.remainingTime <= 60) {
          wx.showToast({
            title: '订单即将超时，请尽快配送',
            icon: 'none'
          })
        }
      }
    }, 1000)
  },
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },
  navigateToMerchant() {
    const { latitude, longitude, name } = this.data.order.merchant
    wx.openLocation({
      latitude,
      longitude,
      name,
      address: this.data.order.merchant.address
    })
  },
  navigateToCustomer() {
    const { latitude, longitude, name } = this.data.order.customer
    wx.openLocation({
      latitude,
      longitude,
      name,
      address: this.data.order.customer.address
    })
  },
  previewImage() {
    wx.previewImage({
      urls: [this.data.order.customer.image]
    })
  },
  completeOrder() {
    wx.showModal({
      title: '确认完成',
      content: '确定已经完成配送吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '配送完成，收入已到账',
            icon: 'success'
          })
          // 跳转到收入页面
          setTimeout(() => {
            wx.navigateTo({
              url: '../income/income'
            })
          }, 1000)
        }
      }
    })
  },
  reportException() {
    wx.showModal({
      title: '异常上报',
      content: '请选择异常类型',
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '异常上报成功',
            icon: 'success'
          })
        }
      }
    })
  }
})