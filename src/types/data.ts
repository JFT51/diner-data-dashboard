export interface HourData {
  timestamp: Date;
  visitorsEntering: number;
  visitorsLeaving: number;
  menEntering: number;
  menLeaving: number;
  womenEntering: number;
  womenLeaving: number;
  groupEntering: number;
  groupLeaving: number;
  passersby: number;
  captureRate: number;
  accumulatedVisitors: number;
  accumulatedVisitorsLeaving: number;
  liveVisitors: number;
}

export interface DayData {
  date: Date;
  visitorsEntering: number;
  visitorsLeaving: number;
  menEntering: number;
  menLeaving: number;
  womenEntering: number;
  womenLeaving: number;
  groupEntering: number;
  groupLeaving: number;
  passersby: number;
  captureRate: number;
  conversion: number;
  dwellTime: number;
  dataAccuracy: number;
  weatherSymbol: string;
  temperature: number;
  precipitation: number;
  windspeed: number;
}

export interface WeatherData {
  symbol: string;
  temperature: number;
  precipitation: number;
  windspeed: number;
}