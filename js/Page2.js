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

// 创建浮窗通知函数
function showNotification(message) {
  // 创建浮窗元素
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `<div class="notification-content">${message}</div>`;

  // 添加到body
  document.body.appendChild(notification);

  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(-100px);
                    background: white;
                    color: #2c3e50;
                    padding: 15px 25px;
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    opacity: 0;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    align-items: center;
                    max-width: 90%;
                    width: auto;
                    min-width: 300px;
                }

                .notification.show {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }

                .notification-content {
                    font-size: 16px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                }

                .notification-content::before {
                    content: '✓';
                    display: inline-block;
                    background: #2ecc71;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    text-align: center;
                    line-height: 24px;
                    margin-right: 12px;
                    font-weight: bold;
                }

                @media (max-width: 600px) {
                    .notification {
                        min-width: 250px;
                        padding: 12px 20px;
                    }

                    .notification-content {
                        font-size: 14px;
                    }
                }
            `;
  document.head.appendChild(style);

  // 显示通知
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // 3秒后移除通知
  setTimeout(() => {
    notification.classList.remove('show');
    // 动画结束后移除元素
    setTimeout(() => {
      document.body.removeChild(notification);
      document.head.removeChild(style);
    }, 300);
  }, 3000);
}

// 用户登陆验证
async function loginCheck(){
  const response = await fetch("http://localhost:8080/user/islogin", {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) {
    window.location.href = 'Page_login.html';
  }
}

async function refreshAllParameters() {
  try {
    // 使用正确的URL获取数据
    const backendData = await fetchData('http://localhost:8080/page2/getlastdata');

    if (!backendData) return; // 获取数据失败时保留原参数

    // 转换数据结构（更简洁的映射方式）
    const newParameters = {
      units: {},
      gasLifts: {}
    };

    // 批量映射机组参数
    [1, 2, 3, 4, 5].forEach(unitId => {
      newParameters.units[unitId] = {
        startHr: backendData[`unit${unitId}StartHour`],
        startMin: backendData[`unit${unitId}StartMinute`],
        stopHr: backendData[`unit${unitId}StopHour`],
        stopMin: backendData[`unit${unitId}StopMinute`],
        startPressure: backendData[`unit${unitId}StartPressure`],
        stopPressure: backendData[`unit${unitId}StopPressure`],
        leftValve: backendData[`unit${unitId}LeftValveTime`],
        rightValve: backendData[`unit${unitId}RightValveTime`]
      };
    });

    // 映射气举参数
    newParameters.gasLifts['1'] = {
      leftValve: backendData.gaslift1LeftValveTime,
      rightValve: backendData.gaslift1RightValveTime
    };

    newParameters.gasLifts['2'] = {
      leftValve: backendData.gaslift2LeftValveTime,
      rightValve: backendData.gaslift2RightValveTime
    };

    // 更新全局参数对象
    parameters = newParameters;

    // 更新页面显示（原有DOM更新逻辑保持不变）
    for (const unitId in parameters.units) {
      const unit = parameters.units[unitId];
      document.getElementById(`unit${unitId}StartTime`).textContent = `${unit.startHr} 时 ${unit.startMin} 分`;
      document.getElementById(`unit${unitId}StopTime`).textContent = `${unit.stopHr} 时 ${unit.stopMin} 分`;
      document.getElementById(`unit${unitId}StartPressure`).textContent = `${unit.startPressure / 100} MPa`;
      document.getElementById(`unit${unitId}StopPressure`).textContent = `${unit.stopPressure / 100} MPa`;
      document.getElementById(`unit${unitId}LeftValveTime`).textContent = `${unit.leftValve} S`;
      document.getElementById(`unit${unitId}RightValveTime`).textContent = `${unit.rightValve} S`;
    }

    // 更新气举参数显示
    const gas1 = parameters.gasLifts['1'];
    document.getElementById('gaslift1LeftValveTime').textContent = `${gas1.leftValve} S`;
    document.getElementById('gaslift1RightValveTime').textContent = `${gas1.rightValve} S`;

    const gas2 = parameters.gasLifts['2'];
    document.getElementById('gaslift2RightValveTime').textContent = `${gas2.leftValve} S`;
    document.getElementById('gaslift2RightValveTime').textContent = `${gas2.rightValve} S`;

  } catch (error) {
    console.error('参数更新失败:', error);
    // 显示错误信息
    document.getElementById('errorMessage').textContent = `数据更新失败: ${error.message}`;
    document.getElementById('errorMessage').style.display = 'block';

    // 5秒后隐藏错误信息
    setTimeout(() => {
      document.getElementById('errorMessage').style.display = 'none';
    }, 5000);
  }
}

// 修改后的fetchData函数（支持动态URL）
async function fetchData(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }

    const result = await response.json();

    if (result.code === 200) {
      return result.data;
    } else {
      throw new Error(`业务错误: ${result.message} (代码: ${result.code})`);
    }

  } catch (error) {
    console.error('请求发生错误:', error);
    // 显示错误信息
    document.getElementById('errorMessage').textContent = `获取数据失败: ${error.message}`;
    document.getElementById('errorMessage').style.display = 'block';

    // 5秒后隐藏错误信息
    setTimeout(() => {
      document.getElementById('errorMessage').style.display = 'none';
    }, 5000);

    return null;
  }
}

// 生成请求体的函数
function generateRequestBody(dataType, dataValue, dataPlace) {

  // 创建基础请求体对象
  const requestBody = {
    dataType: dataType,
    dataFloat: null,
    dataBoolean: null,
    dataShort: null,
    place: dataPlace
  };

  // 根据数据类型设置相应的值
  switch(dataType) {
    case 'float':
      requestBody.dataFloat = parseFloat(dataValue);
      break;
    case 'boolean':
      requestBody.dataBoolean = dataValue.toLowerCase() === 'true';
      break;
    case 'short':
      requestBody.dataShort = parseInt(dataValue);
      break;
  }
  return JSON.stringify(requestBody);
}

async function updateRequest(dataType, dataValue, dataPlace) {
  // 显示加载指示器
  showLoadingIndicator();

  const url = `http://localhost:8080/opcua/writedata`;

  try {
    // 创建请求体
    const requestBody = generateRequestBody(dataType, dataValue, dataPlace);

    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: requestBody
    });

    // 处理HTTP错误
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP错误! 状态码: ${response.status}, 详情: ${errorText}`);
    }

    // 解析JSON响应
    const result = await response.json();
    console.log("请求修改数据响应:", result);

    // 检查业务状态码
    if (result.code === 200) {
      // 成功弹出确认信息
      showNotification('信息更新成功，页面数据显示可能有30秒的延迟');
      // 如果需要，返回更新后的数据
      return result.data;
    } else {
      // 处理业务错误
      throw new Error(`更新失败: ${result.message} (代码: ${result.code})`);
    }

  } catch (error) {
    console.error('更新错误:', error);

    // 弹出错误信息
    showNotification(
      `❌ 信息更新失败！\n\n` +
      `错误原因: ${error.message}\n\n` +
      `请检查网络或联系管理员`
    );

    // 返回错误
    throw error;
  } finally {
    // 无论成功或失败，都隐藏加载指示器
    hideLoadingIndicator();
  }
}

// 显示加载指示器
function showLoadingIndicator() {
  // 创建加载指示器元素
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loading-overlay';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  // 创建旋转动画元素
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  // 添加旋转动画的CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // 添加到DOM
  document.head.appendChild(style);
  loadingOverlay.appendChild(spinner);
  document.body.appendChild(loadingOverlay);

  // 禁用页面交互
  document.body.style.pointerEvents = 'none';
}

// 隐藏加载指示器
function hideLoadingIndicator() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.remove();
  }

  // 恢复页面交互
  document.body.style.pointerEvents = 'auto';
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
    if (!isNaN(value) && value % 1 === 0) {
      // 根据参数类型更新对应变量
      // 确定更新数据的类型-全部为short
      datatype = "short"
      // 组装目标地址
      place = "gugu通道2"
      if(unitId <= 3)place += ".混输气举撬123-3"
      else place += ".混输气举撬456"

      if(unitId <= 5)place += "." + unitId + "#"
      else if(unitId == "gas1")place += ".气举1#"
      else place += ".气举2#"

      if(paramType == "right-valve" || paramType == "left-valve") {}
      else place += "机"

      place += paramName;

      // 发送put请求
      updateRequest(datatype, value, place)

      // 立即刷新显示
      refreshAllParameters();
    } else {
      showNotification("请输入有效的数值（必须为不小于0的整数）");
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
    'start-hr': '启动-小时',
    'start-min': '启动-分钟',
    'stop-hr': '停止-小时',
    'stop-min': '停止-分钟',
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
  //检查用户是否登陆 若没有则返回登陆页面
  loginCheck()
  setInterval(loginCheck, REFRESH_INTERVAL);

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


});

//页面跳转
function toPage3() {
  window.location.href = 'Page3.html';
}

function toPage1() {
  window.location.href = 'Page1.html';
}
