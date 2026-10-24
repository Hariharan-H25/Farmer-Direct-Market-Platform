import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API = axios.create({ baseURL: '/api' });

const WeatherIcon = ({ condition }) => {
  const icons = {
    'Sunny': '☀️', 'Clear Sky': '☀️', 'Partly Cloudy': '⛅', 'Cloudy': '☁️',
    'Light Rain': '🌦️', 'Moderate Rain': '🌧️', 'Heavy Rain': '🌧️', 'default': '🌡️'
  };
  return <span className="text-2xl">{icons[condition] || icons['default']}</span>;
};

const WeatherWidget = ({ compact = false }) => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city] = useState('Erode, Tamil Nadu');

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/weather?city=${encodeURIComponent(city)}`);
        setWeather(data);
      } catch {
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [city]);

  if (loading) return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 animate-pulse">
      <div className="h-4 bg-white/20 rounded w-32 mb-3" />
      <div className="h-8 bg-white/20 rounded w-20" />
    </div>
  );

  if (!weather) return null;

  if (compact) return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2 text-white">
      <WeatherIcon condition={weather.current.condition} />
      <div>
        <div className="text-sm font-bold">{weather.current.temperature}°C</div>
        <div className="text-xs text-gray-300">{weather.location.split(',')[0]}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-900/60 to-emerald-900/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white shadow-2xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold">{t('weather')}</h2>
          <p className="text-blue-300 text-sm mt-0.5">{weather.location}</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black">{weather.current.temperature}°C</div>
          <div className="text-blue-200 text-sm">{weather.current.condition}</div>
        </div>
      </div>

      {/* Current stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: t('humidity'), val: weather.current.humidity, icon: '💧' },
          { label: t('windSpeed'), val: weather.current.windSpeed, icon: '💨' },
          { label: 'UV Index', val: weather.current.uvIndex, icon: '☀️' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="text-sm font-bold">{stat.val}</div>
            <div className="text-xs text-blue-300">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 7-day forecast */}
      <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-3">{t('forecast')}</h3>
      <div className="grid grid-cols-7 gap-1">
        {weather.forecast.map((day, i) => (
          <div key={i} className="bg-white/10 rounded-xl p-2 text-center hover:bg-white/20 transition-colors">
            <div className="text-xs text-blue-300 mb-1 truncate">{day.day}</div>
            <WeatherIcon condition={day.condition} />
            <div className="text-xs font-bold mt-1 leading-tight">{day.temp.split('/')[0]}</div>
            <div className="text-xs text-blue-400">{day.rain}</div>
          </div>
        ))}
      </div>

      {/* Farming advisory */}
      <div className="mt-4 bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <span className="text-lg">🌾</span>
          <div>
            <div className="text-xs font-bold text-emerald-300 mb-1">{t('farmingAdvice')}</div>
            <p className="text-xs text-gray-300 leading-relaxed">{weather.agriculturalAdvisory}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
