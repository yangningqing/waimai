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
  submitFeedback() {
    if (!this.data.feedbackContent) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }
    
    // 提交反馈
    wx.showToast({
      title: '反馈提交成功',
      icon: 'success'
    })
    
    // 跳转到上一页
    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
  }
})