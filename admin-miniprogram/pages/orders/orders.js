Page({
  data: {
    currentTab: 0,
    tabList: ['全部', '待处理', '处理中', '已处理'],
    orders: []
  },

  onLoad() {
    // 页面加载时的初始化逻辑
    this.getOrders()
  },

  onShow() {
    // 页面显示时的逻辑
    this.getOrders()
  },

  getOrders() {
    if (!getApp().isLoggedIn()) {
      this.setData({ orders: [] })
      wx.showToast({ title: '请先登录管理账号', icon: 'none' })
      return
    }
    wx.showLoading({
      title: '加载中...'
    })
    // 首先检查云函数是否可用
    if (!wx.cloud) {
      wx.showToast({
        title: '云函数不可用，请检查环境配置',
        icon: 'none'
      })
      wx.hideLoading()
      return
    }
    
    console.log('开始调用云函数...')
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'getAdminOrders',
        data: {
          accountId: getApp().getAccountId()
        }
      },
      success: (res) => {
        console.log('获取订单成功:', res)
        try {
          if (res.result && res.result.success) {
            const orders = res.result.data || []
            console.log('订单数据:', orders)
            // 确保订单数据格式正确
            const formattedOrders = orders.map(order => ({
              id: order.id || order.orderId || '',
              orderId: order.orderId || order.id || '',
              customer: order.customer || '',
              customerPhone: order.customerPhone || '',
              customerAddress: order.customerAddress || '',
              merchant: order.merchant || order.shop || '',
              shop: order.shop || order.merchant || '',
              amount: order.amount || 0,
              status: order.status || '',
              time: order.time || '',
              rider: order.rider || ''
            }))
            this.setData({
              orders: formattedOrders
            })
            console.log('设置订单数据成功:', formattedOrders)
          } else {
            console.error('获取订单失败:', res.result)
            wx.showToast({
              title: '获取订单失败',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('处理订单数据失败:', error)
          wx.showToast({
            title: '数据处理失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('获取订单失败:', err)
        wx.showToast({
          title: '获取订单失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
        console.log('云函数调用完成')
      }
    })
  },

  switchTab(e) {
    const currentTab = e.currentTarget.dataset.index
    this.setData({
      currentTab: currentTab
    })
    // 可以在这里添加根据标签页筛选订单的逻辑
  },

  handleOrder(e) {
    try {
      const index = e.currentTarget.dataset.index
      if (index === undefined || index === null || isNaN(index)) {
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        })
        return
      }
      
      const order = this.data.orders[index]
      if (!order) {
        wx.showToast({
          title: '订单信息不存在',
          icon: 'none'
        })
        return
      }
      
      wx.showActionSheet({
        itemList: ['分配骑手', '联系商家', '联系客户', '标记完成'],
        success: (res) => {
          try {
            const actions = ['分配骑手', '联系商家', '联系客户', '标记完成']
            const action = actions[res.tapIndex]
            
            if (action === '分配骑手') {
              this.assignRider(index)
            } else if (action === '联系商家') {
              this.contactMerchant(index)
            } else if (action === '联系客户') {
              this.contactCustomer(index)
            } else if (action === '标记完成') {
              this.markComplete(index)
            }
          } catch (error) {
            console.error('处理操作失败:', error)
            wx.showToast({
              title: '操作失败，请重试',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.error('显示操作菜单失败:', err)
        }
      })
    } catch (error) {
      console.error('处理订单操作失败:', error)
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      })
    }
  },

  assignRider(index) {
    const order = this.data.orders[index]
    if (!order) {
      wx.showToast({
        title: '订单信息不存在',
        icon: 'none'
      })
      return
    }
    wx.showModal({
      title: '分配骑手',
      editable: true,
      placeholderText: '请输入骑手姓名',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.showLoading({
            title: '处理中...'
          })
          // 检查云函数是否可用
          if (!wx.cloud) {
            wx.showToast({
              title: '云函数不可用，请检查环境配置',
              icon: 'none'
            })
            wx.hideLoading()
            return
          }
          wx.cloud.callFunction({
            name: 'api',
            data: {
              action: 'assignRider',
              data: {
                orderId: order.id,
                riderName: res.content
              }
            },
            success: (res) => {
              console.log('分配骑手成功:', res)
              if (res.result && res.result.success) {
                this.getOrders()
                wx.showToast({
                  title: '分配成功',
                  icon: 'success'
                })
              } else {
                console.error('分配骑手失败:', res.result)
                wx.showToast({
                  title: '分配失败',
                  icon: 'none'
                })
              }
            },
            fail: (err) => {
              console.error('分配骑手失败:', err)
              wx.showToast({
                title: '分配失败',
                icon: 'none'
              })
            },
            complete: () => {
              wx.hideLoading()
            }
          })
        }
      }
    })
  },

  contactMerchant(index) {
    const order = this.data.orders[index]
    if (!order) {
      wx.showToast({
        title: '订单信息不存在',
        icon: 'none'
      })
      return
    }
    wx.showModal({
      title: '联系商家',
      content: '即将拨打电话给商家？',
      success: (res) => {
        if (res.confirm) {
          // 检查云函数是否可用
          if (!wx.cloud) {
            wx.showToast({
              title: '云函数不可用，请检查环境配置',
              icon: 'none'
            })
            return
          }
          wx.cloud.callFunction({
            name: 'api',
            data: {
              action: 'contactMerchant',
              data: {
                orderId: order.id
              }
            },
            success: (res) => {
              console.log('联系商家成功:', res)
              const result = (res && res.result) || {}
              wx.showToast({
                title: result.success ? '联系商家成功' : (result.message || '联系失败'),
                icon: result.success ? 'success' : 'none'
              })
            },
            fail: (err) => {
              console.error('联系商家失败:', err)
              wx.showToast({
                title: '联系失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  contactCustomer(index) {
    const order = this.data.orders[index]
    if (!order) {
      wx.showToast({
        title: '订单信息不存在',
        icon: 'none'
      })
      return
    }
    if (!order.customerPhone) {
      wx.showToast({
        title: '客户电话不存在',
        icon: 'none'
      })
      return
    }
    wx.showModal({
      title: '联系客户',
      content: `拨打 ${order.customerPhone}？`,
      success: (res) => {
        if (res.confirm) {
          // 检查云函数是否可用
          if (!wx.cloud) {
            wx.showToast({
              title: '云函数不可用，请检查环境配置',
              icon: 'none'
            })
            return
          }
          wx.cloud.callFunction({
            name: 'api',
            data: {
              action: 'contactCustomer',
              data: {
                orderId: order.id
              }
            },
            success: (res) => {
              console.log('联系客户成功:', res)
              const result = (res && res.result) || {}
              if (!result.success) {
                wx.showToast({
                  title: result.message || '联系失败',
                  icon: 'none'
                })
                return
              }
              wx.makePhoneCall({
                phoneNumber: (result.data && result.data.phone) || '13900000000',
                fail: () => {
                  wx.showToast({
                    title: '拨打失败',
                    icon: 'none'
                  })
                }
              })
            },
            fail: (err) => {
              console.error('联系客户失败:', err)
              wx.showToast({
                title: '联系失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  markComplete(index) {
    const order = this.data.orders[index]
    if (!order) {
      wx.showToast({
        title: '订单信息不存在',
        icon: 'none'
      })
      return
    }
    wx.showModal({
      title: '标记完成',
      content: '确定要标记这个订单为已完成吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...'
          })
          // 检查云函数是否可用
          if (!wx.cloud) {
            wx.showToast({
              title: '云函数不可用，请检查环境配置',
              icon: 'none'
            })
            wx.hideLoading()
            return
          }
          wx.cloud.callFunction({
            name: 'api',
            data: {
              action: 'markComplete',
              data: {
                orderId: order.id
              }
            },
            success: (res) => {
              console.log('标记完成成功:', res)
              if (res.result && res.result.success) {
                this.getOrders()
                wx.showToast({
                  title: '标记成功',
                  icon: 'success'
                })
              } else {
                console.error('标记完成失败:', res.result)
                wx.showToast({
                  title: '标记失败',
                  icon: 'none'
                })
              }
            },
            fail: (err) => {
              console.error('标记完成失败:', err)
              wx.showToast({
                title: '标记失败',
                icon: 'none'
              })
            },
            complete: () => {
              wx.hideLoading()
            }
          })
        }
      }
    })
  },

  viewOrderDetail(e) {
    try {
      if (!e || !e.currentTarget || !e.currentTarget.dataset) {
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        })
        return
      }
      
      const index = e.currentTarget.dataset.index
      if (index === undefined || index === null || isNaN(index)) {
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        })
        return
      }
      
      const order = this.data.orders[index]
      if (!order) {
        wx.showToast({
          title: '订单信息不存在',
          icon: 'none'
        })
        return
      }
      
      wx.showModal({
        title: '订单详情',
        content: `订单号：${order.orderId || order.id || '未知'}\n商家：${order.merchant || order.shop || '未知'}\n客户：${order.customer || '未知'}\n电话：${order.customerPhone || '未知'}\n地址：${order.customerAddress || '未知'}\n金额：¥${order.amount || 0}\n骑手：${order.rider || '未分配'}\n状态：${order.status || '未知'}\n时间：${order.time || '未知'}`,
        showCancel: false,
        fail: (err) => {
          console.error('显示订单详情失败:', err)
          wx.showToast({
            title: '显示详情失败，请重试',
            icon: 'none'
          })
        }
      })
    } catch (error) {
      console.error('查看订单详情失败:', error)
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      })
    }
  }
})