const listsContainer = document.querySelector("[data-lists]");
const newListForm = document.querySelector("[data-new-list-form]");
const newListInput = document.querySelector("[data-new-list-input]");
const deleteListBtn = document.querySelector("[data-delete-list-button]");
const listDisplayContainer = document.querySelector(
  "[data-list-display-container]"
);
const listTitleElement = document.querySelector("[data-list-title]");
const listCountElement = document.querySelector("[data-list-count]");
const tasksContainer = document.querySelector("[data-tasks]");
const taskTemplate = document.getElementById("task-template");
const newTaskForm = document.querySelector("[data-new-task-form]");
const newTaskInput = document.querySelector("[data-new-task-input]");
const clearCompleteTasksBtn = document.querySelector(
  "[data-clear-complete-tasks-button]"
);
const noListsMessage = document.getElementById("no-lists-message");
const noTasksMessage = document.getElementById("no-tasks-message");

const LOCAL_STORAGE_LIST_KEY = "task.lists";
const LOCAL_STORAGE_LIST_SELECTED_ID_KEY = "task.selectedListId";

let selectedListId = localStorage.getItem(LOCAL_STORAGE_LIST_SELECTED_ID_KEY);
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];

deleteListBtn.addEventListener("click", (e) => {
  lists = lists.filter((list) => list.id !== selectedListId);
  selectedListId = null;
  saveAndRender();
});

listsContainer.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "li") {
    selectedListId = e.target.dataset.listId;

    saveAndRender();
  }
});

tasksContainer.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "input") {
    const selectedList = lists.find((list) => list.id === selectedListId);
    const selectedTask = selectedList.tasks.find(
      (task) => task.id === e.target.id
    );
    selectedTask.complete = e.target.checked;
    save();
    renderTaskCount(selectedList);
  }
});

newListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const listName = newListInput.value;
  if (listName === null || listName === "") return;
  const list = createList(listName);
  lists.push(list);
  selectedListId = list.id;
  newListInput.value = null;
  saveAndRender();
});

newTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskName = newTaskInput.value;
  if (taskName === null || taskName === "") return;
  const task = createTask(taskName);
  task._justCreated = true;
  newTaskInput.value = null;
  const selectedList = lists.find((list) => list.id === selectedListId);

  selectedList.tasks.push(task);
  saveAndRender();
});

clearCompleteTasksBtn.addEventListener("click", (e) => {
  const selectedList = lists.find((list) => list.id === selectedListId);
  selectedList.tasks = selectedList.tasks.filter((task) => !task.complete);
  saveAndRender();
});

function createList(name) {
  return {
    id: Date.now().toString(),
    name: name,
    tasks: [],
    hasAnimated: false,
  };
}

function createTask(name) {
  return {
    id: Date.now().toString(),
    name: name,
    complete: false,
  };
}

function render() {
  clearElement(listsContainer);

  let selectedList = lists.find((list) => list.id == selectedListId);
  // noListsMessage.style.display = lists.length === 0 ? "block" : "none";

  if (lists.length === 0) {
    noListsMessage.classList.add("visible");
  } else {
    noListsMessage.classList.remove("visible");
  }

  renderLists();

  if (!selectedList && lists.length === 0) {
    listDisplayContainer.style.display = "none";
  } else if (!selectedList && lists.length > 0) {
    selectedList = lists[0];
    selectedListId = lists[0].id;
    listDisplayContainer.style.display = "";
    listTitleElement.innerText = selectedList.name;
    renderTaskCount(selectedList);
    clearElement(tasksContainer);
    renderTasks(selectedList);
  } else {
    listDisplayContainer.style.display = "";
    listTitleElement.innerText = selectedList.name;
    renderTaskCount(selectedList);
    clearElement(tasksContainer);
    renderTasks(selectedList);
  }
}

function renderTasks(selectedList) {
  noTasksMessage.style.display =
    selectedList.tasks.length === 0 ? "block" : "none";
  selectedList.tasks.forEach((task) => {
    const taskElement = document.importNode(taskTemplate.content, true);
    const taskDiv = taskElement.querySelector(".task");
    const checkbox = taskElement.querySelector("input");
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    const label = taskElement.querySelector("label");
    label.htmlFor = task.id;
    label.append(task.name);

    if (task._justCreated) {
      const taskDiv = taskElement.querySelector(".task");
      taskDiv.classList.add("fade-in-up");

      delete task._justCreated; // removing the flag after using it
    }

    tasksContainer.appendChild(taskElement);
  });
}

function renderTaskCount(selectedList) {
  const incompleteTaskCount = selectedList.tasks.filter(
    (task) => !task.complete
  ).length;

  const taskString = incompleteTaskCount === 1 ? "task" : "tasks";
  listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`;
}

function renderLists() {
  lists.forEach((list) => {
    const listElement = document.createElement("li");
    listElement.classList.add("list-name");

    if (!list.hasAnimated) {
      listElement.classList.add("fade-in-up");
      list.hasAnimated = true;
    }
    listElement.innerText = list.name;
    listElement.dataset.listId = list.id;
    if (list.id === selectedListId) {
      listElement.classList.add("active-list");
    }
    listsContainer.appendChild(listElement);
  });
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function saveAndRender() {
  save();
  render();
}

function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
  localStorage.setItem(LOCAL_STORAGE_LIST_SELECTED_ID_KEY, selectedListId);
}

document.addEventListener("DOMContentLoaded", () => {
  render();
});

// render();
