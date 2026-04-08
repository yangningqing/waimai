Page({
  data: {
    showFenceModal: false,
    fenceData: {
      name: '',
      description: ''
    },
    areas: [
      {
        id: 1,
        name: '顺义区',
        status: '已启用',
        riderCount: 15,
        todayOrders: 45,
        yesterdayOrders: 38
      },
      {
        id: 2,
        name: '朝阳区',
        status: '已启用',
        riderCount: 20,
        todayOrders: 68,
        yesterdayOrders: 59
      },
      {
        id: 3,
        name: '海淀区',
        status: '已禁用',
        riderCount: 0,
        todayOrders: 0,
        yesterdayOrders: 0
      }
    ]
  },
  onLoad(options) {
    this.loadAreas()
  },
  onShow() {
    this.loadAreas()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadAreas() {
    this.callApi('getAdminAreas').then(result => {
      if (result.success && Array.isArray(result.data) && result.data.length) {
        this.setData({ areas: result.data })
      }
    }).catch(() => {})
  },
  addArea() {
    wx.showModal({
      title: '新增区域',
      editable: true,
      placeholderText: '请输入区域名称',
      success: (res) => {
        if (!res.confirm) return
        const name = String(res.content || '').trim()
        if (!name) return
        this.callApi('saveAdminArea', { name }).then(result => {
          wx.showToast({ title: result.success ? '区域新增成功' : (result.message || '新增失败'), icon: result.success ? 'success' : 'none' })
          if (result.success) this.loadAreas()
        })
      }
    })
  },
  editArea(e) {
    const areaId = e.currentTarget.dataset.id
    const area = (this.data.areas || []).find(item => item.id === areaId)
    wx.showModal({
      title: '编辑区域',
      editable: true,
      content: area ? area.name : '',
      success: (res) => {
        if (!res.confirm) return
        this.callApi('saveAdminArea', { id: areaId, name: String(res.content || '').trim() }).then(result => {
          wx.showToast({ title: result.success ? '区域编辑成功' : (result.message || '编辑失败'), icon: result.success ? 'success' : 'none' })
          if (result.success) this.loadAreas()
        })
      }
    })
  },
  deleteArea(e) {
    const areaId = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除区域',
      content: '确定要删除这个区域吗？',
      success: (res) => {
        if (!res.confirm) return
        this.callApi('deleteAdminArea', { id: areaId }).then(result => {
          wx.showToast({ title: result.success ? '区域删除成功' : (result.message || '删除失败'), icon: result.success ? 'success' : 'none' })
          if (result.success) this.loadAreas()
        })
      }
    })
  },
  setFence(e) {
    this.setData({ showFenceModal: true })
  },
  closeFenceModal() {
    this.setData({ showFenceModal: false })
  },
  drawFence() {
    this.setData({
      fenceData: {
        ...this.data.fenceData,
        description: '已开启绘制模式'
      }
    })
    wx.showToast({
      title: '请在地图页完成围栏绘制',
      icon: 'none'
    })
  },
  clearFence() {
    this.setData({
      fenceData: {
        ...this.data.fenceData,
        description: ''
      }
    })
    wx.showToast({
      title: '围栏已清除',
      icon: 'success'
    })
  },
  saveFence() {
    this.callApi('saveAdminArea', {
      id: this.data.areas[0] && this.data.areas[0].id,
      name: (this.data.areas[0] && this.data.areas[0].name) || '默认区域',
      description: JSON.stringify(this.data.fenceData || {})
    }).then(result => {
      wx.showToast({
        title: result.success ? '围栏保存成功' : (result.message || '保存失败'),
        icon: result.success ? 'success' : 'none'
      })
    })
    this.setData({ showFenceModal: false })
  }
})