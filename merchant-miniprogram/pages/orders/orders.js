Page({
  data: {
    currentTab: 0,
    tabList: ['全部', '待接单', '配送中', '已完成'],
    orderList: [
      {
        id: '20260406001',
        customerName: '张三',
        customerPhone: '138****1234',
        customerAddress: '北京城市学院顺义校区',
        goodsInfo: '香辣鸡腿堡 x1，薯条 x1',
        orderTime: '10:30',
        price: 30,
        status: '待接单'
      },
      {
        id: '20260406002',
        customerName: '李四',
        customerPhone: '139****5678',
        customerAddress: '朝阳区望京SOHO',
        goodsInfo: '曼玲粥套餐 x1',
        orderTime: '11:15',
        price: 25,
        status: '配送中'
      }
    ]
  },
  onLoad() {
    // 页面加载
  },
  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.index
    })
  },
  acceptOrder(e) {
    const index = e.currentTarget.dataset.index
    const orderList = this.data.orderList
    
    wx.showModal({
      title: '确认接单',
      content: '确定要接这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          orderList[index].status = '配送中'
          this.setData({ orderList })
          wx.showToast({
            title: '接单成功',
            icon: 'success'
          })
        }
      }
    })
  },
  rejectOrder(e) {
    const index = e.currentTarget.dataset.index
    const orderList = this.data.orderList
    
    wx.showModal({
      title: '确认拒单',
      editable: true,
      placeholderText: '请输入拒单原因',
      success: (res) => {
        if (res.confirm) {
          orderList.splice(index, 1)
          this.setData({ orderList })
          wx.showToast({
            title: '已拒单',
            icon: 'success'
          })
        }
      }
    })
  },
  viewDetail(e) {
    const index = e.currentTarget.dataset.index
    const order = this.data.orderList[index]
    
    wx.showModal({
      title: '订单详情',
      content: `订单号：${order.id}\n客户：${order.customerName}\n地址：${order.customerAddress}\n商品：${order.goodsInfo}\n金额：¥${order.price}`,
      showCancel: false
    })
  },
  completeOrder(e) {
    const index = e.currentTarget.dataset.index
    const orderList = this.data.orderList
    
    wx.showModal({
      title: '确认完成',
      content: '确定订单已经完成了吗？',
      success: (res) => {
        if (res.confirm) {
          orderList[index].status = '已完成'
          this.setData({ orderList })
          wx.showToast({
            title: '订单已完成',
            icon: 'success'
          })
        }
      }
    })
  }
})