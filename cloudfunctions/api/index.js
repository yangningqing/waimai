// 云函数入口文件
const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value)
const normalizeData = (data) => (isPlainObject(data) ? data : {})
const getOpenId = () => {
  try {
    const wxContext = cloud.getWXContext()
    return wxContext && wxContext.OPENID
  } catch (e) {
    return null
  }
}

const safeNumber = (value, defaultValue = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : defaultValue
}
const hashPassword = (password) => crypto.createHash('sha256').update(String(password || '')).digest('hex')
const ASSET_BASE_URL = (process.env.ASSET_BASE_URL || '').replace(/\/+$/, '')
const resolveAssetUrl = (keyOrUrl = '') => {
  const v = String(keyOrUrl || '').trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v) || v.startsWith('cloud://')) return v
  if (!ASSET_BASE_URL) return v
  return `${ASSET_BASE_URL}/${v.replace(/^\/+/, '')}`
}
const mapImageFields = (item = {}) => {
  const next = { ...item }
  if (next.imageKey && !next.image) {
    next.image = resolveAssetUrl(next.imageKey)
  } else if (next.image) {
    next.image = resolveAssetUrl(next.image)
  }
  if (next.thumbKey) next.thumb = resolveAssetUrl(next.thumbKey)
  if (next.fullKey) next.full = resolveAssetUrl(next.fullKey)
  return next
}

const nowText = () => new Date().toISOString().slice(0, 16).replace('T', ' ')
let initDataPromise = null
const actionCollectionMap = {
  registerUser: 'user_accounts',
  loginUser: 'user_accounts',
  payOrder: 'orders',
  getUserProfile: 'user_profiles',
  updateUserProfile: 'user_profiles',
  getCoins: 'user_profiles',
  getFavorites: 'user_favorites',
  toggleFavorite: 'user_favorites',
  createServiceTicket: 'service_tickets',
  submitFeedback: 'feedbacks',
  getAddresses: 'user_addresses',
  addAddress: 'user_addresses',
  updateAddress: 'user_addresses',
  deleteAddress: 'user_addresses',
  setDefaultAddress: 'user_addresses',
  getRiderProfile: 'rider_profiles',
  updateRiderOnlineStatus: 'rider_profiles',
  getAdminAreas: 'admin_areas',
  saveAdminArea: 'admin_areas',
  deleteAdminArea: 'admin_areas',
  getAdminComplaints: 'complaints',
  handleComplaint: 'complaints'
}

const normalizeOrderStatus = (status) => {
  const s = String(status || '').trim()
  if (!s) return '待付款'
  if (['待处理', '待接单'].includes(s)) return '待接单'
  if (['处理中', '待取餐', '配送中'].includes(s)) return '配送中'
  return s
}

const computeOrderStats = (orders = []) => {
  const todayStr = new Date().toISOString().slice(0, 10)
  let todayOrders = 0
  let todayIncome = 0
  let pendingOrders = 0
  let completedOrders = 0
  orders.forEach(order => {
    const status = normalizeOrderStatus(order.status)
    const amount = safeNumber(order.amount || order.total, 0)
    const timeText = String(order.time || '')
    if (timeText.startsWith(todayStr)) {
      todayOrders += 1
      todayIncome += amount
    }
    if (['待付款', '待接单', '待处理', '待收货', '配送中'].includes(status)) {
      pendingOrders += 1
    }
    if (['已完成', '已处理'].includes(status)) {
      completedOrders += 1
    }
  })
  return { todayOrders, todayIncome, pendingOrders, completedOrders }
}

// 初始化数据
const initData = async () => {
  console.log('开始初始化数据...')
  try {
    // 检查是否已有数据
    console.log('检查商家数据...')
    const merchantCount = await db.collection('merchants').count()
    console.log('商家数据数量:', merchantCount.total)
    
    if (merchantCount.total === 0) {
      // 初始化商家数据
      console.log('初始化商家数据...')
      await db.collection('merchants').add({
        data: [
          {
            id: 1,
            name: '塔斯汀',
            description: '汉堡 • 西式快餐',
            rating: 4.8,
            sales: 1234,
            distance: '1.2km',
            minPrice: 20,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fast%20food%20restaurant%20tastin&image_size=square_hd'
          },
          {
            id: 2,
            name: '曼玲粥店',
            description: '粥类 • 早餐',
            rating: 4.6,
            sales: 892,
            distance: '0.8km',
            minPrice: 15,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20congee%20shop&image_size=square_hd'
          },
          {
            id: 3,
            name: '肯德基',
            description: '汉堡 • 快餐',
            rating: 4.7,
            sales: 2345,
            distance: '1.5km',
            minPrice: 25,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kfc%20restaurant&image_size=square_hd'
          },
          {
            id: 4,
            name: '麦当劳',
            description: '汉堡 • 快餐',
            rating: 4.6,
            sales: 1987,
            distance: '1.8km',
            minPrice: 20,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mcdonalds%20restaurant&image_size=square_hd'
          },
          {
            id: 5,
            name: '星巴克',
            description: '咖啡 • 饮品',
            rating: 4.9,
            sales: 1567,
            distance: '1.0km',
            minPrice: 30,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=starbucks%20coffee%20shop&image_size=square_hd'
          },
          {
            id: 6,
            name: '喜茶',
            description: '奶茶 • 饮品',
            rating: 4.8,
            sales: 1890,
            distance: '0.9km',
            minPrice: 25,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=heytea%20milk%20tea%20shop&image_size=square_hd'
          }
        ]
      })
      console.log('商家数据初始化完成')
    }
    
    // 检查商品数据
    console.log('检查商品数据...')
    const goodsCount = await db.collection('goods').count()
    console.log('商品数据数量:', goodsCount.total)
    
    if (goodsCount.total === 0) {
      // 初始化商品数据
      console.log('初始化商品数据...')
      await db.collection('goods').add({
        data: [
          // 塔斯汀商品
          {
            id: 101,
            merchantId: 1,
            name: '香辣鸡腿堡',
            price: 25,
            sales: 1234,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spicy%20chicken%20burger&image_size=square_hd',
            category: '汉堡'
          },
          {
            id: 102,
            merchantId: 1,
            name: '薯条（大）',
            price: 12,
            sales: 892,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=french%20fries&image_size=square_hd',
            category: '小食'
          },
          {
            id: 103,
            merchantId: 1,
            name: '可乐',
            price: 8,
            sales: 1567,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coca%20cola%20drink&image_size=square_hd',
            category: '饮品'
          },
          {
            id: 104,
            merchantId: 1,
            name: '汉堡套餐',
            price: 45,
            sales: 789,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=burger%20combo%20meal&image_size=square_hd',
            category: '套餐'
          },
          // 曼玲粥店商品
          {
            id: 201,
            merchantId: 2,
            name: '皮蛋瘦肉粥',
            price: 15,
            sales: 892,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20congee%20with%20preserved%20egg&image_size=square_hd',
            category: '粥类'
          },
          {
            id: 202,
            merchantId: 2,
            name: '小米粥',
            price: 8,
            sales: 678,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20millet%20porridge&image_size=square_hd',
            category: '粥类'
          },
          {
            id: 203,
            merchantId: 2,
            name: '包子',
            price: 2,
            sales: 1234,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20steamed%20buns&image_size=square_hd',
            category: '早点'
          },
          {
            id: 204,
            merchantId: 2,
            name: '油条',
            price: 3,
            sales: 987,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20fried%20dough%20sticks&image_size=square_hd',
            category: '早点'
          },
          // 肯德基商品
          {
            id: 301,
            merchantId: 3,
            name: '原味鸡',
            price: 12,
            sales: 2345,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=original%20recipe%20fried%20chicken&image_size=square_hd',
            category: '炸鸡'
          },
          {
            id: 302,
            merchantId: 3,
            name: '奥尔良烤翅',
            price: 15,
            sales: 1987,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=orleans%20grilled%20chicken%20wings&image_size=square_hd',
            category: '炸鸡'
          },
          // 麦当劳商品
          {
            id: 401,
            merchantId: 4,
            name: '巨无霸',
            price: 25,
            sales: 1987,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=big%20mac%20burger&image_size=square_hd',
            category: '汉堡'
          },
          {
            id: 402,
            merchantId: 4,
            name: '麦乐鸡',
            price: 10,
            sales: 1876,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chicken%20mcnuggets&image_size=square_hd',
            category: '小食'
          },
          // 星巴克商品
          {
            id: 501,
            merchantId: 5,
            name: '美式咖啡',
            price: 25,
            sales: 1567,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=americano%20coffee&image_size=square_hd',
            category: '咖啡'
          },
          {
            id: 502,
            merchantId: 5,
            name: '拿铁',
            price: 30,
            sales: 1432,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=latte%20coffee&image_size=square_hd',
            category: '咖啡'
          },
          // 喜茶商品
          {
            id: 601,
            merchantId: 6,
            name: '多肉葡萄',
            price: 28,
            sales: 1890,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=grape%20fruit%20tea&image_size=square_hd',
            category: '水果茶'
          },
          {
            id: 602,
            merchantId: 6,
            name: '芝士莓莓',
            price: 26,
            sales: 1765,
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=strawberry%20cheese%20tea&image_size=square_hd',
            category: '水果茶'
          }
        ]
      })
      console.log('商品数据初始化完成')
    }
    
    // 检查优惠券数据
    console.log('检查优惠券数据...')
    const couponCount = await db.collection('coupons').count()
    console.log('优惠券数据数量:', couponCount.total)
    
    if (couponCount.total === 0) {
      // 初始化优惠券数据
      console.log('初始化优惠券数据...')
      await db.collection('coupons').add({
        data: [
          {
            id: 1,
            name: '外卖大额神券',
            value: 13,
            minSpend: 50,
            expiryDate: '2026-12-31',
            status: 0 // 0: 未使用, 1: 已使用, 2: 已过期
          },
          {
            id: 2,
            name: '踏青美食神券',
            value: 40,
            minSpend: 100,
            expiryDate: '2026-12-31',
            status: 0
          },
          {
            id: 3,
            name: '外卖大额神券',
            value: 10,
            minSpend: 30,
            expiryDate: '2026-12-31',
            status: 0
          },
          {
            id: 4,
            name: '休闲玩乐神券',
            value: 11,
            minSpend: 40,
            expiryDate: '2026-12-31',
            status: 1
          },
          {
            id: 5,
            name: '老用户专享',
            value: 20,
            minSpend: 60,
            expiryDate: '2026-01-31',
            status: 2
          }
        ]
      })
      console.log('优惠券数据初始化完成')
    }
    
    // 检查订单数据
    console.log('检查订单数据...')
    const orderCount = await db.collection('orders').count()
    console.log('订单数据数量:', orderCount.total)
    
    if (orderCount.total === 0) {
      // 初始化订单数据
      console.log('初始化订单数据...')
      await db.collection('orders').add({
        data: [
          {
            id: '20260406001',
            orderId: '20260406001',
            customer: '张三',
            customerPhone: '138****1234',
            customerAddress: '北京城市学院顺义校区',
            merchant: '塔斯汀',
            shop: '塔斯汀',
            amount: 33,
            status: '待处理',
            time: '2026-04-06 12:00',
            rider: '张师傅'
          },
          {
            id: '20260406002',
            orderId: '20260406002',
            customer: '李四',
            customerPhone: '139****5678',
            customerAddress: '朝阳区望京SOHO',
            merchant: '曼玲粥店',
            shop: '曼玲粥店',
            amount: 25,
            status: '处理中',
            time: '2026-04-06 11:30',
            rider: '李师傅'
          },
          {
            id: '20260406003',
            orderId: '20260406003',
            customer: '王五',
            customerPhone: '137****9876',
            customerAddress: '海淀区中关村',
            merchant: '肯德基',
            shop: '肯德基',
            amount: 45,
            status: '已处理',
            time: '2026-04-06 10:00',
            rider: '王师傅'
          }
        ]
      })
      console.log('订单数据初始化完成')
    }
    console.log('数据初始化完成')
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event || {}
  const data = normalizeData(event && event.data)
  const openid = getOpenId()
  const accountId = String(data.accountId || '').trim()
  const userQuery = accountId ? { openid, accountId } : { openid }
  
  // 冷启动后只初始化一次，避免每次调用都跑全量检查
  if (!initDataPromise) {
    initDataPromise = initData().catch(err => {
      initDataPromise = null
      throw err
    })
  }
  await initDataPromise

  console.log('[api] action=%s merchantId=%s accountId=%s hasOpenid=%s',
    String(action || ''),
    String(data.merchantId || ''),
    accountId,
    !!openid
  )
  
  try {
    switch (action) {
      // 用户端接口
      case 'getMerchants':
        const merchants = await db.collection('merchants').get()
        return {
          success: true,
          data: (merchants.data || []).map(mapImageFields)
        }
      
      case 'getGoodsByMerchant':
        const goods = await db.collection('goods').where({
          merchantId: data.merchantId
        }).get()
        return {
          success: true,
          data: (goods.data || []).map(mapImageFields)
        }
      
      case 'getCoupons':
        const coupons = await db.collection('coupons').get()
        return {
          success: true,
          data: coupons.data
        }

      case 'registerUser':
        {
          const username = String(data.username || '').trim()
          const password = String(data.password || '')
          const nickname = String(data.nickname || username).trim() || username
          const role = String(data.role || 'user').trim() || 'user'
          if (!username || !password) {
            return { success: false, message: '账号和密码不能为空' }
          }
          if (username.length < 3 || username.length > 32) {
            return { success: false, message: '账号长度需在3-32位之间' }
          }
          if (password.length < 6 || password.length > 64) {
            return { success: false, message: '密码长度需在6-64位之间' }
          }
          const exists = await db.collection('user_accounts').where({ username, role }).limit(1).get()
          if (exists.data && exists.data.length) {
            return { success: false, message: '该角色下账号已存在，请直接登录' }
          }
          const now = new Date()
          await db.collection('user_accounts').add({
            data: {
              username,
              passwordHash: hashPassword(password),
              nickname,
              role,
              openid: openid || '',
              status: 'normal',
              createdAt: now,
              updatedAt: now,
              lastLoginAt: now
            }
          })
          return {
            success: true,
            message: '注册成功',
            data: { username, nickname, role, status: 'normal' }
          }
        }

      case 'loginUser':
        {
          const username = String(data.username || '').trim()
          const password = String(data.password || '')
          const role = String(data.role || 'user').trim() || 'user'
          if (!username || !password) {
            return { success: false, message: '请输入账号和密码' }
          }
          const accountRes = await db.collection('user_accounts').where({ username, role }).limit(1).get()
          const account = accountRes.data && accountRes.data[0]
          if (!account) {
            return { success: false, message: '该角色账号不存在，请先注册' }
          }
          if (String(account.status || 'normal') !== 'normal') {
            return { success: false, message: '账号已被禁用，请联系管理员' }
          }
          if (String(account.passwordHash || '') !== hashPassword(password)) {
            return { success: false, message: '密码错误' }
          }
          const patch = { lastLoginAt: new Date(), updatedAt: new Date() }
          if (openid && String(account.openid || '') !== String(openid)) {
            patch.openid = openid
          }
          await db.collection('user_accounts').where({ _id: account._id }).update({ data: patch })
          return {
            success: true,
            message: '登录成功',
            data: {
              username: account.username,
              nickname: account.nickname || account.username,
              role: account.role || role,
              status: account.status || 'normal'
            }
          }
        }
      
      case 'getOrders':
        {
        const shouldOnlyMine = !!data.onlyMine
        let orders
        if (shouldOnlyMine) {
          if (!openid) {
            return {
              success: false,
              message: '未获取到用户身份(openid)，无法查询我的订单',
              data: [],
              meta: { onlyMine: true, hasOpenid: false, accountId: accountId || '', count: 0 }
            }
          }
          if (accountId) {
            // 同一微信号下支持多账号隔离，优先按 openid+accountId 查询
            orders = await db.collection('orders').where({ openid, accountId }).orderBy('createdAt', 'desc').get()
          } else {
            orders = await db.collection('orders').where({ openid }).orderBy('createdAt', 'desc').get()
          }
        } else if (accountId) {
          orders = await db.collection('orders').where({ accountId }).orderBy('createdAt', 'desc').get()
        } else {
          orders = await db.collection('orders').orderBy('createdAt', 'desc').get()
        }
        return {
          success: true,
          data: orders.data,
          meta: {
            onlyMine: shouldOnlyMine,
            accountId: accountId || '',
            hasOpenid: !!openid,
            count: Array.isArray(orders.data) ? orders.data.length : 0
          }
        }
        }

      case 'claimCoupons':
        let claimedCount = 0
        try {
          const availableCoupons = await db.collection('coupons').where({
            status: 0
          }).get()
          claimedCount = (availableCoupons.data || []).length
        } catch (e) {
          console.warn('claimCoupons 查询失败，使用兜底返回:', e && e.message)
          claimedCount = 0
        }
        return {
          success: true,
          message: '优惠券领取成功',
          data: {
            claimedCount
          }
        }

      case 'submitFeedback':
        if (!openid) {
          return { success: false, message: '未获取到用户信息' }
        }
        {
          const feedbackType = String(data.feedbackType || '建议')
          const feedbackContent = String(data.feedbackContent || '').trim()
          const contactInfo = String(data.contactInfo || '').trim()
          const images = Array.isArray(data.images) ? data.images.slice(0, 9) : []
          if (!feedbackContent) {
            return { success: false, message: '反馈内容不能为空' }
          }
          if (feedbackContent.length > 2000) {
            return { success: false, message: '反馈内容过长' }
          }
          await db.collection('feedbacks').add({
            data: {
              feedbackType,
              feedbackContent,
              contactInfo,
              images,
              createdAt: new Date(),
              openid
            }
          })
          return { success: true, message: '反馈提交成功' }
        }

      case 'getAddresses':
        if (!openid) {
          return { success: false, message: '未获取到用户信息' }
        }
        {
          const res = await db.collection('user_addresses').where({ openid }).orderBy('updatedAt', 'desc').get()
          return { success: true, data: res.data || [] }
        }

      case 'addAddress':
        if (!openid) {
          return { success: false, message: '未获取到用户信息' }
        }
        {
          const name = String(data.name || '').trim()
          const phone = String(data.phone || '').trim()
          const address = String(data.address || '').trim()
          const image = data.image ? String(data.image) : ''
          const isDefault = !!data.isDefault
          if (!name || !phone || !address) {
            return { success: false, message: '姓名/电话/地址不能为空' }
          }
          if (isDefault) {
            await db.collection('user_addresses').where({ openid }).update({
              data: { isDefault: false, updatedAt: new Date() }
            })
          }
          const addRes = await db.collection('user_addresses').add({
            data: {
              openid,
              name,
              phone,
              address,
              image,
              isDefault,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
          return { success: true, data: { id: addRes && addRes._id } }
        }

      case 'updateAddress':
        if (!openid) {
          return { success: false, message: '未获取到用户信息' }
        }
        {
          const id = String(data.id || '').trim()
          if (!id) return { success: false, message: '缺少地址ID' }
          const patch = {}
          if (data.name != null) patch.name = String(data.name).trim()
          if (data.phone != null) patch.phone = String(data.phone).trim()
          if (data.address != null) patch.address = String(data.address).trim()
          if (data.image != null) patch.image = String(data.image)
          patch.updatedAt = new Date()
          const upRes = await db.collection('user_addresses').where({ _id: id, openid }).update({ data: patch })
          if (!upRes.stats || upRes.stats.updated === 0) {
            return { success: false, message: '未找到地址或无权限' }
          }
          return { success: true, message: '更新成功' }
        }

      case 'deleteAddress':
        if (!openid) {
          return { success: false, message: '未获取到用户信息' }
        }
        {
          const id = String(data.id || '').trim()
          if (!id) return { success: false, message: '缺少地址ID' }
          const rmRes = await db.collection('user_addresses').where({ _id: id, openid }).remove()
          if (!rmRes.stats || rmRes.stats.removed === 0) {
            return { success: false, message: '未找到地址或无权限' }
          }
          return { success: true, message: '删除成功' }
        }

      case 'setDefaultAddress':
        if (!openid) {
          return { success: false, message: '未获取到用户信息' }
        }
        {
          const id = String(data.id || '').trim()
          if (!id) return { success: false, message: '缺少地址ID' }
          await db.collection('user_addresses').where({ openid }).update({
            data: { isDefault: false, updatedAt: new Date() }
          })
          const defRes = await db.collection('user_addresses').where({ _id: id, openid }).update({
            data: { isDefault: true, updatedAt: new Date() }
          })
          if (!defRes.stats || defRes.stats.updated === 0) {
            return { success: false, message: '未找到地址或无权限' }
          }
          return { success: true, message: '已设为默认' }
        }

      case 'searchMerchants':
        {
          const keyword = String(data.keyword || '').trim().toLowerCase()
          const allMerchants = await db.collection('merchants').get()
          const filtered = !keyword
            ? allMerchants.data
            : allMerchants.data.filter(item =>
              String(item.name || '').toLowerCase().includes(keyword) ||
              String(item.description || '').toLowerCase().includes(keyword)
            )
          return { success: true, data: filtered }
        }

      case 'getUserProfile':
        if (!openid) return { success: false, message: '未获取到用户信息' }
        {
          const profile = await db.collection('user_profiles').where(userQuery).get()
          const value = profile.data[0] || { ...userQuery, nickname: accountId || '微信用户', level: '白银会员', points: 0, coinBalance: 0 }
          return { success: true, data: value }
        }

      case 'updateUserProfile':
        if (!openid) return { success: false, message: '未获取到用户信息' }
        {
          const profilePatch = {}
          if (data.nickname != null) profilePatch.nickname = String(data.nickname).trim()
          if (data.avatar != null) profilePatch.avatar = String(data.avatar).trim()
          profilePatch.updatedAt = new Date()
          const has = await db.collection('user_profiles').where(userQuery).get()
          if (!has.data.length) {
            await db.collection('user_profiles').add({ data: { ...userQuery, ...profilePatch, createdAt: new Date() } })
          } else {
            await db.collection('user_profiles').where(userQuery).update({ data: profilePatch })
          }
          return { success: true, message: '更新成功' }
        }

      case 'getFavorites':
        if (!openid) return { success: false, message: '未获取到用户信息' }
        {
          const favRes = await db.collection('user_favorites').where(userQuery).get()
          return { success: true, data: favRes.data || [] }
        }

      case 'toggleFavorite':
        if (!openid) return { success: false, message: '未获取到用户信息' }
        {
          const merchantId = safeNumber(data.merchantId, 0)
          if (!merchantId) return { success: false, message: '商家ID无效' }
          const favoriteQuery = { ...userQuery, merchantId }
          const exists = await db.collection('user_favorites').where(favoriteQuery).get()
          if (exists.data.length) {
            await db.collection('user_favorites').where(favoriteQuery).remove()
            return { success: true, data: { favorite: false } }
          }
          await db.collection('user_favorites').add({ data: { ...userQuery, merchantId, createdAt: new Date() } })
          return { success: true, data: { favorite: true } }
        }

      case 'getCoins':
        if (!openid) return { success: false, message: '未获取到用户信息' }
        {
          const profile = await db.collection('user_profiles').where(userQuery).get()
          const coinBalance = safeNumber(profile.data[0] && profile.data[0].coinBalance, 0)
          return { success: true, data: { coinBalance } }
        }

      case 'createServiceTicket':
        if (!openid) return { success: false, message: '未获取到用户信息' }
        {
          const content = String(data.content || '').trim()
          if (!content) return { success: false, message: '工单内容不能为空' }
          await db.collection('service_tickets').add({
            data: {
              ...userQuery,
              role: String(data.role || 'user'),
              status: '待处理',
              content,
              createdAt: new Date()
            }
          })
          return { success: true, message: '工单创建成功' }
        }

      case 'createOrder':
        if (!openid) {
          return {
            success: false,
            message: '未获取到用户信息，请确认当前项目已开通云开发并绑定正确环境',
            meta: { hasOpenid: false, accountId: accountId || '' }
          }
        }
        {
          if (!accountId) {
            return {
              success: false,
              message: '账号状态异常，请重新登录后下单',
              meta: { hasOpenid: true, accountId: '' }
            }
          }
          const cartItems = Array.isArray(data.cartItems) ? data.cartItems : []
          const amount = Number(data.totalAmount || 0)
          if (!cartItems.length || !Number.isFinite(amount) || amount <= 0) {
            return { success: false, message: '订单数据无效' }
          }
          const goods = []
          cartItems.forEach(shop => {
            const shopGoods = Array.isArray(shop.goods) ? shop.goods : []
            shopGoods.forEach(g => {
              const quantity = Number(g.quantity || 0)
              if (quantity > 0) {
                goods.push({
                  id: g.id,
                  name: g.name,
                  price: Number(g.price || 0),
                  quantity,
                  image: g.image || ''
                })
              }
            })
          })
          if (!goods.length) {
            return { success: false, message: '订单商品为空' }
          }
          const now = new Date()
          const orderId = String(Date.now())
          const address = isPlainObject(data.address) ? data.address : null
          const shopNames = cartItems
            .map(item => String(item && item.shopName ? item.shopName : '').trim())
            .filter(Boolean)
          const uniqueShopNames = [...new Set(shopNames)]
          const shopName = uniqueShopNames.length <= 1
            ? (uniqueShopNames[0] || '商家')
            : `${uniqueShopNames[0]}等${uniqueShopNames.length}家`
          const merchantId = safeNumber(cartItems[0] && cartItems[0].id, 0)
          const addRes = await db.collection('orders').add({
            data: {
              id: orderId,
              orderId,
              openid,
              accountId,
              shop: shopName,
              merchant: shopName,
              merchantId,
              amount,
              total: amount,
              goods,
              address,
              status: '待付款',
              time: now.toISOString().slice(0, 16).replace('T', ' '),
              createdAt: now,
              updatedAt: now
            }
          })
          const verifyRes = await db.collection('orders').where({ _id: addRes && addRes._id }).limit(1).get()
          if (!verifyRes.data || !verifyRes.data.length) {
            return {
              success: false,
              message: '订单写入校验失败，请重试',
              meta: { hasOpenid: true, accountId: accountId || '' }
            }
          }
          return {
            success: true,
            data: { orderId },
            meta: { hasOpenid: true, accountId: accountId || '', savedId: addRes && addRes._id ? addRes._id : '' }
          }
        }
      
      // 骑手端接口
      case 'getRiderOrders':
        {
          const status = String(data.status || '').trim()
          const query = {}
          if (status === '待抢单') {
            query.status = '待接单'
          } else if (status === '配送中') {
            query.status = _.in(['配送中', '待取餐'])
            if (openid) query.riderOpenid = openid
          } else if (status === '已完成') {
            query.status = '已完成'
            if (openid) query.riderOpenid = openid
          } else {
            query.status = _.in(['待接单', '配送中', '待取餐', '已完成'])
          }
          const riderOrders = await db.collection('orders').where(query).orderBy('time', 'desc').get()
          return { success: true, data: riderOrders.data || [] }
        }
      
      case 'getRiderIncome':
        {
          const query = openid ? { riderOpenid: openid, status: '已完成' } : { status: '已完成' }
          const riderIncomeOrders = await db.collection('orders').where(query).orderBy('time', 'desc').get()
          const stats = computeOrderStats(riderIncomeOrders.data || [])
          const details = (riderIncomeOrders.data || []).slice(0, 50).map(item => ({
            orderId: item.orderId || item.id,
            time: String(item.time || '').slice(11, 16),
            amount: safeNumber(item.riderIncome, safeNumber(item.amount, 0) * 0.2)
          }))
          return { success: true, data: { today: stats.todayIncome, orders: stats.todayOrders, details } }
        }

      case 'getRiderProfile':
        if (!openid) return { success: false, message: '未获取到骑手信息' }
        {
          const profileRes = await db.collection('rider_profiles').where({ openid }).get()
          const orderRes = await db.collection('orders').where({ riderOpenid: openid }).get()
          const stats = computeOrderStats(orderRes.data || [])
          const profile = profileRes.data[0] || {}
          return {
            success: true,
            data: {
              name: profile.name || '骑手',
              phone: profile.phone || '',
              rating: safeNumber(profile.rating, 4.8),
              completedOrders: stats.completedOrders,
              onTimeRate: `${safeNumber(profile.onTimeRate, 98)}%`
            }
          }
        }

      case 'updateRiderOnlineStatus':
        if (!openid) return { success: false, message: '未获取到骑手信息' }
        {
          const online = !!data.online
          const hasRider = await db.collection('rider_profiles').where({ openid }).get()
          if (!hasRider.data.length) {
            await db.collection('rider_profiles').add({ data: { openid, online, updatedAt: new Date(), createdAt: new Date() } })
          } else {
            await db.collection('rider_profiles').where({ openid }).update({ data: { online, updatedAt: new Date() } })
          }
          return { success: true, message: online ? '已上线' : '已下线' }
        }

      case 'acceptOrder':
        if (!openid) return { success: false, message: '未获取到骑手信息' }
        {
          const orderId = String(data.orderId || '').trim()
          if (!orderId) return { success: false, message: '缺少订单号' }
          const lockRes = await db.collection('orders').where({ id: orderId, status: '待接单' }).update({
            data: { status: '待取餐', riderOpenid: openid, rider: String(data.riderName || '骑手'), acceptedAt: new Date() }
          })
          if (!lockRes.stats || lockRes.stats.updated === 0) {
            return { success: false, message: '订单已被抢走或状态已变化' }
          }
          return { success: true, message: '抢单成功' }
        }

      case 'confirmPickup':
        if (!openid) return { success: false, message: '未获取到骑手信息' }
        {
          const orderId = String(data.orderId || '').trim()
          if (!orderId) return { success: false, message: '缺少订单号' }
          const pickupRes = await db.collection('orders').where({ id: orderId, riderOpenid: openid }).update({
            data: { status: '配送中', pickupAt: new Date() }
          })
          if (!pickupRes.stats || pickupRes.stats.updated === 0) return { success: false, message: '订单不存在或无权限' }
          return { success: true, message: '已确认取餐' }
        }

      case 'completeDelivery':
        if (!openid) return { success: false, message: '未获取到骑手信息' }
        {
          const orderId = String(data.orderId || '').trim()
          if (!orderId) return { success: false, message: '缺少订单号' }
          const completeRes = await db.collection('orders').where({ id: orderId, riderOpenid: openid }).update({
            data: { status: '已完成', finishedAt: new Date(), riderIncome: safeNumber(data.riderIncome, 0) || undefined }
          })
          if (!completeRes.stats || completeRes.stats.updated === 0) return { success: false, message: '订单不存在或无权限' }
          return { success: true, message: '配送完成' }
        }

      case 'reportOrderException':
        if (!openid) return { success: false, message: '未获取到骑手信息' }
        {
          const orderId = String(data.orderId || '').trim()
          const reason = String(data.reason || '').trim()
          const detail = String(data.detail || '').trim()
          if (!orderId || !reason) return { success: false, message: '参数不完整' }
          const exception = { reason, detail, reportedAt: new Date(), riderOpenid: openid }
          const exRes = await db.collection('orders').where({ id: orderId, riderOpenid: openid }).update({ data: { exception } })
          if (!exRes.stats || exRes.stats.updated === 0) return { success: false, message: '订单不存在或无权限' }
          return { success: true, message: '异常已上报' }
        }
      
      // 商家端接口
      case 'getMerchantGoods':
        {
          const merchantId = safeNumber(data.merchantId, 1)
          const gRes = await db.collection('goods').where({ merchantId }).get()
          const list = (gRes.data || []).map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            status: item.status || '上架中',
            icon: item.icon || '🍽️',
            sales: item.sales || 0
          }))
          return { success: true, data: list }
        }
      
      case 'getMerchantOrders':
        {
          const status = String(data.status || '').trim()
          const merchant = String(data.merchant || '').trim()
          const query = {}
          if (merchant) query.shop = merchant
          if (status && status !== '全部') query.status = status
          const moRes = Object.keys(query).length
            ? await db.collection('orders').where(query).orderBy('time', 'desc').get()
            : await db.collection('orders').orderBy('time', 'desc').get()
          const list = (moRes.data || []).map(item => ({
            id: item.id || item.orderId,
            customerName: item.customer || item.customerName || '用户',
            customerPhone: item.customerPhone || '',
            customerAddress: item.customerAddress || (item.address && item.address.address) || '',
            goodsInfo: Array.isArray(item.goods) ? item.goods.map(g => `${g.name} x${g.quantity}`).join('，') : (item.goodsInfo || ''),
            orderTime: String(item.time || '').slice(11, 16),
            price: safeNumber(item.amount || item.total, 0),
            status: normalizeOrderStatus(item.status)
          }))
          return { success: true, data: list }
        }
      
      case 'getMerchantIncome':
        {
          const merchant = String(data.merchant || '').trim()
          const query = merchant ? { shop: merchant } : {}
          const miRes = Object.keys(query).length ? await db.collection('orders').where(query).get() : await db.collection('orders').get()
          const stats = computeOrderStats(miRes.data || [])
          const details = (miRes.data || []).slice(0, 50).map(item => ({
            orderId: item.orderId || item.id,
            time: String(item.time || '').slice(11, 16),
            amount: safeNumber(item.amount || item.total, 0)
          }))
          return { success: true, data: { today: stats.todayIncome, orders: stats.todayOrders, details } }
        }

      case 'getMerchantDashboard':
        {
          const merchant = String(data.merchant || '').trim()
          const query = merchant ? { shop: merchant } : {}
          const [ordersRes, goodsRes] = await Promise.all([
            Object.keys(query).length ? db.collection('orders').where(query).get() : db.collection('orders').get(),
            db.collection('goods').where({ merchantId: safeNumber(data.merchantId, 1) }).get()
          ])
          const stats = computeOrderStats(ordersRes.data || [])
          return {
            success: true,
            data: {
              todayOrders: stats.todayOrders,
              todayIncome: stats.todayIncome,
              pendingOrders: stats.pendingOrders,
              goodsCount: (goodsRes.data || []).length
            }
          }
        }

      case 'updateMerchantOrderStatus':
        {
          const orderId = String(data.orderId || '').trim()
          const status = String(data.status || '').trim()
          if (!orderId || !status) return { success: false, message: '参数不完整' }
          const upStatusRes = await db.collection('orders').where({ id: orderId }).update({ data: { status } })
          if (!upStatusRes.stats || upStatusRes.stats.updated === 0) return { success: false, message: '订单不存在' }
          return { success: true, message: '状态更新成功' }
        }

      case 'saveMerchantGoods':
        {
          const goodsId = safeNumber(data.id, 0)
          const merchantId = safeNumber(data.merchantId, 1)
          const payload = {
            name: String(data.name || '').trim(),
            price: safeNumber(data.price, 0),
            status: String(data.status || '上架中'),
            icon: String(data.icon || '🍽️'),
            sales: safeNumber(data.sales, 0),
            merchantId
          }
          if (!payload.name) return { success: false, message: '商品名不能为空' }
          if (goodsId) {
            const upGoodsRes = await db.collection('goods').where({ id: goodsId }).update({ data: payload })
            if (!upGoodsRes.stats || upGoodsRes.stats.updated === 0) return { success: false, message: '商品不存在' }
            return { success: true, message: '更新成功' }
          }
          const maxRes = await db.collection('goods').orderBy('id', 'desc').limit(1).get()
          const newId = maxRes.data.length ? safeNumber(maxRes.data[0].id, 100) + 1 : 1001
          await db.collection('goods').add({ data: { ...payload, id: newId } })
          return { success: true, message: '新增成功', data: { id: newId } }
        }

      case 'getMerchantFinance':
        {
          const merchant = String(data.merchant || '').trim()
          const query = merchant ? { shop: merchant } : {}
          const finRes = Object.keys(query).length ? await db.collection('orders').where(query).get() : await db.collection('orders').get()
          const stats = computeOrderStats(finRes.data || [])
          return {
            success: true,
            data: {
              todayIncome: stats.todayIncome,
              todayOrders: stats.todayOrders,
              totalIncome: (finRes.data || []).reduce((sum, item) => sum + safeNumber(item.amount || item.total, 0), 0)
            }
          }
        }
      
      // 后台管理端接口
      case 'getAdminOrders':
        console.log('查询订单数据...')
        const adminOrders = await db.collection('orders').get()
        console.log('订单数据:', adminOrders.data)
        return {
          success: true,
          data: adminOrders.data
        }
      
      case 'getAdminRiders':
        {
          const riders = await db.collection('rider_profiles').get()
          return {
            success: true,
            data: (riders.data || []).map((r, idx) => ({
              id: r.id || idx + 1,
              name: r.name || '骑手',
              phone: r.phone || '',
              completed: safeNumber(r.completedOrders, 0),
              rate: `${safeNumber(r.onTimeRate, 98)}%`,
              rating: safeNumber(r.rating, 4.8),
              status: r.online ? '在线' : '离线'
            }))
          }
        }
      
      case 'getAdminAreas':
        {
          const areas = await db.collection('admin_areas').orderBy('id', 'asc').get()
          return { success: true, data: areas.data || [] }
        }
      
      case 'getAdminComplaints':
        {
          const complaints = await db.collection('complaints').orderBy('time', 'desc').get()
          return { success: true, data: complaints.data || [] }
        }

      case 'getAdminDashboard':
        {
          const [allOrders, allRiders] = await Promise.all([
            db.collection('orders').get(),
            db.collection('rider_profiles').get()
          ])
          const stats = computeOrderStats(allOrders.data || [])
          return {
            success: true,
            data: {
              todayOrders: stats.todayOrders,
              pendingOrders: stats.pendingOrders,
              todayRiders: (allRiders.data || []).filter(r => r.online).length,
              todayIncome: stats.todayIncome
            }
          }
        }

      case 'saveAdminArea':
        {
          const id = safeNumber(data.id, 0)
          const area = {
            name: String(data.name || '').trim(),
            status: String(data.status || '已启用'),
            riderCount: safeNumber(data.riderCount, 0),
            todayOrders: safeNumber(data.todayOrders, 0),
            yesterdayOrders: safeNumber(data.yesterdayOrders, 0),
            description: String(data.description || '')
          }
          if (!area.name) return { success: false, message: '区域名称不能为空' }
          if (id) {
            const areaUp = await db.collection('admin_areas').where({ id }).update({ data: area })
            if (!areaUp.stats || areaUp.stats.updated === 0) return { success: false, message: '区域不存在' }
            return { success: true, message: '更新成功' }
          }
          const maxArea = await db.collection('admin_areas').orderBy('id', 'desc').limit(1).get()
          const newId = maxArea.data.length ? safeNumber(maxArea.data[0].id, 0) + 1 : 1
          await db.collection('admin_areas').add({ data: { id: newId, ...area } })
          return { success: true, message: '新增成功', data: { id: newId } }
        }

      case 'deleteAdminArea':
        {
          const id = safeNumber(data.id, 0)
          if (!id) return { success: false, message: '区域ID无效' }
          const areaRm = await db.collection('admin_areas').where({ id }).remove()
          if (!areaRm.stats || areaRm.stats.removed === 0) return { success: false, message: '区域不存在' }
          return { success: true, message: '删除成功' }
        }

      case 'handleComplaint':
        {
          const id = safeNumber(data.id, 0)
          if (!id) return { success: false, message: '投诉ID无效' }
          const cpUp = await db.collection('complaints').where({ id }).update({
            data: {
              status: '已处理',
              handleResult: String(data.handleResult || '已联系并处理'),
              handledAt: new Date()
            }
          })
          if (!cpUp.stats || cpUp.stats.updated === 0) return { success: false, message: '投诉不存在' }
          return { success: true, message: '投诉处理成功' }
        }
      
      // 订单操作接口
      case 'assignRider':
        if (!data.orderId || !data.riderName) {
          return { success: false, message: '参数不完整' }
        }
        const assignRes = await db.collection('orders').where({
          id: data.orderId
        }).update({
          data: {
            rider: data.riderName,
            status: '配送中'
          }
        })
        if (!assignRes.stats || assignRes.stats.updated === 0) {
          return { success: false, message: '订单不存在' }
        }
        return {
          success: true,
          message: '分配骑手成功'
        }
      
      case 'markComplete':
        if (!data.orderId) {
          return { success: false, message: '缺少订单号' }
        }
        const markRes = await db.collection('orders').where({
          id: data.orderId
        }).update({
          data: {
            status: '已完成',
            finishedAt: new Date()
          }
        })
        if (!markRes.stats || markRes.stats.updated === 0) {
          return { success: false, message: '订单不存在' }
        }
        return {
          success: true,
          message: '标记完成成功'
        }
      
      case 'contactMerchant':
        if (!data.orderId) {
          return { success: false, message: '缺少订单号' }
        }
        return {
          success: true,
          message: '联系商家功能已触发',
          data: {
            phone: '13800000000'
          }
        }
      
      case 'contactCustomer':
        if (!data.orderId) {
          return { success: false, message: '缺少订单号' }
        }
        return {
          success: true,
          message: '联系客户功能已触发',
          data: {
            phone: '13900000000'
          }
        }

      case 'contactRider':
        if (!data.orderId) {
          return {
            success: false,
            message: '缺少订单号'
          }
        }
        const riderOrder = await db.collection('orders').where({
          id: data.orderId
        }).get()
        if (!riderOrder.data.length) {
          return {
            success: false,
            message: '订单不存在'
          }
        }
        const riderName = riderOrder.data[0].rider || '骑手'
        return {
          success: true,
          message: `已为你联系${riderName}`
        }

      case 'confirmReceipt':
        if (!data.orderId) {
          return {
            success: false,
            message: '缺少订单号'
          }
        }
        const receiptResult = await db.collection('orders').where({
          id: data.orderId
        }).update({
          data: {
            status: '已完成'
          }
        })
        if (!receiptResult.stats || receiptResult.stats.updated === 0) {
          return {
            success: false,
            message: '未找到可确认的订单'
          }
        }
        return {
          success: true,
          message: '确认收货成功'
        }

      case 'payOrder':
        {
          const orderId = String(data.orderId || '').trim()
          if (!orderId) {
            return { success: false, message: '缺少订单号' }
          }
          if (!openid) {
            return { success: false, message: '未获取到用户信息，请重新登录' }
          }
          const query = { id: orderId, openid, status: '待付款' }
          if (accountId) query.accountId = accountId
          const payRes = await db.collection('orders').where(query).update({
            data: {
              status: '待接单',
              paidAt: new Date()
            }
          })
          if (!payRes.stats || payRes.stats.updated === 0) {
            return { success: false, message: '订单不存在、无权限或状态已变化' }
          }
          return { success: true, message: '支付成功' }
        }

      case 'submitEvaluation':
        if (!data.orderId) {
          return {
            success: false,
            message: '缺少订单号'
          }
        }
        const rating = Number(data.rating)
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
          return {
            success: false,
            message: '评分范围应为1-5'
          }
        }
        const content = String(data.content || '').trim()
        await db.collection('orders').where({
          id: data.orderId
        }).update({
          data: {
            status: '已完成',
            evaluation: {
              rating,
              content,
              createdAt: new Date()
            }
          }
        })
        return {
          success: true,
          message: '评价提交成功'
        }
      
      default:
        return {
          success: false,
          message: `未知操作: ${action || 'empty'}`
        }
    }
  } catch (error) {
    console.error('云函数执行错误:', error)
    const rawMessage = String((error && error.message) || '')
    const likelyCollection = actionCollectionMap[action]
    const collectionHint = likelyCollection ? `；请检查集合 ${likelyCollection} 是否已创建并有权限` : ''
    return {
      success: false,
      message: `服务器错误(${action || 'unknown'})${collectionHint}`,
      error: error.message
    }
  }
}