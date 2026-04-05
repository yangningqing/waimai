Page({
  data: {
    categoryList: ['全部商品', '热销商品', '新品上架'],
    currentCategory: 0,
    goodsList: [
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
    ]
  },
  onLoad() {
    // 页面加载
  },
  switchCategory(e) {
    this.setData({
      currentCategory: e.currentTarget.dataset.index
    })
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
          const goodsList = this.data.goodsList
          goodsList[index].name = res.content
          this.setData({ goodsList })
          wx.showToast({
            title: '编辑成功',
            icon: 'success'
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
          const goodsList = this.data.goodsList
          goodsList[index].status = goods.status === '上架中' ? '已下架' : '上架中'
          this.setData({ goodsList })
          wx.showToast({
            title: goods.status === '上架中' ? '下架成功' : '上架成功',
            icon: 'success'
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
          const newGoods = {
            id: Date.now(),
            name: res.content,
            price: 0,
            status: '上架中',
            icon: '🍽️',
            sales: 0
          }
          this.setData({
            goodsList: [...this.data.goodsList, newGoods]
          })
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          })
        }
      }
    })
  }
})