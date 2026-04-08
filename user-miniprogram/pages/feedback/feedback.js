Page({
  data: {
    feedbackType: '建议',
    feedbackContent: '',
    feedbackImages: ['../../images/ai_example1.png'],
    contactInfo: ''
  },
  onLoad() {
    // 页面加载时的初始化逻辑
  },
  onShow() {
    // 页面显示时的逻辑
  },
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      feedbackType: type
    })
  },
  inputContent(e) {
    this.setData({
      feedbackContent: e.detail.value
    })
  },
  inputContact(e) {
    this.setData({
      contactInfo: e.detail.value
    })
  },
  uploadImage() {
    // 上传图片
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.setData({
          feedbackImages: [...this.data.feedbackImages, ...tempFilePaths]
        })
      }
    })
  },
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.feedbackImages
    images.splice(index, 1)
    this.setData({
      feedbackImages: images
    })
  },
  uploadToCloud(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return Promise.resolve(null)
    }
    if (filePath.startsWith('cloud://')) {
      return Promise.resolve(filePath)
    }
    if (!wx.cloud || !wx.cloud.uploadFile) {
      return Promise.resolve(null)
    }
    const ext = (filePath.split('.').pop() || 'png').toLowerCase()
    const cloudPath = `feedback/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`
    return wx.cloud.uploadFile({ cloudPath, filePath }).then(res => (res && res.fileID) || null).catch(() => null)
  },
  submitFeedback() {
    if (!this.data.feedbackContent) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '提交中...' })

    const images = (this.data.feedbackImages || []).slice(0, 9)
    Promise.all(images.map(p => this.uploadToCloud(p))).then(fileIDs => {
      const uploaded = fileIDs.filter(Boolean)
      return wx.cloud.callFunction({
        name: 'api',
        data: {
          action: 'submitFeedback',
          data: {
            feedbackType: this.data.feedbackType,
            feedbackContent: this.data.feedbackContent,
            contactInfo: this.data.contactInfo,
            images: uploaded
          }
        }
      })
    }).then(res => {
      const result = (res && res.result) || {}
      if (result.success) {
        wx.showToast({ title: '反馈提交成功', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 800)
      } else {
        wx.showToast({ title: result.message || '提交失败', icon: 'none' })
      }
    }).catch(err => {
      console.error('提交反馈失败:', err)
      wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  }
})