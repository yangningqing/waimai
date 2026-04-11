Page({
  data: {
    evaluations: [
      {
        id: 1,
        user: '张三',
        avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar&image_size=square_hd',
        rating: 5,
        content: '商品非常好，配送速度也很快，下次还会再来！',
        time: '2026-04-10 12:30',
        goods: '香辣鸡腿堡'
      },
      {
        id: 2,
        user: '李四',
        avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar&image_size=square_hd',
        rating: 4,
        content: '味道不错，就是稍微有点咸，希望可以改进一下。',
        time: '2026-04-09 18:45',
        goods: '可乐'
      },
      {
        id: 3,
        user: '王五',
        avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar&image_size=square_hd',
        rating: 5,
        content: '服务态度很好，商品质量也很棒，强烈推荐！',
        time: '2026-04-08 21:15',
        goods: '薯条'
      }
    ]
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadEvaluations()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadEvaluations() {
    // 这里可以调用API获取用户评价数据
    console.log('加载用户评价数据')
  },
  handleBack() {
    wx.navigateBack()
  }
})
