import { useState, useEffect } from 'react';
import axios from 'axios';
import CurrentWeather from './components/CurrentWeather';
import ForecastWeather from './components/ForecastWeather';
import HourlyForescast from './components/HourlyForescast';

type ForecastItem = {
  date: string;
  temp: number;
  weather: { main: string; description: string; icon: string }[];
};

type HourlyItem = {
  time: string;
  temp: number;
  weather: string;
  icon: string;
};

function App() {
  const [data, setData] = useState({
    name: '',
    main: { temp: 0, feels_like: 0, humidity: 0 },
    weather: [{ main: '' }],
    wind: { speed: 0 }
  });
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [hourly, setHourly] = useState<HourlyItem[]>([]);
  const [location, setLocation] = useState('Panama');

  const buildUrl = (city: string) =>
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=68778de485940178d3cb0f39538d9039`;
  const buildUrl2 = (city: string) =>
    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=68778de485940178d3cb0f39538d9039`;

  const fetchForecast = async (city: string) => {
    try {
      const response2 = await axios.get(buildUrl2(city));
      const tzOffset = response2.data.city?.timezone || 0;
      const items = response2.data.list || [];
      const dailyForecast: ForecastItem[] = [];
      const seenDates = new Set<string>();

      for (const item of items) {
        const date = item.dt_txt?.split(' ')[0];
        if (!date || seenDates.has(date)) {
          continue;
        }
        seenDates.add(date);
        dailyForecast.push({
          date: new Date((item.dt + tzOffset) * 1000).toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          }),
          temp: item.main.temp,
          weather: item.weather
        });
        if (dailyForecast.length >= 5) {
          break;
        }
      }

      const activeDate = items.length > 0 ? new Date((items[0].dt + tzOffset) * 1000).getUTCDate() : null;
      const hourlyForecast: HourlyItem[] = [];

      for (const item of items) {
        if (hourlyForecast.length >= 24) {
          break;
        }
        const itemDate = new Date((item.dt + tzOffset) * 1000).getUTCDate();
        if (activeDate !== null && itemDate !== activeDate) {
          continue;
        }

        hourlyForecast.push({
          time: new Date((item.dt + tzOffset) * 1000).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          temp: item.main.temp,
          weather: item.weather[0]?.main || '',
          icon: item.weather[0]?.icon || ''
        });
      }

      if (hourlyForecast.length === 0) {
        setHourly(items.slice(0, 8).map((item: any) => ({
          time: new Date((item.dt + tzOffset) * 1000).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          temp: item.main.temp,
          weather: item.weather[0]?.main || '',
          icon: item.weather[0]?.icon || ''
        })));
      } else {
        setHourly(hourlyForecast);
      }

      setForecast(dailyForecast);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      setForecast([]);
      setHourly([]);
    }
  };

  const fetchWeatherData = async (city: string) => {
    try {
      const response = await axios.get(buildUrl(city));
      setData(response.data);
      await fetchForecast(city);
    } catch (error) {
      console.error('Error fetching current weather:', error);
    }
  };

  useEffect(() => {
    fetchWeatherData('Panama');
  }, []);

  const searchLocation = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !location.trim()) {
      return;
    }

    await fetchWeatherData(location.trim());
    setLocation('');
  };

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyUp={searchLocation}
          placeholder="Enter Location"
          type="text"
        />
      </div>

      <div className="weather-panels">
        <CurrentWeather data={data} />
        <ForecastWeather forecast={forecast} />
      </div>
      <HourlyForescast hourly={hourly} />
    </div>
  );
}

export default App;
