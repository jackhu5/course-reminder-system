// 主程序入口
// 整合所有模块，处理定时提醒逻辑

const { 
  checkUpcomingClasses, 
  getTomorrowClasses, 
  generateClassReminderMessage, 
  generateTomorrowPreviewMessage,
  shouldSendTomorrowPreview 
} = require('./reminder-logic');

const { 
  sendClassReminder, 
  sendTomorrowPreview,
  sendTestNotification 
} = require('./feishu-notifier');

const { getCurrentWeek, getBeijingTime } = require('./time-calculator');

// 从环境变量获取飞书webhook URL
const FEISHU_WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL;

/**
 * 主要的提醒检查函数
 */
async function runReminderCheck() {
  console.log('='.repeat(50));
  console.log('🚀 课程提醒系统启动');
  console.log(`⏰ 当前时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`📅 当前学期周次: 第${getCurrentWeek()}周`);
  console.log('='.repeat(50));

  if (!FEISHU_WEBHOOK_URL) {
    console.error('❌ 错误: 未设置 FEISHU_WEBHOOK_URL 环境变量');
    process.exit(1);
  }

  let hasNotifications = false;

  try {
    // 1. 检查课前提醒
    console.log('🔍 检查课前提醒...');
    const upcomingClasses = checkUpcomingClasses();
    
    if (upcomingClasses.length > 0) {
      console.log(`📚 发现 ${upcomingClasses.length} 门即将开始的课程`);
      hasNotifications = true;
      
      for (const course of upcomingClasses) {
        const message = generateClassReminderMessage(course);
        const success = await sendClassReminder(FEISHU_WEBHOOK_URL, course, message);
        
        if (!success) {
          console.error(`❌ 课程提醒发送失败: ${course.name}`);
        }
        
        // 避免发送过于频繁
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      console.log('✅ 当前时间无需发送课前提醒');
    }

    // 2. 检查明日预告
    console.log('🔍 检查明日预告...');
    if (shouldSendTomorrowPreview()) {
      console.log('🌙 到了发送明日预告的时间');
      hasNotifications = true;
      
      const tomorrowClasses = getTomorrowClasses();
      const previewMessage = generateTomorrowPreviewMessage(tomorrowClasses);
      
      const success = await sendTomorrowPreview(FEISHU_WEBHOOK_URL, previewMessage);
      
      if (!success) {
        console.error('❌ 明日预告发送失败');
      }
    } else {
      console.log('✅ 当前时间无需发送明日预告');
    }

    // 3. 如果没有任何通知，记录日志
    if (!hasNotifications) {
      console.log('😴 当前时间段无需发送任何提醒');
    }

  } catch (error) {
    console.error('❌ 系统运行出错:', error);
    process.exit(1);
  }

  console.log('='.repeat(50));
  console.log('✅ 课程提醒系统检查完成');
  console.log('='.repeat(50));
}

/**
 * 测试模式
 */
async function runTestMode() {
  console.log('🧪 运行测试模式');
  
  if (!FEISHU_WEBHOOK_URL) {
    console.error('❌ 错误: 未设置 FEISHU_WEBHOOK_URL 环境变量');
    process.exit(1);
  }

  try {
    // 发送测试通知
    const success = await sendTestNotification(FEISHU_WEBHOOK_URL);
    
    if (success) {
      console.log('✅ 测试通知发送成功');
    } else {
      console.error('❌ 测试通知发送失败');
      process.exit(1);
    }

    // 显示当前课程状态
    console.log('\n📊 当前课程状态:');
    console.log(`当前周次: 第${getCurrentWeek()}周`);
    
    const upcomingClasses = checkUpcomingClasses();
    console.log(`即将开始的课程: ${upcomingClasses.length}门`);
    
    const tomorrowClasses = getTomorrowClasses();
    console.log(`明天的课程: ${tomorrowClasses.length}门`);
    
    if (tomorrowClasses.length > 0) {
      console.log('明天的课程列表:');
      tomorrowClasses.forEach(course => {
        console.log(`  - ${course.name} (${course.campus}校区, ${course.courseTime.startTime}-${course.courseTime.endTime})`);
      });
    }

  } catch (error) {
    console.error('❌ 测试模式运行出错:', error);
    process.exit(1);
  }
}

/**
 * 调试模式 - 显示详细信息但不发送通知
 */
async function runDebugMode() {
  console.log('🐛 运行调试模式');
  
  try {
    console.log('\n📊 系统状态:');
    console.log(`当前时间: ${getBeijingTime().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
    console.log(`当前周次: 第${getCurrentWeek()}周`);
    
    // 检查课前提醒
    const upcomingClasses = checkUpcomingClasses();
    console.log(`\n📚 即将开始的课程 (${upcomingClasses.length}门):`);
    
    if (upcomingClasses.length > 0) {
      upcomingClasses.forEach(course => {
        console.log(`\n课程: ${course.name}`);
        console.log(`校区: ${course.campus}`);
        console.log(`时间: ${course.courseTime.startTime}-${course.courseTime.endTime}`);
        console.log(`提醒消息:`);
        console.log(generateClassReminderMessage(course));
      });
    } else {
      console.log('  无');
    }
    
    // 检查明日预告
    const tomorrowClasses = getTomorrowClasses();
    console.log(`\n🌙 明天的课程 (${tomorrowClasses.length}门):`);
    
    if (tomorrowClasses.length > 0) {
      tomorrowClasses.forEach(course => {
        console.log(`  - ${course.name} (${course.campus}校区, ${course.courseTime.startTime}-${course.courseTime.endTime})`);
      });
      
      console.log('\n明日预告消息:');
      console.log(generateTomorrowPreviewMessage(tomorrowClasses));
    } else {
      console.log('  无');
      console.log('\n无课祝福消息:');
      console.log(generateTomorrowPreviewMessage([]));
    }
    
    console.log(`\n⏰ 是否应该发送明日预告: ${shouldSendTomorrowPreview() ? '是' : '否'}`);

  } catch (error) {
    console.error('❌ 调试模式运行出错:', error);
    process.exit(1);
  }
}

// 主程序入口
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'normal';

  switch (mode) {
    case 'test':
      await runTestMode();
      break;
    case 'debug':
      await runDebugMode();
      break;
    case 'normal':
    default:
      await runReminderCheck();
      break;
  }
}

// 运行主程序
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 程序运行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  runReminderCheck,
  runTestMode,
  runDebugMode
};