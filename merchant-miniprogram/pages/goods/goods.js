Page({
  data: {
    allGoods: [],
    goodsList: [],
    categories: ['全部', '主食', '饮料', '小吃'],
    currentCategory: '全部',
    searchText: '',
    loading: true
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadGoods()
  },
  onShow() {
    this.loadGoods()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  getMerchantId() {
    return getApp().getMerchantId()
  },
  loadGoods() {
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中...' })
    const merchantId = this.getMerchantId()
    if (!merchantId) {
      wx.showToast({ title: '未获取到商家信息', icon: 'none' })
      this.setData({ loading: false })
      wx.hideLoading()
      return
    }
    this.callApi('getMerchantGoods', { merchantId }).then(result => {
      if (result.success && Array.isArray(result.data)) {
        this.setData({ allGoods: result.data })
      } else {
        this.setData({ allGoods: [] })
      }
      this.applyCategoryFilter()
    }).catch(() => {
      console.log('加载失败')
      this.setData({ allGoods: [] })
      this.applyCategoryFilter()
    }).finally(() => {
      this.setData({ loading: false })
      wx.hideLoading()
    })
  },
  applyCategoryFilter() {
    const { allGoods, currentCategory, searchText } = this.data
    let filtered = allGoods
    if (currentCategory !== '全部') {
      filtered = filtered.filter(item => item.category === currentCategory)
    }
    if (searchText) {
      const text = searchText.toLowerCase()
      filtered = filtered.filter(item => item.name.toLowerCase().includes(text))
    }
    this.setData({ goodsList: filtered })
  },
  handleCategoryChange(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category })
    this.applyCategoryFilter()
  },
  handleSearchInput(e) {
    this.setData({ searchText: e.detail.value })
    this.applyCategoryFilter()
  },
  handleAddGoods() {
    wx.navigateTo({
      url: '/pages/goods/edit/edit'
    })
  },
  handleEditGoods(e) {
    const goodsId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/goods/edit/edit?id=${goodsId}`
    })
  },
  handleDeleteGoods(e) {
    const goodsId = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除商品',
      content: '确定要删除这个商品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          const merchantId = this.getMerchantId()
          this.callApi('saveMerchantGoods', {
            id: goodsId,
            merchantId: merchantId,
            status: '已下架'
          }).then(result => {
            if (result.success) {
              wx.showToast({ title: '商品删除成功', icon: 'success' })
              this.loadGoods()
            } else {
              wx.showToast({ title: result.message || '删除失败', icon: 'none' })
            }
          }).catch(() => {
            wx.showToast({ title: '网络错误', icon: 'none' })
          }).finally(() => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  handleGoodsAction(e) {
    const action = e.currentTarget.dataset.action
    if (action === 'edit') {
      this.handleEditGoods(e)
    } else if (action === 'delete') {
      this.handleDeleteGoods(e)
    }
  }
})