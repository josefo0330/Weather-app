import { useCallback, useEffect, useState } from 'react';
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

type CitySuggestion = {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
};

type ForecastApiItem = {
  dt: number;
  dt_txt?: string;
  main: { temp: number };
  weather: { main: string; description: string; icon: string }[];
};

type WeatherTarget = string | Pick<CitySuggestion, 'lat' | 'lon'>;

const API_KEY = '68778de485940178d3cb0f39538d9039';

const buildWeatherParams = (target: WeatherTarget) => {
  if (typeof target === 'string') {
    return `q=${encodeURIComponent(target)}`;
  }

  return `lat=${target.lat}&lon=${target.lon}`;
};

const buildUrl = (target: WeatherTarget) =>
  `https://api.openweathermap.org/data/2.5/weather?${buildWeatherParams(target)}&units=metric&appid=${API_KEY}`;
const buildUrl2 = (target: WeatherTarget) =>
  `https://api.openweathermap.org/data/2.5/forecast?${buildWeatherParams(target)}&units=metric&appid=${API_KEY}`;
const buildGeoUrl = (city: string) =>
  `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`;

function App() {
  const [data, setData] = useState({
    name: '',
    main: { temp: 0, feels_like: 0, humidity: 0 },
    weather: [{ main: '' }],
    wind: { speed: 0 }
  });
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [hourly, setHourly] = useState<HourlyItem[]>([]);
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const fetchForecast = useCallback(async (target: WeatherTarget) => {
    try {
      const response2 = await axios.get(buildUrl2(target));
      const tzOffset = response2.data.city?.timezone || 0;
      const items: ForecastApiItem[] = response2.data.list || [];
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
        setHourly(items.slice(0, 8).map((item) => ({
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
  }, []);

  const fetchWeatherData = useCallback(async (target: WeatherTarget) => {
    try {
      const response = await axios.get(buildUrl(target));
      setData(response.data);
      await fetchForecast(target);
    } catch (error) {
      console.error('Error fetching current weather:', error);
    }
  }, [fetchForecast]);

  useEffect(() => {
    fetchWeatherData('Panama');
  }, [fetchWeatherData]);

  useEffect(() => {
    const query = location.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    const controller = new AbortController();
    setSuggestions([]);
    setShowSuggestions(false);
    setIsLoadingSuggestions(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await axios.get<CitySuggestion[]>(buildGeoUrl(query), {
          signal: controller.signal
        });
        setSuggestions(response.data);
        setShowSuggestions(true);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching city suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [location]);

  const formatSuggestion = (suggestion: CitySuggestion) =>
    [suggestion.name, suggestion.state, suggestion.country].filter(Boolean).join(', ');

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const selectSuggestion = async (suggestion: CitySuggestion) => {
    const selectedLocation = formatSuggestion(suggestion);
    setLocation(selectedLocation);
    setShowSuggestions(false);
    setSuggestions([]);
    await fetchWeatherData({ lat: suggestion.lat, lon: suggestion.lon });
    setLocation('');
  };

  const searchLocation = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !location.trim()) {
      return;
    }

    await fetchWeatherData(location.trim());
    setShowSuggestions(false);
    setSuggestions([]);
    setLocation('');
  };

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={handleLocationChange}
          onKeyUp={searchLocation}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Buscar ciudad"
          type="text"
        />
        {showSuggestions ? (
          <div className="suggestions-list">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.name}-${suggestion.state || ''}-${suggestion.country}-${suggestion.lat}-${suggestion.lon}`}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <span>{suggestion.name}</span>
                  <small>{[suggestion.state, suggestion.country].filter(Boolean).join(', ')}</small>
                </button>
              ))
            ) : (
              <p>{isLoadingSuggestions ? 'Buscando ciudades...' : 'No se encontraron ciudades.'}</p>
            )}
          </div>
        ) : null}
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
