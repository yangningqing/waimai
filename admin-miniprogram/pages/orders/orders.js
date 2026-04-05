Page({
  data: {
    currentTab: 0,
    tabList: ['全部', '待处理', '处理中', '已处理'],
    orders: [
      {
        id: 1,
        orderId: '20260406123456',
        status: '待处理',
        merchant: '塔斯汀',
        customer: '张三',
        customerPhone: '138****1234',
        customerAddress: '北京城市学院顺义校区',
        amount: 33,
        time: '2026-04-06 12:00',
        rider: '张师傅'
      },
      {
        id: 2,
        orderId: '20260406123457',
        status: '处理中',
        merchant: '曼玲粥店',
        customer: '李四',
        customerPhone: '139****5678',
        customerAddress: '朝阳区望京SOHO',
        amount: 25,
        time: '2026-04-06 11:30',
        rider: '李师傅'
      }
    ]
  },
  onLoad() {
    // 页面加载时的初始化逻辑
  },
  onShow() {
    // 页面显示时的逻辑
  },
  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.index
    })
  },
  handleOrder(e) {
    const index = e.currentTarget.dataset.index
    const orders = this.data.orders
    
    wx.showActionSheet({
      itemList: ['分配骑手', '联系商家', '联系客户', '标记完成'],
      success: (res) => {
        const actions = ['分配骑手', '联系商家', '联系客户', '标记完成']
        const action = actions[res.tapIndex]
        
        if (action === '分配骑手') {
          this.assignRider(index)
        } else if (action === '联系商家') {
          this.contactMerchant(index)
        } else if (action === '联系客户') {
          this.contactCustomer(index)
        } else if (action === '标记完成') {
          this.markComplete(index)
        }
      }
    })
  },
  assignRider(index) {
    const orders = this.data.orders
    wx.showModal({
      title: '分配骑手',
      editable: true,
      placeholderText: '请输入骑手姓名',
      success: (res) => {
        if (res.confirm && res.content) {
          orders[index].rider = res.content
          orders[index].status = '处理中'
          this.setData({ orders })
          wx.showToast({
            title: '分配成功',
            icon: 'success'
          })
        }
      }
    })
  },
  contactMerchant(index) {
    const orders = this.data.orders
    wx.showModal({
      title: '联系商家',
      content: '即将拨打电话给商家？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '正在拨打...',
            icon: 'none'
          })
        }
      }
    })
  },
  contactCustomer(index) {
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
                title: '拨打失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  markComplete(index) {
    const orders = this.data.orders
    wx.showModal({
      title: '标记完成',
      content: '确定要标记这个订单为已完成吗？',
      success: (res) => {
        if (res.confirm) {
          orders[index].status = '已处理'
          this.setData({ orders })
          wx.showToast({
            title: '标记成功',
            icon: 'success'
          })
        }
      }
    })
  },
  viewOrderDetail(e) {
    const index = e.currentTarget.dataset.index
    const order = this.data.orders[index]
    
    wx.showModal({
      title: '订单详情',
      content: `订单号：${order.orderId}\n商家：${order.merchant}\n客户：${order.customer}\n地址：${order.customerAddress}\n金额：¥${order.amount}\n骑手：${order.rider || '未分配'}\n时间：${order.time}`,
      showCancel: false
    })
  }
})