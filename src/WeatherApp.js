import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { ReactComponent as CloudyIcon } from './images/day-cloudy.svg'
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg'
import { ReactComponent as RainIcon } from './images/rain.svg'
import { ReactComponent as RedoIcon } from './images/refresh.svg'

const Container = styled.div`
  background-color: #ededed;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`
const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: 0 1px 3px 0 #999999;
  background-color: #f9f9f9;
  box-sizing: border-box;
  padding: 30px 15px;
`
const Location = styled.div`
  font-size: 28px;
  color: #212121;
  margin-bottom: 20px;
`
const Description = styled.div`
  font-size: 16px;
  color: #828282;
  margin-bottom: 30px;
`

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`

const Temperature = styled.div`
  color: #757575;
  font-size: 96px;
  font-weight: 300;
  display: flex;
`

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`
const Airflow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 300;
  color: #828282;
  margin-bottom: 20px;
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`
const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 300;
  color: #828282;
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`

const Cloudy = styled(CloudyIcon)`
  flex-basis: 30%;
`
const Redo = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: #828282;

  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
`


const WeatherApp = () => {
  console.log('invoke function component')
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
  })
  const { observationTime, locationName, description, temperature, windSpeed, humid, weatherCode, rainPossibility, comfortability } = weatherElement
  useEffect(() => {
    console.log('execute function in useEffect')
    fetchCurrentWeather()
    fetchWeatherForecast()
  }, [])


  const fetchCurrentWeather = () => {
    fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-0DF52233-79B4-4659-A2EA-FD8F74BAF57E&locationName=臺北')
      .then(res => res.json())
      .then(data => {
        const locationData = data.records.location[0]
        const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
          if (item.elementName === 'WDSD' || item.elementName === 'TEMP' || item.elementName === 'HUMD') {
            neededElements[item.elementName] = item.elementValue
          }
          return neededElements
        }, {})

        setWeatherElement(prevState => ({
          ...prevState,
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          description: '多雲時晴',
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD
        }))

      })
      .catch(err => console.log(err.message))
  }

  const fetchWeatherForecast = () => {
    fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-0DF52233-79B4-4659-A2EA-FD8F74BAF57E&locationName=臺北市')
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
        );

        setWeatherElement(prevState => ({
          ...prevState,
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        }));
      })
  }

  return (
    <Container>
      {console.log('render')}
      <WeatherCard>
        <Location>{locationName}</Location>
        <Description>
          {description}
          {comfortability}
        </Description>
        <CurrentWeather>
          <Temperature>
            {Math.round(temperature)} <Celsius>°C</Celsius>
          </Temperature>
          <Cloudy />
        </CurrentWeather>
        <Airflow>
          <AirFlowIcon />
          {windSpeed} m/h
        </Airflow>
        <Rain>
          <RainIcon />
          {Math.round(rainPossibility)} %
        </Rain>
        <Redo onClick={() => {
          fetchCurrentWeather()
          fetchWeatherForecast()
        }}>
          最後觀測時間：
          {
            new Intl
              .DateTimeFormat('zh-TW', { hour: 'numeric', minute: 'numeric' })
              .format(new Date(observationTime))
          }
          <RedoIcon />
        </Redo>
      </WeatherCard>
    </Container>
  )
}

export default WeatherApp
