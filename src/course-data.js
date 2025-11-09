// 课程数据模块
// 从原始 script.js 提取并优化的课程信息

const courses = [
  {
    name: "电子材料与器件",
    classId: "202510588",
    weeks: "1-18",
    dayOfWeek: 1,
    periods: [3, 4],
    location: "闵行，闵一教230",
    campus: "闵行"
  },
  { 
    name: "药物化学生物学", 
    classId: "202511878", 
    weeks: "1-18", 
    dayOfWeek: 5, 
    periods: [3, 4], 
    location: "闵行，闵二教316", 
    campus: "闵行" 
  },
  {
    name: "人工智能药物设计",
    classId: "202511867",
    weeks: "1-18",
    dayOfWeek: 1,
    periods: [6, 7],
    location: "中北，田家炳教书院132",
    campus: "中北"
  },
  { 
    name: "药学实验室安全与科研伦理", 
    classId: "202511868", 
    weeks: "5-10", 
    dayOfWeek: 3, 
    periods: [6, 7, 8], 
    location: "闵行，闵一教223", 
    campus: "闵行" 
  },
  { 
    name: "博士英语演讲", 
    classId: "202510232", 
    weeks: "1-18", 
    dayOfWeek: 4, 
    periods: [6, 7], 
    location: "闵行，闵一教128", 
    campus: "闵行" 
  },
  { 
    name: "中国马克思主义与当代", 
    classId: "202510656", 
    weeks: "2-13", 
    dayOfWeek: 1, 
    periods: [11, 12, 13], 
    location: "闵行，闵四教110", 
    campus: "闵行" 
  },
  { 
    name: "创新药物与前沿技术", 
    classId: "202511865", 
    weeks: "1-18", 
    dayOfWeek: 3, 
    periods: [11, 12, 13], 
    location: "中北，文史楼215", 
    campus: "中北" 
  }
];

const timeSlots = [
  { period: 1, start: "8:00", end: "8:45" },
  { period: 2, start: "8:50", end: "9:35" },
  { period: 3, start: "9:50", end: "10:35" },
  { period: 4, start: "10:40", end: "11:25" },
  { period: 5, start: "11:30", end: "12:15" },
  { period: 6, start: "13:00", end: "13:45" },
  { period: 7, start: "13:50", end: "14:35" },
  { period: 8, start: "14:50", end: "15:35" },
  { period: 9, start: "15:40", end: "16:25" },
  { period: 10, start: "16:30", end: "17:15" },
  { period: 11, start: "18:00", end: "18:45" },
  { period: 12, start: "18:50", end: "19:35" },
  { period: 13, start: "19:40", end: "20:25" },
  { period: 14, start: "20:30", end: "21:15" }
];

// 学期开始日期
const SEMESTER_START_DATE = new Date('2025-09-15T00:00:00+08:00');

// 校区提醒提前时间配置（分钟）
const CAMPUS_REMINDER_CONFIG = {
  '闵行': 30,  // 30分钟前提醒
  '中北': 120  // 2小时前提醒
};

module.exports = {
  courses,
  timeSlots,
  SEMESTER_START_DATE,
  CAMPUS_REMINDER_CONFIG
};