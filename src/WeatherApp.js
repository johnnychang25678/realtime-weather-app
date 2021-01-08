import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styled from '@emotion/styled'
import { ThemeProvider } from '@emotion/react'
import sunriseAndSunsetData from './sunrise-sunset.json'
import WeatherCard from './WeatherCard'


// CSS in JS
const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`
const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const fetchCurrentWeather = () => {
  return fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-0DF52233-79B4-4659-A2EA-FD8F74BAF57E&locationName=臺北')
    .then(res => res.json())
    .then(data => {
      const locationData = data.records.location[0]
      const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
        if (item.elementName === 'WDSD' || item.elementName === 'TEMP' || item.elementName === 'HUMD') {
          neededElements[item.elementName] = item.elementValue
        }
        return neededElements
      }, {})
      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD
      }

    })
    .catch(err => console.log(err.message))
}

const fetchWeatherForecast = () => {
  return fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-0DF52233-79B4-4659-A2EA-FD8F74BAF57E&locationName=臺北市')
    .then(res => res.json())
    .then((data) => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      )
      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      }
    })
    .catch(err => console.log(err.message))
}

const getMoment = (locationName) => {
  console.log('getMoment invoked! Location name:', locationName)
  const location = sunriseAndSunsetData.find((data) => data.locationName === locationName)
  if (!location) return null
  const now = new Date();
  const nowDate = Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(now)
    .replace(/\//g, '-');

  const locationDate = location.time && location.time.find((time) => time.dataTime === nowDate)
  const sunriseTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunrise}`
  ).getTime();
  const sunsetTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunset}`
  ).getTime();

  const nowTimeStamp = now.getTime();

  return sunriseTimestamp <= nowTimeStamp && nowTimeStamp <= sunsetTimestamp ?
    'day' : 'night';
};


const WeatherApp = () => {
  console.log('invoke function component: WeatherApp')
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: '',
    description: '',
    temperature: 0,
    windSpeed: 0,
    humid: 0,
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: '',
    isLoading: true
  })
  const { locationName } = weatherElement

  const [currentTheme, setCurrentTheme] = useState('light')

  const moment = useMemo(() => getMoment(locationName), [locationName])

  const fetchData = useCallback( // useCallback is to reserve function.
    () => {
      const fetchingData = async () => {
        const [currentWeather, weatherForecast] = await Promise.all(
          [fetchCurrentWeather(), fetchWeatherForecast()]
        )

        setWeatherElement({
          ...currentWeather,
          ...weatherForecast,
          isLoading: false // change loading to false once data fetched
        })
      }

      // change isLoading to true before data fetched
      setWeatherElement(prevState => {
        return { ...prevState, isLoading: true }
      })

      fetchingData()
    }, [])

  useEffect(() => {
    console.log('execute function in useEffect: WeatherApp')
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark')
  }, [moment])

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {console.log('render: WeatherApp')}
        <WeatherCard
          weatherElement={weatherElement}
          moment={moment}
          fetchData={fetchData}
        />
      </Container>
    </ThemeProvider>
  )
}

export default WeatherApp
