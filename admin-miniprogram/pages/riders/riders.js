Page({
  data: {
    riders: [
      {
        id: 1,
        name: '王师傅',
        phone: '138****5678',
        status: '配送中',
        todayOrders: 12,
        totalOrders: 1234,
        avatar: '../../images/avatar.png'
      }
    ]
  },
  onLoad() {
    this.loadRiders()
  },
  onShow() {
    this.loadRiders()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadRiders() {
    this.callApi('getAdminRiders').then(result => {
      this.setData({ riders: result.success ? (result.data || []) : [] })
    }).catch(() => wx.showToast({ title: '加载失败', icon: 'none' }))
  },
  viewRiderDetail(e) {
    const riderId = e.currentTarget.dataset.id
    const rider = (this.data.riders || []).find(item => item.id === riderId)
    wx.showModal({
      title: '骑手详情',
      content: rider
        ? `姓名：${rider.name || ''}\n电话：${rider.phone || ''}\n完成单量：${rider.completed || rider.totalOrders || 0}\n评分：${rider.rating || 0}`
        : '未找到骑手信息',
      showCancel: false
    })
  },
  editRider(e) {
    const riderId = e.currentTarget.dataset.id
    const riderIndex = (this.data.riders || []).findIndex(item => item.id === riderId)
    wx.showModal({
      title: '编辑骑手',
      editable: true,
      placeholderText: '请输入骑手姓名',
      success: (res) => {
        if (!res.confirm) return
        const name = String(res.content || '').trim()
        if (!name || riderIndex < 0) return
        const riders = [...this.data.riders]
        riders[riderIndex] = { ...riders[riderIndex], name }
        this.setData({ riders })
        wx.showToast({
          title: '骑手信息已更新',
          icon: 'success'
        })
      }
    })
  }
})