# 📚 智能课程提醒系统

基于 GitHub Actions 和飞书 Webhook 的自动化课程提醒系统，支持智能课程预告。

## ✨ 功能特性

### 🎯 核心功能
- **每晚预告**：每晚11点自动发送第二天课程安排。
- **无课祝福**：第二天无课时发送轻松祝福消息。
- **智能周次计算**：自动识别当前学期周次，支持不同课程的周次范围。
- **纯文本消息**：飞书消息采用纯文本+表情格式，简洁易读。

### 📅 支持的课程安排
- **7门课程**，分布在闵行和中北两个校区
- **复杂时间安排**：支持同一天多门课程，不同时间段
- **灵活周次范围**：支持 1-18周、5-10周、2-13周等不同范围

## 🏗️ 系统架构

```
GitHub Actions (定时触发)
    ↓
课程数据解析 → 时间计算引擎 → 提醒逻辑判断
    ↓
飞书消息格式化 → Webhook发送 → 用户接收提醒
```

## 📋 课程信息

### 闵行校区课程（5门）
| 课程名称 | 时间 | 地点 | 周次 |
|---------|------|------|------|
| 电子材料与器件 | 周一 第3-4节 (9:50-11:25) | 闵四教225 | 1-18周 |
| 药物化学生物学 | 周五 第3-4节 (9:50-11:25) | 闵二教316 | 1-18周 |
| 药学实验室安全与科研伦理 | 周三 第6-8节 (13:00-15:35) | 闵一教223 | 5-10周 |
| 博士英语演讲 | 周四 第6-7节 (13:00-14:35) | 闵一教128 | 1-18周 |
| 中国马克思主义与当代 | 周一 第11-13节 (18:00-20:25) | 闵四教110 | 2-13周 |

### 中北校区课程（2门）
| 课程名称 | 时间 | 地点 | 周次 |
|---------|------|------|------|
| 人工智能药物设计 | 周一 第6-7节 (13:00-14:35) | 文史楼105 | 1-18周 |
| 创新药物与前沿技术 | 周三 第11-13节 (18:00-20:25) | 文史楼215 | 1-18周 |

## 🚀 快速开始

### 1. 准备工作

#### 获取飞书 Webhook URL
1. 在飞书群聊中添加机器人
2. 获取 Webhook URL（格式：`https://www.feishu.cn/flow/api/trigger-webhook/xxx`）

#### Fork 本项目
1. 点击右上角 "Fork" 按钮
2. 克隆到你的 GitHub 账户

### 2. 配置 GitHub Secrets

在你的 GitHub 仓库中设置以下 Secret：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下 Secret：

| Name | Value | 说明 |
|------|-------|------|
| `FEISHU_WEBHOOK_URL` | 你的飞书 Webhook URL | 用于发送通知消息 |

### 3. 启用 GitHub Actions

1. 进入仓库 → Actions 标签页
2. 如果看到提示，点击 "I understand my workflows, go ahead and enable them"
3. 系统将自动开始运行定时任务

### 4. 测试系统

#### 手动测试
1. 进入 Actions → 选择 "课程提醒系统"
2. 点击 "Run workflow"
3. 选择测试模式：
   - `test`：发送测试通知
   - `debug`：显示详细信息但不发送通知
   - `normal`：正常运行模式

## ⏰ 定时任务

### 自动运行时间
- **明日预告**：每晚11点（北京时间）

## 📱 消息示例

### 明日预告消息

**有课日：**
```
🌙 明日课程预告

📅 明天 9月25日 (周二) 的课程安排：

📖 药物化学生物学
⏰ 9:50-11:25 (第3-4节)
📍 闵二教316 (闵行校区)

📖 博士英语演讲
⏰ 13:00-14:35 (第6-7节)
📍 闵一教128 (闵行校区)

早点休息，明天加油！🌟
```

**无课日：**
```
🎉 明日无课

明天没有课程安排哦！
可以好好休息或者安排其他活动 😊

享受这个轻松的一天吧！🌈
```

## 🛠️ 本地开发

### 环境要求
- Node.js >= 14.0.0
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 设置环境变量
```bash
export FEISHU_WEBHOOK_URL="你的飞书webhook地址"
```

### 运行命令
```bash
# 正常运行
npm start

# 测试模式
npm run test

# 调试模式
npm run debug

# 课程提醒检查
npm run reminder
```

## 📁 项目结构

```
course-reminder-system/
├── src/
│   ├── course-data.js      # 课程数据配置
│   ├── time-calculator.js  # 时间计算工具
│   ├── reminder-logic.js   # 提醒逻辑核心
│   ├── feishu-notifier.js  # 飞书通知模块
│   └── main.js            # 主程序入口
├── .github/
│   └── workflows/
│       └── course-reminder.yml  # GitHub Actions配置
├── package.json
├── README.md
└── course-reminder-plan.md      # 详细设计方案
```

## 🔧 自定义配置

### 修改课程信息
编辑 `src/course-data.js` 文件：

```javascript
const courses = [
  { 
    name: "课程名称", 
    classId: "课程ID", 
    weeks: "1-18",           // 周次范围
    dayOfWeek: 1,            // 星期几 (1-7)
    periods: [3, 4],         // 节次
    location: "校区，教室",   // 地点
    campus: "校区名称"       // 校区
  },
  // 添加更多课程...
];
```

### 修改学期开始时间
```javascript
const SEMESTER_START_DATE = new Date('2025-09-15T00:00:00+08:00');
```

## 🐛 故障排除

### 常见问题

1. **没有收到提醒**
   - 检查 GitHub Actions 是否正常运行
   - 确认 `FEISHU_WEBHOOK_URL` 设置正确
   - 查看 Actions 运行日志

2. **时间不准确**
   - 系统使用北京时间（UTC+8）
   - 检查当前周次计算是否正确

3. **课程信息错误**
   - 检查 `src/course-data.js` 中的课程配置
   - 确认周次范围和时间设置

### 查看日志
1. 进入 GitHub Actions
2. 选择最近的运行记录
3. 查看详细日志输出

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请在 GitHub Issues 中提出。

---

**享受智能化的课程提醒体验！** 🎓✨