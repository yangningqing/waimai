Page({
  data: {
    activeTab: 0,
    tabs: [
      { label: '全部', status: 'ALL', count: 0 },
      { label: '待付款', status: '待付款', count: 0 },
      { label: '待收货/待使用', status: '待收货', count: 0 },
      { label: '待评价', status: '待评价', count: 0 },
      { label: '退款/售后', status: '退款/售后', count: 0 }
    ],
    allOrders: [],
    orders: [],
    deletedOrderIds: [],
    keyword: '',
    loading: true,
    isRefreshing: false,
    fetchingOrders: false,
    lastOrdersFetchAt: 0
  },
  onLoad() {
    this.loadDeletedOrderIds()
    this.loadOrdersCache()
    if (!Array.isArray(this.data.allOrders) || this.data.allOrders.length === 0) {
      this.getOrders()
    }
  },
  onShow() {
    if (!Array.isArray(this.data.allOrders) || this.data.allOrders.length === 0) {
      this.getOrders()
    }
  },
  loadOrdersCache() {
    try {
      const cached = wx.getStorageSync('')
      if (cached && Array.isArray(cached.orders)) {
        this.applyOrders(cached.orders)
        this.setData({
          loading: false,
          lastOrdersFetchAt: Number(cached.updatedAt || 0)
        })
      }
    } catch (err) {
      console.warn('读取订单缓存失败:', err)
    }
  },
  saveOrdersCache(orders) {
    try {
      wx.setStorageSync('', {
        updatedAt: Date.now(),
        orders: Array.isArray(orders) ? orders : []
      })
    } catch (err) {
      console.warn('保存订单缓存失败:', err)
    }
  },
  loadDeletedOrderIds() {
    try {
      const list = wx.getStorageSync('order_deleted_ids')
      if (Array.isArray(list)) {
        this.setData({ deletedOrderIds: list.map(id => String(id)) })
      }
    } catch (err) {
      console.warn('读取本地删除订单缓存失败:', err)
    }
  },
  saveDeletedOrderIds(list) {
    try {
      wx.setStorageSync('order_deleted_ids', list)
    } catch (err) {
      console.warn('保存本地删除订单缓存失败:', err)
    }
  },
  getVisibleOrders(allOrders) {
    const deletedSet = new Set((this.data.deletedOrderIds || []).map(id => String(id)))
    return allOrders.filter(order => !deletedSet.has(String(order.id)))
  },
  tryClearCartAfterOrderSynced(allOrders) {
    const pendingOrderId = String(wx.getStorageSync('pending_clear_cart_order_id') || '').trim()
    if (!pendingOrderId) return
    const exists = Array.isArray(allOrders) && allOrders.some(item => String(item.id) === pendingOrderId)
    if (!exists) return
    wx.removeStorageSync('cartItems')
    wx.removeStorageSync('pending_clear_cart_order_id')
  },
  getOrders(force = false) {
    if (this.data.fetchingOrders) return
    if (!force && Array.isArray(this.data.allOrders) && this.data.allOrders.length > 0) return
    this.setData({ fetchingOrders: true })
    const accountId = getApp().getAccountId()
    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'getOrders',
        data: {
          onlyMine: true,
          ...(accountId ? { accountId } : {})
        }
      }
    }).then(res => {
      const result = (res && res.result) || {}
      if (result.success && Array.isArray(result.data)) {
        const normalizedOrders = this.normalizeOrders(result.data)
        this.tryClearCartAfterOrderSynced(normalizedOrders)
        this.applyOrders(normalizedOrders)
        this.saveOrdersCache(normalizedOrders)
      } else {
        this.applyOrders([])
        wx.showToast({
          title: result.message || '订单加载失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      console.error('调用云函数失败:', err)
      this.applyOrders([])
      wx.showToast({
        title: '网络错误，请下拉重试',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      this.setData({
        loading: false,
        isRefreshing: false,
        fetchingOrders: false,
        lastOrdersFetchAt: Date.now()
      })
    })
  },
  onPullDownRefresh() {
    this.setData({ isRefreshing: true })
    this.getOrders(true)
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
  getStatusClass(status) {
    if (status === '待付款') return 'pending-pay'
    if (status === '待收货') return 'pending-delivery'
    if (status === '待评价') return 'pending-comment'
    if (status === '退款/售后') return 'after-sale'
    if (status === '已完成') return 'completed'
    return 'default'
  },
  formatTime(value) {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  },
  toTimestamp(value) {
    if (!value && value !== 0) return 0
    if (typeof value === 'number') {
      return value < 1000000000000 ? value * 1000 : value
    }
    if (typeof value === 'string') {
      const raw = value.trim()
      const onlyNumber = /^\d+$/.test(raw)
      if (onlyNumber) {
        const asNumber = Number(raw)
        return asNumber < 1000000000000 ? asNumber * 1000 : asNumber
      }
      const normalized = raw.replace('T', ' ').replace(/-/g, '/')
      const parsed = new Date(normalized).getTime()
      return Number.isNaN(parsed) ? 0 : parsed
    }
    if (value instanceof Date) {
      const t = value.getTime()
      return Number.isNaN(t) ? 0 : t
    }
    if (typeof value === 'object') {
      if (typeof value.getTime === 'function') {
        const t = value.getTime()
        return Number.isNaN(t) ? 0 : t
      }
      if (value.$date) return this.toTimestamp(value.$date)
      if (value.seconds) return this.toTimestamp(Number(value.seconds))
      if (value._seconds) return this.toTimestamp(Number(value._seconds))
      if (value.timestamp) return this.toTimestamp(value.timestamp)
    }
    return 0
  },
  sortOrders(list) {
    return [...list].sort((a, b) => {
      const timeDiff = Number(b.sortTime || 0) - Number(a.sortTime || 0)
      if (timeDiff !== 0) return timeDiff
      return 0
    })
  },
  getGoodsSummary(goods) {
    if (!Array.isArray(goods) || goods.length === 0) {
      return '共0件商品'
    }
    const totalCount = goods.reduce((sum, g) => sum + Number(g.quantity || 0), 0)
    return `共${totalCount}件商品`
  },
  getGoodsDetailText(goods) {
    if (!Array.isArray(goods) || goods.length === 0) {
      return '暂无商品明细'
    }
    return goods
      .map(g => (g && g.name ? String(g.name).trim() : ''))
      .filter(Boolean)
      .join('、') || '暂无商品明细'
  },
  normalizeOrders(list) {
    return list.map(item => {
      const rawTime = item.createdAt || item.createTime || item.time || item.orderTime || item.updatedAt
      const id = item.id || item.orderId || ''
      const sortTime = this.toTimestamp(rawTime)
      return {
        id,
        shop: item.shop || item.merchant || '未知商家',
        merchantId: Number(item.merchantId || item.shopId || item.storeId || 0),
        status: this.normalizeStatus(item.status),
        statusClass: this.getStatusClass(this.normalizeStatus(item.status)),
        total: Number(item.total || item.amount || 0),
        totalText: Number(item.total || item.amount || 0).toFixed(2),
        goodsSummary: this.getGoodsSummary(item.goods),
        goodsDetailText: this.getGoodsDetailText(item.goods),
        goods: Array.isArray(item.goods) ? item.goods : [],
        createdAt: sortTime ? this.formatTime(sortTime) : '',
        sortTime,
        canEvaluate: item.canEvaluate !== false && this.normalizeStatus(item.status) === '已完成',
        hasRefund: Boolean(item.refundStatus || item.afterSaleStatus)
      }
    }).filter(item => !!item.id)
  },
  applyOrders(allOrders) {
    const sortedOrders = this.sortOrders(this.getVisibleOrders(allOrders))
    this.setData({
      allOrders: sortedOrders,
      tabs: this.getTabCounts(sortedOrders)
    })
    this.filterOrders()
  },
  getTabCounts(allOrders) {
    const payCount = allOrders.filter(item => item.status === '待付款').length
    const receiveCount = allOrders.filter(item => item.status === '待收货').length
    const evaluateCount = allOrders.filter(item => item.canEvaluate).length
    const refundCount = allOrders.filter(item => item.hasRefund).length
    return [
      { label: '全部', status: 'ALL', count: allOrders.length },
      { label: '待付款', status: '待付款', count: payCount },
      { label: '待收货/待使用', status: '待收货', count: receiveCount },
      { label: '待评价', status: '待评价', count: evaluateCount },
      { label: '退款/售后', status: '退款/售后', count: refundCount }
    ]
  },
  filterOrders() {
    const { activeTab, tabs, allOrders, keyword } = this.data
    const activeStatus = tabs[activeTab] ? tabs[activeTab].status : 'ALL'
    let orders = allOrders
    if (activeStatus === '待评价') {
      orders = orders.filter(item => item.canEvaluate)
    } else if (activeStatus === '退款/售后') {
      orders = orders.filter(item => item.hasRefund)
    } else if (activeStatus !== 'ALL') {
      orders = allOrders.filter(item => item.status === activeStatus)
    }
    const q = String(keyword || '').trim().toLowerCase()
    if (q) {
      orders = orders.filter(item => {
        const goodsText = Array.isArray(item.goods)
          ? item.goods.map(goods => goods.name || '').join(' ')
          : ''
        return String(item.shop).toLowerCase().includes(q)
          || String(item.id).toLowerCase().includes(q)
          || goodsText.toLowerCase().includes(q)
      })
    }
    this.setData({ orders })
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
  switchTab(e) {
    const index = Number(e.currentTarget.dataset.index)
    if (!Number.isFinite(index)) {
      return
    }
    this.setData({
      activeTab: index
    })
    this.filterOrders()
  },
  handleSearchInput(e) {
    this.setData({ keyword: e.detail.value || '' })
    this.filterOrders()
  },
  clearKeyword() {
    this.setData({ keyword: '' })
    this.filterOrders()
  },
  onTapFilter() {
    wx.showToast({ title: '筛选功能开发中', icon: 'none' })
  },
  onTapInvoice() {
    wx.showToast({ title: '发票功能开发中', icon: 'none' })
  },
  navigateToShop(e) {
    const merchantId = Number(e.currentTarget.dataset.merchantId || 0)
    if (!merchantId) {
      wx.showToast({ title: '商家信息缺失', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `../goods/goods?id=${merchantId}`
    })
  },
  handleMore(e) {
    const orderId = e.currentTarget.dataset.id
    if (!orderId) {
      wx.showToast({ title: '订单号无效', icon: 'none' })
      return
    }
    wx.showActionSheet({
      itemList: ['删除订单', '复制单号'],
      success: res => {
        if (res.tapIndex === 0) {
          this.deleteOrderLocal(orderId)
        } else if (res.tapIndex === 1) {
          this.copyOrderId(e)
        }
      }
    })
  },
  deleteOrderLocal(orderId) {
    const id = String(orderId)
    wx.showModal({
      title: '删除订单',
      content: '确认删除这条订单记录？',
      confirmColor: '#ff4d4f',
      success: res => {
        if (!res.confirm) return
        const current = (this.data.deletedOrderIds || []).map(item => String(item))
        if (current.includes(id)) return
        const next = current.concat(id)
        this.saveDeletedOrderIds(next)
        this.setData({ deletedOrderIds: next })
        this.applyOrders(this.data.allOrders)
        wx.showToast({ title: '已本地删除', icon: 'success' })
      }
    })
  },
  copyOrderId(e) {
    const orderId = e.currentTarget.dataset.id
    if (!orderId) {
      wx.showToast({ title: '订单号无效', icon: 'none' })
      return
    }
    wx.setClipboardData({
      data: String(orderId),
      success: () => {
        wx.showToast({ title: '订单号已复制', icon: 'success' })
      }
    })
  },
  contactRider(e) {
    const orderId = e.currentTarget.dataset.id
    if (!orderId) {
      wx.showToast({ title: '订单号无效', icon: 'none' })
      return
    }
    wx.showLoading({ title: '请求中...' })
    this.callApi('contactRider', { orderId }).then(result => {
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
  confirmReceipt(e) {
    const orderId = e.currentTarget.dataset.id
    if (!orderId) {
      wx.showToast({ title: '订单号无效', icon: 'none' })
      return
    }
    wx.showLoading({ title: '提交中...' })
    this.callApi('confirmReceipt', { orderId }).then(result => {
      if (result.success) {
        wx.showToast({ title: '确认收货成功', icon: 'success' })
        this.getOrders(true)
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
  immediatePay(e) {
    const orderId = e.currentTarget.dataset.id
    if (!orderId) {
      wx.showToast({ title: '订单号无效', icon: 'none' })
      return
    }
    wx.showLoading({ title: '支付中...' })
    this.callApi('payOrder', { orderId }).then(result => {
      if (result.success) {
        wx.showToast({ title: '支付成功', icon: 'success' })
        this.getOrders(true)
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
  buyAgain(e) {
    const orderId = e.currentTarget.dataset.id
    if (!orderId) {
      wx.showToast({ title: '订单号无效', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: '../index/index'
    })
  },
  evaluate(e) {
    const orderId = e.currentTarget.dataset.id
    if (!orderId) {
      wx.showToast({ title: '订单号无效', icon: 'none' })
      return
    }
    this.callApi('submitEvaluation', {
      orderId,
      rating: 5,
      content: '默认好评'
    }).then(result => {
      wx.showToast({
        title: result.success ? '评价成功' : (result.message || '评价失败'),
        icon: result.success ? 'success' : 'none'
      })
      if (result.success) {
        this.getOrders(true)
      }
    }).catch(err => {
      console.error('提交评价失败:', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  }
})