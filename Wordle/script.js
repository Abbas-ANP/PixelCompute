import { words } from "./words.js";

let inputSection = document.getElementById("input-section");
let submitBtn = document.getElementById("submit-button");
let blocks = document.getElementsByClassName("wordle-block");
let displaySection = document.getElementById("display-result-section");

let guessedWords = [];

const getRandomWord = () => {
  const min = 0,
    max = 599;
  const randomIdx = Math.floor(Math.random() * (max - min + 1)) + min;
  return words[randomIdx];
};

const start = () => {
  return getRandomWord();
};

let target = start();

const reset = () => {
  displaySection.innerHTML = "<br>";
  guessedWords = [];

  Array.from(blocks).forEach((block) => {
    block.innerText = "".trim();
    block.classList.remove("correct-word", "misplaced-word", "wrong-word");
  });

  target = start();
};

const displayBlock = () => {
  let word = guessedWords[guessedWords.length - 1];
  let start = (guessedWords.length - 1) * 5;
  let idx = 0;

  for (let i = start; i < start + 5; i++) {
    blocks[i].innerText = word[idx];
    if (word[idx] === target[idx]) {
      blocks[i].classList.add("correct-word");
    } else if (target.includes(word[idx])) {
      blocks[i].classList.add("misplaced-word");
    } else {
      blocks[i].classList.add("wrong-word");
    }

    idx++;
  }

  if (word === target || guessedWords.length === 6) {
    displaySection.innerText = word === target ? "Congratulations! You guessed the word!" : `Game over, the correct word was "${target}"`;
    inputSection.disabled = true;
    inputSection.style.cursor = "not-allowed";

    setTimeout(() => {
      inputSection.disabled = false;
      inputSection.style.cursor = "default";
      reset();
    }, 3000);
  }
};

const handleSubmit = () => {
  let word = inputSection.value.trim().toLowerCase();
  inputSection.value = "".trim();

  if (word.length !== 5) {
    displaySection.innerText = "The word must be of length 5!";
    
    setTimeout(() => {
      displaySection.innerHTML = "<br>";
    }, 3000);

    return;
  }

  guessedWords.push(word);
  displayBlock();
};

inputSection.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSubmit();
  }
});

submitBtn.addEventListener("click", handleSubmit);
