// 模式映射关系
modemap =  {
    0: "停止模式",
    1: "1#气举",
    2: "2#气举",
    3: "1#加药",
    4: "2#加药"
}
// 加药数据状态管理对象
const DosingDataState = {
  // 当前数据状态
  currentData: {
    dataId: 0,
    updateTime: "",
    dosingEquipmentStatus: false,
    currentMode: 0,
    dosingRunStatus: false,
    valve1OpenIndicator: false,
    valve1StopIndicator: false,
    valve1OpenStatus: false,
    valve1StopStatus: false,
    valve2OpenIndicator: false,
    valve2OpenStatus: false,
    valve2StopIndicator: false,
    valve2StopStatus: false,
    dosingPressure: 0,
    dosingLiquidLevel: 0
  },

  // 模式映射关系
  modeMap: {
    0: "停止模式",
    1: "1#气举",
    2: "2#气举",
    3: "1#加药",
    4: "2#加药"
  },

  /**
   * 从服务器获取最新数据
   */
  async fetchData() {
    try {
      const response = await fetch('http://localhost:8080/page4/getlastdata', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
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
      this.showError(`获取数据失败: ${error.message}`);
      return null;
    }
  },

  /**
   * 显示错误信息
   */
  showError(message) {
    // 创建错误信息元素（如果不存在）
    let errorElement = document.getElementById('error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = 'error-message';
      errorElement.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #F44336;
        color: white;
        padding: 15px 30px;
        border-radius: 5px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: bold;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.opacity = '1';

    // 5秒后隐藏错误信息
    setTimeout(() => {
      errorElement.style.opacity = '0';
    }, 5000);
  },

  /**
   * 更新页面显示
   */
  updateDisplay() {
    // 更新设备状态
    document.getElementById('dosingEquipmentStatus').textContent =
      this.currentData.dosingEquipmentStatus ? "运行正常" : "停止";

    // 更新当前模式
    const modeText = this.modeMap[this.currentData.currentMode] || "未知模式";
    document.getElementById('currentMode').textContent = modeText;

    // 更新电机运行状态
    document.getElementById('motorStatus').textContent =
      this.currentData.dosingRunStatus ? "运行" : "停止";

    // 更新阀门状态指示灯
    this.updateIndicator('valve1OpenIndicator', this.currentData.valve1OpenIndicator);
    this.updateIndicator('valve1StopIndicator', !this.currentData.valve1StopIndicator);
    this.updateIndicator('valve1OpenStatus', this.currentData.valve1OpenStatus);
    this.updateIndicator('valve1StopStatus', this.currentData.valve1StopStatus);
    this.updateIndicator('valve2OpenIndicator', this.currentData.valve2OpenIndicator);
    this.updateIndicator('valve2OpenStatus', this.currentData.valve2OpenStatus);
    this.updateIndicator('valve2StopIndicator', !this.currentData.valve2StopIndicator);
    this.updateIndicator('valve2StopStatus', this.currentData.valve2StopStatus);

    // 更新压力值
    document.getElementById('dosingPressure').textContent =
      this.currentData.dosingPressure.toFixed(1);

    // 更新液位值
    document.getElementById('dosingLiquidLevel').textContent =
      this.currentData.dosingLiquidLevel.toFixed(1);

    // 添加数据更新视觉反馈
    this.showDataUpdateEffect();
  },

  /**
   * 更新指示灯状态
   */
  updateIndicator(elementId, isActive) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('on', 'off');
      element.classList.add(isActive ? 'on' : 'off');
    }
  },

  /**
   * 显示数据更新效果
   */
  showDataUpdateEffect() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
      timeElement.classList.add('data-update-effect');
      setTimeout(() => {
        timeElement.classList.remove('data-update-effect');
      }, 1000);
    }
  },

  /**
   * 初始化应用
   */
  async init() {
    // 启动实时时钟
    this.startRealTimeClock();

    // 立即执行一次数据获取
    await this.updateData();

    // 设置定时更新，每5秒执行一次
    this.setupAutoRefresh(5000);
  },

  /**
   * 更新数据
   */
  async updateData() {
    const newData = await this.fetchData();
    if (newData) {
      this.currentData = newData;
      this.updateDisplay();
    }
  },

  /**
   * 设置定时数据刷新
   */
  setupAutoRefresh(interval = 5000) {
    // 清除已有定时器
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }

    // 设置新的定时器
    this.autoRefreshTimer = setInterval(() => {
      this.updateData();
    }, interval);
  },

  /**
   * 启动实时时钟
   */
  startRealTimeClock() {
    this.updateTimeDisplay();
    setInterval(() => {
      this.updateTimeDisplay();
    }, 1000);
  },

  /**
   * 更新系统时间显示
   */
  updateTimeDisplay() {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ` +
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const timeElement = document.getElementById('current-time');
    if (timeElement) {
      timeElement.textContent = formattedTime;
    }
  }
};

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  // 添加数据更新动画样式
  const style = document.createElement('style');
  style.textContent = `
    .data-update-effect {
      animation: pulse 1s ease-in-out;
    }

    @keyframes pulse {
      0% { background-color: transparent; }
      50% { background-color: rgba(54, 132, 236, 0.3); }
      100% { background-color: transparent; }
    }
  `;
  document.head.appendChild(style);

  // 初始化应用
  DosingDataState.init();
});

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
      headers: {
        'Content-Type': 'application/json'
      },
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

// 为四个按钮注册事件处理函数
document.getElementById('btn1gas').addEventListener('click', () => {
  confirmAction('1#', '气举');
});

document.getElementById('btn2gas').addEventListener('click', () => {
  confirmAction('2#', '气举');
});

document.getElementById('btn1add').addEventListener('click', () => {
  confirmAction('1#', '加药');
});

document.getElementById('btn2add').addEventListener('click', () => {
  confirmAction('2#', '加药');
});

//球阀开关按钮
document.getElementById('btn1open').addEventListener('click', () => {
  confirmAction2('1#', '开启');
});

document.getElementById('btn1close').addEventListener('click', () => {
  confirmAction2('1#', '关闭');
});

document.getElementById('btn2open').addEventListener('click', () => {
  confirmAction2('2#', '开启');
});

document.getElementById('btn2close').addEventListener('click', () => {
  confirmAction2('2#', '关闭');
});

// 双重确认函数-模式切换
function confirmAction(unitNumber, action) {
  // 第一次确认
  if (confirm(`确认要将${unitNumber}机组切换到${action}模式吗？`)) {
    // 第二次确认
    if (confirm(`请再次确认，您确定要将${unitNumber}机组切换到${action}模式吗？`)) {
      // 两次确认都通过，执行操作
      datatype = "short"
      datavalue = 0;
      switch (action) {
        case '气举':
          switch (unitNumber) {
            case '1#':datavalue = 1;break;
            case '2#':datavalue = 2;
          }break;
        case '加药':
          switch (unitNumber) {
            case '1#':datavalue = 3;break;
            case '2#':datavalue = 4;
          }
      }
      place = "gugu通道1.加药.模式"
      console.log(datatype, datavalue, place)
      updateRequest(datatype, datavalue, place);
    }
  }
}

// 双重确认函数-球阀开关
function confirmAction2(unitNumber, action) {
  // 第一次确认
  if (confirm(`确认要将${unitNumber}入口球阀${action}吗？`)) {
    // 第二次确认
    if (confirm(`请再次确认，您确定要将${unitNumber}入口球阀${action}吗？`)) {
      // 两次确认都通过，执行操作
      datatype = "boolean"
      datavalue = false;
      switch (action) {
        case '开启':datavalue = true;break;
        case '关闭':datavalue = false;
      }
      place = "gugu通道1.加药." + unitNumber + "球阀指示"
      console.log(datatype, datavalue, place)
      updateRequest(datatype, datavalue, place);
    }
  }
}

//页面跳转
function toPage1() {
  window.location.href = 'Page1.html';
}

function toPage5() {
  window.location.href = 'Page5.html';
}
