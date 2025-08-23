
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
      requestBody.dataShoet = parseInt(dataValue);
      break;
  }
  return JSON.stringify(requestBody);
}

async function updateRequest(dataType, dataValue, dataPlace) {
  const url = `http://localhost:8080/opcua/writedata`;

  try {
    // 创建请求体
    const requestBody = generateRequestBody(dataType, dataValue, dataPlace);

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
    console.log("请求修改数据响应:", result);

    // 检查业务状态码
    if (result.code === 200) {
      // 成功弹出确认信息
      alert(`✅ 用户信息更新成功`);

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
      `❌ 用户信息更新失败！\n\n`
      `错误原因: ${error.message}\n\n` +
      `请检查网络或联系管理员`
    );

    // 返回错误
    throw error;
  }
}

