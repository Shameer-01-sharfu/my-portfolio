const TODO_STORAGE_KEY = "shameer-todo-tasks";

let todoState = {
    tasks: loadTasks(),
    filter: "all"
};

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const todoCount = document.querySelector("#todo-count");
const todoStatus = document.querySelector("#todo-status");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll("[data-filter]");

function loadTasks() {
    try {
        const saved = localStorage.getItem(TODO_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todoState.tasks));
}

function createTask(text) {
    return {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        text: text.trim(),
        completed: false
    };
}

function getVisibleTasks() {
    if (todoState.filter === "active") {
        return todoState.tasks.filter(task => !task.completed);
    }

    if (todoState.filter === "completed") {
        return todoState.tasks.filter(task => task.completed);
    }

    return todoState.tasks;
}

function renderTasks() {
    todoList.replaceChildren();

    const visibleTasks = getVisibleTasks();

    if (visibleTasks.length === 0) {
        const empty = document.createElement("li");
        empty.className = "todo-empty";
        empty.textContent = todoState.tasks.length === 0
            ? "No tasks yet. Add your first task!"
            : "No tasks match this filter.";
        todoList.appendChild(empty);
    } else {
        visibleTasks.forEach(task => {
            const item = document.createElement("li");
            item.className = `todo-item${task.completed ? " completed" : ""}`;
            item.dataset.id = task.id;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "todo-check";
            checkbox.checked = task.completed;
            checkbox.dataset.action = "toggle";
            checkbox.setAttribute("aria-label", `Mark "${task.text}" as ${task.completed ? "active" : "completed"}`);

            const text = document.createElement("span");
            text.className = "todo-text";
            text.textContent = task.text;

            const actions = document.createElement("div");
            actions.className = "todo-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "todo-action";
            editButton.dataset.action = "edit";
            editButton.textContent = "Edit";
            editButton.setAttribute("aria-label", `Edit "${task.text}"`);

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "todo-action";
            deleteButton.dataset.action = "delete";
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);

            actions.append(editButton, deleteButton);
            item.append(checkbox, text, actions);
            todoList.appendChild(item);
        });
    }

    const activeCount = todoState.tasks.filter(task => !task.completed).length;
    todoCount.textContent = `${activeCount} active ${activeCount === 1 ? "task" : "tasks"}`;

    filterButtons.forEach(button => {
        const active = button.dataset.filter === todoState.filter;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}

function addTask(text) {
    if (!text.trim()) return;

    todoState.tasks.unshift(createTask(text));
    saveTasks();
    renderTasks();
    todoStatus.textContent = "Task added.";
}

function editTask(taskId) {
    const task = todoState.tasks.find(item => item.id === taskId);
    if (!task) return;

    const updatedText = window.prompt("Edit task:", task.text);

    if (updatedText === null) return;

    const trimmedText = updatedText.trim();

    if (!trimmedText) {
        todoStatus.textContent = "Task text cannot be empty.";
        return;
    }

    task.text = trimmedText;
    saveTasks();
    renderTasks();
    todoStatus.textContent = "Task updated.";
}

function toggleTask(taskId) {
    const task = todoState.tasks.find(item => item.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    todoStatus.textContent = task.completed
        ? "Task marked completed."
        : "Task marked active.";
}

function deleteTask(taskId) {
    const task = todoState.tasks.find(item => item.id === taskId);
    todoState.tasks = todoState.tasks.filter(item => item.id !== taskId);
    saveTasks();
    renderTasks();
    todoStatus.textContent = `"${task?.text || "Task"}" deleted.`;
}

todoForm?.addEventListener("submit", event => {
    event.preventDefault();
    addTask(todoInput.value);
    todoInput.value = "";
    todoInput.focus();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        todoState.filter = button.dataset.filter;
        renderTasks();
    });
});

todoList?.addEventListener("click", event => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) return;

    const item = actionElement.closest(".todo-item");
    if (!item) return;

    const taskId = item.dataset.id;
    const action = actionElement.dataset.action;

    if (action === "edit") editTask(taskId);
    if (action === "delete") deleteTask(taskId);
});

todoList?.addEventListener("change", event => {
    const checkbox = event.target.closest('[data-action="toggle"]');
    if (!checkbox) return;

    const item = checkbox.closest(".todo-item");
    if (item) toggleTask(item.dataset.id);
});

clearCompletedButton?.addEventListener("click", () => {
    const completedCount = todoState.tasks.filter(task => task.completed).length;

    if (completedCount === 0) {
        todoStatus.textContent = "There are no completed tasks to clear.";
        return;
    }

    todoState.tasks = todoState.tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    todoStatus.textContent = `${completedCount} completed task${completedCount === 1 ? "" : "s"} cleared.`;
});

renderTasks();
