Page({
  data: {
    orderId: '',
    merchantId: '',
    merchantName: '',
    myRole: 'merchant',
    messages: [],
    inputValue: '',
    loading: false,
    currentDate: '',
    lastMessageId: ''
  },
  onLoad(options) {
    const orderId = String(options.orderId || '').trim()
    const merchantName = options.merchantName ? decodeURIComponent(options.merchantName) : getApp().getMerchantDisplayName()

    if (!orderId) {
      wx.showToast({ title: '缺少订单号', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const merchantId = getApp().getMerchantId()
    if (merchantId === '' || merchantId == null) {
      wx.showToast({ title: '未获取到商家信息', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const now = new Date()
    const currentDate = now.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric'
    })

    this.setData({
      orderId,
      merchantId,
      merchantName,
      myRole: 'merchant',
      currentDate
    })
    wx.setNavigationBarTitle({ title: `订单沟通 #${orderId}` })
    this.loadMessages()
  },
  displayName() {
    return String(getApp().getMerchantDisplayName() || getApp().getAccountId() || '商家').trim() || '商家'
  },
  callApi(action, payload = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: {
        action,
        data: { ...payload, accountId, role: 'merchant' }
      }
    }).then(res => (res && res.result) || {})
  },
  loadMessages() {
    if (!this.data.orderId) return
    this.setData({ loading: true })
    this.callApi('getMessages', {
      role: 'merchant',
      listMode: 'order_chat',
      orderId: this.data.orderId
    }).then(result => {
      if (result.success && Array.isArray(result.data)) {
        const myRole = this.data.myRole
        const list = result.data.map(msg => ({
          id: msg._id,
          content: msg.content,
          senderLabel: msg.senderLabel || '',
          senderRole: msg.senderRole || '',
          type: msg.senderRole === myRole ? 'sent' : 'received',
          time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''
        }))
        this.setData({ messages: list })
      } else {
        wx.showToast({ title: result.message || '加载失败', icon: 'none' })
        this.setData({ messages: [] })
      }
    }).catch(() => {
      wx.showToast({ title: '网络错误', icon: 'none' })
      this.setData({ messages: [] })
    }).finally(() => {
      this.setData({ loading: false })
    })
  },
  handleInputChange(e) {
    this.setData({ inputValue: e.detail.value })
  },
  sendMessage() {
    const content = this.data.inputValue.trim()
    if (!content) return
    if (!this.data.orderId) return

    const newMessage = {
      id: `local-${Date.now()}`,
      content,
      senderLabel: `商家 ${this.displayName()}`,
      senderRole: 'merchant',
      type: 'sent',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }

    this.setData({
      messages: [...this.data.messages, newMessage],
      inputValue: '',
      lastMessageId: `message-${newMessage.id}`
    })

    this.callApi('sendMessage', {
      type: 'chat',
      content,
      orderId: this.data.orderId,
      senderName: this.displayName(),
      role: 'merchant'
    }).then(result => {
      if (!result.success) {
        wx.showToast({ title: result.message || '发送失败', icon: 'none' })
        this.loadMessages()
        return
      }
      this.loadMessages()
    }).catch(() => {
      wx.showToast({ title: '网络错误', icon: 'none' })
      this.loadMessages()
    })
  }
})
