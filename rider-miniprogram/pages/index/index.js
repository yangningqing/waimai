Page({
  data: {
    currentTab: 0,
    isOnline: false,
    pendingOrders: [],
    deliveringOrders: [],
    completedOrders: []
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
      this.setData({ pendingOrders: [], deliveringOrders: [], completedOrders: [] })
      return
    }
    Promise.all([
      this.callApi('getRiderOrders', { status: '待抢单' }),
      this.callApi('getRiderOrders', { status: '配送中' }),
      this.callApi('getRiderOrders', { status: '已完成' }),
      this.callApi('getRiderProfile')
    ]).then(([pending, delivering, completed, profile]) => {
      this.setData({
        pendingOrders: pending.success ? (pending.data || []) : [],
        deliveringOrders: delivering.success ? (delivering.data || []) : [],
        completedOrders: completed.success ? (completed.data || []) : [],
        isOnline: !!(profile.success && profile.data && profile.data.online)
      })
    }).catch(err => {
      console.error('加载骑手订单失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  toggleOnline() {
    const online = !this.data.isOnline
    this.callApi('updateRiderOnlineStatus', { online }).then(result => {
      if (result.success) {
        this.setData({ isOnline: online })
      }
      wx.showToast({ title: result.success ? (online ? '已上线' : '已下线') : (result.message || '切换失败'), icon: result.success ? 'success' : 'none' })
    }).catch(() => wx.showToast({ title: '网络错误', icon: 'none' }))
  },

  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.index
    })
  },

  acceptOrder(e) {
    const index = e.currentTarget.dataset.index
    const pendingOrders = this.data.pendingOrders
    const order = pendingOrders[index]
    if (!order) return
    
    wx.showModal({
      title: '确认抢单',
      content: `确定要抢这个订单吗？\n距离：${order.distance}\n金额：¥${order.amount}`,
      success: (res) => {
        if (res.confirm) {
          this.callApi('acceptOrder', { orderId: order.id }).then(result => {
            wx.showToast({
              title: result.success ? '抢单成功' : (result.message || '抢单失败'),
              icon: result.success ? 'success' : 'none'
            })
            if (result.success) this.loadOrders()
          })
        }
      }
    })
  },

  viewOrderDetail(e) {
    const index = e.currentTarget.dataset.index
    const tab = this.data.currentTab
    let orders = []
    
    if (tab === 0) orders = this.data.pendingOrders
    else if (tab === 1) orders = this.data.deliveringOrders
    else if (tab === 2) orders = this.data.completedOrders
    
    const order = orders[index]
    
    wx.showModal({
      title: '订单详情',
      content: `预计送达：${order.deliveryTime}\n距离：${order.distance}\n商家：${order.shopName}\n客户：${order.customerName}\n地址：${order.customerAddress}${order.amount ? `\n金额：¥${order.amount}` : ''}`,
      showCancel: false
    })
  },

  navigateToShop(e) {
    const index = e.currentTarget.dataset.index
    const order = this.data.deliveringOrders[index]
    
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

  navigateToCustomer(e) {
    const index = e.currentTarget.dataset.index
    const order = this.data.deliveringOrders[index]
    
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
    const order = this.data.deliveringOrders[index]
    
    wx.showModal({
      title: '联系客户',
      content: `拨打 ${order.customerPhone}？`,
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: order.customerPhone.replace(/\*/g, '0'),
            fail: () => {
              wx.showToast({
                title: '拨打失败',
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
    const deliveringOrders = this.data.deliveringOrders
    const order = deliveringOrders[index]
    
    wx.showModal({
      title: '确认完成',
      content: '确定已经完成配送了吗？\n完成后收入将实时到账',
      success: (res) => {
        if (res.confirm) {
          this.callApi('completeDelivery', { orderId: order.id }).then(result => {
            if (result.success) {
              this.loadOrders()
            }
            wx.showToast({
              title: result.success ? `配送完成，+¥${order.amount || 0}已到账` : (result.message || '操作失败'),
              icon: result.success ? 'success' : 'none',
              duration: 2000
            })
          })
        }
      }
    })
  },

  reportException(e) {
    const index = e.currentTarget.dataset.index
    
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
                orderId: this.data.deliveringOrders[index] && this.data.deliveringOrders[index].id,
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
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          getApp().setCurrentAccount(null)
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
})