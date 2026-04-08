Page({
  data: {
    categoryList: ['全部商品', '热销商品', '新品上架'],
    currentCategory: 0,
    allGoods: [
      {
        id: 1,
        name: '香辣鸡腿堡',
        price: 18,
        status: '上架中',
        icon: '🍔',
        sales: 1234
      },
      {
        id: 2,
        name: '薯条（大）',
        price: 12,
        status: '上架中',
        icon: '🍟',
        sales: 892
      }
    ],
    goodsList: []
  },
  onLoad() {
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
  loadGoods() {
    if (!getApp().isLoggedIn()) {
      this.setData({ allGoods: [], goodsList: [] })
      return
    }
    this.callApi('getMerchantGoods', { merchantId: 1 }).then(result => {
      const allGoods = result.success ? (result.data || []) : []
      this.setData({ allGoods })
      this.applyCategoryFilter()
    }).catch(() => wx.showToast({ title: '加载失败', icon: 'none' }))
  },
  switchCategory(e) {
    this.setData({
      currentCategory: e.currentTarget.dataset.index
    })
    this.applyCategoryFilter()
  },
  applyCategoryFilter() {
    const { currentCategory, allGoods } = this.data
    let goodsList = [...(allGoods || [])]
    if (currentCategory === 1) {
      goodsList = goodsList.filter(item => Number(item.sales || 0) >= 500)
    } else if (currentCategory === 2) {
      goodsList = goodsList.filter(item => Number(item.id || 0) >= 500)
    }
    this.setData({ goodsList })
  },
  editGoods(e) {
    const index = e.currentTarget.dataset.index
    const goods = this.data.goodsList[index]
    
    wx.showModal({
      title: '编辑商品',
      editable: true,
      content: goods.name,
      success: (res) => {
        if (res.confirm && res.content) {
          this.callApi('saveMerchantGoods', {
            id: goods.id,
            merchantId: 1,
            name: res.content,
            price: goods.price,
            status: goods.status,
            icon: goods.icon,
            sales: goods.sales
          }).then(result => {
            wx.showToast({ title: result.success ? '编辑成功' : (result.message || '编辑失败'), icon: result.success ? 'success' : 'none' })
            if (result.success) this.loadGoods()
          })
        }
      }
    })
  },
  offGoods(e) {
    const index = e.currentTarget.dataset.index
    const goods = this.data.goodsList[index]
    
    wx.showModal({
      title: goods.status === '上架中' ? '确认下架' : '确认上架',
      content: goods.status === '上架中' ? '确定要下架这个商品吗？' : '确定要上架这个商品吗？',
      success: (res) => {
        if (res.confirm) {
          const nextStatus = goods.status === '上架中' ? '已下架' : '上架中'
          this.callApi('saveMerchantGoods', {
            id: goods.id,
            merchantId: 1,
            name: goods.name,
            price: goods.price,
            status: nextStatus,
            icon: goods.icon,
            sales: goods.sales
          }).then(result => {
            wx.showToast({ title: result.success ? (nextStatus === '上架中' ? '上架成功' : '下架成功') : (result.message || '操作失败'), icon: result.success ? 'success' : 'none' })
            if (result.success) this.loadGoods()
          })
        }
      }
    })
  },
  addGoods() {
    wx.showModal({
      title: '添加商品',
      editable: true,
      placeholderText: '请输入商品名称',
      success: (res) => {
        if (res.confirm && res.content) {
          this.callApi('saveMerchantGoods', {
            merchantId: 1,
            name: res.content,
            price: 0,
            status: '上架中',
            icon: '🍽️',
            sales: 0
          }).then(result => {
            wx.showToast({ title: result.success ? '添加成功' : (result.message || '添加失败'), icon: result.success ? 'success' : 'none' })
            if (result.success) this.loadGoods()
          })
        }
      }
    })
  }
})