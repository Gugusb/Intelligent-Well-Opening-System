async function getUser() {
  const userId = 1;
  const url = `http://localhost:8080/user/getuser/${userId}`;

  try {
    console.log("正在请求用户数据...");
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 检查HTTP响应状态
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }

    // 解析JSON数据
    const result = await response.json();

    // 检查业务状态码（根据您的格式，成功为200）
    if (result.code === 200) {
      const user = result.data;  // 实际用户数据在result.data中
      // 使用弹窗显示用户信息
      alert(
        `用户信息获取成功！\n\n` +
        `用户ID: ${user.userId}\n` +
        `用户名: ${user.userName}`
      );
      console.log("用户数据详情:", user);
    } else {
      // 如果业务状态码不是200，则抛出消息
      throw new Error(`业务错误: ${result.message} (代码: ${result.code})`);
    }

  } catch (error) {
    console.error('请求发生错误:', error);
    // 使用弹窗显示错误信息
    alert(
      `获取用户信息失败！\n\n` +
      `错误信息: ${error.message}`
    );
  }
}

async function editUser(userId, newUserName) {
  const url = `http://localhost:8080/user/edituser`;

  try {
    // 创建请求体
    const requestBody = JSON.stringify({
      userId: userId,
      userName: newUserName
    });

    console.log("请求内容:", requestBody);

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
    console.log("编辑用户响应:", result);

    // 检查业务状态码
    if (result.code === 200) {
      // 成功弹出确认信息
      alert(
        `✅ 用户信息更新成功！\n\n` +
        `用户ID: ${userId}\n` +
        `新用户名: ${newUserName}\n\n` +
        `服务器消息: ${result.message}`
      );

      // 如果需要，返回更新后的数据
      return result.data;
    } else {
      // 处理业务错误
      throw new Error(`更新失败: ${result.message} (代码: ${result.code})`);
    }

  } catch (error) {
    console.error('用户更新错误:', error);

    // 弹出错误信息
    alert(
      `❌ 用户信息更新失败！\n\n` +
      `用户ID: ${userId}\n` +
      `尝试用户名: ${newUserName}\n\n` +
      `错误原因: ${error.message}\n\n` +
      `请检查网络或联系管理员`
    );

    // 返回错误
    throw error;
  }
}

