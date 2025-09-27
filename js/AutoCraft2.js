

function editCraft() {
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

     //提示
     const tips = document.createElement('h3');
     tips.textContent = '输入想修改的参数，若不想修改则不填';
     tips.style.marginBottom = '20px';
     tips.style.color = '#1a73e8';

    // 参数输入表单
    const form = document.createElement('div');
    const g1 = createInputGroup('ppjnd', '泡排剂浓度（如：0.05）');
    const g2 = createInputGroup('ppjyl', '泡排剂用量（如：0.2）');
    const g3 = createInputGroup('ppjsh', '泡排剂损耗（如：0.5）');

    form.appendChild(tips);
    form.appendChild(g1);
    form.appendChild(g2);
    form.appendChild(g3);

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
      // 收集有值的参数
      const params = {};
      names = ['ppjyl', 'ppjnd', 'ppjsh']
      // 检查每个输入框
      for (let i = 0; i < names.length; i++) {
          const input = document.getElementById(names[i]);
          const value = input.value;
          // 只收集有值的参数
          if (value !== '') {
              params[names[i]] = parseFloat(value);
          }
      }

      // 临时用法-直接修改对应参数
      iszj = true;
      if(iszj){
        Object.keys(params).forEach(key => {
            let value = params[key];
            console.log(key, value);
            document.getElementById("foam-default-" + key).textContent = `${params[key]}`;
        });
      }

      // 调用API
      fetch('http://localhost:8080/smart/edit-craft', {
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
