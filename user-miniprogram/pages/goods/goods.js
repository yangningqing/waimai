Page({
  data: {
    activeCategory: 1,
    currentCategoryName: '推荐',
    categories: [],
    goodsByCategory: {},
    currentGoods: [],
    totalAmount: 0,
    cartCount: 0,
    showCart: false,
    cartItems: [],
    shop: {
      id: 1,
      name: '塔斯汀',
      rating: 4.8,
      sales: 1234,
      distance: '1.2km',
      minPrice: 20,
      image: '../../images/ai_example1.png'
    },
    loading: true,
    selectedAddressText: '',
    merchantId: null
  },
  onLoad(options) {
    const merchantId = options.id
    if (merchantId) {
      this.setData({ merchantId })
      this.getGoodsByMerchant(merchantId)
    } else {
      this.setData({ loading: false })
      wx.showToast({
        title: '商家参数缺失',
        icon: 'none'
      })
    }
  },
  onShow() {
    this.syncSelectedAddress()
    if (this.data.merchantId) {
      this.getGoodsByMerchant(this.data.merchantId)
    }
  },
  syncSelectedAddress() {
    const selectedAddress = wx.getStorageSync('selectedAddress') || null
    const shortText = String((selectedAddress && selectedAddress.shortAddress) || '').trim()
    this.setData({
      selectedAddressText: shortText || String((selectedAddress && selectedAddress.address) || '').trim()
    })
  },
  chooseAddress() {
    wx.navigateTo({ url: '../address/address?mode=select' })
  },
  getGoodsByMerchant(merchantId) {
    wx.showLoading({
      title: '加载中...'
    })
    
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'getGoodsByMerchant',
        data: {
          merchantId: parseInt(merchantId, 10)
        }
      }
    }).then(res => {
      if (res.result.success) {
        const goods = res.result.data
        
        // 构建分类和商品数据
        const categories = [{ id: 1, name: '推荐' }]
        const goodsByCategory = { 1: [] }
        
        // 按分类分组商品
        const categoryMap = new Map()
        
        goods.forEach(item => {
          // 添加到推荐分类
          goodsByCategory[1].push({
            id: item.id,
            name: item.name,
            price: item.price,
            sales: item.sales,
            image: item.image,
            quantity: 0
          })
          
          // 按分类分组
          if (!categoryMap.has(item.category)) {
            const categoryId = categories.length + 1
            categories.push({ id: categoryId, name: item.category })
            goodsByCategory[categoryId] = []
            categoryMap.set(item.category, categoryId)
          }
          
          const categoryId = categoryMap.get(item.category)
          goodsByCategory[categoryId].push({
            id: item.id,
            name: item.name,
            price: item.price,
            sales: item.sales,
            image: item.image,
            quantity: 0
          })
        })
        
        // 获取商家信息
        this.getMerchantInfo(merchantId).then(shopInfo => {
          this.setData({
            shop: shopInfo || this.data.shop,
            categories,
            goodsByCategory
          })
          this.updateCurrentCategory()
          this.calculateTotal()
          wx.hideLoading()
          this.setData({ loading: false })
        })
      } else {
        wx.showToast({
          title: '获取商品失败',
          icon: 'none'
        })
        wx.hideLoading()
        this.setData({ loading: false })
      }
    }).catch(err => {
      console.error('调用云函数失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
      wx.hideLoading()
      this.setData({ loading: false })
    })
  },
  getMerchantInfo(merchantId) {
    return new Promise((resolve) => {
      wx.cloud.callFunction({
        name: 'api',
        data: {
          action: 'getMerchants'
        }
      }).then(res => {
        if (res.result.success) {
          const merchants = res.result.data
          const shop = merchants.find(m => m.id === parseInt(merchantId, 10))
          resolve(shop)
        } else {
          resolve(null)
        }
      }).catch(err => {
        console.error('获取商家信息失败:', err)
        resolve(null)
      })
    })
  },
  updateCurrentCategory() {
    const activeCategory = this.data.activeCategory
    const category = this.data.categories.find(c => c.id === activeCategory)
    const currentGoods = this.data.goodsByCategory[activeCategory] || []
    this.setData({
      currentCategoryName: category ? category.name : '推荐',
      currentGoods: currentGoods
    })
  },
  switchCategory(e) {
    const categoryId = parseInt(e.currentTarget.dataset.id)
    this.setData({
      activeCategory: categoryId
    })
    this.updateCurrentCategory()
  },
  decreaseQuantity(e) {
    const goodsId = Number(e.currentTarget.dataset.id)
    // 遍历所有分类的商品，找到对应商品并减少数量
    const goodsByCategory = this.data.goodsByCategory
    let found = false
    
    for (const categoryId in goodsByCategory) {
      const goodsList = goodsByCategory[categoryId]
      for (let i = 0; i < goodsList.length; i++) {
        if (Number(goodsList[i].id) === goodsId && goodsList[i].quantity > 0) {
          goodsList[i].quantity = Math.max(0, goodsList[i].quantity - 1)
          found = true
          break
        }
      }
      if (found) break
    }
    
    if (found) {
      this.setData({ goodsByCategory })
      this.updateCurrentCategory()
      this.calculateTotal()
      this.persistCurrentShopCart()
      // 如果购物车面板是展开的，更新购物车数据
      if (this.data.showCart) {
        this.loadCartItems()
      }
    }
  },
  increaseQuantity(e) {
    const goodsId = Number(e.currentTarget.dataset.id)
    // 遍历所有分类的商品，找到对应商品并增加数量
    const goodsByCategory = this.data.goodsByCategory
    let found = false
    
    for (const categoryId in goodsByCategory) {
      const goodsList = goodsByCategory[categoryId]
      for (let i = 0; i < goodsList.length; i++) {
        if (Number(goodsList[i].id) === goodsId) {
          goodsList[i].quantity++
          found = true
          break
        }
      }
      if (found) break
    }
    
    if (found) {
      this.setData({ goodsByCategory })
      this.updateCurrentCategory()
      this.calculateTotal()
      this.persistCurrentShopCart()
      // 如果购物车面板是展开的，更新购物车数据
      if (this.data.showCart) {
        this.loadCartItems()
      }
    }
  },
  calculateTotal() {
    let total = 0
    let count = 0
    
    // 遍历所有分类的商品，计算总金额和商品数量
    const goodsByCategory = this.data.goodsByCategory
    for (const categoryId in goodsByCategory) {
      const goodsList = goodsByCategory[categoryId]
      goodsList.forEach(goods => {
        total += goods.price * goods.quantity
        count += goods.quantity
      })
    }
    
    this.setData({ 
      totalAmount: total,
      cartCount: count
    })
  },

  addToCart(e) {
    const goodsId = Number(e.currentTarget.dataset.id)
    // 遍历所有分类的商品，找到对应商品
    const goodsByCategory = this.data.goodsByCategory
    let goods = null
    
    for (const categoryId in goodsByCategory) {
      const goodsList = goodsByCategory[categoryId]
      for (let i = 0; i < goodsList.length; i++) {
        if (Number(goodsList[i].id) === goodsId) {
          goods = goodsList[i]
          break
        }
      }
      if (goods) break
    }
    
    if (goods) {
      // 如果商品数量为0，设置为1
      if (goods.quantity === 0) {
        goods.quantity = 1
        this.setData({ goodsByCategory })
        this.updateCurrentCategory()
        this.calculateTotal()
      }
      
      this.persistCurrentShopCart()
      
      // 如果购物车面板是展开的，更新购物车数据
      if (this.data.showCart) {
        this.loadCartItems()
      }
      
      wx.showToast({
        title: '已添加到购物车',
        icon: 'success'
      })
    }
  },
  checkout() {
    const accountId = getApp().getAccountId()
    if (!accountId) {
      wx.showToast({
        title: '请先登录账号',
        icon: 'none'
      })
      return
    }
    if (this.data.totalAmount === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }

    const minPrice = Number(this.data.shop.minPrice || 0)
    if (this.data.totalAmount < minPrice) {
      wx.showToast({
        title: `未达到起送价¥${minPrice}`,
        icon: 'none'
      })
      return
    }
    
    // 收集所有商品
    const allGoods = []
    const goodsByCategory = this.data.goodsByCategory
    for (const categoryId in goodsByCategory) {
      const goodsList = goodsByCategory[categoryId]
      goodsList.forEach(goods => {
        if (goods.quantity > 0) {
          allGoods.push(goods)
        }
      })
    }
    
    const cartItems = [{
      id: this.data.shop.id,
      shopName: this.data.shop.name,
      minOrder: this.data.shop.minPrice,
      goods: allGoods.filter(goods => goods.quantity > 0)
    }]
    wx.setStorageSync('checkout_payload', {
      source: 'goods',
      shopName: this.data.shop.name,
      items: cartItems[0].goods,
      goodsTotal: Number(this.data.totalAmount || 0),
      deliveryFee: 0,
      couponDeduct: 0
    })
    wx.navigateTo({ url: '../checkout/checkout' })
  },
  toggleCart() {
    const showCart = !this.data.showCart
    this.setData({ showCart })
    if (showCart) {
      this.loadCartItems()
    }
  },
  loadCartItems() {
    const rawCartItems = wx.getStorageSync('cartItems') || []
    const cartItems = Array.isArray(rawCartItems) ? rawCartItems.slice(0, 1) : []
    this.setData({ cartItems })
  },
  persistCurrentShopCart() {
    const allGoods = []
    const goodsByCategory = this.data.goodsByCategory || {}
    for (const categoryId in goodsByCategory) {
      const goodsList = goodsByCategory[categoryId] || []
      goodsList.forEach(goods => {
        if (goods.quantity > 0) {
          allGoods.push({
            id: goods.id,
            name: goods.name,
            price: goods.price,
            quantity: goods.quantity,
            image: goods.image
          })
        }
      })
    }

    if (allGoods.length === 0) {
      wx.removeStorageSync('cartItems')
      return
    }

    const shopPayload = {
      id: Number(this.data.shop.id),
      shopName: this.data.shop.name,
      minOrder: Number(this.data.shop.minPrice || 0),
      goods: allGoods
    }

    wx.setStorageSync('cartItems', [shopPayload])
  }
})