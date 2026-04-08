Page({
  data: {
    adminName: 'admin',
    stats: {
      todayOrders: 128,
      pendingOrders: 15,
      todayRiders: 45,
      todayIncome: 3245
    },
    warnings: [
      {
        id: 1,
        orderId: '20260406123456',
        status: '即将超时',
        remainingTime: 5
      },
      {
        id: 2,
        orderId: '20260406123457',
        status: '超时',
        overtime: 10
      }
    ],
    riders: [
      {
        id: 1,
        name: '王师傅',
        status: '配送中',
        currentOrders: 2,
        avatar: '../../images/avatar.png'
      },
      {
        id: 2,
        name: '李师傅',
        status: '空闲',
        currentOrders: 0,
        avatar: '../../images/avatar.png'
      }
    ],
    areas: [
      {
        id: 1,
        name: '顺义区',
        todayOrders: 45,
        riderCount: 15
      },
      {
        id: 2,
        name: '朝阳区',
        todayOrders: 68,
        riderCount: 20
      }
    ]
  },
  onLoad() {
    this.ensureAuthAndLoad()
  },
  onShow() {
    this.ensureAuthAndLoad()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  ensureAuthAndLoad() {
    if (getApp().isLoggedIn()) {
      const account = getApp().globalData.currentAccount || {}
      this.setData({ adminName: String(account.nickname || account.username || 'admin') })
      this.loadDashboard()
      return
    }
    this.promptAuth()
  },
  promptAuth() {
    wx.showActionSheet({
      itemList: ['登录管理账号', '注册管理账号'],
      success: (res) => {
        const isLogin = res.tapIndex === 0
        this.collectCredentialsAndSubmit(isLogin)
      }
    })
  },
  collectCredentialsAndSubmit(isLogin) {
    wx.showModal({
      title: isLogin ? '管理员登录' : '管理员注册',
      editable: true,
      placeholderText: '请输入账号',
      success: (uRes) => {
        if (!uRes.confirm) return
        const username = String(uRes.content || '').trim()
        if (!username) return
        wx.showModal({
          title: isLogin ? '输入密码' : '设置密码',
          editable: true,
          placeholderText: '请输入密码(6位以上)',
          success: (pRes) => {
            if (!pRes.confirm) return
            const password = String(pRes.content || '')
            if (!password) return
            const action = isLogin ? 'loginUser' : 'registerUser'
            const payload = { username, password, role: 'admin', nickname: username }
            this.callApi(action, payload).then(result => {
              if (!result.success) {
                wx.showToast({ title: result.message || (isLogin ? '登录失败' : '注册失败'), icon: 'none' })
                return
              }
              const account = result.data || { username, nickname: username, role: 'admin' }
              getApp().setCurrentAccount(account)
              this.setData({ adminName: String(account.nickname || account.username || 'admin') })
              wx.showToast({ title: isLogin ? '登录成功' : '注册成功', icon: 'success' })
              this.loadDashboard()
            })
          }
        })
      }
    })
  },
  loadDashboard() {
    Promise.all([
      this.callApi('getAdminDashboard'),
      this.callApi('getAdminRiders'),
      this.callApi('getAdminAreas'),
      this.callApi('getAdminOrders')
    ]).then(([dashboard, riders, areas, orders]) => {
      if (dashboard.success && dashboard.data) {
        this.setData({ stats: dashboard.data })
      }
      if (riders.success) this.setData({ riders: riders.data || [] })
      if (areas.success) this.setData({ areas: areas.data || [] })
      if (orders.success && Array.isArray(orders.data)) {
        const warnings = (orders.data || []).filter(item => ['待接单', '配送中', '待处理'].includes(item.status)).slice(0, 5).map((o, i) => ({
          id: i + 1,
          orderId: o.orderId || o.id,
          status: o.status || '待处理',
          remainingTime: 10
        }))
        this.setData({ warnings })
      }
    }).catch(() => wx.showToast({ title: '加载失败', icon: 'none' }))
  },
  handleWarning(e) {
    const warningId = e.currentTarget.dataset.id
    const warning = (this.data.warnings || []).find(item => item.id === warningId)
    wx.showModal({
      title: '处理订单预警',
      content: '确定要处理这个订单预警吗？',
      success: (res) => {
        if (res.confirm) {
          this.callApi('markComplete', { orderId: warning && warning.orderId }).then(result => {
            wx.showToast({
              title: result.success ? '处理成功' : (result.message || '处理失败'),
              icon: result.success ? 'success' : 'none'
            })
            if (result.success) this.loadDashboard()
          })
        }
      }
    })
  },
  viewRiderDetail(e) {
    const riderId = e.currentTarget.dataset.id
    wx.switchTab({ url: '/pages/riders/riders' })
  },
  viewAreaDetail(e) {
    const areaId = e.currentTarget.dataset.id
    wx.switchTab({ url: '/pages/areas/areas' })
  },
  navigateToOrders() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },
  navigateToRiders() {
    wx.switchTab({ url: '/pages/riders/riders' })
  },
  navigateToAreas() {
    wx.switchTab({ url: '/pages/areas/areas' })
  },
  navigateToComplaints() {
    wx.switchTab({ url: '/pages/complaints/complaints' })
  }
})