import { useState, useEffect } from 'react';
import '../index.css';

interface CurrentWeatherProps {
    data: {
        name: string;
        main: { temp: number; feels_like: number; humidity: number };
        weather: { main: string }[];
        wind: { speed: number };
        dt?: number;
        timezone?: number;
    };
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatLocalDateTime(baseTime?: number, tz?: number) {
    if (!baseTime || baseTime === 0) return '';
    const tzOffset = tz || 0;
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - baseTime;
    const currentTs = baseTime + elapsed;
    const target = new Date((currentTs + tzOffset) * 1000);
    const day = dayNames[target.getUTCDay()];
    const date = target.getUTCDate();
    const month = monthNames[target.getUTCMonth()];
    const hours = String(target.getUTCHours()).padStart(2, '0');
    const minutes = String(target.getUTCMinutes()).padStart(2, '0');
    return `${day} ${date} ${month} ${hours}:${minutes}`;
}

function getTimezoneOffset(tz?: number) {
    if (tz === undefined) return '';
    const hours = Math.floor(Math.abs(tz) / 3600);
    const minutes = Math.floor((Math.abs(tz) % 3600) / 60);
    const sign = tz >= 0 ? '+' : '-';
    const minStr = minutes > 0 ? `:${String(minutes).padStart(2, '0')}` : '';
    return `GMT${sign}${hours}${minStr}`;
}

const CurrentWeather = ({ data }: CurrentWeatherProps) => {
    const [displayTime, setDisplayTime] = useState('');
    
    useEffect(() => {
        const updateTime = () => {
            const newTime = formatLocalDateTime(data.dt, data.timezone);
            setDisplayTime(newTime);
        };
        
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [data.dt, data.timezone]);

    const timezone = getTimezoneOffset(data.timezone);

    return (
        <div className="current-weather">
            <div className="container">
                <div className="top">
                    <div className="local-time-group">
                        {displayTime ? <p className="local-time">{displayTime}</p> : null}
                        {timezone ? <p className="timezone">{timezone}</p> : null}
                    </div>
                    <div className="location">
                        <p>{data.name}</p>
                    </div>
                    <div className="temp">
                        {data.main ? <h1>{data.main.temp.toFixed()} °C</h1> : null}
                    </div>
                    <div className="description">
                        {data.weather ? <p>{data.weather[0].main}</p> : null}
                    </div>
                    <div className="bottom">
                        <div className="feels">
                            {data.main ? <p>{data.main.feels_like.toFixed()} °C</p> : null}
                            <p>Feels like</p>
                        </div>
                        <div className="humidity">
                            {data.main ? <p>{data.main.humidity.toFixed()}%</p> : null}
                            <p>Humidity</p>
                        </div>
                        <div className="wind">
                            {data.wind ? <p>{data.wind.speed.toFixed()} MPH</p> : null}
                            <p>wind Speed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentWeather;