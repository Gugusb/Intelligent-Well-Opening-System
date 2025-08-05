// 全局变量 - 参数存储
const REFRESH_INTERVAL = 5000; // 5秒刷新一次
let parameters = {
  units: {
    '1': { startHr: 0, startMin: 0, stopHr: 0, stopMin: 0, startPressure: 0, stopPressure: 0, leftValve: 0, rightValve: 0 },
    '2': { startHr: 0, startMin: 0, stopHr: 0, stopMin: 0, startPressure: 0, stopPressure: 0, leftValve: 0, rightValve: 0 },
    '3': { startHr: 0, startMin: 0, stopHr: 0, stopMin: 0, startPressure: 0, stopPressure: 0, leftValve: 0, rightValve: 0 },
    '4': { startHr: 0, startMin: 0, stopHr: 0, stopMin: 0, startPressure: 0, stopPressure: 0, leftValve: 0, rightValve: 0 },
    '5': { startHr: 0, startMin: 0, stopHr: 0, stopMin: 0, startPressure: 0, stopPressure: 0, leftValve: 0, rightValve: 0 }
  },
  gasLifts: {
    '1': { leftValve: 0, rightValve: 0 },
    '2': { leftValve: 0, rightValve: 0 }
  }
};

// 更新时间显示
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

// 刷新所有参数显示
function refreshAllParameters() {
  // 更新机组参数显示
  for (const unitId in parameters.units) {
    const unit = parameters.units[unitId];
    document.getElementById(`unit${unitId}-start-time`).textContent =
      `${unit.startHr} 时 ${unit.startMin} 分`;
    document.getElementById(`unit${unitId}-stop-time`).textContent =
      `${unit.stopHr} 时 ${unit.stopMin} 分`;
    document.getElementById(`unit${unitId}-start-pressure-val`).textContent =
      `${unit.startPressure} MPa`;
    document.getElementById(`unit${unitId}-stop-pressure-val`).textContent =
      `${unit.stopPressure} MPa`;
    document.getElementById(`unit${unitId}-left-valve-val`).textContent =
      `${unit.leftValve} S`;
    document.getElementById(`unit${unitId}-right-valve-val`).textContent =
      `${unit.rightValve} S`;
  }

  // 更新气举参数显示
  const gas1 = parameters.gasLifts['1'];
  document.getElementById('gas1-left-valve-val').textContent = `${gas1.leftValve} S`;
  document.getElementById('gas1-right-valve-val').textContent = `${gas1.rightValve} S`;

  const gas2 = parameters.gasLifts['2'];
  document.getElementById('gas2-left-valve-val').textContent = `${gas2.leftValve} S`;
  document.getElementById('gas2-right-valve-val').textContent = `${gas2.rightValve} S`;
}

// 创建参数输入模态框
function createParameterInputModal(unitId, paramType, paramName) {
  // 创建模态框容器
  const modal = document.createElement('div');
  modal.id = 'input-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';

  // 创建模态框内容
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'rgba(0, 40, 80, 0.9)';
  modalContent.style.border = '2px solid rgba(64, 224, 255, 0.5)';
  modalContent.style.borderRadius = '15px';
  modalContent.style.padding = '30px';
  modalContent.style.width = '400px';
  modalContent.style.boxShadow = '0 0 30px rgba(64, 224, 255, 0.6)';

  // 创建标题
  const title = document.createElement('h2');
  title.textContent = `设置 ${unitId}# ${paramName}`;
  title.style.color = '#7bb9ff';
  title.style.textAlign = 'center';
  title.style.marginBottom = '25px';
  title.style.textShadow = '0 0 10px rgba(64, 224, 255, 0.5)';

  // 创建输入框
  const input = document.createElement('input');
  input.type = 'number';
  input.id = 'param-input';
  input.style.width = '100%';
  input.style.padding = '12px';
  input.style.marginBottom = '25px';
  input.style.background = 'rgba(0, 30, 60, 0.8)';
  input.style.border = '1px solid rgba(64, 224, 255, 0.3)';
  input.style.borderRadius = '8px';
  input.style.color = '#fff';
  input.style.fontSize = '1.1rem';
  input.style.textAlign = 'center';

  // 创建按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.gap = '20px';

  // 创建确定按钮
  const confirmButton = document.createElement('button');
  confirmButton.textContent = '确定';
  confirmButton.style.padding = '10px 25px';
  confirmButton.style.background = 'linear-gradient(to bottom, #3a5fcd, #1a3a8f)';
  confirmButton.style.color = 'white';
  confirmButton.style.border = 'none';
  confirmButton.style.borderRadius = '8px';
  confirmButton.style.fontSize = '1.1rem';
  confirmButton.style.cursor = 'pointer';
  confirmButton.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.4)';

  // 创建取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  cancelButton.style.padding = '10px 25px';
  cancelButton.style.background = 'linear-gradient(to bottom, #8B0000, #660000)';
  cancelButton.style.color = 'white';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '8px';
  cancelButton.style.fontSize = '1.1rem';
  cancelButton.style.cursor = 'pointer';
  cancelButton.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.4)';

  // 添加按钮事件
  confirmButton.onclick = function() {
    const value = parseFloat(input.value);
    if (!isNaN(value)) {
      // 根据参数类型更新对应变量
      if (paramType === 'start-hr') {
        parameters.units[unitId].startHr = value;
      } else if (paramType === 'start-min') {
        parameters.units[unitId].startMin = value;
      } else if (paramType === 'stop-hr') {
        parameters.units[unitId].stopHr = value;
      } else if (paramType === 'stop-min') {
        parameters.units[unitId].stopMin = value;
      } else if (paramType === 'start-pressure') {
        parameters.units[unitId].startPressure = value;
      } else if (paramType === 'stop-pressure') {
        parameters.units[unitId].stopPressure = value;
      } else if (paramType === 'left-valve') {
        if (unitId.startsWith('gas')) {
          const gasId = unitId.replace('gas', '');
          parameters.gasLifts[gasId].leftValve = value;
        } else {
          parameters.units[unitId].leftValve = value;
        }
      } else if (paramType === 'right-valve') {
        if (unitId.startsWith('gas')) {
          const gasId = unitId.replace('gas', '');
          parameters.gasLifts[gasId].rightValve = value;
        } else {
          parameters.units[unitId].rightValve = value;
        }
      }
      // 立即刷新显示
      refreshAllParameters();
    }
    document.body.removeChild(modal);
  };

  cancelButton.onclick = function() {
    document.body.removeChild(modal);
  };

  // 组装模态框
  buttonContainer.appendChild(confirmButton);
  buttonContainer.appendChild(cancelButton);

  modalContent.appendChild(title);
  modalContent.appendChild(input);
  modalContent.appendChild(buttonContainer);
  modal.appendChild(modalContent);

  // 添加模态框到页面
  document.body.appendChild(modal);

  // 聚焦输入框
  input.focus();
}

// 处理设置按钮点击
function handleSettingButtonClick() {
  const unit = this.dataset.unit;
  const type = this.dataset.type;

  // 确定参数名称
  const paramNames = {
    'start-hr': '启动小时',
    'start-min': '启动分钟',
    'stop-hr': '停止小时',
    'stop-min': '停止分钟',
    'start-pressure': '启动压力',
    'stop-pressure': '停止压力',
    'left-valve': '左阀时间',
    'right-valve': '右阀时间'
  };

  const paramName = paramNames[type] || type;

  // 创建参数输入模态框
  createParameterInputModal(unit, type, paramName);

  // 添加按钮视觉反馈
  this.style.boxShadow = '0 0 15px rgba(64, 224, 255, 0.8)';
  this.style.transform = 'scale(0.95)';
  setTimeout(() => {
    this.style.boxShadow = '';
    this.style.transform = '';
  }, 200);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 设置初始时间
  updateTime();

  // 每秒更新时间
  setInterval(updateTime, 1000);

  // 初始化刷新所有参数
  refreshAllParameters();

  // 设置定时刷新参数
  setInterval(refreshAllParameters, REFRESH_INTERVAL);

  // 设置按钮点击监听
  const settingButtons = document.querySelectorAll('.setting-button');
  settingButtons.forEach(button => {
    button.addEventListener('click', handleSettingButtonClick);
  });

  // 设置导航按钮效果
  const navButtons = document.querySelectorAll('.nav-button');
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      button.style.boxShadow = '0 0 20px rgba(64, 224, 255, 0.8)';
      button.style.transform = 'scale(0.98)';
      setTimeout(() => {
        button.style.boxShadow = '';
        button.style.transform = '';
      }, 200);

      // 提示功能
      if (button.textContent === '下一页') {
        alert('即将进入下一页设置界面');
      } else {
        alert('返回主监控页面');
      }
    });
  });
});
