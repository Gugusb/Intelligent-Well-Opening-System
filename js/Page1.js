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

//页面跳转
function toPage2() {
  // 跳转到同目录下的Page2.html页面
  window.location.href = 'Page2.html';

  // 如果需要在新标签页中打开，可以使用下面这行代码
  // window.open('Page2.html', '_blank');
}

function toPage4() {
  // 跳转到同目录下的Page2.html页面
  window.location.href = 'Page4.html';

  // 如果需要在新标签页中打开，可以使用下面这行代码
  // window.open('Page2.html', '_blank');
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

// 更新指定ID的元素值
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

// 更新整个面板的值
function updateAllValues(data) {
  if (!data) return;

  // 更新压力值
  updateElement(ids.frontPressure1, data.frontPressure1 / 100);
  updateElement(ids.frontPressure2, data.frontPressure2 / 100);
  updateElement(ids.frontPressure3, data.frontPressure3 / 100);
  updateElement(ids.frontPressure45, data.frontPressure45 / 100);
  updateElement(ids.gasFrontPressure5, data.gasliftFrontPressure5 / 100);//数据标签缺失，存疑
  updateElement(ids.gasFrontPressure6, data.gasliftFrontPressure6 / 100);
  updateElement(ids.rearPressure123, data.backPressure123 / 100);
  updateElement(ids.rearPressure45, data.backPressure45 / 100);
  updateElement(ids.gasRearPressure6, data.gasliftBackPressure6 / 100);

  // 更新流量计
  updateElement(ids.instantFlow, data.flowmeterInstantFlow);
  updateElement(ids.mediumTemp, data.flowmeterMediumTemp);
  updateElement(ids.staticPressure, data.flowmeterStaticPressure);
  updateElement(ids.pressureDiff, data.flowmeterDiffPressure);

  // 更新累计流量
  updateElement(ids.totalFlow, data.flowmeterAccumulatedFlow);

  // 更新启泵次数
  updateElement(ids.pump1Count, data.pump1StartCount);
  updateElement(ids.pump2Count, data.pump2StartCount);
  updateElement(ids.pump3Count, data.pump3StartCount);
  updateElement(ids.pump4Count, data.pump4StartCount);
  updateElement(ids.pump5Count, data.pump5StartCount);
  updateElement(ids.gasPump1Count, data.gasliftPump1StartCount);
  updateElement(ids.gasPump2Count, data.gasliftPump2StartCount);

  // 更新流量监控数据
  updateFlowData(data);
}

// 更新流量监控数据函数
function updateFlowData(data) {
  if (!data) return;

  const flowElements = [
    { selector: "totalInstantFlow123", value: data.totalInstantFlow123 / 10 },
    { selector: "data.totalAccumulatedFlow123", value: data.totalAccumulatedFlow123  * 100},
    { selector: "data.totalInstantFlow45", value: data.totalInstantFlow45  / 10},
    { selector: "data.totalAccumulatedFlow45", value: data.totalAccumulatedFlow45 * 100 },
    { selector: "gasliftInstantFlow", value: data.gasliftInstantFlow / 100 },
    { selector: "gasliftAccumulatedFlow", value: data.gasliftAccumulatedFlow / 100 }
  ];

  flowElements.forEach(item => {
    if (item) {
      //console.log(item.selector, item.value)
      updateElement(item.selector, item.value)
    }
  });
}

// 更新设备状态显示
function updateDeviceStatusDisplay(data) {
  if (!data) return;

  // 更新当前模式
  modeText = `模式 ${data.currentMode}`;
  if(data.currentMode == 1){
    modeText = `气举模式`;
  }else{
    modeText = `正常模式`;
  }

  // 更新电气箱状态
  updateElecBoxDisplay("leftElecStatus", "leftElecText", data.leftElecBoxStatus);
  updateElecBoxDisplay("rightElecStatus", "rightElecText", data.rightElecBoxStatus);

  console.log(data)

  // 更新机组状态
  const units = [
    data.unit1RunStatus,
    data.unit2RunStatus,
    data.unit3RunStatus,
    data.unit4RunStatus,
    data.unit5RunStatus,
    data.unit6RunStatus,
    false // 第7个机组没有数据，默认为停止
  ];

  for (let i = 1; i <= 6; i++) {
    const status = units[i-1] ? "running" : "stopped";
    const text = units[i-1] ? "运行中" : "停止";

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
function updateElecBoxDisplay(statusId, textId, status) {
  if(status == 0){
    status = true;
  }else{
    status = false;
  }

  const statusIndicator = document.getElementById(statusId);
  const textElement = document.getElementById(textId);

  const statusText = status ? "running" : "stopped";
  const displayText = status ? "运行正常" : "故障";
  const color = status ? "#52c41a" : "#f5222d";

  statusIndicator.className = `status-indicator ${statusText}`;
  textElement.textContent = displayText;
  textElement.style.color = color;
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

// // 按钮事件处理
// function setupButtonEvents() {
//   document.querySelectorAll('.flow-btn').forEach((button, index) => {
//     button.addEventListener('click', () => {
//       alert(index === 0 ? '运行参数页面即将打开...' : '加药页面即将打开...');
//     });
//   });
// }

// 从后端获取数据
async function fetchData() {
  const url = `http://localhost:8080/page1/getlastdata`;

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

// 更新所有数据
async function updateAllData() {
  const data = await fetchData();
  if (data) {
    updateAllValues(data);
    updateDeviceStatusDisplay(data);
  }
}

// 初始化应用
function initApp() {
  //检查用户是否登陆 若没有则返回登陆页面
  loginCheck()
  setInterval(loginCheck, 5000);

  // 设置初始时间
  updateTime();

  // 设置定时器每秒更新时间
  setInterval(updateTime, 1000);

  // 设置定时器每5秒更新数据
  setInterval(updateAllData, 5000);

  // 立即获取并显示数据
  updateAllData();

  // 初始化所有数据值为0
  Object.values(ids).forEach(id => {
    updateElement(id, "0");
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
