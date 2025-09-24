// 提醒逻辑模块
// 核心业务逻辑：判断是否需要发送提醒，生成提醒内容

const { courses, timeSlots, CAMPUS_REMINDER_CONFIG } = require('./course-data');
const { 
  getCurrentWeek, 
  isCourseActiveInWeek, 
  getCourseTime, 
  getDayOfWeek, 
  getDateByWeekAndDay,
  getBeijingTime,
  formatDateChinese,
  timeToMinutes,
  minutesToTime
} = require('./time-calculator');

/**
 * 检查是否需要发送课前提醒
 * @returns {Array} 需要提醒的课程列表
 */
function checkUpcomingClasses() {
  const now = getBeijingTime();
  const currentWeek = getCurrentWeek();
  const currentDayOfWeek = getDayOfWeek(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const upcomingClasses = [];
  
  // 遍历所有课程
  courses.forEach(course => {
    // 检查课程是否在当前周次有效
    if (!isCourseActiveInWeek(course, currentWeek)) {
      return;
    }
    
    // 检查是否是今天的课程
    if (course.dayOfWeek !== currentDayOfWeek) {
      return;
    }
    
    // 获取课程时间信息
    const courseTime = getCourseTime(course, timeSlots);
    const reminderAdvanceMinutes = CAMPUS_REMINDER_CONFIG[course.campus];
    const reminderTime = courseTime.startMinutes - reminderAdvanceMinutes;
    
    // 检查是否到了提醒时间（允许5分钟的误差范围）
    const timeDiff = Math.abs(currentMinutes - reminderTime);
    if (timeDiff <= 5) {
      upcomingClasses.push({
        ...course,
        courseTime,
        reminderAdvanceMinutes,
        actualReminderTime: minutesToTime(reminderTime)
      });
    }
  });
  
  return upcomingClasses;
}

/**
 * 获取明天的课程安排
 * @returns {Array} 明天的课程列表
 */
function getTomorrowClasses() {
  const tomorrow = new Date(getBeijingTime().getTime() + 24 * 60 * 60 * 1000);
  const tomorrowWeek = getCurrentWeek();
  const tomorrowDayOfWeek = getDayOfWeek(tomorrow);
  
  const tomorrowClasses = [];
  
  courses.forEach(course => {
    // 检查课程是否在明天的周次有效
    if (!isCourseActiveInWeek(course, tomorrowWeek)) {
      return;
    }
    
    // 检查是否是明天的课程
    if (course.dayOfWeek !== tomorrowDayOfWeek) {
      return;
    }
    
    const courseTime = getCourseTime(course, timeSlots);
    tomorrowClasses.push({
      ...course,
      courseTime,
      date: tomorrow
    });
  });
  
  // 按上课时间排序
  tomorrowClasses.sort((a, b) => a.courseTime.startMinutes - b.courseTime.startMinutes);
  
  return tomorrowClasses;
}

/**
 * 生成课前提醒消息
 * @param {Object} course - 课程信息
 * @returns {string} 提醒消息
 */
function generateClassReminderMessage(course) {
  const { name, campus, location, courseTime, reminderAdvanceMinutes } = course;
  const locationParts = location.split('，');
  const locationText = locationParts.length > 1 ? locationParts[1] : location;
  
  // 根据校区生成不同的提醒文案
  const campusEmoji = campus === '闵行' ? '🏫' : '🚌';
  const timeText = reminderAdvanceMinutes === 30 ? '30分钟后' : '2小时后';
  const actionText = campus === '闵行' ? '记得带好课本和笔记本哦~' : '记得提前出发，路上注意安全！';
  const actionEmoji = campus === '闵行' ? '💪' : '🚗';
  
  return `📚 上课提醒

${campusEmoji} ${timeText}${campus === '中北' ? '要去中北' : '有课'}啦！
📖 课程：${name}
⏰ 时间：${courseTime.startTime}-${courseTime.endTime} (第${course.periods.join('-')}节)
📍 地点：${locationText}
🏫 校区：${campus}校区

${actionText} ${actionEmoji}`;
}

/**
 * 生成明日课程预告消息
 * @param {Array} tomorrowClasses - 明天的课程列表
 * @returns {string} 预告消息
 */
function generateTomorrowPreviewMessage(tomorrowClasses) {
  if (tomorrowClasses.length === 0) {
    return generateNoClassMessage();
  }
  
  const tomorrow = tomorrowClasses[0].date;
  const dateStr = formatDateChinese(tomorrow);
  
  let message = `🌙 明日课程预告

📅 明天 ${dateStr} 的课程安排：

`;
  
  tomorrowClasses.forEach(course => {
    const { name, campus, location, courseTime } = course;
    const locationParts = location.split('，');
    const locationText = locationParts.length > 1 ? locationParts[1] : location;
    
    message += `📖 ${name}
⏰ ${courseTime.startTime}-${courseTime.endTime} (第${course.periods.join('-')}节)
📍 ${locationText} (${campus}校区)

`;
  });
  
  message += '早点休息，明天加油！🌟';
  
  return message;
}

/**
 * 生成无课祝福消息
 * @returns {string} 祝福消息
 */
function generateNoClassMessage() {
  const blessings = [
    '🎉 明日无课\n\n明天没有课程安排哦！\n可以好好休息或者安排其他活动 😊\n\n享受这个轻松的一天吧！🌈',
    '🎊 明日自由日\n\n明天是没有课的一天！\n可以睡个懒觉或者做些喜欢的事情 🛌\n\n好好享受这个美好的日子！☀️',
    '🌟 明日休息日\n\n明天没有课程安排！\n是时候放松一下了 🧘‍♀️\n\n愿你度过愉快的一天！🌸'
  ];
  
  // 随机选择一个祝福消息
  const randomIndex = Math.floor(Math.random() * blessings.length);
  return blessings[randomIndex];
}

/**
 * 检查当前时间是否应该发送明日预告（每晚11点）
 * @returns {boolean} 是否应该发送
 */
function shouldSendTomorrowPreview() {
  const now = getBeijingTime();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // 检查是否是晚上11点（允许5分钟误差）
  return currentHour === 23 && currentMinute <= 5;
}

module.exports = {
  checkUpcomingClasses,
  getTomorrowClasses,
  generateClassReminderMessage,
  generateTomorrowPreviewMessage,
  generateNoClassMessage,
  shouldSendTomorrowPreview
};