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
    // 页面加载时的初始化逻辑
  },
  onShow() {
    // 页面显示时的逻辑
  },
  addArea() {
    wx.showModal({
      title: '新增区域',
      content: '确定要新增区域吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '区域新增成功',
            icon: 'success'
          })
        }
      }
    })
  },
  editArea(e) {
    const areaId = e.currentTarget.dataset.id
    wx.showModal({
      title: '编辑区域',
      content: '确定要编辑这个区域吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '区域编辑成功',
            icon: 'success'
          })
        }
      }
    })
  },
  deleteArea(e) {
    const areaId = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除区域',
      content: '确定要删除这个区域吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '区域删除成功',
            icon: 'success'
          })
        }
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
    wx.showToast({
      title: '开始绘制围栏',
      icon: 'success'
    })
  },
  clearFence() {
    wx.showToast({
      title: '围栏已清除',
      icon: 'success'
    })
  },
  saveFence() {
    wx.showToast({
      title: '围栏保存成功',
      icon: 'success'
    })
    this.setData({ showFenceModal: false })
  }
})