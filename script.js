document.addEventListener('DOMContentLoaded', () => {
    const courses = [
      { name: "电子材料与器件", classId: "202510588", weeks: "1-18", dayOfWeek: 1, periods: [3, 4], location: "闵行，闵四教225", campus: "闵行" },
      { name: "药物化学生物学", classId: "202511878", weeks: "1-18", dayOfWeek: 5, periods: [3, 4], location: "闵行，闵二教316", campus: "闵行" },
      { name: "人工智能药物设计", classId: "202511867", weeks: "1-18", dayOfWeek: 1, periods: [6, 7], location: "中北，文史楼105", campus: "中北" },
      { name: "药学实验室安全与科研伦理", classId: "202511868", weeks: "5-10", dayOfWeek: 3, periods: [6, 7, 8], location: "闵行，闵一教223", campus: "闵行" },
      { name: "博士英语演讲", classId: "202510232", weeks: "1-18", dayOfWeek: 4, periods: [6, 7], location: "闵行，闵一教128", campus: "闵行" },
      { name: "中国马克思主义与当代", classId: "202510656", weeks: "2-13", dayOfWeek: 1, periods: [11, 12, 13], location: "闵行，闵四教110", campus: "闵行" },
      { name: "创新药物与前沿技术", classId: "202511865", weeks: "1-18", dayOfWeek: 3, periods: [11, 12, 13], location: "中北，文史楼215", campus: "中北" }
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

    const timetableGrid = document.querySelector('.timetable-grid');
    const currentWeekEl = document.getElementById('current-week');
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    const currentWeekBtn = document.getElementById('current-week-btn');

    const startDate = new Date('2025-09-15T00:00:00');
    let currentWeek;
    let displayWeek;

    function getCurrentWeek() {
        const now = new Date();
        const diff = now.getTime() - startDate.getTime();
        const week = Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1;
        return week > 0 ? week : 1;
    }

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

    function createTimetable() {
        // 生成时间列
        timeSlots.forEach(slot => {
            const timeCell = document.createElement('div');
            timeCell.classList.add('grid-item', 'time-slot');
            timeCell.innerHTML = `<span>${slot.start}</span><span>${slot.end}</span>`;
            timetableGrid.appendChild(timeCell);

            // 生成课程格子
            for (let i = 0; i < 7; i++) {
                const courseCell = document.createElement('div');
                courseCell.classList.add('grid-item', 'course-cell');
                courseCell.dataset.day = i + 1;
                courseCell.dataset.period = slot.period;
                timetableGrid.appendChild(courseCell);
            }
        });
    }

    function renderCourses(week) {
        console.log(`Rendering courses for week: ${week}`);
        // 清理旧课程
        document.querySelectorAll('.course-item').forEach(item => item.remove());

        currentWeekEl.textContent = `第 ${week} 周`;

        if (week === currentWeek) {
            currentWeekEl.classList.add('current');
        } else {
            currentWeekEl.classList.remove('current');
        }

        updateDates(week);

        const today = new Date();
        const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 星期日是0，改为7

        // 高亮当天
        document.querySelectorAll('.course-cell').forEach(cell => {
            cell.classList.remove('today');
            if (parseInt(cell.dataset.day) === currentDayOfWeek && week === currentWeek) {
                cell.classList.add('today');
            }
        });
        document.querySelectorAll('.day-header').forEach((header, index) => {
            header.classList.remove('today');
            if (index + 1 === currentDayOfWeek && week === currentWeek) {
                header.classList.add('today');
            }
        });


        courses.forEach(course => {
            const activeWeeks = parseWeeks(course.weeks);
            if (activeWeeks.has(week)) {
                console.log('Rendering course:', course.name);
                const startPeriod = course.periods[0];
                const duration = course.periods.length;
                const targetCell = document.querySelector(`.course-cell[data-day='${course.dayOfWeek}'][data-period='${startPeriod}']`);
                console.log('Target cell:', targetCell);

                if (targetCell) {
                    const courseItem = document.createElement('div');
                    courseItem.classList.add('course-item', `campus-${course.campus}`);
                    courseItem.style.height = `calc(${duration * 60}px + ${duration - 1}px)`;
                    const locationParts = course.location.split('，');
                    console.log('Location parts:', locationParts);
                    const locationText = locationParts.length > 1 ? locationParts[1] : course.location;
                    courseItem.innerHTML = `
                        <strong>${course.name}</strong>
                        <span class="location">${locationText}</span>
                    `;
                    targetCell.appendChild(courseItem);
                } else {
                    console.error('Could not find target cell for course:', course.name);
                }
            }
        });
    }

    function updateDates(week) {
        const dayHeaders = document.querySelectorAll('.day-header .date');
        const startOfWeek = new Date(startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);

        dayHeaders.forEach((header, index) => {
            const date = new Date(startOfWeek.getTime() + index * 24 * 60 * 60 * 1000);
            header.textContent = `${date.getMonth() + 1}/${date.getDate()}`;
        });
    }

    function init() {
        createTimetable();
        currentWeek = getCurrentWeek();
        displayWeek = currentWeek;
        renderCourses(displayWeek);

        prevWeekBtn.addEventListener('click', () => {
            if (displayWeek > 1) {
                displayWeek--;
                renderCourses(displayWeek);
            }
        });

        nextWeekBtn.addEventListener('click', () => {
            displayWeek++;
            renderCourses(displayWeek);
        });

        currentWeekBtn.addEventListener('click', () => {
            displayWeek = currentWeek;
            renderCourses(displayWeek);
        });
    }

    init();
});