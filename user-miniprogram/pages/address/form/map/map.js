Page({
  data: {
    city: '北京',
    keyword: '',
    latitude: 40.1675,
    longitude: 116.654,
    marker: {
      id: 1,
      latitude: 40.1675,
      longitude: 116.654,
      width: 28,
      height: 36
    },
    selectedIndex: 0,
    candidates: [
      { name: '北京城市学院顺义校区-西门', detail: '北京市顺义区杨镇木燕路北京城市学院顺义校区', latitude: 40.1675, longitude: 116.654 },
      { name: '北京城市学院顺义校区-南门', detail: '北京市顺义区杨镇木燕路北京城市学院顺义校区', latitude: 40.1668, longitude: 116.6552 },
      { name: '北京城市学院顺义校区-西北门', detail: '北京市顺义区杨镇木燕路北京城市学院顺义校区', latitude: 40.1682, longitude: 116.6532 },
      { name: '北京城市学院(顺义校区)7号宿舍楼', detail: '北京市顺义区杨镇木燕路北京城市学院顺义校区', latitude: 40.1672, longitude: 116.6561 },
      { name: '北京城市学院(顺义校区)6号宿舍楼', detail: '北京市顺义区杨镇木燕路北京城市学院顺义校区', latitude: 40.1669, longitude: 116.6566 }
    ],
    filteredCandidates: []
  },
  onLoad() {
    this.setData({ filteredCandidates: this.data.candidates })
  },
  goBack() {
    wx.navigateBack()
  },
  onTapFeedback() {
    wx.navigateTo({ url: '../../../feedback/feedback' })
  },
  chooseCity() {
    wx.showActionSheet({
      itemList: ['北京', '上海', '广州', '深圳'],
      success: (res) => {
        const map = ['北京', '上海', '广州', '深圳']
        this.setData({ city: map[res.tapIndex] || '北京' })
      }
    })
  },
  onInputKeyword(e) {
    const keyword = String(e.detail.value || '').trim()
    const filteredCandidates = keyword
      ? this.data.candidates.filter(item => item.name.includes(keyword) || item.detail.includes(keyword))
      : this.data.candidates
    this.setData({ keyword, filteredCandidates, selectedIndex: 0 })
  },
  chooseCandidate(e) {
    const index = Number(e.currentTarget.dataset.index || 0)
    const item = this.data.filteredCandidates[index]
    if (!item) return
    this.setData({
      selectedIndex: index,
      latitude: item.latitude,
      longitude: item.longitude,
      marker: { ...this.data.marker, latitude: item.latitude, longitude: item.longitude }
    })
  },
  confirmPick() {
    const item = this.data.filteredCandidates[this.data.selectedIndex]
    if (!item) return
    wx.setStorageSync('address_form_location', {
      address: item.name,
      detail: item.detail,
      latitude: item.latitude,
      longitude: item.longitude
    })
    wx.navigateBack()
  }
})
