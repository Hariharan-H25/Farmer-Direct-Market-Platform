import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWeather } from '../api';

const DEFAULT_WEATHER_DATA = {
  location: "Erode, Tamil Nadu",
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

const TAMIL_NADU_DISTRICTS = ['Erode', 'Coimbatore', 'Thanjavur', 'Madurai', 'Salem', 'Dindigul'];

const WeatherIcon = ({ condition }) => {
  const icons = {
    'Sunny': '☀️', 'Clear Sky': '☀️', 'Partly Cloudy': '⛅', 'Cloudy': '☁️',
    'Light Rain': '🌦️', 'Moderate Rain': '🌧️', 'Heavy Rain': '🌧️', 'default': '🌡️'
  };
  return <span className="text-2xl">{icons[condition] || icons['default']}</span>;
};

const WeatherWidget = ({ compact = false }) => {
  const { lang, t } = useLanguage();
  const [weather, setWeather] = useState(DEFAULT_WEATHER_DATA);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('Erode');

  useEffect(() => {
    let isMounted = true;
    fetchWeather(city)
      .then(res => {
        if (isMounted && res?.data) {
          setWeather(res.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setWeather({
            ...DEFAULT_WEATHER_DATA,
            location: `${city}, Tamil Nadu`
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [city]);

  const activeWeather = weather || DEFAULT_WEATHER_DATA;

  if (compact) return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2 text-white">
      <WeatherIcon condition={activeWeather.current.condition} />
      <div>
        <div className="text-sm font-bold">{activeWeather.current.temperature}°C</div>
        <div className="text-xs text-gray-300">{activeWeather.location.split(',')[0]}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-900/60 to-emerald-900/40 backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-6 text-white shadow-2xl transition-all">
      {/* City Selector Bar */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        <span className="text-xs text-blue-200 font-bold shrink-0">📍 {lang === 'ta' ? 'மாவட்டம்:' : 'District:'}</span>
        {TAMIL_NADU_DISTRICTS.map(dist => (
          <button
            key={dist}
            onClick={() => setCity(dist)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              city === dist
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40 font-bold'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {dist}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{t('weather')}</h2>
          <p className="text-blue-300 text-xs sm:text-sm mt-0.5">{activeWeather.location}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl sm:text-5xl font-black">{activeWeather.current.temperature}°C</div>
          <div className="text-blue-200 text-xs sm:text-sm">{activeWeather.current.condition}</div>
        </div>
      </div>

      {/* Current stats */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
        {[
          { label: t('humidity'), val: activeWeather.current.humidity, icon: '💧' },
          { label: t('windSpeed'), val: activeWeather.current.windSpeed, icon: '💨' },
          { label: 'UV Index', val: activeWeather.current.uvIndex, icon: '☀️' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/10 rounded-xl p-2.5 sm:p-3 text-center">
            <div className="text-lg sm:text-xl mb-1">{stat.icon}</div>
            <div className="text-sm sm:text-base font-bold">{stat.val}</div>
            <div className="text-[11px] sm:text-xs text-blue-300">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 7-day forecast */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-bold text-blue-300 uppercase tracking-wider">{t('forecast')}</h3>
        {loading && <span className="text-[11px] text-emerald-400 animate-pulse font-medium">Updating...</span>}
      </div>

      <div className="flex sm:grid sm:grid-cols-7 gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {activeWeather.forecast.map((day, i) => (
          <div key={i} className="bg-white/10 rounded-xl p-2.5 text-center hover:bg-white/20 transition-colors shrink-0 min-w-[76px] sm:min-w-0">
            <div className="text-xs text-blue-300 mb-1 truncate font-medium">{day.day}</div>
            <WeatherIcon condition={day.condition} />
            <div className="text-xs font-bold mt-1 leading-tight">{day.temp.split('/')[0]}</div>
            <div className="text-[10px] text-blue-400 mt-0.5">{day.rain}</div>
          </div>
        ))}
      </div>

      {/* Farming advisory */}
      <div className="mt-4 bg-emerald-900/40 border border-emerald-700/50 rounded-2xl p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="text-xl shrink-0 mt-0.5">🌾</span>
          <div>
            <div className="text-xs font-bold text-emerald-300 mb-1">{t('farmingAdvice')}</div>
            <p className="text-xs text-gray-200 leading-relaxed">{activeWeather.agriculturalAdvisory}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
