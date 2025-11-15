let currentTempCelsius = null;

// Fetch weather by city
async function getWeather() {
    const city = document.getElementById("city").value;
    if (!city.trim()) return showError("Enter a city name");

    fetchWeather(`q=${city}`);
}

// GPS Weather
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
            () => showError("Enable location access!")
        );
    }
}

// Main fetch function
async function fetchWeather(query) {
    const apiKey = "da5cc509bc967933cf9f957a7a06eb9b";
    const loader = document.getElementById("loader");
    loader.style.display = "block";

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`
        );

        const data = await res.json();
        if (data.cod === "404") return showError("City not found");

        updateCurrentWeather(data);
        changeBackground(data.weather[0].main.toLowerCase());
        fetchForecast(query);

    } catch (err) {
        showError("Unable to fetch data");
    }

    loader.style.display = "none";
}

// Fetch forecast
async function fetchForecast(query) {
    const apiKey = "da5cc509bc967933cf9f957a7a06eb9b";
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${apiKey}&units=metric`
    );

    const data = await res.json();
    const items = document.querySelectorAll(".day");

    items.forEach((day, i) => {
        const index = i * 8;
        if (data.list[index]) {
            const f = data.list[index];
            day.querySelector(".weekday").textContent =
                new Date(f.dt_txt).toLocaleDateString("en-US", { weekday: "long" });

            day.querySelector(".icon").innerHTML =
                `<img src="https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png">`;

            day.querySelector(".temp").textContent =
                `${Math.round(f.main.temp)}°C`;
        }
    });
}

// Update current weather
function updateCurrentWeather(data) {
    currentTempCelsius = data.main.temp;

    document.getElementById("cityName").textContent = data.name;
    document.getElementById("temperature").textContent = `${data.main.temp}°C`;
    document.getElementById("description").textContent = data.weather[0].description;

    document.querySelector(".current-weather .icon").innerHTML =
        `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">`;
}

// Toggle Celsius ↔ Fahrenheit
document.getElementById("tempToggle").addEventListener("change", function () {
    const tempEl = document.getElementById("temperature");

    if (this.checked) {
        const f = (currentTempCelsius * 9/5) + 32;
        tempEl.textContent = `${f.toFixed(1)}°F`;
    } else {
        tempEl.textContent = `${currentTempCelsius}°C`;
    }
});

// Error
function showError(msg) {
    const e = document.getElementById("error");
    e.textContent = msg;
    e.style.display = "block";
    setTimeout(() => e.style.display = "none", 2500);
}

// Background
function changeBackground(condition) {
    document.body.className = "";

    if (["clear", "clouds", "rain", "snow"].includes(condition)) {
        document.body.classList.add(condition);
    } else {
        document.body.classList.add("default");
    }
}
