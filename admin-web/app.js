const STORAGE_KEY = "currentAccount_admin_web";
const API_ENDPOINT = window.ADMIN_API_ENDPOINT || "/api/admin";

const state = {
  activeTab: "dashboard",
  adminName: "admin",
  stats: { todayOrders: 0, pendingOrders: 0, todayRiders: 0, todayIncome: 0 },
  orders: [],
  riders: [],
  areas: [],
  complaints: [],
};

const tabs = [
  { id: "dashboard", label: "首页" },
  { id: "orders", label: "订单管理" },
  { id: "riders", label: "骑手管理" },
  { id: "areas", label: "区域管理" },
  { id: "complaints", label: "投诉管理" },
];

function getAccount() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function setAccount(account) {
  if (account) localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  else localStorage.removeItem(STORAGE_KEY);
}

function callApi(action, data = {}) {
  const account = getAccount();
  const payload = { action, data: { ...data, accountId: account?.username || "" } };
  return fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error("接口调用失败"))))
    .catch(() => ({ success: false, message: "接口未连通，请先配置 ADMIN_API_ENDPOINT" }));
}

function openPrompt(title, desc, defaultValue = "") {
  const modal = document.getElementById("modal");
  const titleEl = document.getElementById("modalTitle");
  const descEl = document.getElementById("modalDesc");
  const inputEl = document.getElementById("modalInput");
  titleEl.textContent = title;
  descEl.textContent = desc;
  inputEl.value = defaultValue;
  modal.showModal();
  return new Promise((resolve) => {
    const form = document.getElementById("modalForm");
    const onClose = () => {
      modal.removeEventListener("close", onClose);
      resolve(modal.returnValue === "ok" ? inputEl.value.trim() : "");
    };
    modal.addEventListener("close", onClose);
    form.reset();
  });
}

function renderNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = tabs
    .map(
      (t) =>
        `<button class="nav-item ${state.activeTab === t.id ? "active" : ""}" data-tab="${t.id}">${t.label}</button>`
    )
    .join("");
}

function renderTable(headers, rowsHtml) {
  return `<table class="table"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
}

function renderView() {
  const pageTitle = tabs.find((t) => t.id === state.activeTab)?.label || "首页";
  document.getElementById("pageTitle").textContent = pageTitle;
  document.getElementById("adminName").textContent = state.adminName;
  const view = document.getElementById("view");

  if (state.activeTab === "dashboard") {
    view.innerHTML = `
      <div class="grid stats">
        <div class="card"><h3>今日订单</h3><p>${state.stats.todayOrders}</p></div>
        <div class="card"><h3>待处理订单</h3><p>${state.stats.pendingOrders}</p></div>
        <div class="card"><h3>在线骑手</h3><p>${state.stats.todayRiders}</p></div>
        <div class="card"><h3>今日收入</h3><p>¥${state.stats.todayIncome}</p></div>
      </div>
    `;
    return;
  }

  if (state.activeTab === "orders") {
    const rows = state.orders
      .map(
        (o) => `
          <tr>
            <td>${o.orderId || o.id || "-"}</td>
            <td>${o.shop || o.merchant || "-"}</td>
            <td>${o.customer || "-"}</td>
            <td>¥${o.amount || 0}</td>
            <td>${o.status || "-"}</td>
            <td><button class="btn secondary btn-mark-complete" data-id="${o.id || o.orderId}">标记完成</button></td>
          </tr>`
      )
      .join("");
    view.innerHTML = renderTable(["订单号", "商家", "客户", "金额", "状态", "操作"], rows || `<tr><td colspan="6" class="muted">暂无数据</td></tr>`);
    return;
  }

  if (state.activeTab === "riders") {
    const rows = state.riders
      .map(
        (r) => `
          <tr>
            <td>${r.name || "-"}</td>
            <td>${r.phone || "-"}</td>
            <td>${r.completed || 0}</td>
            <td>${r.rating || 0}</td>
            <td>${r.status || "-"}</td>
          </tr>`
      )
      .join("");
    view.innerHTML = renderTable(["骑手", "电话", "完成单量", "评分", "状态"], rows || `<tr><td colspan="5" class="muted">暂无数据</td></tr>`);
    return;
  }

  if (state.activeTab === "areas") {
    const rows = state.areas
      .map(
        (a) => `
          <tr>
            <td>${a.id || "-"}</td>
            <td>${a.name || "-"}</td>
            <td>${a.status || "-"}</td>
            <td>${a.riderCount || 0}</td>
            <td>${a.todayOrders || 0}</td>
          </tr>`
      )
      .join("");
    view.innerHTML = renderTable(["ID", "区域名", "状态", "骑手数", "今日订单"], rows || `<tr><td colspan="5" class="muted">暂无数据</td></tr>`);
    return;
  }

  const complaintRows = state.complaints
    .map(
      (c) => `
        <tr>
          <td>${c.complaintId || c.id || "-"}</td>
          <td>${c.customer || "-"}</td>
          <td>${c.type || "-"}</td>
          <td>${c.status || "-"}</td>
          <td><button class="btn secondary btn-handle-complaint" data-id="${c.id}">处理</button></td>
        </tr>`
    )
    .join("");
  view.innerHTML = renderTable(["投诉单号", "用户", "类型", "状态", "操作"], complaintRows || `<tr><td colspan="5" class="muted">暂无数据</td></tr>`);
}

async function loadAll() {
  const account = getAccount();
  if (account) state.adminName = account.nickname || account.username || "admin";
  const [dash, orders, riders, areas, complaints] = await Promise.all([
    callApi("getAdminDashboard"),
    callApi("getAdminOrders"),
    callApi("getAdminRiders"),
    callApi("getAdminAreas"),
    callApi("getAdminComplaints"),
  ]);
  if (dash.success && dash.data) state.stats = dash.data;
  state.orders = orders.success ? orders.data || [] : [];
  state.riders = riders.success ? riders.data || [] : [];
  state.areas = areas.success ? areas.data || [] : [];
  state.complaints = complaints.success ? complaints.data || [] : [];
  renderView();
}

async function loginOrRegister() {
  const mode = await openPrompt("登录或注册", "输入 login 或 register", "login");
  if (!mode) return;
  const username = await openPrompt("管理员账号", "请输入账号");
  if (!username) return;
  const password = await openPrompt("管理员密码", "请输入密码");
  if (!password) return;
  const action = mode === "register" ? "registerUser" : "loginUser";
  const result = await callApi(action, { username, password, role: "admin", nickname: username });
  if (!result.success) {
    alert(result.message || "操作失败");
    return;
  }
  const account = result.data || { username, nickname: username, role: "admin" };
  setAccount(account);
  state.adminName = account.nickname || account.username || "admin";
  await loadAll();
}

async function handleTableActions(e) {
  const markBtn = e.target.closest(".btn-mark-complete");
  if (markBtn) {
    const orderId = markBtn.dataset.id;
    const result = await callApi("markComplete", { orderId });
    alert(result.success ? "处理成功" : result.message || "处理失败");
    if (result.success) loadAll();
    return;
  }
  const complaintBtn = e.target.closest(".btn-handle-complaint");
  if (complaintBtn) {
    const id = Number(complaintBtn.dataset.id);
    const content = await openPrompt("处理投诉", "请输入处理结果", "已处理");
    if (!content) return;
    const result = await callApi("handleComplaint", { id, handleResult: content });
    alert(result.success ? "处理成功" : result.message || "处理失败");
    if (result.success) loadAll();
  }
}

function bindEvents() {
  document.getElementById("nav").addEventListener("click", (e) => {
    const btn = e.target.closest(".nav-item");
    if (!btn) return;
    state.activeTab = btn.dataset.tab;
    renderNav();
    renderView();
  });
  document.getElementById("btnRefresh").addEventListener("click", loadAll);
  document.getElementById("btnAuth").addEventListener("click", loginOrRegister);
  document.getElementById("btnLogout").addEventListener("click", () => {
    setAccount(null);
    state.adminName = "admin";
    alert("已退出登录");
  });
  document.getElementById("view").addEventListener("click", handleTableActions);
}

function bootstrap() {
  renderNav();
  renderView();
  bindEvents();
  loadAll();
}

bootstrap();
