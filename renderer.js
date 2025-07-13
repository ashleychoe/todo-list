let tasks = [];

const { ipcRenderer } = require('electron');
const confetti = require('canvas-confetti');

function minimizeWindow() {
    ipcRenderer.send('minimize-window');
}

function closeWindow() {
    ipcRenderer.send('close-window');
}

function showTodoScreen() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('todoScreen').style.display = 'block';
}

function showDoneScreen() {
    document.getElementById('todoScreen').style.display = 'none';
    document.getElementById('doneScreen').style.display = 'block';

    updateStreak();
    launchConfetti();
}

function goHome() {
    document.getElementById('doneScreen').style.display = 'none';
    const startScreen = document.getElementById('startScreen');
    startScreen.style.display = 'flex';
    tasks = [];
    renderTasks();
    updateProgress();


    startScreen.scrollTop = 0;
    startScreen.offsetHeight;
}

function handleDone() {
    const allDone = tasks.length > 0 && tasks.every(task => task.completed === true);
    if (allDone) {
        showDoneScreen();
    } else {
        document.getElementById('todoScreen').style.display = 'none';
        document.getElementById('notDoneScreen').style.display = 'block';

    }
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (text === '') return;

    tasks.push({ text, completed: false });
    input.value = '';
    renderTasks();
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        const li = document.createElement('li');

        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';

        const cookieImg = document.createElement('img');
        cookieImg.src = task.completed ? 'assets/images/crushed.png' : 'assets/images/bullet_pt.png';
        cookieImg.className = 'cookie-icon';
        cookieImg.style.opacity = task.completed ? 0.5 : 1;
        cookieImg.alt = 'cookie';
        cookieImg.addEventListener('click', () => toggleTask(index));

        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        if (task.completed) textSpan.classList.add('completed-text');
        textSpan.innerText = task.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => deleteTask(index));

        const deleteImg = document.createElement('img');
        deleteImg.src = 'assets/icons/delete_task.png';
        deleteImg.alt = 'Delete Task';
        deleteBtn.appendChild(deleteImg);

        taskItem.appendChild(cookieImg);
        taskItem.appendChild(textSpan);
        taskItem.appendChild(deleteBtn);
        li.appendChild(taskItem);
        taskList.appendChild(li);
    });

    updateProgress();
}

function updateProgress() {
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    const percent = total === 0 ? 0 : (completed / total) * 100;

    // progress bar width
    document.getElementById('progressBar').style.width = `${percent}%`;

    // update percentage
    const progressPercent = document.getElementById('progressPercent');
    if (progressPercent) {
        progressPercent.innerText = `${Math.round(percent)}%`;
    }

    const cookieImg = document.getElementById('cookieProgressImg');
    if (cookieImg) {
        if (percent < 25) {
            cookieImg.src = "assets/images/25percent.png";
        } else if (percent < 50) {
            cookieImg.src = "assets/images/50percent.png";
        } else if (percent < 75) {
            cookieImg.src = "assets/images/75percent.png";
        } else {
            cookieImg.src = "assets/images/90percent.png";
        }
    }

}

function displayCurrentDate() {
    const now = new Date();

    const month = now.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    const day = now.getDate();
    const weekday = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

    document.querySelector('.calendar-month').innerText = month;
    document.querySelector('.calendar-day').innerText = day;
    document.querySelector('.calendar-weekday').innerText = weekday;
}

function getTodayDateStr() {
    return new Date().toISOString().split('T')[0]; // '2025-06-24'
}

function displayStreak(count = null) {
    const streakDisplay = document.getElementById('streakDisplay');
    const storedCount = count !== null ? count : localStorage.getItem('streakCount') || 0;
    streakDisplay.innerText = `${storedCount} 🔥`;
}

function updateStreak() {
    const today = getTodayDateStr();
    const lastDate = localStorage.getItem('lastProductiveDate');
    let streak = parseInt(localStorage.getItem('streakCount')) || 0;

    if (lastDate === today) return; // already counted today

    const yesterday = new Date(Date.now() - 86400000); // subtract 1 day
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
        streak += 1;
    } else {
        streak = 1; // reset streak if not consecutive
    }

    localStorage.setItem('lastProductiveDate', today);
    localStorage.setItem('streakCount', streak);

    displayStreak(streak);
}


function returnToTodo() {
    document.getElementById('notDoneScreen').style.display = 'none';
    document.getElementById('todoScreen').style.display = 'block';
}

function launchConfetti() {
    const duration = 1.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}


document.addEventListener('DOMContentLoaded', () => {
    displayCurrentDate();

    displayStreak();

    // task input + add
    document.getElementById('add-btn').addEventListener('click', addTask);

    document.getElementById('taskInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTask();
    });
});
