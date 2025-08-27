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
      requestBody.dataBoolean = dataValue;
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
      alert(`✅ 信息更新成功，页面数据显示可能有30秒的延迟`);

      // 如果需要，返回更新后的数据
      return result.data;
    } else {
      // 处理业务错误
      throw new Error(`更新失败: ${result.message} (代码: ${result.code})`);
    }

  } catch (error) {
    console.error('更新错误:', error);

    // 弹出错误信息
    alert(
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


// 状态管理对象
const AppState = {
  // 当前时间
  currentTime: "2025-08-13 14:50:24",

  // 压力参数状态
  pressureParams: {
    alarm123: 0,
    resume123: 0,
    alarm45: 0,
    resume45: 0,
    alarmGaslift1: 0,
    resumeGaslift1: 0,
    alarmGaslift2: 0
  },

  // 机组状态
  unitStatus: {
    1: "off",
    2: "off",
    3: "off",
    4: "on",
    5: "off"
  },

  // 自动刷新定时器ID
  autoRefreshTimer: null,

  /**
   * 从服务器获取最新数据并返回更新后的状态
   */
  async fetchData() {
    try {
      const response = await fetch('http://localhost:8080/page3/getlastdata', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
      }

      const result = await response.json();

      if (result.code === 200) {
        return {
          pressureParams: {
            alarm123: result.data.backendAlarmPressure123,
            resume123: result.data.backendRecoveryPressure123,
            alarm45: result.data.backendAlarmPressure45,
            resume45: result.data.backendRecoveryPressure45,
            alarmGaslift1: result.data.gaslift1BackendAlarmPressure,
            resumeGaslift1: result.data.gaslift1BackendRecoveryPressure,
            alarmGaslift2: result.data.gaslift2BackendAlarmPressure
          },
          unitStatus: {
            1: result.data.unit1Enabled ? "on" : "off",
            2: result.data.unit2Enabled ? "on" : "off",
            3: result.data.unit3Enabled ? "on" : "off",
            4: result.data.unit4Enabled ? "on" : "off",
            5: result.data.unit5Enabled ? "on" : "off"
          }
        };
      } else {
        throw new Error(`业务错误: ${result.message} (代码: ${result.code})`);
      }

    } catch (error) {
      console.error('请求发生错误:', error);

      // 显示错误信息（确保页面上有id为'errorMessage'的元素）
      const errorElement = document.getElementById('errorMessage');
      if (errorElement) {
        errorElement.textContent = `获取数据失败: ${error.message}`;
        errorElement.style.display = 'block';

        // 5秒后隐藏错误信息
        setTimeout(() => {
          errorElement.style.display = 'none';
        }, 5000);
      }

      return null;
    }
  },

  async updateFromAPI() {
    const newData = await this.fetchData();
    if (newData) {
      // 更新压力参数状态
      this.pressureParams = newData.pressureParams;

      // 更新机组状态
      this.unitStatus = newData.unitStatus;

      // 更新UI
      this.updateDisplays();

      // 添加数据更新视觉反馈
      this.showDataUpdateEffect();
    }
  },

  // 显示数据更新效果
  showDataUpdateEffect() {
    const timeElement = document.getElementById('current-time');
    timeElement.classList.add('data-update-effect');
    setTimeout(() => {
      timeElement.classList.remove('data-update-effect');
    }, 1000);
  },

  // 初始化函数
  async init() {
    // 启动实时时钟
    this.startRealTimeClock();

    // 绑定事件监听器
    this.bindEventListeners();

    // 立即执行一次数据获取和显示更新
    await this.updateFromAPI();

    // 设置定时更新，每5秒执行一次
    this.setupAutoRefresh(5000);
  },

  // 设置定时数据刷新
  setupAutoRefresh(interval = 5000) {
    // 清除已有定时器
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }

    // 设置新的定时器
    this.autoRefreshTimer = setInterval(() => {
      this.updateFromAPI();
    }, interval);
  },

  // 更新所有显示
  updateDisplays() {
    this.updatePressureDisplays();
    this.updateUnitStatusIndicators();
  },

  // 启动实时时钟
  startRealTimeClock() {
    this.updateTimeDisplay();
    setInterval(() => {
      this.updateTimeDisplay();
    }, 1000);
  },

  // 更新系统时间显示
  updateTimeDisplay() {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ` +
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    document.getElementById('current-time').textContent = formattedTime;
  },

  // 绑定所有事件监听器
  bindEventListeners() {
    // 压力设置按钮事件
    document.getElementById('set-alarm-123').addEventListener('click', () =>
      this.showSettingDialog("1#2#3#后端报警压力", 'alarm123'));

    document.getElementById('set-resume-123').addEventListener('click', () =>
      this.showSettingDialog("1#2#3#后端恢复压力", 'resume123'));

    document.getElementById('set-alarm-45').addEventListener('click', () =>
      this.showSettingDialog("4#5#后端报警压力", 'alarm45'));

    document.getElementById('set-resume-45').addEventListener('click', () =>
      this.showSettingDialog("4#5#后端恢复压力", 'resume45'));

    document.getElementById('set-alarm-gaslift1').addEventListener('click', () =>
      this.showSettingDialog("气举1#报警压力", 'alarmGaslift1'));

    document.getElementById('set-resume-gaslift1').addEventListener('click', () =>
      this.showSettingDialog("气举1#恢复压力", 'resumeGaslift1'));

    document.getElementById('set-alarm-gaslift2').addEventListener('click', () =>
      this.showSettingDialog("气举2#报警压力", 'alarmGaslift2'));

    // 机组控制按钮事件
    for (let i = 1; i <= 5; i++) {
      document.getElementById(`unit${i}-start`).addEventListener('click', () =>
        this.confirmUnitAction(i, "on", "开启"));

      document.getElementById(`unit${i}-stop`).addEventListener('click', () =>
        this.confirmUnitAction(i, "off", "关闭"));
    }

  },

  // 显示设置对话框
  showSettingDialog(title, paramKey) {
    const currentValue = this.pressureParams[paramKey];
    const newValue = prompt(`${title}设置 (当前值: ${currentValue} MPa)`, currentValue);

    if (newValue !== null && newValue !== "") {
      const numValue = parseFloat(newValue);

      if (!isNaN(numValue) && numValue >= 0 && numValue % 1 === 0) {
        this.pressureParams[paramKey] = numValue;
        //发送数据更新请求
        datatype = "short"
        datavalue = numValue;
        place = "gugu通道1."
        switch(paramKey) {
          case "resume123":place += "混输气举撬123.后端恢复压力";break;
          case "alarm123":place += "混输气举撬123.后端报警压力";break;
          case "alarm45":place += "混输气举撬456.后端报警压力1";break;
          case "resume45":place += "混输气举撬456.后端恢复压力1";break;
          case "alarmGaslift1":place += "混输气举撬456.1#后端警报压力";break;
          case "resumeGaslift1":place += "混输气举撬456.1#后端恢复压力";break;
          case "alarmGaslift2":place += "混输气举撬456.2#后端警报压力";
        }

        updateRequest(datatype, datavalue, place)
      } else {
        alert("请输入有效的数值（必须为不小于0的整数）");
      }
    }
  },

  // 显示值变化视觉效果
  showValueChangeEffect(paramKey) {
    const element = document.getElementById(
      paramKey === 'alarm123' ? 'backendAlarmPressure123' :
        paramKey === 'resume123' ? 'backendRecoveryPressure123' :
          paramKey === 'alarm45' ? 'backendAlarmPressure45' :
            paramKey === 'resume45' ? 'backendRecoveryPressure45' :
              paramKey === 'alarmGaslift1' ? 'gaslift1BackendAlarmPressure' :
                paramKey === 'resumeGaslift1' ? 'gaslift1BackendRecoveryPressure' :
                  'gaslift2BackendAlarmPressure'
    );

    element.classList.remove('value-change-effect');
    setTimeout(() => {
      element.classList.add('value-change-effect');
      setTimeout(() => {
        element.classList.remove('value-change-effect');
      }, 1000);
    }, 10);
  },

  // 更新所有压力参数显示
  updatePressureDisplays() {
    document.getElementById('backendAlarmPressure123').textContent = this.pressureParams.alarm123;
    document.getElementById('backendRecoveryPressure123').textContent = this.pressureParams.resume123;
    document.getElementById('backendAlarmPressure45').textContent = this.pressureParams.alarm45;
    document.getElementById('backendRecoveryPressure45').textContent = this.pressureParams.resume45;
    document.getElementById('gaslift1BackendAlarmPressure').textContent = this.pressureParams.alarmGaslift1;
    document.getElementById('gaslift1BackendRecoveryPressure').textContent = this.pressureParams.resumeGaslift1;
    document.getElementById('gaslift2BackendAlarmPressure').textContent = this.pressureParams.alarmGaslift2;
  },

  // 双重确认函数
  confirmUnitAction(unitId, status, action) {
    // 第一次确认
    this.showDialog(`确认${action}机组 ${unitId}`, `您确定要${action}机组 ${unitId} 吗？`, () => {
      // 第二次确认
      this.showDialog(`再次确认${action}操作`, `请再次确认您要${action}机组 ${unitId}。此操作非常重要！`, () => {
        // 两次确认都通过，执行状态更新
        this.setUnitStatus(unitId, status);
      });
    });
  },

  // 显示确认对话框
  showDialog(title, message, confirmCallback) {
    // 使用浏览器原生confirm对话框
    if (confirm(`${title}\n\n${message}`)) {
      confirmCallback();
    }
  },

  // 状态修改方法
  setUnitStatus(unitId, status) {
    this.unitStatus[unitId] = status;
    datatype = "boolean"
    datavalue = false
    if(status === "on") datavalue = true
    place = "gugu通道1.混输气举撬"

    if(unitId <= 3)place += "123." + unitId + "#机组状态1";
    else place += "456." + unitId + "#机组状态";

    updateRequest(datatype, datavalue, place)

    this.updateUnitStatusIndicators();

    // 添加状态变化效果
    const indicator = document.getElementById(`unit${unitId}-status`);
    indicator.style.transform = "scale(1.5)";
    setTimeout(() => {
      indicator.style.transform = "scale(1)";
    }, 300);
  },

  // 更新机组状态指示灯
  updateUnitStatusIndicators() {
    for (let i = 1; i <= 5; i++) {
      const indicator = document.getElementById(`unit${i}-status`);
      indicator.classList.remove('status-on', 'status-off');
      indicator.classList.add(
        this.unitStatus[i] === "on" ? 'status-on' : 'status-off'
      );
    }
  }
};

// 当DOM加载完成后初始化应用
window.addEventListener('DOMContentLoaded', () => {
  AppState.init();

  //检查用户是否登陆 若没有则返回登陆页面
  loginCheck()
  setInterval(loginCheck, 5000);

  // 添加数据更新动画样式
  const style = document.createElement('style');
  style.textContent = `
    .data-update-effect {
      animation: pulse 1s ease-in-out;
    }

    @keyframes pulse {
      0% { background-color: transparent; }
      50% { background-color: rgba(30, 136, 229, 0.3); }
      100% { background-color: transparent; }
    }

    .value-change-effect {
      animation: highlight 1s ease-in-out;
    }

    @keyframes highlight {
      0% { background-color: transparent; }
      50% { background-color: rgba(76, 175, 80, 0.3); }
      100% { background-color: transparent; }
    }
  `;
  document.head.appendChild(style);
});

//页面跳转
function toPage2() {
  window.location.href = 'Page2.html';
}

function toPage1() {
  window.location.href = 'Page1.html';
}
