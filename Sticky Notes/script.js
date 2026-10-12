let parentContainer = document.getElementById("parent-container");
let displaySection = document.getElementById("display-section");
let inputSection = document.getElementById("input-section");
let addButton = document.getElementById("add-button");

if (displaySection.children.length === 0) {
  displaySection.style.padding = '0px';
}

let stickies = [];
let counter = 0;

const handleDelete = (e) => {
  let parentId = e.target.parentElement.id;
  console.log(parentId);

	let idx = stickies.findIndex(sticky => sticky.id === parentId);

	if (idx !== -1) {
		stickies.splice(idx, 1);
	}

  handleStickiesDisplay();
};

const handleStickiesDisplay = () => {
	displaySection.innerHTML = "";
  stickies.forEach((sticky) => {
		displaySection.append(sticky);
  });
};

handleStickiesDisplay();

const addSticky = () => {
  if (inputSection.value.trim() === "") return;

	let sticky = document.createElement("p");
  sticky.id = counter;
  counter++;
  sticky.classList.add("sticky");
  sticky.innerText = inputSection.value.trim();
  inputSection.value = "".trim();

  if (stickies.length === 0) {
    sticky.style.backgroundColor = "#d1e1ff";
  } else {
    sticky.style.backgroundColor =
      stickies[stickies.length - 1].style.backgroundColor ===
      "rgb(209, 225, 255)"
        ? "#fefffe"
        : "#d1e1ff";
	}
	
	let deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.innerText = "X";
  sticky.append(deleteButton);

  deleteButton.addEventListener("click", (e) => handleDelete(e));

  stickies.push(sticky);
  console.log(stickies);
}

inputSection.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
		addSticky();
    handleStickiesDisplay();
  }
});

addButton.addEventListener("click", () => {
	addSticky();
  handleStickiesDisplay();
});
