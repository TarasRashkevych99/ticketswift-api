const weatherMap = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog and depositing rime fog',
    48: 'Fog and depositing rime fog',
    51: 'Drizzle: Light intensity',
    53: 'Drizzle: Moderate intensity',
    55: 'Drizzle: Dense intensity',
    56: 'Freezing Drizzle: Light intensity',
    57: 'Freezing Drizzle: Dense intensity',
    61: 'Rain: Slight intensity',
    63: 'Rain: Moderate intensity',
    65: 'Rain: Heavy intensity',
    66: 'Freezing Rain: Light intensity',
    67: 'Freezing Rain: Heavy intensity',
    71: 'Snow fall: Slight intensity',
    73: 'Snow fall: Moderate intensity',
    75: 'Snow fall: Heavy intensity',
    77: 'Snow grains',
    80: 'Rain showers: Slight intensity',
    81: 'Rain showers: Moderate intensity',
    82: 'Rain showers: Violent intensity',
    85: 'Snow showers: Slight intensity',
    86: 'Snow showers: Heavy intensity',
    95: 'Thunderstorm: Slight intensity',
    96: 'Thunderstorm with hail: Slight intensity',
    99: 'Thunderstorm with hail: Heavy intensity'
};


function weatherCondition(code){
    if (weatherMap.hasOwnProperty(code)) {
        return weatherMap[code];
      } else {
        return 'Unknown weather code';
      }
}

function isDateWithin16Days(inputDate) {
    let dif = Math.ceil((new Date(inputDate) - new Date()) / (1000 * 3600 * 24));
    return dif < 16 && dif >= 0;
}

function parseResponse(response, date){
    // console.log(response);
    let latitude = response.latitude;
    let longitude = response.longitude;
    let tUnit =  response.daily_units.temperature_2m_max;
    let precUnit = response.daily_units.precipitation_probability_max;
    let pos = (response.daily.time).indexOf(date);

    let weather = weatherCondition(response.daily.weather_code[pos]);
    let maxTemp = response.daily.temperature_2m_max[pos];
    let minTemp = response.daily.temperature_2m_min[pos];
    let precipitationProb = response.daily.precipitation_probability_max[pos];

    return {
        "lat": latitude,
        "lon": longitude,
        "units": {
            "temperature": tUnit,
            "probability": precUnit
        },
        "weather": weather,
        "max_temperature": maxTemp,
        "min_temperature": minTemp,
        "precipitation_probability": precipitationProb
    };
}

async function getWeather(params){
    if(!isDateWithin16Days(params.date) || !params.date || !params.lat || !params.lon){
        return;
    }
    //forecast aviable
    const lat = params.lat;
    const lon = params.lon;
    try {
        const url  = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&daily=" +
                    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=16";
        console.log(url);
        const response = await fetch(url);
        const data = parseResponse(await response.json(), params.date);
        return data;
    } catch (error) {
        throw error;
    }
    
}

getWeather({date: '2024-01-27', lat:46.1228, lon:12.2051}).then(result => {
    console.log(result);
});
