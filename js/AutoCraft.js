// 数据模型
const systemData = {
  crew: [0, 0, 0, 0, 0, 0],
  production: {
    dailyGas: 100,
    dailyLiquid: 10,
    tubingPressure: 2,
    casingPressure: 12
  },
  processes: {
    suction: {
      enabled: true,
      conditionParams: {
        wellheadPressure: 0.2
      },
      smartParams: {
        machines: 4,
        power: '10e4W'
      },
      defaultParams: {
        machines: 4
      },
      runTime: { current: '3天16小时38分钟', total: '10天' },
      progress: 35
    },
    foam: {
      enabled: false,
      conditionParams: {
        pressureDiff: 5
      },
      smartParams: {
        liquidAccumulation: 300,
        injectionVolume: 50,
        injectionRate: 15,
        injectionTime: 1.5
      },
      defaultParams: {
        injectionRate: 15,
        injectionTime: 1.5
      },
      runTime: { current: '0小时', total: '0小时' },
      injectedVolume: { current: 0, total: 0 },
      progress: 0
    },
    gasLift: {
      enabled: true,
      glModel: false,
      conditionParams: {
        pressureDiff: 3
      },
      smartParams: {
        gasVolume: 800,
        gasRate: 35,
        gasTime: 3
      },
      defaultParams: {
        gasRate: 35,
        gasTime: 3
      },
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

  // 新增：立即获取一次数据并设置定时器
  fetchCrewData();
  setInterval(fetchCrewData, 60000);

  // 新增：立即获取一次工艺状态并设置定时器
  fetchProcessStates();
  setInterval(fetchProcessStates, 60000);

  // 新增：获取初始日志并设置定时器获取增量日志
    fetchAllLogs();
    setInterval(fetchRecentLogs, 60000);
}

// 新增：获取所有日志
function fetchAllLogs() {
  fetch('http://localhost:8080/smart/get-logs-by-id')
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        updateLogs(data.data, true);
      }
    })
    .catch(error => {
      console.error('获取日志失败:', error);
    });
}

// 新增：获取最近一分钟的日志
function fetchRecentLogs() {
  fetch('http://localhost:8080/smart/get-rec-logs-by-id')
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        updateLogs(data.data, false);
      }
    })
    .catch(error => {
      console.error('获取最近日志失败:', error);
    });
}

// 新增：更新日志显示
function updateLogs(logsArray, replaceAll) {
  const logContainer = document.getElementById('log-container');

  // 如果需要替换所有日志，先清空容器
  if (replaceAll) {
    logContainer.innerHTML = '';
  }

  // 将新日志添加到容器底部（最新的在下面）
  logsArray.forEach(log => {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry highlight'; // 添加高亮样式

    // 解析日志格式 [timestamp] message
    const logMatch = log.match(/^\[(.*?)\]\s*(.*)$/);

    if (logMatch) {
      const timestamp = logMatch[1];
      const message = logMatch[2];

      logEntry.innerHTML = `
        <span class="log-time">[${timestamp}]</span>
        <span>${message}</span>
      `;
    } else {
      // 如果格式不匹配，直接显示整个日志
      logEntry.innerHTML = `<span>${log}</span>`;
    }

    logContainer.appendChild(logEntry);

    // 设置1分钟后移除高亮效果
    setTimeout(() => {
      logEntry.classList.remove('highlight');
    }, 60000); // 1分钟
  });

  // 如果有新日志，滚动到底部
  if (logsArray.length > 0 && !replaceAll) {
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

// 新增：获取所有工艺状态的函数
function fetchProcessStates() {
  // 获取气举工艺状态
  fetch('http://localhost:8080/smart/get-gas-lift-state')
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        updateGasLiftState(data.data);
      }
    })
    .catch(error => {
      console.error('获取气举状态失败:', error);
    });

  // 获取泡排工艺状态
  fetch('http://localhost:8080/smart/get-foam-state')
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        updateFoamState(data.data);
      }
    })
    .catch(error => {
      console.error('获取泡排状态失败:', error);
    });

  // 获取抽吸工艺状态
  fetch('http://localhost:8080/smart/get-pump-state')
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        updatePumpState(data.data);
      }
    })
    .catch(error => {
      console.error('获取抽吸状态失败:', error);
    });
}

// 新增：更新气举工艺状态
function updateGasLiftState(data) {
  const gasLift = systemData.processes.gasLift;

  // 更新运行状态
  gasLift.enabled = data.running === 1.0;
  gasLift.glModel = data.gl_model_open === 1;

  // 更新参数
  gasLift.conditionParams.pressureDiff = data.start_pressure.toFixed(2);
  gasLift.smartParams.gasRate = data.inj_rate.toFixed(2);
  gasLift.smartParams.gasVolume = data.inj_volume.toFixed(2);
  gasLift.smartParams.gasTime = data.inj_time.toFixed(2);
  gasLift.defaultParams.gasRate = data.inj_rate_default.toFixed(2);
  gasLift.defaultParams.gasTime = data.inj_time_default.toFixed(2);

  // 更新运行时间
  gasLift.runTime.current = data.kept_duration;
  gasLift.runTime.total = data.total_duration;

  // 更新进度
  gasLift.progress = data.progress * 100;

  // 更新页面显示
  updateProcessParams();
  updateProcessStatusGL('gasLift', gasLift.enabled, gasLift.glModel);
}

// 新增：更新泡排工艺状态
function updateFoamState(data) {
  const foam = systemData.processes.foam;

  // 更新运行状态
  foam.enabled = data.running === 1;

  // 更新参数
  foam.conditionParams.pressureDiff = data.start_pressure.toFixed(2);
  foam.smartParams.injectionRate = data.inj_rate.toFixed(2);
  foam.smartParams.injectionVolume = data.inj_volume.toFixed(2);
  foam.smartParams.injectionTime = data.inj_time.toFixed(2);
  foam.smartParams.liquidAccumulation = data.fluid_volume.toFixed(2);
  foam.defaultParams.injectionRate = data.inj_rate_default.toFixed(2);
  foam.defaultParams.injectionTime = data.inj_time_default.toFixed(2);

  // 更新运行时间
  foam.runTime.current = data.kept_duration;
  foam.runTime.total = data.total_duration;

  // 更新注入量
  foam.injectedVolume.current = data.inj_volume;
  foam.injectedVolume.total = data.fluid_volume;

  // 更新进度
  foam.progress = data.progress * 100;

  // 更新页面显示
  updateProcessParams();
  updateProcessStatus('foam', foam.enabled);
}

// 新增：更新抽吸工艺状态
function updatePumpState(data) {
  const suction = systemData.processes.suction;

  // 更新运行状态
  suction.enabled = data.running === 1.0;

  // 更新参数
  suction.conditionParams.wellheadPressure = data.start_pressure.toFixed(2);
  suction.smartParams.machines = data.machine_count.toFixed(0);
  suction.smartParams.power = `${data.machine_power.toFixed(2)}W`;
  suction.defaultParams.machines = data.machine_count_default.toFixed(0);

  // 更新运行时间
  suction.runTime.current = data.kept_duration;
  suction.runTime.total = data.total_duration;

  // 更新进度
  suction.progress = data.progress * 100;

  // 更新页面显示
  updateProcessParams();
  updateProcessStatus('suction', suction.enabled);
}

// 新增：更新工艺状态显示
function updateProcessStatus(processType, isEnabled) {
  const processCard = document.querySelector(`[data-process="${processType}"]`).closest('.process-card');
  const statusBadge = processCard.querySelector('.status-badge');

  if (isEnabled) {
    statusBadge.textContent = '运行中';
    statusBadge.className = 'status-badge active';
    processCard.style.borderColor = '#34a853'; // 绿色边框
  } else {
    statusBadge.textContent = '未开启';
    statusBadge.className = 'status-badge inactive';
    processCard.style.borderColor = '#ea4335'; // 红色边框
  }
}

function updateProcessStatusGL(processType, isEnabled, isOpen) {
    const processCard = document.querySelector(`[data-process="${processType}"]`).closest('.process-card');
    const statusBadge = processCard.querySelector('.status-badge');
    const glBanner = document.getElementById('gl-banner');

    // 保留原有的 isEnabled 逻辑
    if (isEnabled) {
        statusBadge.textContent = '运行中';
        statusBadge.className = 'status-badge active';
    } else {
        statusBadge.textContent = '未开启';
        statusBadge.className = 'status-badge inactive';
    }

    // 添加的新功能：根据 isOpen 参数更新第二个标签和边框
    if (isOpen) {
        glBanner.textContent = '已解禁';
        glBanner.className = 'status-badge active';
        processCard.style.borderColor = '#34a853'; // 绿色边框
    } else {
        glBanner.textContent = '已禁用';
        glBanner.className = 'status-badge inactive';
        processCard.style.borderColor = '#ea4335'; // 红色边框
    }
}

// 新增：定时获取机组状态和生产数据的功能
function fetchCrewData() {
  fetch('http://localhost:8080/smart/get-crew-snap')
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        // 更新机组状态
        systemData.crew = [
          data.data.u1,
          data.data.u2,
          data.data.u3,
          data.data.u4,
          data.data.u5,
          data.data.u6
        ];

        // 更新生产参数
        systemData.production = {
          dailyGas: data.data.gas_flow,
          dailyLiquid: data.data.water_flow,
          tubingPressure: data.data.tubing_pressure / 100,
          casingPressure: data.data.casing_pressure / 100
        };

        // 更新页面显示
        updateProductionParams();
        updateCrewStatus(); // 新增函数，用于更新机组状态显示
      }
    })
    .catch(error => {
      console.error('获取数据失败:', error);
    });
}

// 新增：更新机组状态显示
function updateCrewStatus() {
  const indicators = document.querySelectorAll('.indicator');

  systemData.crew.forEach((status, index) => {
    const indicator = indicators[index];
    const statusDot = indicator.querySelector('.status-dot');
    const statusBadge = indicator.querySelector('.status-badge');

    // 根据状态更新样式
    if (status === 1) {
      statusDot.className = 'status-dot green';
      statusBadge.textContent = '运行中';
      statusBadge.className = 'status-badge active';
    } else {
      statusDot.className = 'status-dot red';
      statusBadge.textContent = '未开启';
      statusBadge.className = 'status-badge inactive';
    }
  });
}

// 设置事件监听器
function setupEventListeners() {
  // 修复：使用事件委托确保所有按钮都能被监听
  document.addEventListener('click', function(e) {
    if (e.target.closest('.edit-btn')) {
      const button = e.target.closest('.edit-btn');
      const processType = button.getAttribute('data-process');
      openEditModal(processType);
    }
  });

  // 为工艺卡片添加 data-process 属性
  document.querySelector('[data-process="suction"]').closest('.process-card').setAttribute('data-process', 'suction');
  document.querySelector('[data-process="foam"]').closest('.process-card').setAttribute('data-process', 'foam');
  document.querySelector('[data-process="gasLift"]').closest('.process-card').setAttribute('data-process', 'gasLift');

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
  document.getElementById('suction-wellhead-pressure').textContent = `${suction.conditionParams.wellheadPressure}MPa`;
  document.getElementById('suction-machines').textContent = `${suction.smartParams.machines}台`;
  document.getElementById('suction-power').textContent = suction.smartParams.power;
  document.getElementById('suction-default-machines').textContent = `${suction.defaultParams.machines}台`;
  document.getElementById('suction-time').textContent = `${suction.runTime.current} / ${suction.runTime.total}`;
  document.getElementById('suction-progress').style.width = `${suction.progress}%`;

  // 泡排工艺
  const foam = systemData.processes.foam;
  document.getElementById('foam-pressure-diff').textContent = `${foam.conditionParams.pressureDiff}MPa`;
  document.getElementById('foam-liquid-accumulation').textContent = `${foam.smartParams.liquidAccumulation}m³`;
  document.getElementById('foam-injection-volume').textContent = `${foam.smartParams.injectionVolume}L`;
  document.getElementById('foam-injection-rate').textContent = `${foam.smartParams.injectionRate}L/h`;
  document.getElementById('foam-injection-time').textContent = `${foam.smartParams.injectionTime}小时`;
  document.getElementById('foam-default-rate').textContent = `${foam.defaultParams.injectionRate}L/h`;
  document.getElementById('foam-default-time').textContent = `${foam.defaultParams.injectionTime}小时`;
  document.getElementById('foam-time').textContent = `${foam.runTime.current} / ${foam.runTime.total}`;
  document.getElementById('foam-progress').style.width = `${foam.progress}%`;

  // 气举工艺
  const gasLift = systemData.processes.gasLift;
  document.getElementById('gasLift-pressure-diff').textContent = `${gasLift.conditionParams.pressureDiff}MPa`;
  document.getElementById('gasLift-gas-volume').textContent = `${gasLift.smartParams.gasVolume}m³`;
  document.getElementById('gasLift-gas-rate').textContent = `${gasLift.smartParams.gasRate}m³/h`;
  document.getElementById('gasLift-gas-time').textContent = `${gasLift.smartParams.gasTime}小时`;
  document.getElementById('gasLift-default-rate').textContent = `${gasLift.defaultParams.gasRate}m³/h`;
  document.getElementById('gasLift-default-time').textContent = `${gasLift.defaultParams.gasTime}小时`;
  document.getElementById('gasLift-time').textContent = `${gasLift.runTime.current} / ${gasLift.runTime.total}`;
  document.getElementById('gasLift-progress').style.width = `${gasLift.progress}%`;
}

// 打开编辑模态窗口
function openEditModal(processType) {
  currentEditingProcess = processType;
  const process = systemData.processes[processType];
  const modal = document.getElementById('edit-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');

  // 清空表单内容
  modalForm.innerHTML = '';

  // 设置模态窗口标题
  modalTitle.textContent = `编辑${getProcessName(processType)}参数`;

  // 根据工艺类型生成表单
  if (processType === 'suction') {
    // 抽吸工艺只显示机器数量
    modalForm.innerHTML = `
      <div class="form-group">
        <label for="suction-machines">机器数量</label>
        <input type="number" id="suction-machines-input" value="${process.defaultParams.machines}">
      </div>
    `;
  } else if (processType === 'foam') {
    // 泡排工艺显示加注速率和加注时间
    modalForm.innerHTML = `
      <div class="form-group">
        <label for="foam-injection-rate">加注速率 (L/h)</label>
        <input type="number" id="foam-injection-rate-input" value="${process.defaultParams.injectionRate}">
      </div>
      <div class="form-group">
        <label for="foam-injection-time">加注时间 (小时)</label>
        <input type="number" step="0.1" id="foam-injection-time-input" value="${process.defaultParams.injectionTime}">
      </div>
    `;
  } else if (processType === 'gasLift') {
    // 气举工艺显示注气速率和注气时间
    modalForm.innerHTML = `
      <div class="form-group">
        <label for="gasLift-gas-rate">注气速率 (m³/h)</label>
        <input type="number" id="gasLift-gas-rate-input" value="${process.defaultParams.gasRate}">
      </div>
      <div class="form-group">
        <label for="gasLift-gas-time">注气时间 (小时)</label>
        <input type="number" step="0.1" id="gasLift-gas-time-input" value="${process.defaultParams.gasTime}">
      </div>
    `;
  }

  // 显示模态窗口
  modal.style.display = 'block';
}

// 根据工艺类型获取工艺名称
function getProcessName(processType) {
  const names = {
    'suction': '抽吸混输',
    'foam': '泡排',
    'gasLift': '气举'
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

  // 根据工艺类型保存参数
  if (currentEditingProcess === 'suction') {
    const machinesInput = document.getElementById('suction-machines-input');
    const machinesValue = parseFloat(machinesInput.value);
    if (!isNaN(machinesValue)) {
      process.defaultParams.machines = machinesValue;
    } else {
      showNotification('请输入有效的机器数量');
      return;
    }
  } else if (currentEditingProcess === 'foam') {
    const injectionRateInput = document.getElementById('foam-injection-rate-input');
    const injectionTimeInput = document.getElementById('foam-injection-time-input');

    const injectionRateValue = parseFloat(injectionRateInput.value);
    const injectionTimeValue = parseFloat(injectionTimeInput.value);

    if (!isNaN(injectionRateValue) && !isNaN(injectionTimeValue)) {
      process.defaultParams.injectionRate = injectionRateValue;
      process.defaultParams.injectionTime = injectionTimeValue;
    } else {
      showNotification('请输入有效的加注参数');
      return;
    }
  } else if (currentEditingProcess === 'gasLift') {
    const gasRateInput = document.getElementById('gasLift-gas-rate-input');
    const gasTimeInput = document.getElementById('gasLift-gas-time-input');

    const gasRateValue = parseFloat(gasRateInput.value);
    const gasTimeValue = parseFloat(gasTimeInput.value);

    if (!isNaN(gasRateValue) && !isNaN(gasTimeValue)) {
      process.defaultParams.gasRate = gasRateValue;
      process.defaultParams.gasTime = gasTimeValue;
    } else {
      showNotification('请输入有效的注气参数');
      return;
    }
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

function toAutoHome(){
  window.location.href = 'AutoHome.html';
}

function editParam() {
    // 创建模态窗口
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    // 创建模态内容
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.width = '400px';
    modalContent.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';

    // 标题
    const title = document.createElement('h2');
    title.textContent = '气井参数编辑';
    title.style.marginBottom = '20px';
    title.style.color = '#1a73e8';
    title.style.textAlign = 'center';

    // 参数输入表单
    const form = document.createElement('div');

    // 垂直深度
    const verticalDepthGroup = createInputGroup('verticalDepth', '垂直深度 (米)');
    // 水平长度
    const horizontalLengthGroup = createInputGroup('horizontalLength', '水平长度 (米)');
    // 油管直径
    const tubingDiameterGroup = createInputGroup('tubingDiameter', '油管直径 (米)');
    // 套管直径
    const casingDiameterGroup = createInputGroup('casingDiameter', '套管直径 (米)');

    form.appendChild(verticalDepthGroup);
    form.appendChild(horizontalLengthGroup);
    form.appendChild(tubingDiameterGroup);
    form.appendChild(casingDiameterGroup);

    // 按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginTop = '20px';

    // 启动按钮
    const startButton = document.createElement('button');
    startButton.textContent = '修改参数';
    startButton.style.padding = '10px 20px';
    startButton.style.backgroundColor = '#1a73e8';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '4px';
    startButton.style.cursor = 'pointer';
    startButton.style.fontWeight = 'bold';

    // 取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.backgroundColor = '#f1f3f4';
    cancelButton.style.color = '#5f6368';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(startButton);

    // 组装模态内容
    modalContent.appendChild(title);
    modalContent.appendChild(form);
    modalContent.appendChild(buttonContainer);

    // 添加到模态窗口
    modal.appendChild(modalContent);

    // 添加到文档
    document.body.appendChild(modal);

    // 取消按钮事件
    cancelButton.addEventListener('click', function() {
      document.body.removeChild(modal);
    });

    // 启动按钮事件
    startButton.addEventListener('click', function() {
      // 获取输入值
      const verticalDepth = document.getElementById('verticalDepth').value;
      const horizontalLength = document.getElementById('horizontalLength').value;
      const tubingDiameter = document.getElementById('tubingDiameter').value;
      const casingDiameter = document.getElementById('casingDiameter').value;

      // 验证输入
      if (!verticalDepth || !horizontalLength || !tubingDiameter || !casingDiameter) {
        alert('请填写所有气井参数！');
        return;
      }

      // 转换为浮点数
      const params = {
        verticalDepth: parseFloat(verticalDepth),
        horizontalLength: parseFloat(horizontalLength),
        tubingDiameter: parseFloat(tubingDiameter),
        casingDiameter: parseFloat(casingDiameter)
      };

      // 验证是否为有效数字
      if (isNaN(params.verticalDepth) || isNaN(params.horizontalLength) ||
          isNaN(params.tubingDiameter) || isNaN(params.casingDiameter)) {
        alert('请输入有效的数字参数！');
        return;
      }

      // 调用API
      fetch('http://localhost:8080/smart/edit-params', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('网络响应异常');
      })
      .then(data => {
        if (data.code === 200) {
          // 提示
          alert('参数修改成功');
          document.body.removeChild(modal);
        } else {
          alert('参数修改失败: ' + (data.message || '未知错误'));
        }
      })
      .catch(error => {
        console.error('请求失败:', error);
        alert('参数修改失败，请检查网络连接或后端服务');
      });
    });
}

function printData(){
  // 创建模态窗口
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';

  // 创建模态内容
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.padding = '30px';
  modalContent.style.borderRadius = '10px';
  modalContent.style.width = '600px';
  modalContent.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';

  // 标题
  const title = document.createElement('h2');
  title.textContent = '导出生产数据';
  title.style.marginBottom = '20px';
  title.style.color = '#1a73e8';
  title.style.textAlign = 'center';

  // 日期输入表单
  const form = document.createElement('div');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '15px';

  // 获取当前日期（ISO格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  // 开始日期输入
  const startDateGroup = document.createElement('div');
  startDateGroup.style.display = 'flex';
  startDateGroup.style.flexDirection = 'column';

  const startDateLabel = document.createElement('label');
  startDateLabel.textContent = '开始日期';
  startDateLabel.style.marginBottom = '5px';
  startDateLabel.style.fontWeight = '500';

  const startDateInput = document.createElement('input');
  startDateInput.type = 'date';
  startDateInput.id = 'startDate';
  startDateInput.value = today;
  startDateInput.style.padding = '10px';
  startDateInput.style.border = '1px solid #dadce0';
  startDateInput.style.borderRadius = '4px';

  startDateGroup.appendChild(startDateLabel);
  startDateGroup.appendChild(startDateInput);

  // 结束日期输入
  const endDateGroup = document.createElement('div');
  endDateGroup.style.display = 'flex';
  endDateGroup.style.flexDirection = 'column';

  const endDateLabel = document.createElement('label');
  endDateLabel.textContent = '结束日期';
  endDateLabel.style.marginBottom = '5px';
  endDateLabel.style.fontWeight = '500';

  const endDateInput = document.createElement('input');
  endDateInput.type = 'date';
  endDateInput.id = 'endDate';
  endDateInput.value = today;
  endDateInput.style.padding = '10px';
  endDateInput.style.border = '1px solid #dadce0';
  endDateInput.style.borderRadius = '4px';

  endDateGroup.appendChild(endDateLabel);
  endDateGroup.appendChild(endDateInput);

  form.appendChild(startDateGroup);
  form.appendChild(endDateGroup);

  // 按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'space-between';
  buttonContainer.style.marginTop = '20px';

  // 取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  cancelButton.style.padding = '10px 20px';
  cancelButton.style.backgroundColor = '#f1f3f4';
  cancelButton.style.color = '#5f6368';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '4px';
  cancelButton.style.cursor = 'pointer';
  cancelButton.style.transition = 'background 0.2s ease';

  // 导出按钮1-5
  const exportButton1 = document.createElement('button1');
  exportButton1.textContent = '导出1';
  exportButton1.style.padding = '10px 20px';
  exportButton1.style.backgroundColor = '#1a73e8';
  exportButton1.style.color = 'white';
  exportButton1.style.border = 'none';
  exportButton1.style.borderRadius = '4px';
  exportButton1.style.cursor = 'pointer';
  exportButton1.style.fontWeight = 'bold';
  exportButton1.style.transition = 'background 0.2s ease';

  const exportButton2 = document.createElement('button2');
  exportButton2.textContent = '导出2';
  exportButton2.style.padding = '10px 20px';
  exportButton2.style.backgroundColor = '#1a73e8';
  exportButton2.style.color = 'white';
  exportButton2.style.border = 'none';
  exportButton2.style.borderRadius = '4px';
  exportButton2.style.cursor = 'pointer';
  exportButton2.style.fontWeight = 'bold';
  exportButton2.style.transition = 'background 0.2s ease';

  const exportButton3 = document.createElement('button3');
  exportButton3.textContent = '导出3';
  exportButton3.style.padding = '10px 20px';
  exportButton3.style.backgroundColor = '#1a73e8';
  exportButton3.style.color = 'white';
  exportButton3.style.border = 'none';
  exportButton3.style.borderRadius = '4px';
  exportButton3.style.cursor = 'pointer';
  exportButton3.style.fontWeight = 'bold';
  exportButton3.style.transition = 'background 0.2s ease';

  const exportButton4 = document.createElement('button4');
  exportButton4.textContent = '导出4';
  exportButton4.style.padding = '10px 20px';
  exportButton4.style.backgroundColor = '#1a73e8';
  exportButton4.style.color = 'white';
  exportButton4.style.border = 'none';
  exportButton4.style.borderRadius = '4px';
  exportButton4.style.cursor = 'pointer';
  exportButton4.style.fontWeight = 'bold';
  exportButton4.style.transition = 'background 0.2s ease';

  const exportButton5 = document.createElement('button5');
  exportButton5.textContent = '导出5';
  exportButton5.style.padding = '10px 20px';
  exportButton5.style.backgroundColor = '#1a73e8';
  exportButton5.style.color = 'white';
  exportButton5.style.border = 'none';
  exportButton5.style.borderRadius = '4px';
  exportButton5.style.cursor = 'pointer';
  exportButton5.style.fontWeight = 'bold';
  exportButton5.style.transition = 'background 0.2s ease';

  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(exportButton1);
  buttonContainer.appendChild(exportButton2);
  buttonContainer.appendChild(exportButton3);
  buttonContainer.appendChild(exportButton4);
  buttonContainer.appendChild(exportButton5);

  // 组装模态内容
  modalContent.appendChild(title);
  modalContent.appendChild(form);
  modalContent.appendChild(buttonContainer);

  // 添加到模态窗口
  modal.appendChild(modalContent);

  // 添加到文档
  document.body.appendChild(modal);

  // 取消按钮事件 - 关闭模态窗口
  cancelButton.addEventListener('click', function() {
      document.body.removeChild(modal);
  });

  // 导出按钮事件
  exportButton1.addEventListener('click', function() {
      // 获取输入值
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;

      // 验证输入
      if (!startDate || !endDate) {
          alert('请选择开始日期和结束日期！');
          return;
      }

      // 检查日期范围是否有效
      if (new Date(startDate) > new Date(endDate)) {
          alert('开始日期不能晚于结束日期！');
          return;
      }

      // 调用简化导出API
      const url = `http://localhost:8080/printer/print-data1?startDate=${startDate}&endDate=${endDate}`;

      // 创建隐藏链接进行下载
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dfp1_export.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

//      // 调用导出API
//      fetch('http://localhost:8080/printer/print-data', {
//          method: 'POST',
//          headers: {
//              'Content-Type': 'application/json'
//          },
//          body: JSON.stringify({
//              startDate: startDate,
//              endDate: endDate
//          })
//      })
//      .then(response => {
//          if (response.ok) {
//              return response.json();
//          }
//          throw new Error('网络响应异常');
//      })
//      .then(data => {
//          if (data.code === 200) {
//              alert('导出成功！');
//              document.body.removeChild(modal);
//          } else {
//              alert('导出失败: ' + (data.message || '未知错误'));
//          }
//      })
//      .catch(error => {
//          console.error('导出失败:', error);
//          alert('导出失败，请检查网络连接或后端服务');
//      });
  });

  exportButton2.addEventListener('click', function() {
      // 获取输入值
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;

      // 验证输入
      if (!startDate || !endDate) {
          alert('请选择开始日期和结束日期！');
          return;
      }

      // 检查日期范围是否有效
      if (new Date(startDate) > new Date(endDate)) {
          alert('开始日期不能晚于结束日期！');
          return;
      }

      // 调用简化导出API
      const url = `http://localhost:8080/printer/print-data2?startDate=${startDate}&endDate=${endDate}`;

      // 创建隐藏链接进行下载
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dfp2_export.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  });

  exportButton3.addEventListener('click', function() {
      // 获取输入值
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;

      // 验证输入
      if (!startDate || !endDate) {
          alert('请选择开始日期和结束日期！');
          return;
      }

      // 检查日期范围是否有效
      if (new Date(startDate) > new Date(endDate)) {
          alert('开始日期不能晚于结束日期！');
          return;
      }

      // 调用简化导出API
      const url = `http://localhost:8080/printer/print-data3?startDate=${startDate}&endDate=${endDate}`;

      // 创建隐藏链接进行下载
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dfp3_export.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

//      // 调用导出API
//      fetch('http://localhost:8080/printer/print-data', {
//          method: 'POST',
//          headers: {
//              'Content-Type': 'application/json'
//          },
//          body: JSON.stringify({
//              startDate: startDate,
//              endDate: endDate
//          })
//      })
//      .then(response => {
//          if (response.ok) {
//              return response.json();
//          }
//          throw new Error('网络响应异常');
//      })
//      .then(data => {
//          if (data.code === 200) {
//              alert('导出成功！');
//              document.body.removeChild(modal);
//          } else {
//              alert('导出失败: ' + (data.message || '未知错误'));
//          }
//      })
//      .catch(error => {
//          console.error('导出失败:', error);
//          alert('导出失败，请检查网络连接或后端服务');
//      });
  });

  exportButton4.addEventListener('click', function() {
      // 获取输入值
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;

      // 验证输入
      if (!startDate || !endDate) {
          alert('请选择开始日期和结束日期！');
          return;
      }

      // 检查日期范围是否有效
      if (new Date(startDate) > new Date(endDate)) {
          alert('开始日期不能晚于结束日期！');
          return;
      }

      // 调用简化导出API
      const url = `http://localhost:8080/printer/print-data4?startDate=${startDate}&endDate=${endDate}`;

      // 创建隐藏链接进行下载
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dfp4_export.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

//      // 调用导出API
//      fetch('http://localhost:8080/printer/print-data', {
//          method: 'POST',
//          headers: {
//              'Content-Type': 'application/json'
//          },
//          body: JSON.stringify({
//              startDate: startDate,
//              endDate: endDate
//          })
//      })
//      .then(response => {
//          if (response.ok) {
//              return response.json();
//          }
//          throw new Error('网络响应异常');
//      })
//      .then(data => {
//          if (data.code === 200) {
//              alert('导出成功！');
//              document.body.removeChild(modal);
//          } else {
//              alert('导出失败: ' + (data.message || '未知错误'));
//          }
//      })
//      .catch(error => {
//          console.error('导出失败:', error);
//          alert('导出失败，请检查网络连接或后端服务');
//      });
  });

  exportButton5.addEventListener('click', function() {
      // 获取输入值
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;

      // 验证输入
      if (!startDate || !endDate) {
          alert('请选择开始日期和结束日期！');
          return;
      }

      // 检查日期范围是否有效
      if (new Date(startDate) > new Date(endDate)) {
          alert('开始日期不能晚于结束日期！');
          return;
      }

      // 调用简化导出API
      const url = `http://localhost:8080/printer/print-data5?startDate=${startDate}&endDate=${endDate}`;

      // 创建隐藏链接进行下载
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dfp5_export.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  });


  // 添加悬停效果
  cancelButton.addEventListener('mouseenter', () => {
      cancelButton.style.backgroundColor = '#e8eaed';
  });
  cancelButton.addEventListener('mouseleave', () => {
      cancelButton.style.backgroundColor = '#f1f3f4';
  });

  exportButton.addEventListener('mouseenter', () => {
      exportButton.style.backgroundColor = '#1557b7';
  });
  exportButton.addEventListener('mouseleave', () => {
      exportButton.style.backgroundColor = '#1a73e8';
  });
}

function stopAll() {
    // 创建模态窗口
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    // 创建模态内容
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.width = '400px';
    modalContent.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';

    // 标题
    const title = document.createElement('h2');
    title.textContent = '关闭所有工艺设备';
    title.style.marginBottom = '20px';
    title.style.color = '#1a73e8';
    title.style.textAlign = 'center';

    // 参数输入表单
    const form = document.createElement('div');

    //提示
    const tips = document.createElement('h3');
    tips.textContent = '确认关闭后，现场的所有气举/泡排/抽吸相关设备将立即关闭！(数据显示可能存在最多一分钟延迟)';
    tips.style.marginBottom = '20px';
    tips.style.color = '#1a73e8';

    const openGroup = createBooleanInputGroup('isclose', '是否关闭全部设备');

    form.appendChild(tips);
    form.appendChild(openGroup);

    // 按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginTop = '20px';

    // 启动按钮
    const startButton = document.createElement('button');
    startButton.textContent = '确认';
    startButton.style.padding = '10px 20px';
    startButton.style.backgroundColor = '#1a73e8';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '4px';
    startButton.style.cursor = 'pointer';
    startButton.style.fontWeight = 'bold';

    // 取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.backgroundColor = '#f1f3f4';
    cancelButton.style.color = '#5f6368';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(startButton);

    // 组装模态内容
    modalContent.appendChild(title);
    modalContent.appendChild(form);
    modalContent.appendChild(buttonContainer);

    // 添加到模态窗口
    modal.appendChild(modalContent);

    // 添加到文档
    document.body.appendChild(modal);

    // 取消按钮事件
    cancelButton.addEventListener('click', function() {
      document.body.removeChild(modal);
    });

    // 启动按钮事件
    startButton.addEventListener('click', function() {
      // 获取输入值
      const openValue = getBooleanInputValue('isclose');

      // 验证是否为有效数字
      if (!openValue) {
        alert('请输入有效的参数！');
        return;
      }

      fetch('http://localhost:8080/smart/stop-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(openValue)
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('网络响应异常');
      })
      .then(data => {
        if (data.code === 200) {
          // 提示
          if(openValue === "yes"){
            alert('所有工艺设备已经关闭');
          }

          document.body.removeChild(modal);
        } else {
          alert('参数修改失败: ' + (data.message || '未知错误'));
        }
      })
      .catch(error => {
        console.error('请求失败:', error);
        alert('参数修改失败，请检查网络连接或后端服务');
      });
    });
}

// 创建输入组的辅助函数
function createInputGroup(id, label) {
  const group = document.createElement('div');
  group.style.marginBottom = '15px';

  const labelEl = document.createElement('label');
  labelEl.textContent = label;
  labelEl.style.display = 'block';
  labelEl.style.marginBottom = '5px';
  labelEl.style.fontWeight = '500';

  const input = document.createElement('input');
  input.type = 'number';
  input.step = '0.001';
  input.id = id;
  input.style.width = '100%';
  input.style.padding = '10px';
  input.style.border = '1px solid #dadce0';
  input.style.borderRadius = '4px';
  input.style.fontSize = '16px';

  group.appendChild(labelEl);
  group.appendChild(input);

  return group;
}

// 创建布尔值输入组
function createBooleanInputGroup(id, label) {
    const group = document.createElement('div');
    group.className = 'boolean-input-group';
    group.id = `group-${id}`;

    const labelEl = document.createElement('label');
    labelEl.className = 'boolean-label';
    labelEl.textContent = label;
    labelEl.htmlFor = id;

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'boolean-options';

    // 创建"是"选项
    const yesOption = createBooleanOption(id, 'yes', '是');
    // 创建"否"选项
    const noOption = createBooleanOption(id, 'no', '否');

    optionsContainer.appendChild(yesOption);
    optionsContainer.appendChild(noOption);

    group.appendChild(labelEl);
    group.appendChild(optionsContainer);

    return group;
}

// 创建单个选项
function createBooleanOption(groupId, value, label) {
    const option = document.createElement('div');
    option.className = 'boolean-option';
    option.dataset.value = value;

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = groupId;
    radio.value = value;
    radio.id = `${groupId}-${value}`;
    radio.style.display = 'none';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.htmlFor = radio.id;

    option.appendChild(radio);
    option.appendChild(labelEl);

    // 添加点击事件处理
    option.addEventListener('click', function() {
        // 选中当前选项
        radio.checked = true;

        // 更新视觉状态
        const group = document.getElementById(`group-${groupId}`);
        const options = group.querySelectorAll('.boolean-option');
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
    });

    return option;
}

// 获取布尔值输入的值
function getBooleanInputValue(id) {
    const selectedOption = document.querySelector(`input[name="${id}"]:checked`);
    return selectedOption ? selectedOption.value : null;
}
