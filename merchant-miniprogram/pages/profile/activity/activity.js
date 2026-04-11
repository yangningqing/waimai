Page({
  data: {
    activities: [
      {
        id: 1,
        title: '新用户优惠',
        description: '新用户下单立减10元',
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        status: '进行中'
      },
      {
        id: 2,
        title: '满减活动',
        description: '满30减5，满50减10',
        startDate: '2026-04-15',
        endDate: '2026-04-30',
        status: '进行中'
      },
      {
        id: 3,
        title: '周末特惠',
        description: '周末下单8折优惠',
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        status: '进行中'
      }
    ]
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadActivities()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadActivities() {
    // 这里可以调用API获取活动数据
    console.log('加载活动数据')
  },
  handleCreateActivity() {
    wx.showModal({
      title: '创建活动',
      content: '确定要创建新活动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '活动创建成功', icon: 'success' })
        }
      }
    })
  },
  handleBack() {
    wx.navigateBack()
  }
})
