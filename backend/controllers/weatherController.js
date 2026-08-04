// Live Weather & Agricultural Forecast Controller

export const getWeather = async (req, res) => {
  const { city, lat, lng } = req.query;
  const locationName = city || 'Erode, Tamil Nadu';

  const weatherData = {
    location: locationName,
    current: {
      temperature: 31,
      condition: "Partly Cloudy",
      humidity: "68%",
      windSpeed: "14 km/h",
      rainfallProbability: "20%",
      uvIndex: 7
    },
    forecast: [
      { day: "Today", temp: "31°C / 23°C", condition: "Partly Cloudy", rain: "20%", advice: "Suitable for harvesting and drying produce." },
      { day: "Tomorrow", temp: "32°C / 24°C", condition: "Sunny", rain: "10%", advice: "Ideal day for pesticide & fertilizer application." },
      { day: "Day 3", temp: "29°C / 22°C", condition: "Light Rain", rain: "65%", advice: "Ensure field drainage channels are clear." },
      { day: "Day 4", temp: "28°C / 21°C", condition: "Moderate Rain", rain: "80%", advice: "Avoid spraying chemicals; cover harvested crops." },
      { day: "Day 5", temp: "30°C / 23°C", condition: "Cloudy", rain: "35%", advice: "Inspect crops for post-rain pest surges." },
      { day: "Day 6", temp: "33°C / 24°C", condition: "Clear Sky", rain: "0%", advice: "Resume regular irrigation schedules." },
      { day: "Day 7", temp: "34°C / 25°C", condition: "Sunny", rain: "5%", advice: "Good soil aeration condition for sowing." }
    ],
    agriculturalAdvisory: "Light to moderate rain expected on Day 3 & Day 4. Complete any pesticide application within 24 hours to prevent runoff."
  };

  res.status(200).json(weatherData);
};
