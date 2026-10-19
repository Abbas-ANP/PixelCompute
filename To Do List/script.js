let taskInputSection = document.getElementById("task-input-section");
let taskTimeSection = document.getElementById("task-time-section");
let taskAddButton = document.getElementById("task-add-button");
let dialog = document.getElementById("dialog");
let dialogMsg = document.getElementById("dialog-message");
let dialogClose = document.getElementById("dialog-close-button");
let dialogOK = document.getElementById("dialog-ok-button");
let tasksSection = document.getElementById("tasks-container");
let dueTasksSection = document.getElementById("due-tasks-section");
let upcomingTasksSection = document.getElementById("upcoming-tasks-section");
let editDialog = document.getElementById("edit-dialog");
let editInputSection = document.getElementById("edit-input-section");
let editTimeSection = document.getElementById("edit-time-section");
let editUpdateButton = document.getElementById("edit-update-button");
let editCloseButton = document.getElementById("edit-close-button");
let taskSearchSection = document.getElementById("task-search-section");
let searchResultsDialog = document.getElementById("search-results-dialog");
let searchResultsDialogCloseButton = document.getElementById(
  "search-results-dialog-close-button",
);
let searchResultsList = document.getElementById("search-results-list");
let isClosingSearch = false;

let tasks;
let dueTasks, upcomingTasks;

const initialize = () => {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  dueTasks = [];
  upcomingTasks = [];
  handleTasks();
};

const updateMinDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  taskTimeSection.min = now.toISOString().slice(0, 16);
};

updateMinDateTime();

taskTimeSection.addEventListener("focus", updateMinDateTime);
taskTimeSection.addEventListener("click", updateMinDateTime);

const isValidFutureDateTime = (value) => {
  if (!value) return false;
  const selectedDateTime = new Date(value);

  return selectedDateTime.getTime() > Date.now();
};

const displayTasks = (tasksArr, tasksSection) => {
  const now = new Date();
  const todayString = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

  tasksArr.sort((t1, t2) => {
    const t1Date = t1.date.split("/");
    const t2Date = t2.date.split("/");

    if (t1Date[2] - t2Date[2] !== 0) {
      return t1Date[2] - t2Date[2];
    }

    if (t1Date[1] - t2Date[1] !== 0) {
      return t1Date[1] - t2Date[1];
    }

    if (t1Date[0] - t2Date[0] !== 0) {
      return t1Date[0] - t2Date[0];
    }

    const t1Time = t1.time.split(/:| /);
    const t2Time = t2.time.split(/:| /);

    let t1Hours = Number(t1Time[0]);
    let t2Hours = Number(t2Time[0]);

    const t1Minutes = Number(t1Time[1]);
    const t2Minutes = Number(t2Time[1]);

    const t1Period = t1Time[2];
    const t2Period = t2Time[2];

    if (t1Period === "pm" && t1Hours !== 12) t1Hours += 12;
    if (t1Period === "am" && t1Hours === 12) t1Hours = 0;

    if (t2Period === "pm" && t2Hours !== 12) t2Hours += 12;
    if (t2Period === "am" && t2Hours === 12) t2Hours = 0;

    if (t1Hours !== t2Hours) {
      return t1Hours - t2Hours;
    }

    return t1Minutes - t2Minutes;
  });

  tasksArr.forEach((task) => {
    const { id, date, taskName, time } = task;

    let newTask = document.createElement("div");
    newTask.classList.add("task-card");
    newTask.id = id;

    let newTaskDate = document.createElement("h3");
    newTaskDate.classList.add("task-date");
    newTaskDate.innerText = date === todayString ? "Today" : date;
    newTask.append(newTaskDate);

    let newTaskDetails = document.createElement("div");
    newTaskDetails.classList.add("task-details");
    newTaskDetails.innerHTML = `
      <p>${taskName} at <span class="task-time">${time}</span></p>
      <button class="task-edit-button">Edit</button>
      <button class="task-delete-button">Delete</button>
    `;
    newTask.append(newTaskDetails);

    tasksSection.append(newTask);
  });
};

const handleTasks = () => {
  dueTasks.length = 0;
  upcomingTasks.length = 0;

  if (tasks.length !== 0) {
    dueTasksSection.innerHTML = `
    <div id="due-tasks-section">
      <h3 class="tasks-section-header">Due Tasks</h3>
    </div>
  `;

    upcomingTasksSection.innerHTML = `
    <div id="upcoming-tasks-section">
      <h3 class="tasks-section-header">Upcoming Tasks</h3>
    </div>
  `;
  }

  tasks.forEach((task) => {
    const { date } = task;
    const [selectedDate, selectedMonth, selectedYear] = date.split("/");

    const currTime = new Date();
    const currDate = currTime.getDate();
    const currMonth = currTime.getMonth() + 1;
    const currYear = currTime.getFullYear();

    if (
      selectedDate == currDate &&
      selectedMonth == currMonth &&
      selectedYear == currYear
    ) {
      dueTasks.push(task);
    } else {
      upcomingTasks.push(task);
    }
  });

  displayTasks(dueTasks, dueTasksSection);
  displayTasks(upcomingTasks, upcomingTasksSection);
};

const handleTaskSubmission = () => {
  const taskName = taskInputSection.value.trim();
  const taskTime = taskTimeSection.value;

  if (!taskName || !taskTime) {
    dialogMsg.innerText = "Please fill in all fields";
    dialog.showModal();
    return;
  }

  updateMinDateTime();

  if (!isValidFutureDateTime(taskTime)) {
    dialogMsg.innerText = "Please select a future date and time";
    dialog.showModal();
    return;
  }

  const selectedTime = new Date(taskTime);

  const date = `${selectedTime.getDate()}/${selectedTime.getMonth() + 1}/${selectedTime.getFullYear()}`;
  const hours = selectedTime.getHours();
  const minutes = String(selectedTime.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  const time = `${displayHours}:${minutes} ${suffix}`;
  const id = crypto.randomUUID();

  if (
    tasks.some(
      (task) =>
        date === task.date && taskName === task.taskName && time === task.time,
    )
  ) {
    dialogMsg.innerText = "Task already exists";
    dialog.showModal();
    return;
  }

  tasks.push({
    id,
    date,
    taskName,
    time,
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));

  taskInputSection.value = "";
  taskTimeSection.value = "";

  handleTasks();
};

const handleTaskEdit = (task) => {
  const updateEditMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    editTimeSection.min = now.toISOString().slice(0, 16);
  };

  updateEditMinDateTime();
  editDialog.showModal();

  const currTask = tasks.find(({ id }) => id === task.id);
  const oldDate = currTask.date;
  const oldTask = task
    .querySelector(".task-details p")
    .innerText.split(" at")[0];
  const oldTime = task.querySelector(".task-time").innerText;

  editInputSection.value = oldTask;

  const [day, month, year] = oldDate.split("/");
  let [hours, minutes] = oldTime.split(/:| /).filter(Boolean);

  hours = parseInt(hours);
  minutes = parseInt(minutes);

  const isPM = oldTime.toLowerCase().includes("pm");

  if (isPM && hours !== 12) {
    hours += 12;
  } else if (!isPM && hours === 12) {
    hours = 0;
  }

  const formattedDateTime =
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T` +
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  editTimeSection.value = formattedDateTime;

  editUpdateButton.onclick = () => {
    const taskId = task.id;
    let currTask = tasks.find(({ id }) => id === taskId);

    const newTaskName = editInputSection.value.trim();
    const newTaskTime = editTimeSection.value;

    if (!newTaskName || !newTaskTime) {
      dialogMsg.innerText = "Please fill in all fields";
      dialog.showModal();
      return;
    }

    updateEditMinDateTime();

    if (!isValidFutureDateTime(newTaskTime)) {
      dialogMsg.innerText = "Please select a future date and time";
      dialog.showModal();
      return;
    }

    const selectedTime = new Date(newTaskTime);
    const newDate = `${selectedTime.getDate()}/${selectedTime.getMonth() + 1}/${selectedTime.getFullYear()}`;
    const hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes();
    const suffix = hours >= 12 ? "pm" : "am";
    const displayHours = hours % 12 || 12;
    const formattedMinutes = String(minutes).padStart(2, "0");
    const newTime = `${displayHours}:${formattedMinutes} ${suffix}`;

    currTask.date = newDate;
    currTask.taskName = newTaskName;
    currTask.time = newTime;

    localStorage.setItem("tasks", JSON.stringify(tasks));

    editInputSection.value = "";
    editTimeSection.value = "";

    handleTasks();
    editDialog.close();
  };
};

const handleTaskDelete = (task) => {
  const { id } = task;
  tasks = tasks.filter((currTask) => currTask.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  handleTasks();
};

const displaySearchTasks = (tasksToBeShown) => {
  searchResultsList.innerHTML = "";
  searchResultsList.classList.remove("no-tasks");

  if (tasksToBeShown.length === 0) {
    searchResultsList.classList.add("no-tasks");
    searchResultsList.innerHTML = `
    <h1>No such task exists...</h1>
    `;
    return;
  }

  tasksToBeShown.forEach((task) => {
    const { date, taskName, time } = task;

    let displayResult = document.createElement("p");
    displayResult.innerText = `${taskName} at ${time} on ${date}`;

    displayResult.classList.add("display-card");
    searchResultsList.append(displayResult);
  });
};

const handleSearch = () => {
  const input = taskSearchSection.value.trim().toLowerCase();
  const matched = tasks.filter((task) =>
    task.taskName.toLowerCase().includes(input),
  );

  displaySearchTasks(matched);
};

taskAddButton.addEventListener("click", handleTaskSubmission);
dialogOK.onclick = () => dialog.close();
dialogClose.onclick = () => dialog.close();
editCloseButton.onclick = () => editDialog.close();

tasksSection.addEventListener("click", (e) => {
  if (e.target.classList.contains("task-edit-button")) {
    handleTaskEdit(e.target.parentElement.parentElement);
  }

  if (e.target.classList.contains("task-delete-button")) {
    handleTaskDelete(e.target.parentElement.parentElement);
  }
});

taskSearchSection.addEventListener("focus", () => {
  if (isClosingSearch) return;
  if (!searchResultsDialog.open) {
    searchResultsDialog.show();
    handleSearch();
  }
});

taskSearchSection.addEventListener("input", handleSearch);

searchResultsDialogCloseButton.addEventListener("click", () => {
  isClosingSearch = true;
  taskSearchSection.value = "";
  searchResultsList.innerHTML = "";

  searchResultsDialog.close();
  taskSearchSection.blur();

  setTimeout(() => {
    isClosingSearch = false;
  }, 100);
});

localStorage.clear();
document.addEventListener("DOMContentLoaded", initialize);
