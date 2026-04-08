Page({
  data: {
    currentTab: 0,
    tabList: ['全部', '待接单', '配送中', '已完成'],
    allOrders: [
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
    ],
    orderList: []
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
  getMerchantName() {
    const account = getApp().globalData.currentAccount || {}
    return String(account.nickname || account.merchantName || '塔斯汀')
  },
  loadOrders() {
    if (!getApp().isLoggedIn()) {
      this.setData({ allOrders: [], orderList: [] })
      return
    }
    this.callApi('getMerchantOrders', { merchant: this.getMerchantName() }).then(result => {
      const allOrders = result.success ? (result.data || []) : []
      this.setData({ allOrders })
      this.applyFilter()
    }).catch(() => wx.showToast({ title: '加载失败', icon: 'none' }))
  },
  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.index
    })
    this.applyFilter()
  },
  applyFilter() {
    const { currentTab, allOrders } = this.data
    let orderList = allOrders || []
    if (currentTab === 1) {
      orderList = orderList.filter(item => item.status === '待接单')
    } else if (currentTab === 2) {
      orderList = orderList.filter(item => item.status === '配送中' || item.status === '待取餐')
    } else if (currentTab === 3) {
      orderList = orderList.filter(item => item.status === '已完成')
    }
    this.setData({ orderList })
  },
  acceptOrder(e) {
    const index = e.currentTarget.dataset.index
    const orderList = this.data.orderList
    
    wx.showModal({
      title: '确认接单',
      content: '确定要接这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          this.callApi('updateMerchantOrderStatus', { orderId: orderList[index].id, status: '配送中' }).then(result => {
            wx.showToast({
              title: result.success ? '接单成功' : (result.message || '接单失败'),
              icon: result.success ? 'success' : 'none'
            })
            if (result.success) this.loadOrders()
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
          this.callApi('updateMerchantOrderStatus', { orderId: orderList[index].id, status: '已取消' }).then(result => {
            wx.showToast({
              title: result.success ? '已拒单' : (result.message || '操作失败'),
              icon: result.success ? 'success' : 'none'
            })
            if (result.success) this.loadOrders()
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
          this.callApi('updateMerchantOrderStatus', { orderId: orderList[index].id, status: '已完成' }).then(result => {
            wx.showToast({
              title: result.success ? '订单已完成' : (result.message || '操作失败'),
              icon: result.success ? 'success' : 'none'
            })
            if (result.success) this.loadOrders()
          })
        }
      }
    })
  }
})