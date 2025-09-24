// 时间计算模块
// 处理学期周次计算、课程时间匹配等核心逻辑

const { SEMESTER_START_DATE } = require('./course-data');

/**
 * 获取当前学期周次
 * @returns {number} 当前周次（1-18）
 */
function getCurrentWeek() {
  const now = new Date();
  const diff = now.getTime() - SEMESTER_START_DATE.getTime();
  const week = Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1;
  return week > 0 ? week : 1;
}

/**
 * 解析课程周次范围字符串
 * @param {string} weeksStr - 周次字符串，如 "1-18", "5-10", "2-13"
 * @returns {Set<number>} 有效周次的集合
 */
function parseWeeks(weeksStr) {
  const weekRanges = weeksStr.split(',');
  const activeWeeks = new Set();
  
  weekRanges.forEach(range => {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        activeWeeks.add(i);
      }
    } else {
      activeWeeks.add(Number(range));
    }
  });
  
  return activeWeeks;
}

/**
 * 检查课程是否在指定周次有效
 * @param {Object} course - 课程对象
 * @param {number} week - 周次
 * @returns {boolean} 是否有效
 */
function isCourseActiveInWeek(course, week) {
  const activeWeeks = parseWeeks(course.weeks);
  return activeWeeks.has(week);
}

/**
 * 将时间字符串转换为分钟数（从00:00开始计算）
 * @param {string} timeStr - 时间字符串，如 "9:50"
 * @returns {number} 分钟数
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 将分钟数转换为时间字符串
 * @param {number} minutes - 分钟数
 * @returns {string} 时间字符串
 */
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 获取课程的开始和结束时间
 * @param {Object} course - 课程对象
 * @param {Array} timeSlots - 时间段数组
 * @returns {Object} {startTime, endTime, startMinutes, endMinutes}
 */
function getCourseTime(course, timeSlots) {
  const startPeriod = course.periods[0];
  const endPeriod = course.periods[course.periods.length - 1];
  
  const startSlot = timeSlots.find(slot => slot.period === startPeriod);
  const endSlot = timeSlots.find(slot => slot.period === endPeriod);
  
  return {
    startTime: startSlot.start,
    endTime: endSlot.end,
    startMinutes: timeToMinutes(startSlot.start),
    endMinutes: timeToMinutes(endSlot.end)
  };
}

/**
 * 获取指定日期是星期几（1=周一，7=周日）
 * @param {Date} date - 日期对象
 * @returns {number} 星期几
 */
function getDayOfWeek(date) {
  const day = date.getDay();
  return day === 0 ? 7 : day; // 将周日从0改为7
}

/**
 * 获取指定周次和星期几的日期
 * @param {number} week - 周次
 * @param {number} dayOfWeek - 星期几（1-7）
 * @returns {Date} 日期对象
 */
function getDateByWeekAndDay(week, dayOfWeek) {
  const startOfWeek = new Date(SEMESTER_START_DATE.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
  const targetDate = new Date(startOfWeek.getTime() + (dayOfWeek - 1) * 24 * 60 * 60 * 1000);
  return targetDate;
}

/**
 * 获取当前北京时间
 * @returns {Date} 北京时间
 */
function getBeijingTime() {
  const now = new Date();
  // 转换为北京时间（UTC+8）
  const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return beijingTime;
}

/**
 * 格式化日期为中文显示
 * @param {Date} date - 日期对象
 * @returns {string} 格式化的日期字符串
 */
function formatDateChinese(date) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  
  return `${month}月${day}日 (${weekday})`;
}

module.exports = {
  getCurrentWeek,
  parseWeeks,
  isCourseActiveInWeek,
  timeToMinutes,
  minutesToTime,
  getCourseTime,
  getDayOfWeek,
  getDateByWeekAndDay,
  getBeijingTime,
  formatDateChinese
};