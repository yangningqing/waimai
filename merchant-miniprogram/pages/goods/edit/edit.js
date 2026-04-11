Page({
  data: {
    goodsId: null,
    name: '',
    price: '',
    category: '其他',
    status: '上架中',
    sales: 0,
    image: '',
    categories: ['其他', '主食', '饮料', '小吃', '套餐', '甜点', '水果', '蔬菜', '肉类', '海鲜']
  },
  onLoad(options) {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    const goodsId = options.id
    if (goodsId) {
      this.setData({ goodsId })
      this.loadGoodsDetail(goodsId)
    }
  },
  getMerchantId() {
    return getApp().getMerchantId()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  loadGoodsDetail(goodsId) {
    wx.showLoading({ title: '加载中...' })
    const merchantId = this.getMerchantId()
    if (!merchantId) {
      wx.hideLoading()
      wx.showToast({ title: '未获取到商家信息', icon: 'none' })
      return
    }
    this.callApi('getMerchantGoods', { merchantId }).then(result => {
      if (result.success && Array.isArray(result.data)) {
        const gid = Number(goodsId)
        const goods = result.data.find(item => Number(item.id) === gid)
        if (goods) {
          this.setData({
            name: goods.name || '',
            price: goods.price || '',
            category: goods.category || '其他',
            status: goods.status || '上架中',
            sales: goods.sales || 0,
            image: goods.image || ''
          })
        }
      }
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },
  handleNameInput(e) {
    this.setData({ name: e.detail.value })
  },
  handlePriceInput(e) {
    this.setData({ price: e.detail.value })
  },
  handleCategoryChange(e) {
    const category = this.data.categories[e.detail.value]
    this.setData({ category })
  },
  handleStatusChange(e) {
    const statuses = ['上架中', '已下架']
    this.setData({ status: statuses[e.detail.value] })
  },
  handleSalesInput(e) {
    this.setData({ sales: e.detail.value })
  },
  handleImageInput(e) {
    this.setData({ image: e.detail.value })
  },
  handleSave() {
    const { goodsId, name, price, category, status, sales, image } = this.data
    if (!name.trim()) {
      return wx.showToast({ title: '请输入商品名称', icon: 'none' })
    }
    if (!price || isNaN(price)) {
      return wx.showToast({ title: '请输入正确的价格', icon: 'none' })
    }
    wx.showLoading({ title: '保存中...' })
    const merchantId = this.getMerchantId()
    if (!merchantId) {
      wx.hideLoading()
      wx.showToast({ title: '未获取到商家信息', icon: 'none' })
      return
    }
    this.callApi('saveMerchantGoods', {
      id: goodsId,
      merchantId: merchantId,
      name,
      price: parseFloat(price),
      category,
      status,
      sales: parseInt(sales) || 0,
      image
    }).then(result => {
      if (result.success) {
        wx.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      } else {
        wx.showToast({ title: result.message || '保存失败', icon: 'none' })
      }
    }).catch(() => {
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  handleCancel() {
    wx.navigateBack()
  }
})
