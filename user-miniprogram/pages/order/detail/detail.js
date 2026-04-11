Page({
  data: {
    orderId: '',
    order: null,
    loading: true,
    statusDesc: ''
  },
  onLoad(options) {
    const orderId = options.id || ''
    if (!orderId) {
      wx.showToast({ title: '订单号无效', icon: 'none' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    this.setData({ orderId })
    this.loadOrderDetail()
  },
  callApi(action, payload = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: {
        action,
        data: { ...payload, accountId }
      }
    }).then(res => (res && res.result) || {})
  },
  loadOrderDetail() {
    if (!this.data.orderId) return
    
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中...' })
    
    this.callApi('getOrders').then(result => {
      if (result.success && Array.isArray(result.data)) {
        const order = result.data.find(item => item.id === this.data.orderId || item.orderId === this.data.orderId)
        if (order) {
          const normalizedOrder = this.normalizeOrder(order)
          this.setData({ 
            order: normalizedOrder,
            statusDesc: this.getStatusDesc(normalizedOrder.status)
          })
        } else {
          wx.showToast({ title: '订单不存在', icon: 'none' })
        }
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    }).catch(err => {
      console.error('加载订单详情失败:', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      this.setData({ loading: false })
      wx.hideLoading()
    })
  },
  normalizeOrder(item) {
    const rawTime = item.createdAt || item.createTime || item.time || item.orderTime || item.updatedAt
    const id = item.id || item.orderId || ''
    return {
      id,
      shop: item.shop || item.merchant || '未知商家',
      merchantId: Number(item.merchantId || item.shopId || item.storeId || 0),
      status: this.normalizeStatus(item.status),
      total: Number(item.total || item.amount || 0),
      goods: Array.isArray(item.goods) ? item.goods : [],
      address: item.address,
      createdAt: this.formatTime(rawTime),
      paymentMethod: item.paymentMethod,
      deliveryFee: Number(item.deliveryFee || 0),
      canEvaluate: item.canEvaluate !== false && this.normalizeStatus(item.status) === '已完成'
    }
  },
  normalizeStatus(status) {
    const s = String(status || '').trim()
    const map = {
      '待接单': '待收货',
      '待取餐': '待收货',
      '配送中': '待收货',
      '已处理': '已完成',
      '处理中': '待收货'
    }
    return map[s] || s || '待付款'
  },
  formatTime(value) {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  },
  getStatusDesc(status) {
    const descMap = {
      '待付款': '请尽快完成支付',
      '待收货': '商家正在处理您的订单',
      '已完成': '订单已完成，感谢您的购买',
      '待评价': '订单已完成，期待您的评价',
      '退款/售后': '售后处理中'
    }
    return descMap[status] || ''
  },
  copyOrderId() {
    if (!this.data.orderId) return
    wx.setClipboardData({
      data: String(this.data.orderId),
      success: () => {
        wx.showToast({ title: '订单号已复制', icon: 'success' })
      }
    })
  },
  buyAgain() {
    wx.navigateTo({
      url: '../../index/index'
    })
  },
  immediatePay() {
    if (!this.data.orderId) return
    wx.showLoading({ title: '支付中...' })
    this.callApi('payOrder', { orderId: this.data.orderId }).then(result => {
      if (result.success) {
        wx.showToast({ title: '支付成功', icon: 'success' })
        this.loadOrderDetail()
      } else {
        wx.showToast({ title: result.message || '支付失败', icon: 'none' })
      }
    }).catch(err => {
      console.error('支付失败:', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  contactRider() {
    if (!this.data.orderId) return
    wx.showLoading({ title: '请求中...' })
    this.callApi('contactRider', { orderId: this.data.orderId }).then(result => {
      wx.showToast({
        title: result.success ? (result.message || '已联系骑手') : (result.message || '操作失败'),
        icon: result.success ? 'success' : 'none'
      })
    }).catch(err => {
      console.error('联系骑手失败:', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  confirmReceipt() {
    if (!this.data.orderId) return
    wx.showLoading({ title: '提交中...' })
    this.callApi('confirmReceipt', { orderId: this.data.orderId }).then(result => {
      if (result.success) {
        wx.showToast({ title: '确认收货成功', icon: 'success' })
        this.loadOrderDetail()
      } else {
        wx.showToast({ title: result.message || '确认失败', icon: 'none' })
      }
    }).catch(err => {
      console.error('确认收货失败:', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  evaluate() {
    if (!this.data.orderId) return
    this.callApi('submitEvaluation', {
      orderId: this.data.orderId,
      rating: 5,
      content: '默认好评'
    }).then(result => {
      wx.showToast({
        title: result.success ? '评价成功' : (result.message || '评价失败'),
        icon: result.success ? 'success' : 'none'
      })
      if (result.success) {
        this.loadOrderDetail()
      }
    }).catch(err => {
      console.error('提交评价失败:', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },
  contactMerchant() {
    wx.showActionSheet({
      itemList: ['电话联系', '在线咨询'],
      success: res => {
        if (res.tapIndex === 0) {
          // 电话联系
          wx.makePhoneCall({
            phoneNumber: '400-123-4567', // 商家客服电话
            success: () => {
              console.log('拨打电话成功')
            },
            fail: () => {
              wx.showToast({ title: '拨打电话失败', icon: 'none' })
            }
          })
        } else if (res.tapIndex === 1) {
          // 在线咨询 - 跳转到聊天页面
          const order = this.data.order
          if (order) {
            wx.navigateTo({
              url: `../../chat/chat?orderId=${encodeURIComponent(this.data.orderId)}&merchantId=${order.merchantId}&merchantName=${encodeURIComponent(order.shop)}`
            })
          } else {
            wx.showToast({ title: '订单信息无效', icon: 'none' })
          }
        }
      }
    })
  }
})