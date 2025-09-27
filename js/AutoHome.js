document.addEventListener('DOMContentLoaded', function() {
  const testButton = document.getElementById('testButton');
  const smartControlButton = document.getElementById('smartControl');
  const manualControlButton = document.getElementById('manualControl');
  const testResult = document.getElementById('testResult');
  const deviceStatus = document.getElementById('deviceStatus');

  // 检查用户登陆情况
  loginCheck();

  //setInterval(loginCheck, 5000);

  // 智能控制按钮事件
  smartControlButton.addEventListener('click', function() {
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
    title.textContent = '启动智能控制系统';
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
    startButton.textContent = '启动智能系统';
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
      fetch('http://localhost:8080/smart/system-start-process', {
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
          // 跳转到下一个页面
          window.location.href = 'AutoCraft.html'; // 替换为实际的下一个页面URL
        } else {
          alert('启动失败: ' + (data.message || '未知错误'));
        }
      })
      .catch(error => {
        console.error('请求失败:', error);
        alert('启动智能系统失败，请检查网络连接或后端服务');
      });
    });
  });

  // 手动控制按钮事件
  manualControlButton.addEventListener('click', function() {
    alert('手动控制模式即将启动，注意这将直接解除所有的智能控制系统！');
    // 这里可以添加实际的手动控制逻辑
  });

});

document.getElementById("testButton").addEventListener("click", function () {
  fetch("http://localhost:8080/smart/system-start-check", {
    method: "POST",
    credentials: "include"
  })
    .then(response => response.json())
    .then(res => {
      if (res.code === 200 && res.data) {
        const statusContainer = document.getElementById("deviceStatus");
        statusContainer.innerHTML = ""; // 清空原有内容

        // 设备名称映射
        const deviceNames = {
          "gaslift": "气举系统",
          "llj": "流量计系统",
          "pump": "抽吸泵系统",
          "poam": "泡排系统"
        };

        // 遍历数据对象
        for (const [key, value] of Object.entries(res.data)) {
          const statusItem = document.createElement("div");
          statusItem.className = "status-item";

          const nameSpan = document.createElement("span");
          nameSpan.className = "device-name";
          nameSpan.textContent = (deviceNames[key] || key) + ": ";

          const statusSpan = document.createElement("span");
          statusSpan.className = "status " + (value ? "normal" : "abnormal");
          statusSpan.textContent = value ? "正常" : "异常";

          statusItem.appendChild(nameSpan);
          statusItem.appendChild(statusSpan);
          statusContainer.appendChild(statusItem);
        }
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
