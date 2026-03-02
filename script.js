const input = document.getElementById("country-input");
const button = document.getElementById("search-btn");
const spinner = document.getElementById("loading-spinner");
const countryInfo = document.getElementById("country-info");
const borderingCountries = document.getElementById("bordering-countries");
const errorMessage = document.getElementById("error-message");

// Required: Use async/await OR .then() for API calls
// Required: Use try/catch OR .catch() for error handling
async function searchCountry(countryName) {
    try {
        // Clear previous content + hide previous error
        countryInfo.innerHTML = "";
        borderingCountries.innerHTML = "";
        errorMessage.textContent = "";
        errorMessage.classList.add("hidden");

        // Show loading spinner
        spinner.classList.remove("hidden");

        // Fetch country data (encode to handle spaces like "South Africa")
        const response = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
        );

        // Error for not a valid country
        if (!response.ok) {
            throw new Error("Country not found. Please try another name.");
        }

        const data = await response.json();
        const country = data[0];

        // Update DOM
        countryInfo.innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <img src="${country.flags.svg}" alt="${country.name.common} flag" width="150">
        `;

        // Fetch bordering countries (if any)
        if (!country.borders || country.borders.length === 0) {
            borderingCountries.innerHTML = "<p>No bordering countries</p>";
            return; // stop here (nothing else to fetch)
        }

        // Update bordering countries section
        for (const code of country.borders) {
            const borderResponse = await fetch(
                `https://restcountries.com/v3.1/alpha/${code}`
            );

            if (!borderResponse.ok) {
                continue; // skip this neighbor if something weird happens
            }

            const borderData = await borderResponse.json();
            const borderCountry = borderData[0];

            borderingCountries.innerHTML += `
    <article>
        <h3>${borderCountry.name.common}</h3>
        <img src="${borderCountry.flags.svg}" 
             alt="Flag of ${borderCountry.name.common}" 
             width="80">
    </article>
`;
        }
    } catch (error) {
        // Show error message (use the real error message)
        errorMessage.textContent = error.message;
        errorMessage.classList.remove("hidden");
    } finally {
        // Hide loading spinner
        spinner.classList.add("hidden");
    }
}

// Event listeners

// Click the search button
button.addEventListener("click", () => {
    const country = input.value.trim();
    if (country) {
        searchCountry(country);
    }
});

// Press Enter in the input
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        button.click();
    }
});