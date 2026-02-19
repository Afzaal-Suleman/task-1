const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const itemsPerPageSelect = document.getElementById('itemsPerPage');
const currentDateEl = document.getElementById('currentDate');
const currentTimeEl = document.getElementById('currentTime');

// State
let tasks = [];
let currentPage = 1;
let itemsPerPage = 5;
let editId = null;

// Load tasks from localStorage
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    renderTasks();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add new task
function addTask() {
    const text = taskInput.value.trim();
    if (text) {
        const task = {
            id: Date.now().toString(),
            text: text,
            createdAt: new Date().toISOString()
        };
        tasks.unshift(task); 
        saveTasks();
        taskInput.value = '';
        currentPage = 1;
        renderTasks();
    }
}

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        taskInput.value = task.text;
        editId = id;
        addBtn.textContent = 'Update Task';
    }
}

// Update task
function updateTask() {
    const text = taskInput.value.trim();
    if (text && editId) {
        const taskIndex = tasks.findIndex(t => t.id === editId);
        if (taskIndex !== -1) {
            tasks[taskIndex].text = text;
            tasks[taskIndex].createdAt = new Date().toISOString(); // Update timestamp
            // Re-sort tasks
            tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            saveTasks();
            resetEdit();
            renderTasks();
        }
    }
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        
        // Adjust current page if necessary
        const totalPages = Math.ceil(tasks.length / itemsPerPage);
        if (currentPage > totalPages && currentPage > 1) {
            currentPage = totalPages;
        }
        
        renderTasks();
    }
}

// Reset edit mode
function resetEdit() {
    taskInput.value = '';
    editId = null;
    addBtn.textContent = 'Add Task';
}

// Get current page tasks
function getCurrentPageTasks() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return tasks.slice(startIndex, endIndex);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Render tasks
function renderTasks() {
    const currentTasks = getCurrentPageTasks();
    const totalPages = Math.ceil(tasks.length / itemsPerPage) || 1;
    
    // Update pagination buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || tasks.length === 0;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Render tasks
    if (tasks.length === 0) {
        taskList.innerHTML = '<li class="task-item" style="justify-content: center; color: #999;">No tasks yet. Add one above!</li>';
        return;
    }
    
    taskList.innerHTML = currentTasks.map(task => `
        <li class="task-item">
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-date">${formatDate(task.createdAt)}</div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask('${task.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        </li>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDateEl.textContent = now.toLocaleDateString('en-US', dateOptions);
    
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    currentTimeEl.textContent = now.toLocaleTimeString('en-US', timeOptions);
}

// Event Listeners
addBtn.addEventListener('click', () => {
    if (editId) {
        updateTask();
    } else {
        addTask();
    }
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (editId) {
            updateTask();
        } else {
            addTask();
        }
    }
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTasks();
    }
});

nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(tasks.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTasks();
    }
});

itemsPerPageSelect.addEventListener('change', () => {
    itemsPerPage = parseInt(itemsPerPageSelect.value);
    currentPage = 1;
    renderTasks();
});

// Update date and time every second
updateDateTime();
setInterval(updateDateTime, 1000);

// Make functions available globally for onclick handlers
window.editTask = editTask;
window.deleteTask = deleteTask;

// Initial load
loadTasks();