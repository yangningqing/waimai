Page({
  data: {
    currentTab: 0,
    isOnline: false,
    pendingOrders: [
      {
        id: 1,
        deliveryTime: '04-03 15:44:09',
        distance: '3.08 km',
        tags: ['商家单', '帮我买', '抖音订单'],
        status: '待抢单',
        shopName: '塔斯汀',
        shopAddress: '北京市顺义区塔斯汀店',
        customerName: '张三',
        customerAddress: '北京城市学院顺义校区',
        customerPhone: '138****1234',
        amount: 15
      },
      {
        id: 2,
        deliveryTime: '04-03 15:50:00',
        distance: '2.1 km',
        waitTime: '立即送达（已等待7分钟）',
        tags: ['跑腿单', '帮我买'],
        status: '待抢单',
        shopName: '曼玲粥店',
        shopAddress: '北京市朝阳区曼玲粥店',
        customerName: '李四',
        customerAddress: '朝阳区望京SOHO',
        customerPhone: '139****5678',
        amount: 18
      }
    ],
    deliveringOrders: [
      {
        id: 3,
        deliveryTime: '04-03 16:00:00',
        distance: '1.5 km',
        tags: ['商家单'],
        status: '配送中',
        shopName: '肯德基',
        shopAddress: '北京市海淀区肯德基店',
        customerName: '王五',
        customerAddress: '海淀区中关村',
        customerPhone: '137****9012',
        amount: 16
      }
    ],
    completedOrders: [
      {
        id: 4,
        deliveryTime: '04-03 14:30:00',
        distance: '2.0 km',
        tags: ['商家单'],
        status: '已完成',
        shopName: '麦当劳',
        customerName: '赵六',
        amount: 20
      }
    ]
  },

  onLoad() {
    // 页面加载
  },

  onShow() {
    // 页面显示
  },

  toggleOnline() {
    this.setData({
      isOnline: !this.data.isOnline
    })
    wx.showToast({
      title: this.data.isOnline ? '已上线' : '已下线',
      icon: 'success'
    })
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
    
    wx.showModal({
      title: '确认抢单',
      content: `确定要抢这个订单吗？\n距离：${order.distance}\n金额：¥${order.amount}`,
      success: (res) => {
        if (res.confirm) {
          // 从待抢单列表移除
          pendingOrders.splice(index, 1)
          // 添加到配送中列表
          const deliveringOrders = this.data.deliveringOrders
          deliveringOrders.push({
            ...order,
            status: '配送中'
          })
          this.setData({ pendingOrders, deliveringOrders })
          wx.showToast({
            title: '抢单成功',
            icon: 'success'
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
          // 从配送中列表移除
          deliveringOrders.splice(index, 1)
          // 添加到已完成列表
          const completedOrders = this.data.completedOrders
          completedOrders.unshift({
            ...order,
            status: '已完成'
          })
          this.setData({ deliveringOrders, completedOrders })
          
          wx.showToast({
            title: `配送完成，+¥${order.amount}已到账`,
            icon: 'success',
            duration: 2000
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
              wx.showToast({
                title: '异常已上报',
                icon: 'success'
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
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
})