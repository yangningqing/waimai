Page({
  data: {
    addresses: [],
    loadingAddresses: false,
    hasLoadedAddresses: false,
    selectMode: false
  },
  onLoad(options = {}) {
    this.setData({ selectMode: String(options.mode || '') === 'select' })
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
    const maskPhone = (phone) => {
      const p = String(phone || '').trim()
      if (/^1\d{10}$/.test(p)) return `${p.slice(0, 3)}****${p.slice(7)}`
      return p
    }
    return arr.map(item => ({
      id: item.id || item._id || '',
      name: item.name || '',
      phone: maskPhone(item.phone),
      phoneRaw: String(item.phone || ''),
      address: item.address || '',
      isDefault: !!item.isDefault,
      image: item.image || ''
    })).filter(a => !!a.id)
  },
  onBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/member/member' }) })
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
  navigateToAddAddress() {
    wx.navigateTo({ url: './form/form' })
  },
  editAddress(e) {
    const index = e.currentTarget.dataset.index
    const address = this.data.addresses[index]
    if (!address || !address.id) return
    wx.navigateTo({ url: `./form/form?id=${encodeURIComponent(String(address.id))}` })
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
    const selected = this.data.addresses[index]
    if (!selected) return
    wx.setStorageSync('selectedAddress', {
      ...selected,
      phone: selected.phoneRaw || selected.phone
    })
    wx.showToast({
      title: '已选择地址',
      icon: 'success'
    })
    if (this.data.selectMode) {
      setTimeout(() => {
        wx.navigateBack({
          fail: () => {}
        })
      }, 220)
    }
  }
})