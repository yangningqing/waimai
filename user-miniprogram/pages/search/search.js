Page({
  data: {
    searchText: '',
    searchHistory: ['塔斯汀', '曼玲粥店', '汉堡', '粥'],
    hotSearch: ['汉堡', '粥', '披萨', '炸鸡', '奶茶', '水果'],
    showResults: false,
    searchResults: []
  },
  onLoad() {
    const cached = wx.getStorageSync('searchHistory')
    if (Array.isArray(cached) && cached.length) {
      this.setData({ searchHistory: cached })
    }
  },
  callApi(action, data = {}) {
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data }
    }).then(res => (res && res.result) || {})
  },
  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value
    })
  },
  doSearch() {
    const searchText = this.data.searchText.trim()
    if (!searchText) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      })
      return
    }
    
    const searchHistory = [...this.data.searchHistory]
    if (!searchHistory.includes(searchText)) {
      searchHistory.unshift(searchText)
      if (searchHistory.length > 10) {
        searchHistory.pop()
      }
    }
    wx.setStorageSync('searchHistory', searchHistory)

    wx.showLoading({ title: '搜索中...' })
    this.callApi('searchMerchants', { keyword: searchText }).then(result => {
      const searchResults = result.success && Array.isArray(result.data) ? result.data : []
      this.setData({
        searchHistory,
        searchResults,
        showResults: true
      })
      if (!result.success) {
        wx.showToast({ title: result.message || '搜索失败', icon: 'none' })
      }
    }).catch(err => {
      console.error('搜索失败:', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  cancelSearch() {
    wx.navigateBack()
  },
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            searchHistory: []
          })
          wx.setStorageSync('searchHistory', [])
        }
      }
    })
  },
  selectHistory(e) {
    const text = e.currentTarget.dataset.text
    this.setData({
      searchText: text
    })
    this.doSearch()
  },
  selectHotSearch(e) {
    const text = e.currentTarget.dataset.text
    this.setData({
      searchText: text
    })
    this.doSearch()
  },
  navigateToMerchant(e) {
    const merchantId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../goods/goods?id=${merchantId}`
    })
  }
})