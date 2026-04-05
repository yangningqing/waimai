Page({
  data: {
    addresses: [
      {
        id: 1,
        name: '张三',
        phone: '138****1234',
        address: '北京市顺义区北京城市学院顺义校区',
        isDefault: true,
        image: '../../images/ai_example1.png'
      },
      {
        id: 2,
        name: '李四',
        phone: '139****5678',
        address: '北京市朝阳区望京SOHO',
        isDefault: false
      }
    ]
  },
  onLoad() {
    // 页面加载时的初始化逻辑
  },
  onShow() {
    // 页面显示时的逻辑
  },
  addAddress() {
    // 添加新地址
    wx.showToast({
      title: '添加地址功能开发中',
      icon: 'none'
    })
  },
  editAddress() {
    // 编辑地址
    wx.showToast({
      title: '编辑地址功能开发中',
      icon: 'none'
    })
  },
  deleteAddress() {
    // 删除地址
    wx.showToast({
      title: '删除地址功能开发中',
      icon: 'none'
    })
  }
})