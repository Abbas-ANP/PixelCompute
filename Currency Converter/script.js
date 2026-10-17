import { COUNTRIES_API_KEY, EXCHANGE_RATE_API_KEY } from "./keys.js";

const COUNTRIES_URL = "https://api.restcountries.com";
const EXCHANGE_RATE_URL = "https://v6.exchangerate-api.com/v6";
const ERROR_MESSAGES = {
  countries: "Failed to load currencies. Please try again.",
  amount: "Please enter a valid positive amount.",
  currency: "Please select a valid currency.",
  exchangeRate: "Conversion failed. Please try again.",
};
let messageTimer;

let fromCountryDropdown = document.getElementById("from-country");
let toCountryDropdown = document.getElementById("to-country");
let inputSection = document.getElementById("input-section");
let submitButton = document.getElementById("submit-button");
let resultSection = document.getElementById("display-result");
let errorSection = document.getElementById("display-error");
let placeHolderSection = document.getElementById("place-holder");
placeHolderSection.innerHTML = "<br>";

const fetchCountriesData = async () => {
  try {
    const [response1, response2, response3] = await Promise.all([
      fetch(
        `${COUNTRIES_URL}/countries/v5?limit=100&response_fields=currencies.code,currencies.name,flag.emoji`,
        {
          headers: {
            Authorization: `Bearer ${COUNTRIES_API_KEY}`,
          },
        },
      ),
      fetch(
        `${COUNTRIES_URL}/countries/v5?limit=100&offset=100&response_fields=currencies.code,currencies.name,flag.emoji`,
        {
          headers: {
            Authorization: `Bearer ${COUNTRIES_API_KEY}`,
          },
        },
      ),
      fetch(
        `${COUNTRIES_URL}/countries/v5?limit=100&offset=200&response_fields=currencies.code,currencies.name,flag.emoji`,
        {
          headers: {
            Authorization: `Bearer ${COUNTRIES_API_KEY}`,
          },
        },
      ),
    ]);

    if (!response1.ok || !response2.ok || !response3.ok) {
      throw new Error();
    }

    const jsonData1 = await response1.json();
    const jsonData2 = await response2.json();
    const jsonData3 = await response3.json();

    const {
      data: { objects: countries1 },
    } = jsonData1;
    const {
      data: { objects: countries2 },
    } = jsonData2;
    const {
      data: { objects: countries3 },
    } = jsonData3;

    let countries = [...countries1, ...countries2, ...countries3];
    countries = countries
      .filter((country) => country.currencies?.[0]?.code)
      .sort((a, b) => a.currencies[0].code.localeCompare(b.currencies[0].code));

    populateDropdowns(countries);
  } catch (err) {
    displayError(ERROR_MESSAGES.countries);
  }
};

const populateDropdowns = (countries) => {
  countries.forEach(({ flag, currencies }) => {
    const option1 = document.createElement("option");
    option1.innerText = `${flag?.emoji || "🏳️"} ${currencies[0]?.code || "N/A"} - ${currencies[0]?.name || "N/A"}`;
    option1.value = currencies[0]?.code || "N/A";

    const option2 = document.createElement("option");
    option2.innerText = `${flag?.emoji || "🏳️"} ${currencies[0]?.code || "N/A"} - ${currencies[0]?.name || "N/A"}`;
    option2.value = currencies[0]?.code || "N/A";

    fromCountryDropdown.append(option1);
    toCountryDropdown.append(option2);
  });
};

const reset = () => {
  resultSection.innerText = "".trim();
  errorSection.innerText = "".trim();
  inputSection.value = "";
  fromCountryDropdown.selectedIndex = 0;
  toCountryDropdown.selectedIndex = 0;

  placeHolderSection.innerHTML = "<br>";
  toggleSubmitButton();
};

const displayResult = ({ fromCountry, toCountry, amount, result }) => {
  clearTimeout(messageTimer);
  errorSection.innerText = "".trim();
  placeHolderSection.innerHTML = "";
  resultSection.innerText = `${amount} ${fromCountry} = ${result} ${toCountry}`;

  messageTimer = setTimeout(reset, 5000);
};

const displayError = (err) => {
  clearTimeout(messageTimer);
  resultSection.innerText = "".trim();
  placeHolderSection.innerHTML = "";
  errorSection.innerText = err;
  
  messageTimer = setTimeout(reset, 3000);
};

const fetchExchangeRate = async (fromCountry, toCountry, amount) => {
  if (fromCountry === "N/A" || toCountry === "N/A") {
    displayError(ERROR_MESSAGES.currency);
    return;
  }

  try {
    const response = await fetch(
      `${EXCHANGE_RATE_URL}/${EXCHANGE_RATE_API_KEY}/pair/${fromCountry}/${toCountry}/${amount}`,
    );

    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();

    if (data.result !== "success") {
      throw new Error("Conversion failed");
    }

    const { conversion_result: result } = data;

    displayResult({ fromCountry, toCountry, amount, result });
  } catch (err) {
    displayError(ERROR_MESSAGES.exchangeRate);
  }
};

const validateAmount = (amount) => {
  const value = Number(amount);
  return amount.trim() !== "" && Number.isFinite(value) && value > 0;
};

const handleSubmit = () => {
  const amount = inputSection.value.trim();

  if (!validateAmount(amount)) {
    displayError(ERROR_MESSAGES.amount);
    return;
  }

  const fromCountry = fromCountryDropdown.value;
  const toCountry = toCountryDropdown.value;

  fetchExchangeRate(fromCountry, toCountry, amount);
};

submitButton.addEventListener("click", handleSubmit);

const toggleSubmitButton = () => {
  const amount = inputSection.value.trim();
  const fromCountry = fromCountryDropdown.value;
  const toCountry = toCountryDropdown.value;

  const isValid =
    validateAmount(amount) &&
    fromCountry !== "Select" &&
    toCountry !== "Select";

  submitButton.disabled = !isValid;
  submitButton.classList.toggle("disabled", !isValid);
};

inputSection.addEventListener("input", toggleSubmitButton);
fromCountryDropdown.addEventListener("change", toggleSubmitButton);
toCountryDropdown.addEventListener("change", toggleSubmitButton);
document.addEventListener("DOMContentLoaded", fetchCountriesData);
