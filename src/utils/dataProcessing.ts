import { parse, format, startOfDay, getDay } from 'date-fns';
import { HourData, DayData, WeatherData } from '../types/data';

const OPENING_HOURS = {
  0: { start: 8, end: 16 }, // Sunday
  1: { start: 7, end: 20 }, // Monday
  2: { start: 7, end: 20 }, // Tuesday
  3: { start: 7, end: 20 }, // Wednesday
  4: { start: 7, end: 20 }, // Thursday
  5: { start: 7, end: 20 }, // Friday
  6: { start: 8, end: 20 }, // Saturday
};

export const processCSVData = async (url: string): Promise<HourData[]> => {
  const response = await fetch(url);
  const text = await response.text();
  const rows = text.split('\n').slice(1); // Skip header

  const hourData: HourData[] = [];
  let dailyAccumulated = {
    visitors: 0,
    visitorsLeaving: 0,
  };
  let lastDate = '';

  rows.forEach((row) => {
    const columns = row.split(';');
    if (columns.length < 10) return;

    const timestamp = parse(columns[0], 'd/MM/yyyy H:mm', new Date());
    const currentDate = format(timestamp, 'yyyy-MM-dd');

    // Reset accumulators at start of day
    if (currentDate !== lastDate) {
      dailyAccumulated = {
        visitors: 0,
        visitorsLeaving: 0,
      };
      lastDate = currentDate;
    }

    const visitorsEntering = parseInt(columns[1]);
    const visitorsLeaving = parseInt(columns[2]);
    dailyAccumulated.visitors += visitorsEntering;
    dailyAccumulated.visitorsLeaving += visitorsLeaving;

    const passersby = parseInt(columns[9]);
    const captureRate = passersby > 0 ? (visitorsEntering / passersby) * 100 : 0;

    hourData.push({
      timestamp,
      visitorsEntering,
      visitorsLeaving,
      menEntering: parseInt(columns[3]),
      menLeaving: parseInt(columns[4]),
      womenEntering: parseInt(columns[5]),
      womenLeaving: parseInt(columns[6]),
      groupEntering: parseInt(columns[7]),
      groupLeaving: parseInt(columns[8]),
      passersby,
      captureRate: Math.round(captureRate * 100) / 100,
      accumulatedVisitors: dailyAccumulated.visitors,
      accumulatedVisitorsLeaving: dailyAccumulated.visitorsLeaving,
      liveVisitors: Math.max(0, dailyAccumulated.visitors - dailyAccumulated.visitorsLeaving),
    });
  });

  return hourData;
};

export const aggregateDailyData = (hourData: HourData[]): DayData[] => {
  const dailyMap = new Map<string, DayData>();

  hourData.forEach((hour) => {
    const dateStr = format(hour.timestamp, 'yyyy-MM-dd');
    const dayOfWeek = getDay(hour.timestamp);
    const hourNum = hour.timestamp.getHours();
    const isOpeningHour = hourNum >= OPENING_HOURS[dayOfWeek].start && 
                         hourNum < OPENING_HOURS[dayOfWeek].end;

    if (!dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, {
        date: startOfDay(hour.timestamp),
        visitorsEntering: 0,
        visitorsLeaving: 0,
        menEntering: 0,
        menLeaving: 0,
        womenEntering: 0,
        womenLeaving: 0,
        groupEntering: 0,
        groupLeaving: 0,
        passersby: 0,
        captureRate: 0,
        conversion: 0,
        dwellTime: 0,
        dataAccuracy: 0,
        weatherSymbol: '',
        temperature: 0,
        precipitation: 0,
        windspeed: 0,
      });
    }

    const day = dailyMap.get(dateStr)!;
    if (isOpeningHour) {
      day.visitorsEntering += hour.visitorsEntering;
      day.visitorsLeaving += hour.visitorsLeaving;
      day.menEntering += hour.menEntering;
      day.menLeaving += hour.menLeaving;
      day.womenEntering += hour.womenEntering;
      day.womenLeaving += hour.womenLeaving;
      day.groupEntering += hour.groupEntering;
      day.groupLeaving += hour.groupLeaving;
      day.passersby += hour.passersby;
    }
  });

  // Calculate derived metrics
  return Array.from(dailyMap.values()).map(day => {
    const captureRate = day.passersby > 0 ? (day.visitorsEntering / day.passersby) * 100 : 0;
    const conversion = day.visitorsEntering > 0 ? (day.groupEntering / day.visitorsEntering) * 100 : 0;
    const dwellTime = day.visitorsEntering > 0 ? (day.liveVisitors / day.visitorsEntering) * 10 : 0;
    const accuracy = Math.min(day.visitorsEntering / day.visitorsLeaving, 
                            day.visitorsLeaving / day.visitorsEntering) * 100;

    return {
      ...day,
      captureRate: Math.round(captureRate * 100) / 100,
      conversion: Math.round(conversion * 100) / 100,
      dwellTime: Math.round(dwellTime),
      dataAccuracy: Math.round(accuracy * 10) / 10,
    };
  });
};

export const fetchWeatherData = async (startDate: Date, endDate: Date): Promise<WeatherData[]> => {
  const lat = 50.8503;  // Brussels latitude
  const lon = 4.3517;   // Brussels longitude
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${format(startDate, 'yyyy-MM-dd')}&end_date=${format(endDate, 'yyyy-MM-dd')}&daily=temperature_2m_mean,precipitation_sum,windspeed_10m_max,weathercode`;
  
  const response = await fetch(url);
  const data = await response.json();

  return data.daily.time.map((date: string, index: number) => ({
    symbol: getWeatherEmoji(data.daily.weathercode[index]),
    temperature: data.daily.temperature_2m_mean[index],
    precipitation: data.daily.precipitation_sum[index],
    windspeed: data.daily.windspeed_10m_max[index],
  }));
};

const getWeatherEmoji = (code: number): string => {
  // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
  const weatherMap: { [key: number]: string } = {
    0: '☀️',  // Clear sky
    1: '🌤️',  // Mainly clear
    2: '⛅',  // Partly cloudy
    3: '☁️',  // Overcast
    45: '🌫️', // Foggy
    48: '🌫️', // Depositing rime fog
    51: '🌧️', // Light drizzle
    53: '🌧️', // Moderate drizzle
    55: '🌧️', // Dense drizzle
    61: '🌧️', // Slight rain
    63: '🌧️', // Moderate rain
    65: '🌧️', // Heavy rain
    71: '🌨️', // Slight snow
    73: '🌨️', // Moderate snow
    75: '🌨️', // Heavy snow
    77: '🌨️', // Snow grains
    80: '🌧️', // Slight rain showers
    81: '🌧️', // Moderate rain showers
    82: '🌧️', // Violent rain showers
    85: '🌨️', // Slight snow showers
    86: '🌨️', // Heavy snow showers
    95: '⛈️', // Thunderstorm
    96: '⛈️', // Thunderstorm with slight hail
    99: '⛈️', // Thunderstorm with heavy hail
  };
  return weatherMap[code] || '❓';
};