document.addEventListener('DOMContentLoaded', function() {
  const testButton = document.getElementById('testButton');
  const smartControlButton = document.getElementById('smartControl');
  const manualControlButton = document.getElementById('manualControl');
  const testResult = document.getElementById('testResult');
  const deviceStatus = document.getElementById('deviceStatus');

  // 检查用户登陆情况
  loginCheck();

  setInterval(loginCheck, 5000);

  // 智能控制按钮事件
  smartControlButton.addEventListener('click', function() {
    alert('智能控制模式即将启动，你可以通过切换为手动控制模式来解除智能控制');
    // 这里可以添加实际的智能控制逻辑
  });

  // 手动控制按钮事件
  manualControlButton.addEventListener('click', function() {
    alert('手动控制模式即将启动，注意这将直接解除所有的智能控制系统！');
    // 这里可以添加实际的手动控制逻辑
  });

  // 模拟测试过程
  function simulateTestProcess() {
    // 重置所有设备状态为正常
    resetAllDevices();

    // 模拟测试过程（3秒后完成）
    setTimeout(() => {
      // 随机决定测试结果（成功或失败）
      const isSuccess = Math.random() > 0.3;

      if (isSuccess) {
        // 测试成功
        const resultValue = testResult.querySelector('.result-value');
        resultValue.textContent = '成功';
        resultValue.className = 'result-value success';

      } else {
        // 测试失败
        const resultValue = testResult.querySelector('.result-value');
        resultValue.textContent = '失败';
        resultValue.className = 'result-value failed';

        // 随机设置一些设备状态为异常
        simulateDeviceFailures();
      }

      // 重新启用测试按钮
      testButton.disabled = false;
      testButton.style.opacity = '1';
    }, 3000);
  }

  // 重置所有设备状态为正常
  function resetAllDevices() {
    const statusItems = deviceStatus.querySelectorAll('.status');
    statusItems.forEach(item => {
      item.textContent = '正常';
      item.className = 'status normal';
    });
  }

  // 模拟设备故障
  function simulateDeviceFailures() {
    const statusItems = deviceStatus.querySelectorAll('.status');
    const failureCount = Math.floor(Math.random() * 3) + 1; // 1-3个设备故障

    for (let i = 0; i < failureCount; i++) {
      const randomIndex = Math.floor(Math.random() * statusItems.length);
      const randomStatus = statusItems[randomIndex];

      // 随机设置故障类型
      const failureType = Math.random() > 0.5 ? 'warning' : 'error';
      const failureText = failureType === 'warning' ? '警告' : '故障';

      randomStatus.textContent = failureText;
      randomStatus.className = `status ${failureType}`;
    }
  }
});

document.getElementById("testButton").addEventListener("click", function () {
  fetch("http://localhost:8080/opcua/checkdata", {
    method: "GET",
    credentials: "include"
  })
    .then(response => response.json())
    .then(res => {
      if (res.code === 200 && res.data && res.data.checkResults) {
        const statusContainer = document.getElementById("deviceStatus");
        statusContainer.innerHTML = ""; // 清空原有内容

        res.data.checkResults.forEach(item => {
          const statusItem = document.createElement("div");
          statusItem.className = "status-item";

          const nameSpan = document.createElement("span");
          nameSpan.className = "device-name";
          nameSpan.textContent = item.first + ": ";

          const statusSpan = document.createElement("span");
          statusSpan.className = "status " + (item.second === "正常" ? "normal" : "abnormal");
          statusSpan.textContent = item.second;

          statusItem.appendChild(nameSpan);
          statusItem.appendChild(statusSpan);
          statusContainer.appendChild(statusItem);
        });
      } else {
        alert("获取设备状态失败: " + res.message);
      }
    })
    .catch(err => {
      console.error("请求失败:", err);
      alert("请求出错，请检查后端服务是否启动");
    });
});

async function loginCheck(){
  const response = await fetch("http://localhost:8080/user/islogin", {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) {
    window.location.href = 'Page_login.html';
  }
}

function toPage1() {
  // 跳转到同目录下的Page2.html页面
  window.location.href = 'Page1.html';
}

function toPageAutoCraft() {
  // 跳转到同目录下的Page2.html页面
  window.location.href = 'AutoCraft.html';
}
