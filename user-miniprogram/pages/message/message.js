Page({
  data: {
    activeTab: 0,
    tabs: [
      { id: 1, name: '全部消息' },
      { id: 2, name: '系统消息' },
      { id: 3, name: '订单消息' },
      { id: 4, name: '活动消息' }
    ],
    messages: [],
    filteredMessages: []
  },
  onLoad() {
    if (!getApp().isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadMessages()
  },
  onShow() {
    this.loadMessages()
  },
  callApi(action, data = {}) {
    const accountId = getApp().getAccountId()
    return wx.cloud.callFunction({
      name: 'api',
      data: { action, data: { ...data, ...(accountId ? { accountId } : {}) } }
    }).then(res => (res && res.result) || {})
  },
  mapNotice(msg) {
    return {
      inboxKind: 'notice',
      id: msg._id,
      type: msg.type || 'system',
      icon: msg.type === 'system' ? '📢' : msg.type === 'order' ? '📦' : msg.type === 'chat' ? '💬' : '🎯',
      title: msg.title,
      content: msg.content,
      time: msg.createdAt ? new Date(msg.createdAt).toISOString().slice(0, 16).replace('T', ' ') : '',
      unread: msg.unread !== false,
      orderId: msg.orderId || ''
    }
  },
  loadMessages() {
    this.callApi('getMessages', { role: 'user', listMode: 'combined_inbox' }).then(result => {
      if (result.success && result.data && result.data.threads) {
        const threads = (result.data.threads || []).map(t => ({
          ...t,
          inboxKind: 'thread'
        }))
        const notices = (result.data.notices || []).map(msg => this.mapNotice(msg))
        const messages = [...threads, ...notices]
        this.setData({ messages })
      } else if (result.success && Array.isArray(result.data)) {
        const messages = result.data.map(msg => this.mapNotice(msg))
        this.setData({ messages })
      }
      this.filterMessages()
    }).catch(() => {
      this.filterMessages()
    })
  },
  filterMessages() {
    const { activeTab, messages, tabs } = this.data
    let filtered = messages

    if (activeTab === 0) {
      filtered = messages
    } else if (activeTab > 0) {
      const tabType = tabs[activeTab].name === '系统消息' ? 'system' :
        tabs[activeTab].name === '订单消息' ? 'order' : 'activity'
      filtered = messages.filter(msg => {
        if (msg.inboxKind === 'thread') return tabType === 'order'
        return msg.type === tabType || (tabType === 'order' && msg.type === 'chat')
      })
    }

    this.setData({ filteredMessages: filtered })
  },
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ activeTab: index })
    this.filterMessages()
  },
  handleMessageTap(e) {
    const messageId = e.currentTarget.dataset.id
    const inboxKind = e.currentTarget.dataset.inboxkind
    const orderId = e.currentTarget.dataset.orderid || ''
    const merchantId = e.currentTarget.dataset.merchantid
    const merchantName = e.currentTarget.dataset.merchantname || '商家'

    if (inboxKind === 'thread' && orderId) {
      const q = `orderId=${encodeURIComponent(orderId)}&merchantId=${encodeURIComponent(String(merchantId || ''))}&merchantName=${encodeURIComponent(merchantName)}`
      wx.navigateTo({ url: `/pages/chat/chat?${q}` })
      return
    }

    if (orderId && (inboxKind === 'notice' || !inboxKind)) {
      wx.navigateTo({
        url: `/pages/chat/chat?orderId=${encodeURIComponent(orderId)}&merchantId=${encodeURIComponent(String(merchantId || ''))}&merchantName=${encodeURIComponent(merchantName)}`
      })
      return
    }

    const updatedMessages = this.data.messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, unread: false }
      }
      return msg
    })
    this.setData({ messages: updatedMessages })
    this.filterMessages()

    this.callApi('markMessageAsRead', { messageId })
  }
})
