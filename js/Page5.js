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
      showNotification(`✅ 信息更新成功，页面数据显示可能有30秒的延迟`);

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
// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
  //检查用户是否登陆 若没有则返回登陆页面
  loginCheck()
  setInterval(loginCheck, 5000);
});

// 加药参数状态管理对象
const DosingParamsState = {
  // 当前数据状态
  currentData: {
    dataId: 0,
    updateTime: "",
    pressureAlarm: 0,
    pressureRecovery: 0,
    lowLevelWarning: 0,
    highLevelWarning: 0,
    lowLevelAlarm: 0,
    highLevelAlarm: 0,
    firstDosingStartHour: 0,
    firstDosingStartMinute: 0,
    firstDosingStopHour: 0,
    firstDosingStopMinute: 0,
    secondDosingStartHour: 0,
    secondDosingStartMinute: 0,
    secondDosingStopHour: 0,
    secondDosingStopMinute: 0,
    thirdDosingStartHour: 0,
    thirdDosingStartMinute: 0,
    thirdDosingStopHour: 0,
    thirdDosingStopMinute: 0
  },

  // 自动刷新定时器ID
  autoRefreshTimer: null,

  /**
   * 从服务器获取最新数据
   */
  async fetchData() {
    try {
      const response = await fetch('http://localhost:8080/page5/getlastdata', {
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
    // 更新报警参数
    document.getElementById('pressureAlarm').textContent = this.currentData.pressureAlarm;
    document.getElementById('pressureRecovery').textContent = this.currentData.pressureRecovery;
    document.getElementById('lowLevelWarning').textContent = this.currentData.lowLevelWarning;
    document.getElementById('highLevelWarning').textContent = this.currentData.highLevelWarning;
    document.getElementById('lowLevelAlarm').textContent = this.currentData.lowLevelAlarm;
    document.getElementById('highLevelAlarm').textContent = this.currentData.highLevelAlarm;

    // 更新第一次加药时间
    document.getElementById('firstDosingStartHour').textContent =
      `${this.currentData.firstDosingStartHour} 时`;
    document.getElementById('firstDosingStartMinute').textContent =
      `${this.currentData.firstDosingStartMinute} 分`;
    document.getElementById('firstDosingStopHour').textContent =
      `${this.currentData.firstDosingStopHour} 时`;
    document.getElementById('firstDosingStopMinute').textContent =
      `${this.currentData.firstDosingStopMinute} 分`;

    // 更新第二次加药时间
    document.getElementById('secondDosingStartHour').textContent =
      `${this.currentData.secondDosingStartHour} 时`;
    document.getElementById('secondDosingStartMinute').textContent =
      `${this.currentData.secondDosingStartMinute} 分`;
    document.getElementById('secondDosingStopHour').textContent =
      `${this.currentData.secondDosingStopHour} 时`;
    document.getElementById('secondDosingStopMinute').textContent =
      `${this.currentData.secondDosingStopMinute} 分`;

    // 更新第三次加药时间
    document.getElementById('thirdDosingStartHour').textContent =
      `${this.currentData.thirdDosingStartHour} 时`;
    document.getElementById('thirdDosingStartMinute').textContent =
      `${this.currentData.thirdDosingStartMinute} 分`;
    document.getElementById('thirdDosingStopHour').textContent =
      `${this.currentData.thirdDosingStopHour} 时`;
    document.getElementById('thirdDosingStopMinute').textContent =
      `${this.currentData.thirdDosingStopMinute} 分`;

    // 添加数据更新视觉反馈
    this.showDataUpdateEffect();
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

    // 绑定按钮事件
    this.bindEventListeners();
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
  },

  /**
   * 绑定事件监听器
   */
  bindEventListeners() {
    // 绑定设置按钮事件
    document.querySelectorAll('.setting-btn').forEach(button => {
      button.addEventListener('click', () => {
        // 获取按钮所在的参数行
        const paramRow = button.closest('.param-row');
        if (paramRow) {
          const paramLabel = paramRow.querySelector('.param-label').textContent;
          const paramValueElement = paramRow.querySelector('.param-value');
          const currentValue = parseFloat(paramValueElement.textContent);

          const newValue = prompt(`设置${paramLabel}`, currentValue);
          if (newValue !== null && newValue !== "") {
            const numValue = parseFloat(newValue);
            if (!isNaN(numValue) && numValue >= 0 && numValue % 1 === 0) {
              datatype = "short";
              datavalue = numValue;
              place = "gugu通道1.加药."
              switch(button.id) {
                case "btn-pa": place += "加药后端报警压力";break;
                case "btn-pr": place += "加药后端恢复压力";break;
                case "btn-wlw": place += "低液位警告值";break;
                case "btn-whw": place += "高液位警告值";break;
                case "btn-wla": place += "低液位报警值";break;
                case "btn-wlr": place += "低液位恢复值";break;
              }
              updateRequest(datatype, datavalue, place);
            } else {
              showNotification("请输入有效的数值（必须为不小于0的整数）");
            }
          }
        }
      });
    });

    // 绑定时间设置按钮事件
    document.querySelectorAll('.time-controls .setting-btn').forEach(button => {
      button.addEventListener('click', () => {
        const timeCard = button.closest('.time-card');
        const timeHeader = timeCard.querySelector('.time-header').textContent;
        const isHourButton = button.textContent.includes('小时');

        // 确定要设置的时间类型
        let timeType = '';
        let timeValue = 0;
        if (timeHeader.includes('第一次')) {
          timeType = 'first';
          timeValue = 1;
        }
        else if (timeHeader.includes('第二次')){
          timeType = 'second';
          timeValue = 2;
        }
        else if (timeHeader.includes('第三次')){
          timeType = 'third';
          timeValue = 3;
        }

        // 确定是启动时间还是停止时间
        const timeRow = button.closest('.time-controls').previousElementSibling;
        const isStartTime = timeRow.querySelector('.time-label').textContent.includes('启动');

        // 确定是小时还是分钟
        const timeValueElement = isHourButton ?
          timeRow.querySelector('.time-value:nth-child(2)') :
          timeRow.querySelector('.time-value:nth-child(3)');

        const currentValue = parseInt(timeValueElement.textContent);
        const timeUnit = isHourButton ? '小时' : '分钟';
        const maxValue = isHourButton ? 23 : 59;

        const newValue = prompt(`设置${timeHeader}${isStartTime ? '启动' : '停止'}${timeUnit}`, currentValue);
        if (newValue !== null && newValue !== "") {
          const numValue = parseInt(newValue);
          if (!isNaN(numValue) && numValue >= 0 && numValue <= maxValue) {
            datatype = "short";
            datavalue = numValue;
            place = "gugu通道1.加药.时间" + timeValue + (isStartTime ? '-启动' : '-停止') + (isHourButton ? '时' : '分')

            updateRequest(datatype, datavalue, place);
          } else {
            showNotification(`请输入有效的${timeUnit}值 (0-${maxValue})`);
          }
        }
      });
    });

  },

  /**
   * 显示值变化视觉效果
   */
  showValueChangeEffect(element) {
    element.classList.remove('value-change-effect');
    setTimeout(() => {
      element.classList.add('value-change-effect');
      setTimeout(() => {
        element.classList.remove('value-change-effect');
      }, 1000);
    }, 10);
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

  // 初始化应用
  DosingParamsState.init();
});

//页面跳转
function toPage1() {
  window.location.href = 'Page1.html';
}

function toPage4() {
  window.location.href = 'Page4.html';
}
