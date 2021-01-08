import { useState, useEffect, useCallback } from 'react'

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

const useWeatherApi = () => {
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

  return [weatherElement, fetchData] // returns the data or method you want to export
}

export default useWeatherApi