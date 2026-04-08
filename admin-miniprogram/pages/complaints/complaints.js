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
    this.loadComplaints()
  },
  onShow() {
    this.loadComplaints()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadComplaints() {
    this.callApi('getAdminComplaints').then(result => {
      if (result.success && Array.isArray(result.data)) {
        this.setData({ complaints: result.data })
      }
    }).catch(() => {})
  },
  handleComplaint(e) {
    const complaintId = Number(e.currentTarget.dataset.id)
    wx.showModal({
      title: '处理投诉',
      editable: true,
      placeholderText: '请输入处理结果',
      success: (res) => {
        if (res.confirm) {
          this.callApi('handleComplaint', {
            id: complaintId,
            handleResult: String(res.content || '已处理')
          }).then(result => {
            wx.showToast({
              title: result.success ? '投诉处理成功' : (result.message || '处理失败'),
              icon: result.success ? 'success' : 'none'
            })
            if (result.success) this.loadComplaints()
          })
        }
      }
    })
  },
  viewComplaintDetail(e) {
    const complaintId = e.currentTarget.dataset.id
    const complaint = (this.data.complaints || []).find(item => item.id === complaintId)
    wx.showModal({
      title: '投诉详情',
      content: complaint ? `用户：${complaint.customer || ''}\n内容：${complaint.content || ''}\n状态：${complaint.status || ''}` : '无详情',
      showCancel: false
    })
  }
})