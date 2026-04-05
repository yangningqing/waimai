// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 模拟数据
const mockData = {
  // 用户端数据
  user: {
    categories: [
      { id: 1, name: '外卖', icon: '🍔' },
      { id: 2, name: '团购', icon: '🛍️' },
      { id: 3, name: '酒店', icon: '🏨' },
      { id: 4, name: '闪购', icon: '⚡' },
      { id: 5, name: '更多', icon: '📱' }
    ],
    goods: [
      {
        id: 1,
        name: '香辣鸡腿堡',
        price: 18,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spicy%20chicken%20burger%20fast%20food&image_size=square_hd',
        sales: 1234,
        shop: '塔斯汀'
      },
      {
        id: 2,
        name: '皮蛋瘦肉粥',
        price: 12,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20congee%20with%20preserved%20egg%20and%20pork&image_size=square_hd',
        sales: 987,
        shop: '曼玲粥店'
      }
    ],
    coupons: [
      { id: 1, value: 13, minSpend: 30, name: '外卖大额神券' },
      { id: 2, value: 40, minSpend: 100, name: '踏青美食神券' },
      { id: 3, value: 10, minSpend: 20, name: '外卖大额神券' }
    ]
  },
  
  // 骑手端数据
  rider: {
    orders: [
      {
        id: 1,
        deliveryTime: '04-03 15:44:09',
        distance: '3.08 km',
        tags: ['商家单', '帮我买', '抖音订单'],
        status: '待抢单'
      },
      {
        id: 2,
        deliveryTime: '04-03 15:50:00',
        distance: '2.1 km',
        waitTime: '立即送达（已等待7分钟）',
        tags: ['跑腿单', '帮我买'],
        status: '待抢单'
      }
    ],
    income: {
      today: 186,
      orders: 12,
      details: [
        { orderId: '20260406001', time: '10:30', amount: 15 },
        { orderId: '20260406002', time: '11:15', amount: 18 },
        { orderId: '20260406003', time: '12:00', amount: 16 }
      ]
    }
  },
  
  // 商家端数据
  merchant: {
    goods: [
      { id: 1, name: '香辣鸡腿堡', price: 18, status: '上架中', icon: '🍔' },
      { id: 2, name: '薯条（大）', price: 12, status: '上架中', icon: '🍟' }
    ],
    orders: [
      {
        id: '20260406001',
        customerName: '张三',
        goodsInfo: '香辣鸡腿堡 x1，薯条 x1',
        orderTime: '10:30',
        price: 30,
        status: '待接单'
      },
      {
        id: '20260406002',
        customerName: '李四',
        goodsInfo: '曼玲粥套餐 x1',
        orderTime: '11:15',
        price: 25,
        status: '配送中'
      }
    ],
    income: {
      today: 568,
      orders: 24,
      details: [
        { orderId: '20260406001', time: '10:30', amount: 30 },
        { orderId: '20260406002', time: '11:15', amount: 25 },
        { orderId: '20260406003', time: '12:00', amount: 45 }
      ]
    }
  },
  
  // 后台管理端数据
  admin: {
    orders: [
      {
        id: '20260406001',
        customer: '张三',
        shop: '塔斯汀',
        amount: 30,
        status: '待接单',
        time: '10:30'
      },
      {
        id: '20260406002',
        customer: '李四',
        shop: '曼玲粥店',
        amount: 25,
        status: '配送中',
        time: '11:15'
      }
    ],
    riders: [
      { id: 1, name: '张师傅', phone: '138****0001', completed: 156, rate: '98.5%', rating: 4.8 },
      { id: 2, name: '李师傅', phone: '138****0002', completed: 203, rate: '99.2%', rating: 4.9 }
    ],
    areas: [
      { id: 1, name: '朝阳区', status: '已启用' },
      { id: 2, name: '顺义区', status: '已启用' },
      { id: 3, name: '海淀区', status: '已禁用' }
    ],
    complaints: [
      {
        id: 1,
        customer: '张三',
        content: '订单送达时间过长',
        time: '2026-04-06 10:00',
        status: '待处理'
      },
      {
        id: 2,
        customer: '李四',
        content: '商品质量问题',
        time: '2026-04-06 09:30',
        status: '已处理'
      }
    ]
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event
  
  switch (action) {
    // 用户端接口
    case 'getCategories':
      return {
        success: true,
        data: mockData.user.categories
      }
    
    case 'getGoods':
      return {
        success: true,
        data: mockData.user.goods
      }
    
    case 'getCoupons':
      return {
        success: true,
        data: mockData.user.coupons
      }
    
    // 骑手端接口
    case 'getRiderOrders':
      return {
        success: true,
        data: mockData.rider.orders
      }
    
    case 'getRiderIncome':
      return {
        success: true,
        data: mockData.rider.income
      }
    
    // 商家端接口
    case 'getMerchantGoods':
      return {
        success: true,
        data: mockData.merchant.goods
      }
    
    case 'getMerchantOrders':
      return {
        success: true,
        data: mockData.merchant.orders
      }
    
    case 'getMerchantIncome':
      return {
        success: true,
        data: mockData.merchant.income
      }
    
    // 后台管理端接口
    case 'getAdminOrders':
      return {
        success: true,
        data: mockData.admin.orders
      }
    
    case 'getAdminRiders':
      return {
        success: true,
        data: mockData.admin.riders
      }
    
    case 'getAdminAreas':
      return {
        success: true,
        data: mockData.admin.areas
      }
    
    case 'getAdminComplaints':
      return {
        success: true,
        data: mockData.admin.complaints
      }
    
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}