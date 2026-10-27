const dashboardData = {
  today: {
    orders: 12, revenue: 28600, profit: 6480, due: 3200, invoice: 3, expiry: 8,
    revenueBars: [18, 26, 22, 35, 30, 43, 38], profitBars: [10, 16, 14, 26, 21, 34, 29],
  },
  yesterday: {
    orders: 8, revenue: 19400, profit: 4210, due: 1800, invoice: 2, expiry: 6,
    revenueBars: [20, 24, 16, 28, 31, 26, 34], profitBars: [12, 18, 11, 20, 24, 19, 28],
  },
  before: {
    orders: 10, revenue: 23100, profit: 5090, due: 4600, invoice: 4, expiry: 5,
    revenueBars: [14, 22, 28, 24, 33, 27, 36], profitBars: [9, 14, 20, 16, 26, 21, 30],
  },
};

const money = new Intl.NumberFormat("zh-CN");

function animateValue(element, to, formatter = value => String(value)) {
  const from = Number(element.dataset.value || 0);
  const started = performance.now();
  const duration = 420;
  element.dataset.value = String(to);

  function frame(now) {
    const progress = Math.min(1, (now - started) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = formatter(Math.round(from + (to - from) * eased));
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function renderBars(containerId, values) {
  const container = document.getElementById(containerId);
  container.replaceChildren(...values.map(height => {
    const bar = document.createElement("i");
    bar.style.height = `${height}%`;
    return bar;
  }));
  requestAnimationFrame(() => [...container.children].forEach((bar, index) => {
    bar.style.height = `${Math.max(8, values[index] * 1.45)}%`;
  }));
}

function renderExpiry(count) {
  const container = document.getElementById("expiryDots");
  container.replaceChildren(...Array.from({ length: 7 }, (_, index) => {
    const dot = document.createElement("i");
    dot.style.height = `${10 + ((index * 7 + count * 3) % 23)}px`;
    return dot;
  }));
}

function setDashboard(day) {
  const data = dashboardData[day];
  animateValue(document.getElementById("heroOrders"), data.orders);
  animateValue(document.getElementById("heroRevenue"), data.revenue, money.format);
  animateValue(document.getElementById("metricRevenue"), data.revenue, money.format);
  animateValue(document.getElementById("metricProfit"), data.profit, money.format);
  animateValue(document.getElementById("metricDue"), data.due, money.format);
  animateValue(document.getElementById("metricOrders"), data.orders);
  animateValue(document.getElementById("metricInvoice"), data.invoice);
  animateValue(document.getElementById("metricExpiry"), data.expiry);

  const rate = (data.profit / data.revenue * 100).toFixed(1);
  document.getElementById("profitRate").textContent = `${rate}%`;
  document.getElementById("heroCaption").textContent = `预计公司利润 ¥${money.format(data.profit)}，${Math.max(1, Math.round(data.orders / 3))} 笔订单等待补充资料。`;
  document.getElementById("dueProgress").style.width = `${Math.min(88, 20 + data.due / 90)}%`;
  document.getElementById("invoiceProgress").style.width = `${Math.min(88, 18 + data.invoice * 12)}%`;
  renderBars("revenueBars", data.revenueBars);
  renderBars("profitBars", data.profitBars);
  renderExpiry(data.expiry);
}

document.querySelectorAll(".date-tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".date-tab").forEach(tab => tab.classList.remove("active"));
    button.classList.add("active");
    setDashboard(button.dataset.day);
  });
});

const sidebar = document.getElementById("sidebar");
document.getElementById("menuToggle").addEventListener("click", () => sidebar.classList.toggle("open"));

const dashboardPanel = document.querySelector('[data-panel="dashboard"]');
const placeholderPanel = document.querySelector('[data-panel="placeholder"]');
const placeholderTitle = document.getElementById("placeholderTitle");

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    sidebar.classList.remove("open");

    if (button.dataset.view === "dashboard") {
      dashboardPanel.hidden = false;
      placeholderPanel.hidden = true;
      return;
    }

    dashboardPanel.hidden = true;
    placeholderPanel.hidden = false;
    placeholderTitle.textContent = button.textContent.trim();
  });
});

document.getElementById("backDashboard").addEventListener("click", () => {
  document.querySelector('[data-view="dashboard"]').click();
});

const search = document.getElementById("globalSearch");
search.addEventListener("input", () => {
  const query = search.value.trim().toLowerCase();
  document.querySelectorAll("#orderRows tr").forEach(row => {
    row.hidden = Boolean(query) && !row.textContent.toLowerCase().includes(query);
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "/" && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
});

const dialog = document.getElementById("intakeDialog");
const openDialog = () => {
  dialog.showModal();
  document.querySelectorAll(".process-step").forEach((step, index) => step.classList.toggle("active", index === 0));
  document.getElementById("demoResult").textContent = "";
};

document.getElementById("openIntake").addEventListener("click", openDialog);
document.getElementById("simulateIntake").addEventListener("click", openDialog);

document.getElementById("demoFile").addEventListener("change", event => {
  const file = event.target.files[0];
  document.getElementById("fileLabel").textContent = file ? file.name : "选择截图、PDF 或表格";
});

document.getElementById("runDemo").addEventListener("click", async event => {
  const button = event.currentTarget;
  const steps = [...document.querySelectorAll(".process-step")];
  button.disabled = true;
  button.textContent = "正在演示…";

  for (let index = 0; index < steps.length; index += 1) {
    await new Promise(resolve => setTimeout(resolve, index === 0 ? 180 : 520));
    steps[index].classList.add("active");
  }

  document.getElementById("demoResult").textContent = "已生成一份虚构草稿，正式入库前仍需人工确认。";
  button.disabled = false;
  button.textContent = "重新演示";
});

setDashboard("today");
