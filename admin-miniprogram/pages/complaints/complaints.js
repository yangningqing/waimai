Page({
  data: {
    complaints: [
      {
        id: 1,
        complaintId: '20260406001',
        status: '待处理',
        customer: '张三',
        orderId: '20260406123456',
        type: '配送问题',
        time: '2026-04-06 12:30',
        content: '骑手配送超时，服务态度差。'
      }
    ]
  },
  onLoad() {
    // 页面加载时的初始化逻辑
  },
  onShow() {
    // 页面显示时的逻辑
  },
  handleComplaint(e) {
    const complaintId = e.currentTarget.dataset.id
    wx.showModal({
      title: '处理投诉',
      content: '确定要处理这个投诉吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '投诉处理成功',
            icon: 'success'
          })
        }
      }
    })
  },
  viewComplaintDetail(e) {
    const complaintId = e.currentTarget.dataset.id
    wx.showModal({
      title: '投诉详情',
      content: '投诉详情页面',
      success: (res) => {
        if (res.confirm) {
          // 跳转到投诉详情页
        }
      }
    })
  }
})