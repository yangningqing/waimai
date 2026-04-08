Page({
  data: {
    categories: [],
    activeCategory: '',
    currentCategoryName: '',
    currentGoods: [],
    goods: {},
    loading: false,
    hasLoaded: false,
    lastLoadedAt: 0
  },
  onLoad() {
    this.loadCategoryCache()
    if (!this.data.hasLoaded) {
      this.loadCategoriesAndGoods()
    }
  },
  onShow() {
    if (!this.data.hasLoaded) {
      this.loadCategoriesAndGoods()
    }
  },
  loadCategoryCache() {
    try {
      const cached = wx.getStorageSync('user_category_cache')
      if (!cached || !Array.isArray(cached.categories) || !cached.goods) return
      if (cached.version !== 2) return
      const firstId = cached.activeCategory || (cached.categories[0] && cached.categories[0].id) || ''
      this.setData({
        categories: cached.categories,
        goods: cached.goods,
        activeCategory: String(firstId),
        hasLoaded: true,
        lastLoadedAt: Number(cached.updatedAt || 0)
      })
      this.updateCurrentCategory()
    } catch (err) {
      console.warn('读取分类缓存失败:', err)
    }
  },
  saveCategoryCache(payload) {
    try {
      wx.setStorageSync('user_category_cache', {
        version: 2,
        updatedAt: Date.now(),
        categories: payload.categories || [],
        goods: payload.goods || {},
        activeCategory: payload.activeCategory || ''
      })
    } catch (err) {
      console.warn('保存分类缓存失败:', err)
    }
  },
  callApi(action, data = {}) {
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data }
    }).then(res => (res && res.result) || {})
  },
  loadCategoriesAndGoods() {
    if (this.data.loading) return
    this.setData({ loading: true })
    this.callApi('getMerchants').then(async result => {
      if (!result.success || !Array.isArray(result.data)) {
        wx.showToast({ title: result.message || '获取分类失败', icon: 'none' })
        return
      }
      const merchants = result.data
      const groups = {}
      merchants.forEach(item => {
        const typeName = this.getMerchantType(item)
        if (!groups[typeName]) groups[typeName] = []
        groups[typeName].push({
          id: Number(item.id || 0),
          name: item.name || '未知店铺',
          description: item.description || '',
          image: item.image || '',
          minPrice: Number(item.minPrice || 0),
          rating: Number(item.rating || 0),
          distance: item.distance || ''
        })
      })
      const categories = Object.keys(groups).map((name, idx) => ({ id: String(idx + 1), name }))
      const goodsMap = {}
      categories.forEach(c => {
        goodsMap[c.id] = groups[c.name] || []
      })
      const firstId = categories.length ? String(categories[0].id) : ''
      this.setData({
        categories,
        goods: goodsMap,
        activeCategory: firstId,
        hasLoaded: true,
        lastLoadedAt: Date.now()
      })
      this.saveCategoryCache({ categories, goods: goodsMap, activeCategory: firstId })
      this.updateCurrentCategory()
    }).catch(err => {
      console.error('加载分类数据失败:', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      this.setData({ loading: false })
    })
  },
  updateCurrentCategory() {
    const activeCategory = String(this.data.activeCategory || '')
    const category = this.data.categories.find(c => c.id === activeCategory)
    const currentGoods = this.data.goods[activeCategory] || []
    this.setData({
      currentCategoryName: category ? category.name : '',
      currentGoods: currentGoods
    })
  },
  getMerchantType(merchant) {
    const explicit = String((merchant && (merchant.type || merchant.category)) || '').trim()
    if (explicit) return explicit
    const desc = String((merchant && merchant.description) || '').trim()
    if (desc.includes('•')) {
      const first = desc.split('•')[0].trim()
      if (first) return first
    }
    return '其他'
  },
  switchCategory(e) {
    const categoryId = String(e.currentTarget.dataset.id || '')
    if (!categoryId) return
    this.setData({
      activeCategory: categoryId
    })
    this.updateCurrentCategory()
  },
  navigateToMerchant(e) {
    const merchantId = Number(e.currentTarget.dataset.id || 0)
    if (!merchantId) return
    wx.navigateTo({
      url: `../goods/goods?id=${merchantId}`
    })
  }
})