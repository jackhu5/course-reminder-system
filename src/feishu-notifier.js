// 飞书通知模块
// 处理飞书webhook消息发送

const https = require('https');
const http = require('http');

/**
 * 发送飞书通知
 * @param {string} webhookUrl - 飞书webhook URL
 * @param {string} message - 消息内容
 * @returns {Promise<boolean>} 发送是否成功
 */
async function sendFeishuNotification(webhookUrl, message) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(webhookUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      // 构造飞书消息格式（纯文本格式）
      const payload = {
        msg_type: "text",
        content: {
          text: message
        }
      };
      
      const postData = JSON.stringify(payload);
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`飞书通知发送完成，状态码: ${res.statusCode}`);
          console.log(`响应内容: ${data}`);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else {
            console.error(`飞书通知发送失败，状态码: ${res.statusCode}`);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('飞书通知发送错误:', error);
        resolve(false);
      });
      
      // 设置超时
      req.setTimeout(10000, () => {
        console.error('飞书通知发送超时');
        req.destroy();
        resolve(false);
      });
      
      req.write(postData);
      req.end();
      
    } catch (error) {
      console.error('飞书通知发送异常:', error);
      resolve(false);
    }
  });
}

/**
 * 发送课前提醒通知
 * @param {string} webhookUrl - 飞书webhook URL
 * @param {Object} course - 课程信息
 * @param {string} message - 提醒消息
 * @returns {Promise<boolean>} 发送是否成功
 */
async function sendClassReminder(webhookUrl, course, message) {
  console.log(`准备发送课前提醒: ${course.name}`);
  console.log(`提醒内容:\n${message}`);
  
  const success = await sendFeishuNotification(webhookUrl, message);
  
  if (success) {
    console.log(`✅ 课前提醒发送成功: ${course.name}`);
  } else {
    console.error(`❌ 课前提醒发送失败: ${course.name}`);
  }
  
  return success;
}

/**
 * 发送明日预告通知
 * @param {string} webhookUrl - 飞书webhook URL
 * @param {string} message - 预告消息
 * @returns {Promise<boolean>} 发送是否成功
 */
async function sendTomorrowPreview(webhookUrl, message) {
  console.log('准备发送明日课程预告');
  console.log(`预告内容:\n${message}`);
  
  const success = await sendFeishuNotification(webhookUrl, message);
  
  if (success) {
    console.log('✅ 明日预告发送成功');
  } else {
    console.error('❌ 明日预告发送失败');
  }
  
  return success;
}

/**
 * 发送测试通知
 * @param {string} webhookUrl - 飞书webhook URL
 * @returns {Promise<boolean>} 发送是否成功
 */
async function sendTestNotification(webhookUrl) {
  const testMessage = `🧪 课程提醒系统测试

系统运行正常！
当前时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

如果您收到这条消息，说明提醒系统已成功部署 ✅`;

  console.log('发送测试通知');
  return await sendFeishuNotification(webhookUrl, testMessage);
}

/**
 * 批量发送通知（带重试机制）
 * @param {string} webhookUrl - 飞书webhook URL
 * @param {Array} messages - 消息列表
 * @param {number} maxRetries - 最大重试次数
 * @returns {Promise<Object>} 发送结果统计
 */
async function sendBatchNotifications(webhookUrl, messages, maxRetries = 3) {
  const results = {
    total: messages.length,
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    let success = false;
    let retries = 0;
    
    while (!success && retries < maxRetries) {
      try {
        success = await sendFeishuNotification(webhookUrl, message);
        if (!success) {
          retries++;
          if (retries < maxRetries) {
            console.log(`消息发送失败，${2 ** retries}秒后重试... (${retries}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 2 ** retries * 1000));
          }
        }
      } catch (error) {
        retries++;
        results.errors.push(`消息 ${i + 1}: ${error.message}`);
        if (retries < maxRetries) {
          console.log(`消息发送异常，${2 ** retries}秒后重试... (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2 ** retries * 1000));
        }
      }
    }
    
    if (success) {
      results.success++;
    } else {
      results.failed++;
    }
    
    // 避免发送过于频繁，每条消息间隔1秒
    if (i < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

module.exports = {
  sendFeishuNotification,
  sendClassReminder,
  sendTomorrowPreview,
  sendTestNotification,
  sendBatchNotifications
};