Page({
  data: {
    allOrders: [],
    orderList: [],
    statuses: ['全部', '待处理', '配送中', '已完成', '已取消'],
    currentStatus: '全部',
    searchText: '',
    loading: true
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
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
    return getApp().getMerchantDisplayName()
  },
  getMerchantId() {
    return getApp().getMerchantId()
  },
  loadOrders() {
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中...' })
    const merchant = this.getMerchantName()
    const merchantId = this.getMerchantId()
    this.callApi('getMerchantOrders', { merchant, merchantId }).then(result => {
      if (result.success && Array.isArray(result.data)) {
        this.setData({ allOrders: result.data })
      } else {
        this.setData({ allOrders: [] })
      }
      this.applyFilter()
    }).catch(() => {
      console.log('加载失败')
      this.setData({ allOrders: [] })
      this.applyFilter()
    }).finally(() => {
      this.setData({ loading: false })
      wx.hideLoading()
    })
  },
  applyFilter() {
    const { allOrders, currentStatus, searchText } = this.data
    let filtered = allOrders
    if (currentStatus !== '全部') {
      filtered = filtered.filter(item => item.status === currentStatus)
    }
    if (searchText) {
      const text = searchText.toLowerCase()
      filtered = filtered.filter(item => 
        item.orderId.toLowerCase().includes(text) || 
        (item.customerName && item.customerName.toLowerCase().includes(text))
      )
    }
    this.setData({ orderList: filtered })
  },
  handleStatusChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ currentStatus: status })
    this.applyFilter()
  },
  handleSearchInput(e) {
    this.setData({ searchText: e.detail.value })
    this.applyFilter()
  },
  handleOrderAction(e) {
    const orderId = e.currentTarget.dataset.id
    const status = e.currentTarget.dataset.status
    if (status === '待处理' || status === '待接单') {
      this.handleAcceptOrder(e)
    } else if (status === '配送中') {
      this.handleCompleteOrder(e)
    } else {
      this.viewOrderDetail(e)
    }
  },
  handleAcceptOrder(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '接单',
      content: '确定要接这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '接单中...', icon: 'none' })
          this.callApi('updateMerchantOrderStatus', { orderId, status: '配送中' }).then(result => {
            wx.showToast({ title: result.success ? '接单成功' : (result.message || '接单失败'), icon: result.success ? 'success' : 'none' })
            if (result.success) this.loadOrders()
          })
        }
      }
    })
  },
  handleCompleteOrder(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '完成订单',
      content: '确定要完成这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '处理中...', icon: 'none' })
          this.callApi('updateMerchantOrderStatus', { orderId, status: '已完成' }).then(result => {
            wx.showToast({ title: result.success ? '订单已完成' : (result.message || '处理失败'), icon: result.success ? 'success' : 'none' })
            if (result.success) this.loadOrders()
          })
        }
      }
    })
  },
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '订单详情',
      content: `订单号: ${orderId}`,
      showCancel: false
    })
  }
})