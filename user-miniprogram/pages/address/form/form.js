Page({
  data: {
    id: '',
    address: '',
    addressShort: '',
    addressDetail: '',
    doorNo: '',
    tagOptions: ['家', '公司', '学校'],
    tag: '家',
    contactName: '',
    gender: '先生',
    phone: '',
    mapMask: 'rgba(255,255,255,0.65)'
  },
  onLoad(options = {}) {
    const id = String(options.id || '')
    this.setData({ id })
    if (id) this.loadAddressDetail(id)
  },
  callApi(action, payload = {}) {
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: payload }
    }).then(res => (res && res.result) || {})
  },
  loadAddressDetail(id) {
    this.callApi('getAddresses').then(result => {
      if (!result.success || !Array.isArray(result.data)) return
      const hit = result.data.find(item => String(item.id || item._id || '') === String(id))
      if (!hit) return
      this.setData({
        address: String(hit.address || ''),
        addressShort: String(hit.address || '').split(' ')[0] || String(hit.address || ''),
        addressDetail: String(hit.address || ''),
        contactName: String(hit.name || ''),
        phone: String(hit.phone || '')
      })
    }).catch(() => {})
  },
  goBack() {
    wx.navigateBack()
  },
  onTapFeedback() {
    wx.navigateTo({ url: '../../feedback/feedback' })
  },
  chooseAddressFromMap() {
    const openChooser = () => {
      wx.chooseLocation({
        success: (res) => {
          const shortName = String(res.name || '').trim()
          const detailText = String(res.address || '').trim()
          const address = String(detailText || shortName).trim()
          if (!address) {
            wx.showToast({ title: '未获取到地址', icon: 'none' })
            return
          }
          this.setData({
            address,
            addressShort: shortName || address,
            addressDetail: detailText || address
          })
          wx.showToast({ title: '已选择地址', icon: 'success' })
        },
        fail: (err) => {
          const msg = String((err && err.errMsg) || '')
          wx.showToast({ title: msg ? '地址选择失败，请重试' : '地址选择失败', icon: 'none' })
        }
      })
    }
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          openChooser()
          return
        }
        wx.authorize({
          scope: 'scope.userLocation',
          success: openChooser,
          fail: () => {
            wx.showModal({
              title: '需要位置权限',
              content: '请在设置中开启位置信息权限后重试',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) wx.openSetting()
              }
            })
          }
        })
      },
      fail: () => openChooser()
    })
  },
  onInputDoorNo(e) {
    this.setData({ doorNo: String(e.detail.value || '') })
  },
  onInputContactName(e) {
    this.setData({ contactName: String(e.detail.value || '') })
  },
  onInputPhone(e) {
    this.setData({ phone: String(e.detail.value || '') })
  },
  chooseTag(e) {
    this.setData({ tag: String(e.currentTarget.dataset.tag || '家') })
  },
  chooseGender(e) {
    this.setData({ gender: String(e.currentTarget.dataset.gender || '先生') })
  },
  saveAddress() {
    const { id, address, doorNo, contactName, gender, phone } = this.data
    const fullAddress = `${String(address || '').trim()} ${String(doorNo || '').trim()}`.trim()
    if (!fullAddress) return wx.showToast({ title: '请选择收货地址', icon: 'none' })
    if (!contactName.trim()) return wx.showToast({ title: '请填写联系人', icon: 'none' })
    if (!/^1\d{10}$/.test(phone.trim())) return wx.showToast({ title: '手机号格式错误', icon: 'none' })
    const payload = {
      name: `${contactName.trim()} ${gender}`,
      phone: phone.trim(),
      address: fullAddress
    }
    wx.showLoading({ title: '保存中...' })
    const p = id
      ? this.callApi('updateAddress', { id, ...payload })
      : this.callApi('addAddress', { ...payload, isDefault: false })
    p.then(result => {
      if (result.success) {
        wx.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 220)
      } else {
        wx.showToast({ title: result.message || '保存失败', icon: 'none' })
      }
    }).catch(() => wx.showToast({ title: '网络错误', icon: 'none' }))
      .finally(() => wx.hideLoading())
  }
})
