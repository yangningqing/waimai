App({
  onLaunch() {
    // 小程序启动时执行的逻辑
    console.log('小程序启动');
  },
  onShow() {
    // 小程序显示时执行的逻辑
    console.log('小程序显示');
  },
  onHide() {
    // 小程序隐藏时执行的逻辑
    console.log('小程序隐藏');
  },
  globalData: {
    userInfo: null,
    baseUrl: 'https://api.example.com'
  }
})