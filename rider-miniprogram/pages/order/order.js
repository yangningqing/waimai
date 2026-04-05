Page({
  data: {
    orders: [
      {
        id: '20260406001',
        shopName: '塔斯汀',
        shopAddress: '北京市顺义区塔斯汀店',
        customerName: '张三',
        customerAddress: '北京城市学院顺义校区',
        status: '待取餐',
        remainingTime: '29:59',
        customerPhone: '138****1234'
      },
      {
        id: '20260406002',
        shopName: '曼玲粥店',
        shopAddress: '北京市朝阳区曼玲粥店',
        customerName: '李四',
        customerAddress: '朝阳区望京SOHO',
        status: '配送中',
        remainingTime: '15:30',
        customerPhone: '139****5678'
      }
    ]
  },
  onLoad() {
    // 页面加载
  },
  onShow() {
    // 页面显示
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
          this.setData({ orders })
          wx.showToast({
            title: '取餐成功',
            icon: 'success'
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
          orders.splice(index, 1)
          this.setData({ orders })
          
          wx.showToast({
            title: '配送完成，收入已到账',
            icon: 'success',
            duration: 2000
          })
          
          // 更新骑手收入
          setTimeout(() => {
            wx.showToast({
              title: '+15元已到账',
              icon: 'success'
            })
          }, 2000)
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
  }
})