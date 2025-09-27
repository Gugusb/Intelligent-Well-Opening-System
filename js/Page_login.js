// 基础URL - 根据您的实际后端地址修改
const BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('loginBtn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const messageDiv = document.getElementById('message');
  const loader = document.getElementById('loader');

  // 设置默认测试账号
  usernameInput.value = 'gugusb';
  passwordInput.value = '123';

  loginBtn.addEventListener('click', function() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showMessage('请输入用户名和密码', 'error');
      return;
    }

    // 禁用登录按钮并显示加载动画
    loginBtn.disabled = true;
    loader.style.display = 'block';
    messageDiv.innerHTML = '';

    // 调用登录函数
    login(username, password);
  });

  // 按回车键也可以登录
  passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });
});

// 登录函数
async function login(username, password) {
  const messageDiv = document.getElementById('message');
  const loader = document.getElementById('loader');
  const loginBtn = document.getElementById('loginBtn');

  try {
    const response = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 关键：确保发送Cookie
      body: JSON.stringify({
        userName: username,
        password: password
      })
    });

    const data = await response.json();

    if (response.ok && data.code === 200) {
      showMessage('登陆成功，自动跳转中', 'success');
      // 3秒后跳转到Page1.html
      setTimeout(() => {
        window.location.href = 'AutoHome.html';
      }, 3000);
    } else {
      showMessage('用户名或密码错误', 'error');
      // 重新启用登录按钮
      loginBtn.disabled = false;
      loader.style.display = 'none';
    }
  } catch (error) {
    showMessage('未知错误', 'error');
    // 重新启用登录按钮
    loginBtn.disabled = false;
    loader.style.display = 'none';
  }
}

function register(){
  showMessage('请联系石书强团队获取系统登陆权限：420247426@qq.com', 'error');
}

function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.className = 'message ' + type;
}


