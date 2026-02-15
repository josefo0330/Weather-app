import {  useState } from 'react';
import axios from 'axios';
import './index.css';
function App() {
  const [data, setData]=useState({
    name: '',
    main: {
      temp: 0,
      feels_like: 0,
      humidity: 0
    },
    weather: [
      {
        main: ''
      }
    ],
    wind: {
      speed: 0
    }
  });
  const [location, setLocation]=useState('');
   const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=68778de485940178d3cb0f39538d9039`

  const searchLocation = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if(event.key==='Enter'){
      axios.get(url).then((response)=>{
      setData(response.data);
      console.log(response.data);
      console.log(event)
    })
    setLocation('')
    }
  }
  return (
    
    <div className="app">
      <div className="search">
         <input
          value={location}
          onChange={event => setLocation(event.target.value)}
          onKeyUp={searchLocation}
          placeholder='Enter Location'
          type="text" />
      </div>
      <div className="container"> 
        <div className="top">
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
}
export default App;
