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
    wx.showActionSheet({
      itemList: ['手动输入地址', '地图选址', '拍照上传位置'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.showAddAddressModal('manual')
        } else if (res.tapIndex === 1) {
          this.chooseLocation()
        } else if (res.tapIndex === 2) {
          this.uploadLocationImage()
        }
      }
    })
  },
  showAddAddressModal(type) {
    wx.showModal({
      title: '添加新地址',
      editable: true,
      placeholderText: '请输入地址详情',
      success: (res) => {
        if (res.confirm && res.content) {
          const newAddress = {
            id: Date.now(),
            name: '新用户',
            phone: '138****0000',
            address: res.content,
            isDefault: this.data.addresses.length === 0
          }
          this.setData({
            addresses: [...this.data.addresses, newAddress]
          })
          wx.showToast({
            title: '添加地址成功',
            icon: 'success'
          })
        }
      }
    })
  },
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        const newAddress = {
          id: Date.now(),
          name: '新用户',
          phone: '138****0000',
          address: res.address,
          isDefault: this.data.addresses.length === 0
        }
        this.setData({
          addresses: [...this.data.addresses, newAddress]
        })
        wx.showToast({
          title: '添加地址成功',
          icon: 'success'
        })
      }
    })
  },
  uploadLocationImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newAddress = {
          id: Date.now(),
          name: '新用户',
          phone: '138****0000',
          address: '拍照位置',
          isDefault: this.data.addresses.length === 0,
          image: res.tempFilePaths[0]
        }
        this.setData({
          addresses: [...this.data.addresses, newAddress]
        })
        wx.showToast({
          title: '添加地址成功',
          icon: 'success'
        })
      }
    })
  },
  editAddress(e) {
    const index = e.currentTarget.dataset.index
    const address = this.data.addresses[index]
    wx.showModal({
      title: '编辑地址',
      editable: true,
      content: address.address,
      success: (res) => {
        if (res.confirm && res.content) {
          const addresses = this.data.addresses
          addresses[index].address = res.content
          this.setData({ addresses })
          wx.showToast({
            title: '编辑成功',
            icon: 'success'
          })
        }
      }
    })
  },
  deleteAddress(e) {
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (res.confirm) {
          const addresses = this.data.addresses
          addresses.splice(index, 1)
          this.setData({ addresses })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },
  setDefault(e) {
    const index = e.currentTarget.dataset.index
    const addresses = this.data.addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index
    }))
    this.setData({ addresses })
    wx.showToast({
      title: '已设为默认',
      icon: 'success'
    })
  },
  selectAddress(e) {
    const index = e.currentTarget.dataset.index
    wx.setStorageSync('selectedAddress', this.data.addresses[index])
    wx.showToast({
      title: '已选择地址',
      icon: 'success'
    })
    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
  }
})