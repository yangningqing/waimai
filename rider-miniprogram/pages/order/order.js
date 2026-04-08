Page({
  data: {
    orders: []
  },
  onLoad() {
    this.loadOrders()
  },
  onShow() {
    this.loadOrders()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadOrders() {
    if (!getApp().isLoggedIn()) {
      this.setData({ orders: [] })
      return
    }
    this.callApi('getRiderOrders', { status: '配送中' }).then(result => {
      this.setData({ orders: result.success ? (result.data || []) : [] })
    }).catch(() => wx.showToast({ title: '加载失败', icon: 'none' }))
  },
  navigateToShop(e) {
    const index = e.currentTarget.dataset.index
    const order = this.data.orders[index]
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude
        const longitude = res.longitude
        
        wx.openLocation({
          latitude: latitude + 0.01,
          longitude: longitude + 0.01,
          name: order.shopName,
          address: order.shopAddress,
          scale: 18
        })
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        })
      }
    })
  },
  confirmPickup(e) {
    const index = e.currentTarget.dataset.index
    const orders = this.data.orders
    
    wx.showModal({
      title: '确认取餐',
      content: '确定已经取到餐了吗？',
      success: (res) => {
        if (res.confirm) {
          orders[index].status = '配送中'
          this.callApi('confirmPickup', { orderId: orders[index].id }).then(result => {
            wx.showToast({ title: result.success ? '取餐成功' : (result.message || '操作失败'), icon: result.success ? 'success' : 'none' })
            if (result.success) this.loadOrders()
          })
        }
      }
    })
  },
  navigateToCustomer(e) {
    const index = e.currentTarget.dataset.index
    const order = this.data.orders[index]
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude
        const longitude = res.longitude
        
        wx.openLocation({
          latitude: latitude + 0.02,
          longitude: longitude + 0.02,
          name: order.customerName,
          address: order.customerAddress,
          scale: 18
        })
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        })
      }
    })
  },
  callCustomer(e) {
    const index = e.currentTarget.dataset.index
    const order = this.data.orders[index]
    
    wx.showModal({
      title: '联系客户',
      content: `拨打 ${order.customerPhone}？`,
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: order.customerPhone.replace(/\*/g, '0'),
            fail: () => {
              wx.showToast({
                title: '拨打电话失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  completeDelivery(e) {
    const index = e.currentTarget.dataset.index
    const orders = this.data.orders
    
    wx.showModal({
      title: '确认完成',
      content: '确定已经完成配送了吗？\n完成后收入将实时到账',
      success: (res) => {
        if (res.confirm) {
          this.callApi('completeDelivery', { orderId: orders[index] && orders[index].id }).then(result => {
            wx.showToast({
              title: result.success ? '配送完成，收入已到账' : (result.message || '操作失败'),
              icon: result.success ? 'success' : 'none',
              duration: 2000
            })
            if (result.success) this.loadOrders()
          })
        }
      }
    })
  },
  reportException(e) {
    const index = e.currentTarget.dataset.index
    const orders = this.data.orders || []
    
    wx.showActionSheet({
      itemList: ['联系不上客户', '商品异常', '交通拥堵', '其他异常'],
      success: (res) => {
        const reasons = ['联系不上客户', '商品异常', '交通拥堵', '其他异常']
        const reason = reasons[res.tapIndex]
        
        wx.showModal({
          title: '上报异常',
          editable: true,
          placeholderText: '请详细描述异常情况',
          success: (modalRes) => {
            if (modalRes.confirm) {
              this.callApi('reportOrderException', {
                orderId: orders[index] && orders[index].id,
                reason,
                detail: String(modalRes.content || '')
              }).then(result => {
                wx.showToast({
                  title: result.success ? '异常已上报' : (result.message || '上报失败'),
                  icon: result.success ? 'success' : 'none'
                })
              })
            }
          }
        })
      }
    })
  }
})