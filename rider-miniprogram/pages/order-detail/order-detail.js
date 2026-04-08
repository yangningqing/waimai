Page({
  data: {
    order: {
      id: 3,
      orderId: '20260406123455',
      orderTime: '2026-04-06 12:00',
      expectedTime: '2026-04-06 12:30',
      remainingTime: 15, // 15秒
      remainingTimeText: '00:15',
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
    const orderId = options.id
    if (orderId) {
      this.loadOrder(orderId)
    }
    this.startCountdown()
  },
  onShow() {
    // 页面显示时的逻辑
  },
  startCountdown() {
    // 启动倒计时
    if (this.timer) clearInterval(this.timer)
    this.warnedSoon = false
    this.timer = setInterval(() => {
      if (this.data.order.remainingTime > 0) {
        const nextRemaining = this.data.order.remainingTime - 1
        this.setData({
          'order.remainingTime': nextRemaining,
          'order.remainingTimeText': this.formatTime(nextRemaining)
        })
        // 订单超时预警
        if (nextRemaining <= 60 && !this.warnedSoon) {
          this.warnedSoon = true
          wx.showToast({
            title: '订单即将超时，请尽快配送',
            icon: 'none'
          })
        }
      }
    }, 1000)
  },
  onUnload() {
    if (this.timer) clearInterval(this.timer)
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadOrder(orderId) {
    if (!getApp().isLoggedIn()) return
    this.callApi('getRiderOrders', { status: '配送中' }).then(result => {
      if (!result.success) return
      const order = (result.data || []).find(item => String(item.id) === String(orderId))
      if (order) {
        this.setData({
          order: {
            ...this.data.order,
            id: order.id,
            orderId: order.orderId || order.id,
            merchant: { ...this.data.order.merchant, name: order.shop || order.merchant || this.data.order.merchant.name, address: order.shopAddress || this.data.order.merchant.address },
            customer: { ...this.data.order.customer, name: order.customer || order.customerName || this.data.order.customer.name, address: order.customerAddress || this.data.order.customer.address, phone: order.customerPhone || this.data.order.customer.phone },
            totalAmount: order.amount || this.data.order.totalAmount
          }
        })
      }
    }).catch(() => {})
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
            title: '配送完成中...',
            icon: 'none'
          })
          this.callApi('completeDelivery', { orderId: this.data.order.id }).then(result => {
            wx.showToast({
              title: result.success ? '配送完成，收入已到账' : (result.message || '操作失败'),
              icon: result.success ? 'success' : 'none'
            })
            if (result.success) {
              setTimeout(() => wx.switchTab({ url: '/pages/income/income' }), 800)
            }
          })
        }
      }
    })
  },
  reportException() {
    wx.showModal({
      title: '异常上报',
      editable: true,
      placeholderText: '请填写异常说明',
      success: (res) => {
        if (!res.confirm) return
        this.callApi('reportOrderException', {
          orderId: this.data.order.id,
          reason: '其他异常',
          detail: String(res.content || '')
        }).then(result => {
          wx.showToast({
            title: result.success ? '异常上报成功' : (result.message || '上报失败'),
            icon: result.success ? 'success' : 'none'
          })
        })
      }
    })
  }
})