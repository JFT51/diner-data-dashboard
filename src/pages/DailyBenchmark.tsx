import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DayData, HourData } from '../types/data';

interface DailyBenchmarkProps {
  dayData: DayData[];
  hourData: HourData[];
}

export function DailyBenchmark({ dayData, hourData }: DailyBenchmarkProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(dayData[0]?.date);
  const [benchmarkDate, setBenchmarkDate] = useState<Date | null>(null);
  const [useBenchmark, setUseBenchmark] = useState(false);
  const [useWeekdayAverage, setUseWeekdayAverage] = useState(false);

  const selectedDayData = useMemo(() => 
    dayData.find(day => format(day.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')),
    [dayData, selectedDate]
  );

  const weekdayAverages = useMemo(() => {
    if (!selectedDate || !useWeekdayAverage) return null;
    const weekday = format(selectedDate, 'EEEE');
    const weekdayData = dayData.filter(day => format(day.date, 'EEEE') === weekday);
    
    return {
      date: selectedDate,
      visitorsEntering: Math.round(weekdayData.reduce((sum, day) => sum + day.visitorsEntering, 0) / weekdayData.length),
      captureRate: Math.round(weekdayData.reduce((sum, day) => sum + day.captureRate, 0) / weekdayData.length * 100) / 100,
      menEntering: Math.round(weekdayData.reduce((sum, day) => sum + day.menEntering, 0) / weekdayData.length),
      womenEntering: Math.round(weekdayData.reduce((sum, day) => sum + day.womenEntering, 0) / weekdayData.length),
      dataAccuracy: Math.round(weekdayData.reduce((sum, day) => sum + day.dataAccuracy, 0) / weekdayData.length * 10) / 10,
      weatherSymbol: selectedDayData?.weatherSymbol || '',
      temperature: Math.round(weekdayData.reduce((sum, day) => sum + day.temperature, 0) / weekdayData.length * 10) / 10,
      precipitation: Math.round(weekdayData.reduce((sum, day) => sum + day.precipitation, 0) / weekdayData.length * 10) / 10,
      windspeed: Math.round(weekdayData.reduce((sum, day) => sum + day.windspeed, 0) / weekdayData.length * 10) / 10,
    };
  }, [dayData, selectedDate, useWeekdayAverage, selectedDayData?.weatherSymbol]);

  const benchmarkDayData = useMemo(() => 
    useBenchmark && benchmarkDate ? 
      dayData.find(day => format(day.date, 'yyyy-MM-dd') === format(benchmarkDate, 'yyyy-MM-dd')) :
      useWeekdayAverage ? weekdayAverages : null,
    [dayData, benchmarkDate, useBenchmark, useWeekdayAverage, weekdayAverages]
  );

  const hourlyData = useMemo(() => {
    if (!selectedDate) return [];
    return hourData
      .filter(hour => format(hour.timestamp, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
      .map(hour => ({
        hour: format(hour.timestamp, 'HH:mm'),
        visitors: hour.visitorsEntering,
        passersby: hour.passersby,
        captureRate: hour.captureRate,
      }));
  }, [hourData, selectedDate]);

  const handleBenchmarkToggle = (checked: boolean) => {
    setUseBenchmark(checked);
    if (checked) {
      setUseWeekdayAverage(false);
    }
  };

  const handleWeekdayAverageToggle = (checked: boolean) => {
    setUseWeekdayAverage(checked);
    if (checked) {
      setUseBenchmark(false);
      setBenchmarkDate(null);
    }
  };

  const getGenderDistribution = (data: DayData) => {
    const total = data.menEntering + data.womenEntering;
    if (total === 0) return "No data";
    const menPercentage = Math.round((data.menEntering / total) * 100);
    const womenPercentage = 100 - menPercentage;
    return `${menPercentage}% men, ${womenPercentage}% women`;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Date Selection</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => !dayData.some(day => format(day.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="benchmark"
                checked={useBenchmark}
                onCheckedChange={handleBenchmarkToggle}
              />
              <label htmlFor="benchmark">Benchmark Date</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="weekdayAverage"
                checked={useWeekdayAverage}
                onCheckedChange={handleWeekdayAverageToggle}
              />
              <label htmlFor="weekdayAverage">{format(selectedDate, 'EEEE')} Averages</label>
            </div>

            {useBenchmark && (
              <Calendar
                mode="single"
                selected={benchmarkDate}
                onSelect={(date) => date && setBenchmarkDate(date)}
                disabled={(date) => !dayData.some(day => format(day.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))}
              />
            )}
          </div>
        </div>

        <Card className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Visitors</TableHead>
                <TableHead>Capture Rate</TableHead>
                <TableHead>Gender Distribution</TableHead>
                <TableHead>Data Accuracy</TableHead>
                <TableHead>Weather</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedDayData && (
                <TableRow>
                  <TableCell>{format(selectedDayData.date, 'EEE dd MMM yyyy')}</TableCell>
                  <TableCell>{selectedDayData.visitorsEntering}</TableCell>
                  <TableCell>{selectedDayData.captureRate}%</TableCell>
                  <TableCell>{getGenderDistribution(selectedDayData)}</TableCell>
                  <TableCell>{selectedDayData.dataAccuracy}%</TableCell>
                  <TableCell>
                    {selectedDayData.weatherSymbol} {selectedDayData.temperature}°C, {selectedDayData.precipitation}mm, {selectedDayData.windspeed}km/h
                  </TableCell>
                </TableRow>
              )}
              {benchmarkDayData && (
                <TableRow>
                  <TableCell>
                    {useWeekdayAverage ? `${format(selectedDate, 'EEEE')} Average` : format(benchmarkDayData.date, 'EEE dd MMM yyyy')}
                  </TableCell>
                  <TableCell>{benchmarkDayData.visitorsEntering}</TableCell>
                  <TableCell>{benchmarkDayData.captureRate}%</TableCell>
                  <TableCell>{getGenderDistribution(benchmarkDayData)}</TableCell>
                  <TableCell>{benchmarkDayData.dataAccuracy}%</TableCell>
                  <TableCell>
                    {benchmarkDayData.weatherSymbol} {benchmarkDayData.temperature}°C, {benchmarkDayData.precipitation}mm, {benchmarkDayData.windspeed}km/h
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="visitors" stroke="#859527" name="Visitors" />
                <Line yAxisId="left" type="monotone" dataKey="passersby" stroke="#f39700" name="Passersby" />
                <Line yAxisId="right" type="monotone" dataKey="captureRate" stroke="#a6ba33" name="Capture Rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}