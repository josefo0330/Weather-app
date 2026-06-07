interface ForecastItem {
  date: string;
  temp: number;
  weather: { main: string; description: string; icon: string }[];
}

interface ForecastWeatherProps {
  forecast: ForecastItem[];
}

const ForecastWeather = ({ forecast }: ForecastWeatherProps) => {
  return (
    <div className="forecast-weather">
      <h2>5-Day Forecast</h2>
      {forecast.length > 0 ? (
        <div className="forecast-grid">
          {forecast.map((item) => (
            <div key={item.date} className="forecast-card">
              <p className="forecast-date">{item.date}</p>
              <p className="forecast-temp">{Math.round(item.temp)}°C</p>
              <p className="forecast-desc">{item.weather[0]?.main}</p>
              <p className="forecast-detail">{item.weather[0]?.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="forecast-empty">
          <p>Ingrese una ciudad y presione Enter para ver el pronóstico.</p>
        </div>
      )}
    </div>
  );
};

export default ForecastWeather;
