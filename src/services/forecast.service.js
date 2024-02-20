const weatherMap = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Fog',
    51: 'Drizzle',
    53: 'Drizzle',
    55: 'Drizzle',
    56: 'Freezing Drizzle',
    57: 'Freezing Drizzle',
    61: 'Rain',
    63: 'Rain',
    65: 'Rain',
    66: 'Freezing Rain',
    67: 'Freezing Rain',
    71: 'Snow fall',
    73: 'Snow fall',
    75: 'Snow fall',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Rain showers',
    85: 'Snow showers',
    86: 'Snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm',
    99: 'Thunderstorm',
};

function weatherCondition(code) {
    if (weatherMap.hasOwnProperty(code)) {
        return weatherMap[code];
    } else {
        return 'Unknown weather code';
    }
}

function isDateWithinDays(inputDate, n) {
    let dif = new Date(inputDate).getDate() - new Date().getDate();
    return dif < n && dif >= 0;
}

function parseResponse(response, date) {
    // console.log(response);
    let latitude = response.latitude;
    let longitude = response.longitude;
    let tUnit = response.daily_units.temperature_2m_max;
    let precUnit = response.daily_units.precipitation_probability_max;
    let pos = response.daily.time.indexOf(date);

    let weather = weatherCondition(response.daily.weather_code[pos]);
    let maxTemp = response.daily.temperature_2m_max[pos];
    let minTemp = response.daily.temperature_2m_min[pos];
    let precipitationProb = response.daily.precipitation_probability_max[pos];

    return {
        lat: latitude,
        lon: longitude,
        units: {
            temperature: tUnit,
            probability: precUnit,
        },
        weather: weather,
        max_temperature: maxTemp,
        min_temperature: minTemp,
        precipitation_probability: precipitationProb,
    };
}

async function getWeather(params) {
    if (
        !isDateWithinDays(params.date, 16) ||
        !params.date ||
        !params.lat ||
        !params.lon
    ) {
        return;
    }
    // if forecast aviable
    const lat = params.lat;
    const lon = params.lon;
    try {
        const url =
            process.env.FORECAST_URL +
            '?latitude=' +
            lat +
            '&longitude=' +
            lon +
            '&daily=' +
            'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=16';
        console.log(url);
        const response = await fetch(url);
        const data = parseResponse(await response.json(), params.date);
        return data;
    } catch (error) {
        throw error;
    }
}

getWeather({ date: '2024-01-26', lat: 46.1228, lon: 12.2051 }).then(
    (result) => {
        console.log(result);
    }
);
