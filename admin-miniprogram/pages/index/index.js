Page({
  data: {
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
    // 页面加载时的初始化逻辑
  },
  onShow() {
    // 页面显示时的逻辑
  },
  handleWarning(e) {
    const warningId = e.currentTarget.dataset.id
    wx.showModal({
      title: '处理订单预警',
      content: '确定要处理这个订单预警吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '处理成功',
            icon: 'success'
          })
        }
      }
    })
  },
  viewRiderDetail(e) {
    const riderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../riders/riders?id=${riderId}`
    })
  },
  viewAreaDetail(e) {
    const areaId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../areas/areas?id=${areaId}`
    })
  },
  navigateToOrders() {
    wx.navigateTo({
      url: '../orders/orders'
    })
  },
  navigateToRiders() {
    wx.navigateTo({
      url: '../riders/riders'
    })
  },
  navigateToAreas() {
    wx.navigateTo({
      url: '../areas/areas'
    })
  },
  navigateToComplaints() {
    wx.navigateTo({
      url: '../complaints/complaints'
    })
  }
})