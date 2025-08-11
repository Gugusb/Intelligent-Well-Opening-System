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
