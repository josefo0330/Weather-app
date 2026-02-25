import {  useState } from 'react';
import axios from 'axios';
import CurrentWeather from './components/CurrentWeather';
function App() {
  const [data, setData]=useState({
    name: '',
    main: { temp: 0, feels_like: 0, humidity: 0 },
    weather: [{ main: '' }],
    wind: { speed: 0 }
  });
  const [location, setLocation]=useState('');
   const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=68778de485940178d3cb0f39538d9039`

  const searchLocation = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if(event.key==='Enter'){
      axios.get(url).then((response)=>{
      setData(response.data);
      console.log(data)
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
      <CurrentWeather data={data}/>
    </div>
  );
}
export default App;
