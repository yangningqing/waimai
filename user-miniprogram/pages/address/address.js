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
    ],
    loadingAddresses: false,
    hasLoadedAddresses: false
  },
  onLoad() {
    // 页面加载时的初始化逻辑
  },
  onShow() {
    if (!this.data.hasLoadedAddresses) {
      this.loadAddresses()
    }
  },
  callApi(action, payload = {}) {
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: payload }
    }).then(res => (res && res.result) || {})
  },
  normalizeAddresses(list) {
    const arr = Array.isArray(list) ? list : []
    return arr.map(item => ({
      id: item.id || item._id || '',
      name: item.name || '',
      phone: item.phone || '',
      address: item.address || '',
      isDefault: !!item.isDefault,
      image: item.image || ''
    })).filter(a => !!a.id)
  },
  loadAddresses() {
    if (this.data.loadingAddresses) return
    this.setData({ loadingAddresses: true })
    const localAddresses = this.data.addresses || []
    this.callApi('getAddresses').then(result => {
      if (result.success && Array.isArray(result.data)) {
        this.setData({
          addresses: this.normalizeAddresses(result.data),
          hasLoadedAddresses: true
        })
      } else {
        this.setData({ addresses: localAddresses })
      }
    }).catch(err => {
      console.error('获取地址失败:', err)
      this.setData({ addresses: localAddresses })
    }).finally(() => {
      this.setData({ loadingAddresses: false })
    })
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
          const isDefault = this.data.addresses.length === 0
          wx.showLoading({ title: '保存中...' })
          this.callApi('addAddress', {
            name: '新用户',
            phone: '138****0000',
            address: res.content,
            isDefault
          }).then(result => {
            if (result.success) {
              wx.showToast({ title: '添加地址成功', icon: 'success' })
              this.loadAddresses()
            } else {
              wx.showToast({ title: result.message || '添加失败', icon: 'none' })
            }
          }).catch(err => {
            console.error('添加地址失败:', err)
            wx.showToast({ title: '网络错误', icon: 'none' })
          }).finally(() => wx.hideLoading())
        }
      }
    })
  },
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        const isDefault = this.data.addresses.length === 0
        wx.showLoading({ title: '保存中...' })
        this.callApi('addAddress', {
          name: '新用户',
          phone: '138****0000',
          address: res.address,
          isDefault
        }).then(result => {
          if (result.success) {
            wx.showToast({ title: '添加地址成功', icon: 'success' })
            this.loadAddresses()
          } else {
            wx.showToast({ title: result.message || '添加失败', icon: 'none' })
          }
        }).catch(err => {
          console.error('添加地址失败:', err)
          wx.showToast({ title: '网络错误', icon: 'none' })
        }).finally(() => wx.hideLoading())
      }
    })
  },
  uploadLocationImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const isDefault = this.data.addresses.length === 0
        wx.showLoading({ title: '保存中...' })
        this.callApi('addAddress', {
          name: '新用户',
          phone: '138****0000',
          address: '拍照位置',
          image: res.tempFilePaths[0],
          isDefault
        }).then(result => {
          if (result.success) {
            wx.showToast({ title: '添加地址成功', icon: 'success' })
            this.loadAddresses()
          } else {
            wx.showToast({ title: result.message || '添加失败', icon: 'none' })
          }
        }).catch(err => {
          console.error('添加地址失败:', err)
          wx.showToast({ title: '网络错误', icon: 'none' })
        }).finally(() => wx.hideLoading())
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
          wx.showLoading({ title: '保存中...' })
          this.callApi('updateAddress', { id: address.id, address: res.content }).then(result => {
            if (result.success) {
              wx.showToast({ title: '编辑成功', icon: 'success' })
              this.loadAddresses()
            } else {
              wx.showToast({ title: result.message || '编辑失败', icon: 'none' })
            }
          }).catch(err => {
            console.error('编辑地址失败:', err)
            wx.showToast({ title: '网络错误', icon: 'none' })
          }).finally(() => wx.hideLoading())
        }
      }
    })
  },
  deleteAddress(e) {
    const index = e.currentTarget.dataset.index
    const address = this.data.addresses[index]
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          this.callApi('deleteAddress', { id: address && address.id }).then(result => {
            if (result.success) {
              wx.showToast({ title: '删除成功', icon: 'success' })
              this.loadAddresses()
            } else {
              wx.showToast({ title: result.message || '删除失败', icon: 'none' })
            }
          }).catch(err => {
            console.error('删除地址失败:', err)
            wx.showToast({ title: '网络错误', icon: 'none' })
          }).finally(() => wx.hideLoading())
        }
      }
    })
  },
  setDefault(e) {
    const index = e.currentTarget.dataset.index
    const address = this.data.addresses[index]
    if (!address || !address.id) {
      wx.showToast({ title: '地址无效', icon: 'none' })
      return
    }
    wx.showLoading({ title: '设置中...' })
    this.callApi('setDefaultAddress', { id: address.id }).then(result => {
      if (result.success) {
        wx.showToast({ title: '已设为默认', icon: 'success' })
        this.loadAddresses()
      } else {
        wx.showToast({ title: result.message || '设置失败', icon: 'none' })
      }
    }).catch(err => {
      console.error('设置默认地址失败:', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => wx.hideLoading())
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