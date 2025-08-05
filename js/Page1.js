// DOM元素ID列表
const ids = {
  // 压力监控
  frontPressure1: "frontPressure1",
  frontPressure2: "frontPressure2",
  frontPressure3: "frontPressure3",
  frontPressure45: "frontPressure45",
  gasFrontPressure5: "gasFrontPressure5",
  gasFrontPressure6: "gasFrontPressure6",
  rearPressure123: "rearPressure123",
  rearPressure45: "rearPressure45",
  gasRearPressure6: "gasRearPressure6",

  // 流量计
  instantFlow: "instantFlow",
  totalFlow: "totalFlow",
  mediumTemp: "mediumTemp",
  staticPressure: "staticPressure",
  pressureDiff: "pressureDiff",

  // 启泵次数
  pump1Count: "pump1Count",
  pump2Count: "pump2Count",
  pump3Count: "pump3Count",
  pump4Count: "pump4Count",
  pump5Count: "pump5Count",
  gasPump1Count: "gasPump1Count",
  gasPump2Count: "gasPump2Count"
};

// 设备状态变量
const deviceStatus = {
  currentMode: "正常模式",
  leftElecStatus: "running",
  rightElecStatus: "running",
  units: {
    1: { status: "stopped", text: "停止" },
    2: { status: "stopped", text: "停止" },
    3: { status: "stopped", text: "停止" },
    4: { status: "stopped", text: "停止" },
    5: { status: "stopped", text: "停止" },
    6: { status: "stopped", text: "停止" },
    7: { status: "stopped", text: "停止" }
  }
};

// 更新指定ID的元素值
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

// 更新整个面板的值
function updateAllValues() {
  // 更新压力值
  updateElement(ids.frontPressure1, getRandomValue(0, 5, 2));
  updateElement(ids.frontPressure2, getRandomValue(0, 5, 2));
  updateElement(ids.frontPressure3, getRandomValue(0, 5, 2));
  updateElement(ids.frontPressure45, getRandomValue(0, 5, 2));
  updateElement(ids.gasFrontPressure5, getRandomValue(0, 5, 2));
  updateElement(ids.gasFrontPressure6, getRandomValue(0, 5, 2));
  updateElement(ids.rearPressure123, getRandomValue(0, 5, 2));
  updateElement(ids.rearPressure45, getRandomValue(0, 5, 2));
  updateElement(ids.gasRearPressure6, getRandomValue(0, 5, 2));

  // 更新流量计
  updateElement(ids.instantFlow, getRandomValue(0, 1000, 0));
  updateElement(ids.mediumTemp, getRandomValue(20, 80, 1));
  updateElement(ids.staticPressure, getRandomValue(0, 5, 2));
  updateElement(ids.pressureDiff, getRandomValue(0, 500, 0));

  // 更新累计流量（只增不减）
  const totalFlow = parseFloat(document.getElementById(ids.totalFlow).textContent) || 0;
  updateElement(ids.totalFlow, (totalFlow + Math.random()).toFixed(2));

  // 更新启泵次数（随机增加）
  Object.keys(ids).forEach(key => {
    if (key.includes("Count")) {
      const element = document.getElementById(ids[key]);
      if (element && Math.random() > 0.9) {
        const current = parseInt(element.textContent) || 0;
        updateElement(ids[key], current + 1);
      }
    }
  });
}

// 获取随机值
function getRandomValue(min, max, decimals) {
  const value = Math.random() * (max - min) + min;
  return decimals === 0 ? Math.floor(value) : value.toFixed(decimals);
}

// 更新设备状态显示
function updateDeviceStatusDisplay() {
  document.getElementById("currentMode").textContent = deviceStatus.currentMode;

  // 电气箱状态
  updateElecBoxDisplay("leftElecStatus", "leftElecText");
  updateElecBoxDisplay("rightElecStatus", "rightElecText");

  // 机组状态
  for (let i = 1; i <= 7; i++) {
    const status = deviceStatus.units[i].status;
    const text = deviceStatus.units[i].text;
    const statusIndicator = document.getElementById(`unit${i}Status`);
    const textElement = document.getElementById(`unit${i}StatusText`);

    statusIndicator.className = `status-indicator ${status}`;
    textElement.textContent = text;

    // 运行状态添加脉冲动画
    if (status === "running") {
      statusIndicator.classList.add("pulse");
      textElement.style.color = "#52c41a";
    } else {
      statusIndicator.classList.remove("pulse");
      textElement.style.color = "#f5222d";
    }
  }
}

// 更新电气箱显示
function updateElecBoxDisplay(statusId, textId) {
  const status = deviceStatus[statusId];
  const statusIndicator = document.getElementById(statusId);
  const textElement = document.getElementById(textId);

  statusIndicator.className = `status-indicator ${status}`;
  textElement.textContent = status === "running" ? "运行正常" : "故障";
  textElement.style.color = status === "running" ? "#52c41a" : "#f5222d";
}

// 模拟设备状态变化
function simulateDeviceStatus() {
  // 随机改变机组状态
  for (let i = 1; i <= 7; i++) {
    if (Math.random() > 0.7) {
      toggleUnitStatus(i);
    }
  }

  // 随机改变电气箱状态（概率较低）
  if (Math.random() > 0.95) {
    toggleElecBoxStatus("leftElecStatus", "左电气箱");
  }
  if (Math.random() > 0.95) {
    toggleElecBoxStatus("rightElecStatus", "右电气箱");
  }
}

// 切换机组状态
function toggleUnitStatus(unitNum) {
  const currentStatus = deviceStatus.units[unitNum].status;
  if (currentStatus === "stopped") {
    deviceStatus.units[unitNum] = {
      status: "running",
      text: "运行中"
    };
  } else {
    deviceStatus.units[unitNum] = {
      status: "stopped",
      text: "停止"
    };
  }
  updateDeviceStatusDisplay();
}

// 切换电气箱状态
function toggleElecBoxStatus(statusId, name) {
  const currentStatus = deviceStatus[statusId];
  if (currentStatus === "running") {
    deviceStatus[statusId] = "stopped";
    console.log(`${name}发生故障`);
  } else {
    deviceStatus[statusId] = "running";
    console.log(`${name}恢复正常`);
  }
  updateDeviceStatusDisplay();
}

// 更新时间
function updateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const timeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  document.getElementById('currentTime').textContent = timeStr;
}

// 按钮事件处理
function setupButtonEvents() {
  document.querySelectorAll('.flow-btn').forEach((button, index) => {
    button.addEventListener('click', () => {
      alert(index === 0 ? '运行参数页面即将打开...' : '加药页面即将打开...');
    });
  });
}

// 更新流量监控数据函数
function updateFlowData() {
  const flowElements = [
    { selector: ".flow-group:nth-child(1) .flow-item:first-child .flow-value", min: 80, max: 120 }, // 1#2#3#瞬时流量
    { selector: ".flow-group:nth-child(1) .flow-item:nth-child(2) .flow-value", min: 500, max: 800 }, // 1#2#3#累计流量
    { selector: ".flow-group:nth-child(2) .flow-item:first-child .flow-value", min: 60, max: 90 }, // 4#5#瞬时流量
    { selector: ".flow-group:nth-child(2) .flow-item:nth-child(2) .flow-value", min: 400, max: 600 }, // 4#5#累计流量
    { selector: ".flow-group:nth-child(3) .flow-item:first-child .flow-value", min: 30, max: 50 }, // 气举瞬时流量
    { selector: ".flow-group:nth-child(3) .flow-item:nth-child(2) .flow-value", min: 200, max: 400 }  // 气举累计流量
  ];

  flowElements.forEach(item => {
    const element = document.querySelector(item.selector);
    if (element) {
      const currentValue = parseInt(element.textContent) || 0;
      // 生成随机增量，但不超过最大值
      const increment = Math.random() * 5;
      const newValue = Math.min(item.max, Math.max(item.min, currentValue + increment));
      element.innerHTML = newValue.toFixed(newValue % 1 ? 1 : 0);
    }
  });
}

// 初始化应用
function initApp() {
  // 设置初始时间
  updateTime();

  // 设置定时器每秒更新时间
  setInterval(updateTime, 1000);

  // 模拟设备状态变化
  setInterval(simulateDeviceStatus, 3000);

  // 模拟数据更新
  setInterval(updateAllValues, 1500);

  // 模拟流量数据更新
  setInterval(updateFlowData, 1500);

  // 设置按钮事件
  setupButtonEvents();

  // 初始化所有数据值为0
  Object.values(ids).forEach(id => {
    updateElement(id, "0");
  });

  // 更新初始状态显示
  updateDeviceStatusDisplay();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
