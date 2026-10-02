const weatherForm=document.querySelector("#weather-form");
const cityInput=document.querySelector("#city-input");
const weatherStatus=document.querySelector("#weather-status");
const weatherResult=document.querySelector("#weather-result");

function setWeatherStatus(message,type=""){
    weatherStatus.textContent=message;
    weatherStatus.className=`weather-status ${type}`.trim();
}

function weatherCodeLabel(code){
    const labels={
        0:["☀️","Clear sky"],1:["🌤️","Mainly clear"],2:["⛅","Partly cloudy"],3:["☁️","Overcast"],
        45:["🌫️","Fog"],48:["🌫️","Depositing rime fog"],51:["🌦️","Light drizzle"],
        53:["🌦️","Moderate drizzle"],55:["🌧️","Dense drizzle"],61:["🌦️","Slight rain"],
        63:["🌧️","Moderate rain"],65:["🌧️","Heavy rain"],71:["🌨️","Slight snow"],
        73:["🌨️","Moderate snow"],75:["❄️","Heavy snow"],80:["🌦️","Slight rain showers"],
        81:["🌧️","Moderate rain showers"],82:["⛈️","Violent rain showers"],95:["⛈️","Thunderstorm"],
        96:["⛈️","Thunderstorm with slight hail"],99:["⛈️","Thunderstorm with heavy hail"]
    };
    return labels[code]||["🌡️","Weather conditions unavailable"];
}

function renderWeather(location,data){
    const current=data.current;
    const [icon,description]=weatherCodeLabel(current.weather_code);
    weatherResult.innerHTML=`
        <div class="weather-location">
            <div><h2>${location.name}, ${location.country}</h2><p>${location.admin1||"Current conditions"}</p></div>
            <p>Updated: ${new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</p>
        </div>
        <div class="weather-grid">
            <article class="card weather-metric"><span class="weather-icon" aria-hidden="true">${icon}</span><strong>${current.temperature_2m}°C</strong><span>Temperature</span></article>
            <article class="card weather-metric"><span class="weather-icon" aria-hidden="true">💧</span><strong>${current.relative_humidity_2m}%</strong><span>Humidity</span></article>
            <article class="card weather-metric"><span class="weather-icon" aria-hidden="true">💨</span><strong>${current.wind_speed_10m} km/h</strong><span>Wind speed</span></article>
        </div>
        <div class="weather-details">
            <article class="card weather-detail"><strong>Conditions</strong><span>${description}</span></article>
            <article class="card weather-detail"><strong>Coordinates</strong><span>${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}</span></article>
        </div>`;
}

async function fetchWeather(city){
    setWeatherStatus("Searching for the city...","weather-loading");
    weatherResult.innerHTML="";
    try{
        const geoResponse=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        if(!geoResponse.ok) throw new Error(`City search failed (${geoResponse.status})`);
        const geoData=await geoResponse.json();
        if(!geoData.results||geoData.results.length===0) throw new Error("City not found. Try another city name.");
        const location=geoData.results[0];

        setWeatherStatus("Fetching live weather data...","weather-loading");
        const weatherResponse=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
        if(!weatherResponse.ok) throw new Error(`Weather request failed (${weatherResponse.status})`);
        const weatherData=await weatherResponse.json();
        if(!weatherData.current) throw new Error("The weather service returned incomplete data.");

        renderWeather(location,weatherData);
        setWeatherStatus("Live weather loaded successfully.","success");
    }catch(error){
        weatherResult.innerHTML="";
        setWeatherStatus(error.message||"Unable to load weather data. Please try again.","error");
    }
}

weatherForm.addEventListener("submit",async event=>{
    event.preventDefault();
    const city=cityInput.value.trim();
    if(!city){
        setWeatherStatus("Please enter a city name.","error");
        cityInput.focus();
        return;
    }
    await fetchWeather(city);
});

fetchWeather("Chennai");
