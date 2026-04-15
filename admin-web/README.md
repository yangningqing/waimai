# admin-web

后台管理端网页版本（从 `admin-miniprogram` 拆分出的 H5 结构）。

## 已支持功能

- 登录/注册管理员账号（调用 `loginUser` / `registerUser`）
- 首页统计（`getAdminDashboard`）
- 订单管理（`getAdminOrders` + `markComplete`）
- 骑手管理（`getAdminRiders`）
- 区域管理（`getAdminAreas`）
- 投诉管理（`getAdminComplaints` + `handleComplaint`）

## 接口对接方式

默认会请求 `POST /api/admin`，Body 格式：

```json
{
  "action": "getAdminDashboard",
  "data": {
    "accountId": "admin"
  }
}
```

你可以在页面加载前设置：

```html
<script>
  window.ADMIN_API_ENDPOINT = "你的后端地址";
</script>
```

然后再引入 `app.js`。

## 快速本地启动

用任意静态服务器启动 `admin-web` 目录，例如：

```bash
# 在项目根目录执行
npx http-server ./admin-web -p 8081
```

浏览器打开：`http://127.0.0.1:8081`
