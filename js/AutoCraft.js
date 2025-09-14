// 数据模型
const systemData = {
  production: {
    dailyGas: 100,
    dailyLiquid: 10,
    tubingPressure: 2,
    casingPressure: 12
  },
  processes: {
    suction: {
      enabled: true,
      maxNegativePressure: 0.09,
      power: '10e4W',
      machines: 4,
      runTime: { current: '3天16小时38分钟', total: '10天' },
      progress: 35
    },
    foam: {
      enabled: false,
      dilutionRatio: 12.5,
      concentration: '***',
      pumpSpeed: '10L/h',
      pressure: 3,
      runTime: { current: '0小时', total: '0小时' },
      injectedVolume: { current: 0, total: 0 },
      progress: 0
    },
    gasLift: {
      enabled: true,
      injectionRate: 100,
      injectionPressure: 20,
      devices: 2,
      runTime: { current: '37小时', total: '48小时' },
      progress: 77
    }
  },
  logs: [
    { timestamp: '2025/9/1/22:11', message: '检测到油套压差升高，启用气举。' },
    { timestamp: '2025/9/1/21:51', message: '油套压差较高，启用抽吸混输。' },
    { timestamp: '2025/9/1/21:31', message: '开井，系统检测检完毕。' },
    { timestamp: '2025/9/1/20:15', message: '系统压力正常，运行稳定。' },
    { timestamp: '2025/9/1/19:40', message: '调整抽吸混输参数，优化生产效率。' },
    { timestamp: '2025/9/1/18:20', message: '检测到液位上升，启动自动排水。' },
    { timestamp: '2025/9/1/17:55', message: '气举工艺效率提升5%。' }
  ]
};

// 当前编辑的工艺
let currentEditingProcess = null;

// DOM加载完成后初始化页面
document.addEventListener('DOMContentLoaded', function() {
  initializePage();
  setupEventListeners();
});

// 初始化页面数据
function initializePage() {
  // 更新生产参数
  updateProductionParams();

  // 更新工艺参数
  updateProcessParams();
}

// 设置事件监听器
function setupEventListeners() {
  // 编辑按钮点击事件
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function() {
      const processType = this.getAttribute('data-process');
      openEditModal(processType);
    });
  });

  // 模态窗口关闭按钮
  document.querySelector('.close').addEventListener('click', closeModal);
  document.querySelector('#cancel-btn').addEventListener('click', closeModal);

  // 保存按钮点击事件
  document.querySelector('#save-btn').addEventListener('click', saveParameters);
}

// 更新生产参数显示
function updateProductionParams() {
  const { dailyGas, dailyLiquid, tubingPressure, casingPressure } = systemData.production;

  document.getElementById('daily-gas').textContent = `${dailyGas}m³/d`;
  document.getElementById('daily-liquid').textContent = `${dailyLiquid}m³/d`;
  document.getElementById('tubing-pressure').textContent = `${tubingPressure}MPa`;
  document.getElementById('casing-pressure').textContent = `${casingPressure}MPa`;
}

// 更新工艺参数显示
function updateProcessParams() {
  // 抽吸混输工艺
  const suction = systemData.processes.suction;
  document.getElementById('suction-negative-pressure').textContent = `${suction.maxNegativePressure}MPa`;
  document.getElementById('suction-power').textContent = suction.power;
  document.getElementById('suction-machines').textContent = `${suction.machines}台`;
  document.getElementById('suction-time').textContent = `${suction.runTime.current} / ${suction.runTime.total}`;
  document.getElementById('suction-progress').style.width = `${suction.progress}%`;

  // 泡排工艺
  const foam = systemData.processes.foam;
  document.getElementById('foam-dilution').textContent = `${foam.dilutionRatio}%`;
  document.getElementById('foam-concentration').textContent = foam.concentration;
  document.getElementById('foam-pump-speed').textContent = foam.pumpSpeed;
  document.getElementById('foam-pressure').textContent = `${foam.pressure}MPa`;
  document.getElementById('foam-time').textContent = `${foam.runTime.current} / ${foam.runTime.total}`;
  document.getElementById('foam-injected').textContent = `${foam.injectedVolume.current}m³ / ${foam.injectedVolume.total}m³`;
  document.getElementById('foam-progress').style.width = `${foam.progress}%`;

  // 气举工艺
  const gasLift = systemData.processes.gasLift;
  document.getElementById('gas-lift-rate').textContent = `${gasLift.injectionRate}m³/h`;
  document.getElementById('gas-lift-pressure').textContent = `${gasLift.injectionPressure}MPa`;
  document.getElementById('gas-lift-devices').textContent = `${gasLift.devices}台`;
  document.getElementById('gas-lift-time').textContent = `${gasLift.runTime.current} / ${gasLift.runTime.total}`;
  document.getElementById('gas-lift-progress').style.width = `${gasLift.progress}%`;
}

// 打开编辑模态窗口
function openEditModal(processType) {
  currentEditingProcess = processType;
  const process = systemData.processes[processType];
  const modal = document.getElementById('edit-modal');
  const modalTitle = document.getElementById('modal-title');

  // 设置模态窗口标题
  modalTitle.textContent = `编辑${getProcessName(processType)}参数`;

  // 显示模态窗口
  modal.style.display = 'block';
}

// 根据工艺类型获取工艺名称
function getProcessName(processType) {
  const names = {
    'suction': '抽吸混输',
    'foam': '泡排',
    'gas-lift': '气举'
  };
  return names[processType];
}

// 关闭模态窗口
function closeModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

// 保存参数
function saveParameters() {
  if (!currentEditingProcess) return;

  const process = systemData.processes[currentEditingProcess];

  // 更新抽吸混输工艺参数
  if (currentEditingProcess === 'suction') {
    process.maxNegativePressure = parseFloat(document.getElementById('maxNegativePressure').value);
    process.power = document.getElementById('power').value;
    process.machines = parseInt(document.getElementById('machines').value);
  }

  // 更新页面显示
  updateProcessParams();

  // 关闭模态窗口
  closeModal();

  // 显示保存成功提示
  showNotification('参数已成功更新');
}

// 显示通知
function showNotification(message) {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#34a853';
  notification.style.color = 'white';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.zIndex = '1000';

  // 添加到文档中
  document.body.appendChild(notification);

  // 3秒后移除通知
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}
