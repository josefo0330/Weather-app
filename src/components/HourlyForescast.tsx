interface HourlyForescastProps {
  hourly: {
    time: string;
    temp: number;
    weather: string;
    icon: string;
  }[];
}

const HourlyForescast = ({ hourly }: HourlyForescastProps) => {
  return (
    <section className="hourly-forecast">
      <h2>Hourly Forecast</h2>
      <div className="hourly-list">
        {hourly.length > 0 ? (
          hourly.map((item, index) => (
            <article key={`${item.time}-${index}`} className="hourly-card">
              <p className="hourly-time">{item.time}</p>
              {item.icon ? (
                <img
                  className="hourly-icon"
                  src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                  alt={item.weather}
                />
              ) : null}
              <p className="hourly-temp">{Math.round(item.temp)}°C</p>
              <p className="hourly-weather">{item.weather}</p>
            </article>
          ))
        ) : (
          <div className="hourly-empty">
            <p>No hourly forecast available.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HourlyForescast;
