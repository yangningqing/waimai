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
    // 页面加载时的初始化逻辑
  },
  onShow() {
    // 页面显示时的逻辑
  },
  viewRiderDetail(e) {
    const riderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '骑手详情',
      content: '骑手详情页面',
      success: (res) => {
        if (res.confirm) {
          // 跳转到骑手详情页
        }
      }
    })
  },
  editRider(e) {
    const riderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '编辑骑手',
      content: '确定要编辑这个骑手吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '骑手编辑成功',
            icon: 'success'
          })
        }
      }
    })
  }
})